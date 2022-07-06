var edit = false;
var mapData = {};
var selectedId = ''

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

    initData();

    $(function () {
        $("#table-data").DataTable({
            "paging": true,
            "lengthChange": false,
            "searching": true,
            "ordering": false,
            "info": false,
            "autoWidth": false,
            "responsive": false,
        });
    });
}

function initData() {
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
                    mapData[response.data[i].id] = response.data[i]            
                    html += '<tr>';
                    html += '<td>' + response.data[i].code + '</td>';
                    html += '<td>' + response.data[i].name + '</td>';
                    html += '<td>' + response.data[i].description + '</td>';
                    html += '<td>' + (response.data[i].active ? 'Aktif' : 'Tidak Aktif') + '</td>';
                    html += '<td><button ' + (edit ? '' : 'hidden') + 'type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#edit-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button></td>';
                    html += '</tr>';
                }

                $('#data-body').html(html);
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

function prepareEdit(id){
    selectedId = id;

    $("#code-edit").val(mapData[id].code);
    $("#name-edit").val(mapData[id].name);
    $("#description-edit").val(mapData[id].description);

    active = mapData[id].active
    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);
}

function editData(){
    data = {};
    data["id"] = selectedId;
    data["code"] =  $("#code-edit").val();
    data["name"] =  $("#name-edit").val();
    data["description"] =  $("#description-edit").val();
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

init();