function init() {
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
                $('#ability-select').append(optionhtml);
            }
        }
    });

    $('.select2').select2()
}

function registerRole(){
    token = getCookie("token")
    data = {};
    data["permissions"] = $("#ability-select").val();
    data["roleName"] = $("#roleName").val();

    $.ajax({
        type: "POST",
        url: "/api/role/create",
        headers: { "token": token },
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                $("#ability-select").empty();
                clearInput("roleName")
            }
        }
    });
}

init();