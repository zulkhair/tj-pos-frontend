var edit = false;
var mapData = {};
var selectedId = ''
var tableCustomer;
var ws_data = [];

function init() {
    $.ajax({
        type: "GET",
        url: "/api/auth/check",
        headers: { "token": token },
        data: { "permission": "web:masterdata:customer:add" },
        success: function (response) {
            if (response.status != 0) {
                hideTag("add-btn")
            } else {
                showTag("add-btn")
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/auth/check",
        headers: { "token": token },
        data: { "permission": "web:masterdata:customer:edit" },
        success: function (response) {
            if (response.status != 0) {
                edit = false;
            } else {
                edit = true;
            }
        }
    });

    tableCustomer =
        $("#table-data").DataTable({
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
    tableCustomer.clear();
    ws_data = [];
    ws_data.push(['Kode', 'Nama', 'Deskripsi', 'Status']);
    $.ajax({
        type: "GET",
        url: "/api/customer/find",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    ws_data.push(
                        [response.data[i].code, response.data[i].name, response.data[i].description, (response.data[i].active ? 'Aktif' : 'Tidak Aktif')]
                    )
                    mapData[response.data[i].id] = response.data[i]
                    tableCustomer.row.add([
                        response.data[i].code,
                        response.data[i].name,
                        response.data[i].description,
                        (response.data[i].active ? 'Aktif' : 'Tidak Aktif'),
                        '<button ' + (edit ? '' : 'hidden') + 'type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#edit-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>',
                    ]).draw(false);
                }
            }
        }
    });

}

function prepareAdd() {
    clearInput("code");
    clearInput("name");
    clearInput("description");
}

function submit() {
    data = {};
    data["code"] = $("#code").val().trim();
    data["name"] = $("#name").val().trim();
    data["description"] = $("#description").val().trim();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/customer/create",
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

    $("#code-edit").val(mapData[id].code);
    $("#name-edit").val(mapData[id].name);
    $("#description-edit").val(mapData[id].description);

    active = mapData[id].active
    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);
}

function editData() {
    data = {};
    data["id"] = selectedId;
    data["code"] = $("#code-edit").val().trim();
    data["name"] = $("#name-edit").val().trim();
    data["description"] = $("#description-edit").val().trim();
    data["active"] = $("#active-modal-select").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/customer/edit",
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
        Title: "Customer",
        Subject: "Customer",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Customer");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Customer"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'customer.xlsx');
}

init();