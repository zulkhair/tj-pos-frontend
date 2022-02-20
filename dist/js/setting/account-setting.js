function init(){
    // addInputEnterListener("name", "btnSubmitName");
    // addInputEnterListener("password1", "btnSubmitPassword");
    // addInputEnterListener("password2", "btnSubmitPassword");
    // addInputEnterListener("password3", "btnSubmitPassword");
}

function editUser(){
    data = {};
    data["name"] = $("#name").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/user/edit",
        headers: { "token": token },
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                setCookie("name", data["name"], 1)
            }
        }
    });
}

function editPassword(){
    data = {};
    data["password1"] = $("#password1").val();
    data["password2"] = $("#password2").val();
    data["password3"] = $("#password3").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/user/change-password",
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