var arrRole = [];
var mapRole = {};
var mapUser = {};
var selectedId = ''

function init() {
    $.ajax({
        type: "GET",
        url: "/api/role/active-list",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    arrRole.push(response.data[i])
                    mapRole[response.data[i].id] = response.data[i].name
                }
            }
        }
    });

    initData()

    $(function () {
        $("#table-user").DataTable({
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

function initData(){
    $.ajax({
        type: "GET",
        url: "/api/user/find-all",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    mapUser[response.data[i].id] = response.data[i]
                    html += '<tr>';
                    html += '<td>' + response.data[i].name + '</td>';
                    html += '<td>' + response.data[i].username + '</td>';
                    html += '<td>' + mapRole[response.data[i].roleId] + '</td>';
                    html += '<td>' + (response.data[i].active ? 'Aktif' : 'Tidak Aktif') + '</td>';
                    html += '<td><button type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#status-modal" onclick="setSelectedId(\'' + response.data[i].id + '\');"></button>';
                    html += '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-key" title="Ubah kata sandi" data-toggle="modal" data-target="#password-modal" onclick="setSelectedId(\'' + response.data[i].id + '\');"></button></td>';
                    html += '</tr>';
                }

                $('#user-data-body').html(html);
            }
        }
    });
}

function setSelectedId(id) {
    selectedId = id;
    active = mapUser[id].active

    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);

    clearInput("password1")
    clearInput("password2")
}

function editStatus() {
    data = {};
    data["userId"] = selectedId;
    data["active"] = $("#active-modal-select").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/user/change-status",
        headers: { "token": token },
        data: JSON.stringify(data),
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

function forceChangePassword() {
    data = {};
    data["userId"] = selectedId;
    data["password1"] = $("#password1").val();
    data["password2"] = $("#password2").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/user/force-change-password",
        headers: { "token": token },
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
            }
        }
    });
}

init();