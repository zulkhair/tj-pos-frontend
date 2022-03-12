var mapRole = {};
var selectedId = ''

function init() {
    initData()

    $(function () {
        $("#table-user").DataTable({
            "paging": false,
            "lengthChange": false,
            "searching": false,
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
        url: "/api/role/find-all",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    mapRole[response.data[i].id] = response.data[i]
                    html += '<tr>';
                    html += '<td>' + response.data[i].name + '</td>';
                    html += '<td>' + (response.data[i].active ? 'Aktif' : 'Tidak Aktif') + '</td>';
                    html += '<td><button type="button" class="btn-tbl btn btn-block btn-primary fas fa-toggle-off " title="Ubah status" data-toggle="modal" data-target="#status-modal" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>';
                    html += '</tr>';
                }

                $('#user-data-body').html(html);
            }
        }
    });
}

function prepareEdit(id) {
    $("#ability-select").val('');
    $.ajax({
        type: "GET",
        url: "/api/role/permissions",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].menu + ' | ' + response.data[i].name + '</option>';
                }
                $('#ability-select').html(optionhtml);
            }
        }
    });

    $('.select2').select2()

    $.ajax({
        type: "GET",
        url: "/api/role/permissions",
        headers: { "token": token },
        data: {
            roleId: id
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                var arrPerm = [];
                console.log(response.data)
                for (i in response.data) {
                    arrPerm.push(response.data[i].id)
                }

                $("#ability-select").val(arrPerm);
                $("#ability-select").change();
            }
        }
    });

    selectedId = id;
    active = mapRole[id].active

    html = '<option value="true" ' + (active ? 'selected' : '') + '>Aktif</option>'
    html += '<option value="false" ' + (!active ? 'selected' : '') + '>Tidak Aktif</option>'

    $('#active-modal-select').html(html);
    $('#roleName').val(mapRole[id].name);
}

function editRole() {
    data = {};
    data["roleId"] = selectedId;
    data["roleName"] = $("#roleName").val();
    data["permissions"] = $("#ability-select").val();
    data["active"] = $("#active-modal-select").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/role/edit",
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

init();