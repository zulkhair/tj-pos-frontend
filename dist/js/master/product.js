var edit = false;
var mapProduct = {};
var selectedId = ''

function init() {
    $.ajax({
        type: "GET",
        url: "/api/auth/check",
        headers: { "token": token },
        data: { "permission": "web:masterdata:product:add" },
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
        data: { "permission": "web:masterdata:product:edit" },
        success: function (response) {
            if (response.status != 0) {
                edit = false;
            } else {
                edit = true;
            }
        }
    });

    initData();

    $(function () {
        $("#table-product").DataTable({
            "paging": false,
            "lengthChange": false,
            "searching": false,
            "ordering": false,
            "info": false,
            "autoWidth": false,
            "responsive": true,
        });
    });
}

function initData() {
    $.ajax({
        type: "GET",
        url: "/api/product/find",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {       
                    mapProduct[response.data[i].id] = response.data[i]            
                    html += '<tr>';
                    html += '<td>' + response.data[i].code + '</td>';
                    html += '<td>' + response.data[i].name + '</td>';
                    html += '<td>' + response.data[i].description + '</td>';
                    html += '<td>' + (response.data[i].active ? 'Aktif' : 'Tidak Aktif') + '</td>';
                    html += '<td><button ' + (edit ? '' : 'hidden') + 'type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#edit-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button></td>';
                    html += '</tr>';
                }

                $('#product-data-body').html(html);
            }
        }
    });

}

function prepareAdd(){
    clearInput("code");
    clearInput("name");
    clearInput("description");
}

function submit(){
    data = {};
    data["code"] = $("#code").val();
    data["name"] = $("#name").val();
    data["description"] = $("#description").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/product/create",
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

function prepareEdit(id){
    selectedId = id;

    $("#code-edit").val(mapProduct[id].code);
    $("#name-edit").val(mapProduct[id].name);
    $("#description-edit").val(mapProduct[id].description);

    active = mapProduct[id].active
    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);
}

function editProduct(){
    data = {};
    data["id"] = selectedId;
    data["code"] =  $("#code-edit").val();
    data["name"] =  $("#name-edit").val();
    data["description"] =  $("#description-edit").val();
    data["active"] = $("#active-modal-select").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/product/edit",
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

init();