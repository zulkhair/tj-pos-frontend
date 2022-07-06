var products;
var productPriceMap = {};
var selectedProductId;
var tableProduct;
var tableHistory;
var mapUnit = {};

function init() {
    $.ajax({
        type: "GET",
        url: "/api/customer/find",
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
        "autoWidth": true,
        "responsive": false,
        "columns": [
            null,
            { className: "numeric" },
            null,
            null
        ]
    });

    initUnit();
    initData();
}

function initData() {
    tableProduct.clear().draw();
    customerId = $('#supplier-modal-select').val();

    if (customerId !== "") {
        $.ajax({
            type: "GET",
            url: "/api/product/findActive",
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
            url: "/api/customer/find-latest-price",
            headers: { "token": token },
            data: {
                "customerId": customerId
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
                mapUnit[products[i].unitId].code,
                price,
                '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareSubmit(\'' + products[i].id + '\');"></button><button data-toggle="modal" data-target="#view-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="Edit" onclick="prepareView(\'' + products[i].id + '\');"></button>'
            ]).draw(false);
        }
    }
}

function initUnit() {
    mapUnit = {};
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
                for (i in response.data) {
                    mapUnit[response.data[i].id] = response.data[i];
                }
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
        "customerId": customerId,
        "unitId": unitId,
        "productId": productId,
        "price": parseInt(price),
    }

    $.ajax({
        type: "POST",
        url: "/api/customer/add-price",
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
    tableHistory.clear();

    $.ajax({
        type: "GET",
        url: "/api/customer/find-price",
        headers: { "token": token },
        data: {
            "customerId": customerId,
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
                    tableHistory.row.add([
                        response.data[i].date,
                        response.data[i].price,
                        response.data[i].webUserName + ' (' + response.data[i].webUsername + ')',
                        response.data[i].transactionCode
                    ]).draw(false);
                }
            }
        }
    });
}

init();