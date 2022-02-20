
function init() {
    var name = getCookie("name");
    $('#welcoming-name').append("Selamat datang <b>" + name + "</b>");
}

init();