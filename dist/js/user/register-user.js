function init() {
    $.ajax({
        type: "GET",
        url: "/api/role/active-list",
        headers: { "token": token },
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '<option value="">-Pilih Role-</option>';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].name + '</option>';
                }

                $('#role').append(optionhtml);
            }
        }
    });
}

function register() {
    pass1 = $("#password1").val();
    pass2 = $("#password2").val();

    if (pass1 == pass2) {
        token = getCookie("token")
        data = {};
        data["name"] = $("#name").val();
        data["username"] = $("#username").val();
        data["password"] = $("#password1").val();
        data["roleId"] = $("#role").val();

        $.ajax({
            type: "POST",
            url: "/api/user/register-user",
            headers: { "token": token },
            data: JSON.stringify(data),
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    clearInput("name")
                    clearInput("username")
                    clearInput("password1")
                    clearInput("password2")
                    clearInput("role")
                }
            }
        });
    } else {
        toastr.warning("Kata sandi tidak sesuai");
    }


}

init();