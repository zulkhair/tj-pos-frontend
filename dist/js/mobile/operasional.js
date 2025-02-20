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
    ws_data.push(['Deskripsi', 'Status']);
    $.ajax({
        type: "GET",
        url: "/api/mobile/operasional/desc/find",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    ws_data.push(
                        [response.data[i].description, (response.data[i].active ? 'Aktif' : 'Tidak Aktif')]
                    )

                    mapProduct[response.data[i].id] = response.data[i]
                    tableProduct.row.add([
                        response.data[i].description,
                        (response.data[i].active ? 'Aktif' : 'Tidak Aktif'),
                        '<button ' + (edit ? '' : 'hidden') + 'type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#edit-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>'
                    ]).draw(false);
                }

            }
        }
    });

}

function prepareAdd() {
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
}

function submit() {
    data = {};
    data["description"] = $("#name").val().trim();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/mobile/operasional/desc/create",
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

    $("#name-edit").val(mapProduct[id].description);

    active = mapProduct[id].active
    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);

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
    data["description"] = $("#name-edit").val().trim();
    data["active"] = $("#active-modal-select").val() === "true";
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/mobile/operasional/desc/edit",
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
        Title: "Operasional",
        Subject: "Operasional",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Operasional");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Operasional"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'operasional.xlsx');
}

init();