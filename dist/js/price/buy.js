var products;

function init() {
    $.ajax({
        type: "GET",
        url: "/api/supplier/find",
        headers: { "token": token },
        data: { "active": true },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#supplier-modal-select').html(optionhtml);
            }
        }
    });

    initUnit();

    $('.select2').select2()

    $(function () {
        $("#table-product").DataTable({
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
    supplierId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    date = $('#date').val();

    if (supplierId !== "" && unitId !== "" && date !== "") {
        $.ajax({
            type: "GET",
            url: "/api/product/find",
            headers: { "token": token },
            data: {
                "active": true
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    products = response.data;
                }
            }
        });

        var mapPrice = {};
        $.ajax({
            type: "GET",
            url: "/api/supplier/buy-price",
            headers: { "token": token },
            data: {
                "supplierId": supplierId,
                "unitId": unitId,
                "date": date,
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    for (i in response.data) {
                        mapPrice[response.data[i].productId] = response.data[i]
                    }
                }
            }
        });

        html = '';
        for (i in products) {
            var price = 0;
            if (mapPrice[products[i].id] !== undefined) {
                price = mapPrice[products[i].id].price;
            }

            html += '<tr>';
            html += '<td>' + products[i].code + '</td>';
            html += '<td>' + products[i].name + '</td>';
            html += '<td>' + products[i].description + '</td>';
            html += '<td contenteditable=\'true\' class="td-edit allow_only_numbers">' + price + '</td>';
            html += '</tr>';
        }

        $('#product-data-body').html(html);
    }
}

function initUnit() {
    $.ajax({
        type: "GET",
        url: "/api/unit/find",
        headers: { "token": token },
        data: { "active": true },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + '</option>';
                }
                $('#unit-modal-select').html(optionhtml);
            }
        }
    });
}

function prepareAdd() {
    clearInput("unitCode");
    clearInput("unitDescription");
}

function submitUnit() {
    data = {};
    data["code"] = $("#unitCode").val();
    data["description"] = $("#unitDescription").val();
    token = getCookie("token");

    $.ajax({
        type: "POST",
        url: "/api/unit/create",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initUnit()
            }
        }
    });
}

function editUnit() {
    data = {};
    data["id"] = $("#unit-modal-select").val();
    data["active"] = false;
    token = getCookie("token");

    $.ajax({
        type: "POST",
        url: "/api/unit/edit",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initUnit()
            }
        }
    });
}

function prepareSubmit() {
    supplierId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    date = $('#date').val();

    if (supplierId !== "" && unitId !== "" && date !== "") {
        $("#submit-modal").modal()
    }

}

function submit() {
    supplierId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    date = $('#date').val();



    var prices = []

    var oTable = document.getElementById('table-product');
    var rowLength = oTable.rows.length;
    for (i = 1; i < rowLength; i++) {
        var oCells = oTable.rows.item(i).cells;
        var productId = products[i-1].id
        var price = oCells.item(3).innerHTML;
        prices.push({ "productId": productId, "price": parseFloat(price)})
    }

    var data = {
        "date": date,
        "supplierId": supplierId,
        "unitId": unitId,
        "prices": prices
    }

    token = getCookie("token");

    $.ajax({
        type: "POST",
        url: "/api/supplier/buy-price",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initUnit()
            }
        }
    });
}

init();