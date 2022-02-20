function init(){
    $(window).on('load', function () {
        $('#loading').hide();
    })
    
    $('#loading').bind('ajaxStart', function () {
        $(this).show();
    }).bind('ajaxStop', function () {
        $(this).hide();
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    let username = getCookie("username");
    if (username != "") {
        alert("Welcome again " + username);
    } else {
        username = prompt("Please enter your name:", "");
        if (username != "" && username != null) {
            setCookie("username", username, 365);
        }
    }
}

function getFirstPath() {
    var first = $(location).attr('pathname');
    first.indexOf(1);
    first.toLowerCase();
    first = first.split("/")[1];
    return first
}

function getFullPath() {
    var first = $(location).attr('pathname');
    first.indexOf(1);
    first.toLowerCase();
    return first
}

function createSession(token, name, role) {
    setCookie("token", token, 1)
    setCookie("name", name, 1)
    setCookie("role", role, 1)
}

function removeSession() {
    setCookie("token", "", - 1)
    setCookie("name", "", -1)
    setCookie("role", "", -1)
}

function addInputEnterListener(inputId, btnId) {
    var input = document.getElementById(inputId);

    input.addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById(btnId).click();
        }
    });
}

function redirectToLogin() {
    window.location.replace("/login.html");
}

init();