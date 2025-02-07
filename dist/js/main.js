var token;

function init() {
    token = getCookie("token")
    if (token == "") {
        redirectToLogin();
    }

    firstPath = getFirstPath()
    fullPath = getFullPath()

    $.ajax({
        type: "GET",
        url: "/api/auth/getmenu",
        headers: { "token": token },
        success: function (response) {
            if (response.status != 0) {
                redirectToLogin();
            } else {
                menuhtml = ""
                for (i in response.data.menu) {
                    menu = response.data.menu[i]

                    // Mobile menu is not shown in the sidebar
                    if (menu.name == "Mobile") {
                        continue;
                    }

                    menuActive = "";
                    menuOpen = "";
                    paths = menu.path.split(";");
                    
                    for (i in paths) {
                        if (menuActive == "") {
                            menuActive = firstPath == paths[i] ? "active" : "";
                        }
                        if (menuOpen == "") {
                            menuOpen = firstPath == paths[i] ? "menu-is-opening menu-open" : "";
                        }
                    }

                    menuhtml = menuhtml + '<li class="nav-item ' + menuOpen + '"><a href="#" class="nav-link ' + menuActive + '"><i class="nav-icon fas ' + menu.icon + '"></i><p>' + menu.name + '<i class="right fas fa-angle-left"></i></p></a><ul class="nav nav-treeview">';

                    for (j in menu.subMenu) {
                        submenu = menu.subMenu[j]

                        subMenuActive = fullPath == submenu.outcome ? "active" : "";
                        menuhtml = menuhtml + '<li class="nav-item"><a href="' + submenu.outcome + '" class="nav-link ' + subMenuActive + '"><i class="far ' + submenu.icon + ' nav-icon"></i><p>' + submenu.name + '</p></a></li>';
                    }

                    menuhtml = menuhtml + '</ul></li>';
                }

                $('#sidebarmenu').append(menuhtml);
                $('#navbar-name').append(getCookie("name"));
                $('#navbar-role-name').append(getCookie("role"));
            }
        }
    });
}

function logout() {
    token = getCookie("token")
    var status = 1
    $.ajax({
        type: "POST",
        url: "/api/auth/logout",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status == 0) {
                status = 0
            }
        }
    });

    if (status == 0) {
        removeSession()
        redirectToLogin();
    }
}

init();