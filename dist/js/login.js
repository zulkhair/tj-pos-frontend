function init() {
    token = getCookie("token")
    if (token != "") {
        var status = 1
        $.ajax({
            type: "GET",
            url: "/api/auth/getmenu",
            headers: { "token": token },
            async: false,
            success: function (response) {
                if (response.status == 0) {
                    status = 0
                    window.location.replace("index.html");
                }
            }
        });

        if (status == 1) {
            removeSession()
        }
    }

    addInputEnterListener("username", "btnSubmit");
    addInputEnterListener("password", "btnSubmit");
}

function login() {
    data = {};
    data["username"] = $("#username").val();
    data["password"] = $("#password").val();

    $.ajax({
        type: "POST",
        url: "/api/auth/login",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                createSession(response.data.token, response.data.name, response.data.roleName)
                window.location.replace("index.html");
            }
        }
    });
}

init();