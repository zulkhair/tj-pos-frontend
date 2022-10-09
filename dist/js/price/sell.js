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
        ],
        "lengthMenu": [ 5, 10, 25, 50, 75, 100 ]
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

    var harga = document.getElementById("price");
    harga.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            submit();
            $('#submit-modal').modal('toggle');
        }
    });

    $('#submit-modal').on('shown.bs.modal', function () {
        $(this).find('#price').focus();
    })  
}

function hargaChange() {
    value = $("#price").val();
    if (value == "" || value == undefined){
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#price").val(harga.toLocaleString('id'));
}

function initData() {
    ws_data = [];
    ws_data.push(['Kode', 'Nama', 'Satuan', 'Harga']);
    tableProduct.clear();
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
                "code": products[i].code,
                "name": products[i].name,
                "unit": products[i].unitId,
                "price": price.toLocaleString('id'),
            }

            productPriceMap[products[i].id] = product

            ws_data.push(
                [products[i].code, products[i].name, mapUnit[products[i].unitId].code, price]
            )

            tableProduct.row.add([
                products[i].code,
                products[i].name,
                mapUnit[products[i].unitId].code,
                price.toLocaleString('id'),
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
    $("#code-sub").val(productPriceMap[productId].code);
    $("#name-sub").val(productPriceMap[productId].name);
    $("#unit-sub").val(productPriceMap[productId].unit);
    $("#price").val(productPriceMap[productId].price);
    document.getElementById("price").focus();
}

function submit() {
    customerId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    price = parseInt($("#price").val().replaceAll('.', ''));
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

    $("#code-sub2").val(productPriceMap[productId].code);
    $("#name-sub2").val(productPriceMap[productId].name);
    $("#unit-sub2").val(productPriceMap[productId].unit);

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
                        response.data[i].price.toLocaleString('id'),
                        response.data[i].webUserName + ' (' + response.data[i].webUsername + ')',
                        response.data[i].transactionCode
                    ]).draw(false);
                }
            }
        }
    });
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Harga Jual",
        Subject: "Harga Jual",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Harga Jual");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Harga Jual"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'Harga Jual.xlsx');
}

init();