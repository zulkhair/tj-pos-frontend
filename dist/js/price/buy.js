var products;
var productPriceMap = {};
var selectedProductId;
var tableProduct;
var tableHistory;

function init() {
    $('.select2').select2()

    tableProduct = $("#table-product").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": true,
        "ordering": false,
        "info": false,
        "autoWidth": true,
        "responsive": false,
        "columns": [
            null,
            null,
            null,
            { className: "numeric" },
            null
        ]
    });

    tableHistory = $("#table-history-price").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "columns": [
            null,
            { className: "numeric" },
            null
        ]
    });

    initUnit();
    initData();
}

function initData() {
    tableProduct.clear().draw();
    unitId = $('#unit-modal-select').val();

    if (unitId !== "") {
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
            url: "/api/supplier/find-latest-price",
            headers: { "token": token },
            data: {
                "unitId": unitId,
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

        for (i in products) {
            var price = 0;
            if (mapPrice[products[i].id] !== undefined) {
                price = mapPrice[products[i].id].price;
            }

            product = {
                "id": products[i].id,
                "price": price,
            }

            productPriceMap[products[i].id] = product

            tableProduct.row.add([
                products[i].code,
                products[i].name,
                products[i].description,
                price,
                '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareSubmit(\'' + products[i].id + '\');"></button><button data-toggle="modal" data-target="#view-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="Edit" onclick="prepareView(\'' + products[i].id + '\');"></button>'
            ]).draw(false);
        }

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

function prepareSubmit(productId) {
    selectedProductId = productId
    $("#price").val(productPriceMap[productId].price);
}

function submit() {
    customerId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    price = $("#price").val();
    productId = selectedProductId;

    data = {
        "unitId": unitId,
        "productId": productId,
        "price": parseInt(price),
    }

    $.ajax({
        type: "POST",
        url: "/api/supplier/add-price",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData()
                selectedProductId = ""
            }
        }
    });
}

function prepareView(productId) {
    customerId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    tableProduct.clear().draw();

    $.ajax({
        type: "GET",
        url: "/api/supplier/find-price",
        headers: { "token": token },
        data: {
            "unitId": unitId,
            "productId": productId,
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                var t = $('#table-history-price').DataTable();
                for (i in response.data) {
                    t.row.add([
                        response.data[i].date,
                        response.data[i].price,
                        response.data[i].webUserName + ' (' + response.data[i].webUsername + ')'
                    ]).draw(false);
                }
            }
        }
    });
}

init();