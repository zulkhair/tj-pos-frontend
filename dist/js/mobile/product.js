var edit = true;
var mapProduct = {};
var selectedId = ''
var tableProduct;
var ws_data = [];
var units;

function init() {
    tableProduct = $("#table-product").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    initData();
}

function initData() {
    tableProduct.clear();
    ws_data = [];
    ws_data.push(['Kode', 'Nama', 'Status']);
    $.ajax({
        type: "GET",
        url: "/api/mobile/product/find",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    ws_data.push(
                        [response.data[i].code, response.data[i].name, (response.data[i].active ? 'Aktif' : 'Tidak Aktif')]
                    )

                    mapProduct[response.data[i].id] = response.data[i]
                    tableProduct.row.add([
                        response.data[i].code,
                        response.data[i].name,
                        (response.data[i].active ? 'Aktif' : 'Tidak Aktif'),
                        '<button ' + (edit ? '' : 'hidden') + 'type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#edit-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>'
                    ]).draw(false);
                }

            }
        }
    });

}

function prepareAdd() {
    clearInput("code");
    clearInput("name");

    var name = document.getElementById("name");
    name.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            submit();
            $('#add-modal').modal('toggle');
        }
    });

    var code = document.getElementById("code");
    code.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            submit();
            $('#add-modal').modal('toggle');
        }
    });

    $('#add-modal').on('shown.bs.modal', function () {
        $(this).find('#code').focus();
    })
}

function submit() {
    data = {};
    data["code"] = $("#code").val().trim();
    data["name"] = $("#name").val().trim();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/mobile/product/create",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData()
            }
        }
    });
}

function prepareEdit(id) {
    selectedId = id;

    $("#code-edit").val(mapProduct[id].code);
    $("#name-edit").val(mapProduct[id].name);

    active = mapProduct[id].active
    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);

    var name = document.getElementById("code-edit");
    name.addEventListener("keypress", function f(event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            editProduct();
            $('#edit-modal').modal('toggle');
            name.removeEventListener("keypress", f)
        }
    });

    var code = document.getElementById("name-edit");
    code.addEventListener("keypress", function f(event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            editProduct();
            $('#edit-modal').modal('toggle');
            code.removeEventListener("keypress", f)
        }
    });

    $('#edit-modal').on('shown.bs.modal', function () {
        $(this).find('#code-edit').focus();
    })
}

function editProduct() {
    data = {};
    data["id"] = selectedId;
    data["code"] = $("#code-edit").val().trim();
    data["name"] = $("#name-edit").val().trim();
    data["active"] = $("#active-modal-select").val() === "true";
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/mobile/product/edit",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData();
            }
        }
    });
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Produk",
        Subject: "Produk",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Produk");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Produk"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'produk.xlsx');
}

init();