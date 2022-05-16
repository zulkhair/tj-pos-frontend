var mapProduct = new Map();
var mapUnit = new Map();
var dataRow = [];
var mapProductVal = new Map();
var tableProduct;

function init() {
    mapProduct = new Map();
    mapUnit = new Map();
    dataRow = [];
    mapProductVal = new Map();

    tableProduct = $("#table-product").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });


    initCustomer();
    initUnit();
    initProduct();
    initHarga();
    reloadTable();
}

function initCustomer() {
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
                $('#customer-select').html(optionhtml);
            }
        }
    });
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
                    mapUnit.set(response.data[i].id, response.data[i])
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + '</option>';
                }
                $('#unit-select').html(optionhtml);
            }
        }
    });
}

function initProduct() {
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
                optionhtml = '';
                for (i in response.data) {
                    mapProduct.set(response.data[i].id, response.data[i])
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + " (" + response.data[i].name + ")" + '</option>';
                }
                $('#product-select').html(optionhtml);

            }
        }
    });
}

function initHarga() {
    unitId = $('#unit-select').val();
    productId = $('#product-select').val();
    customerId = $('#customer-select').val();

    if (unitId !== "" && productId !== "") {
        $.ajax({
            type: "GET",
            url: "/api/customer/find-price",
            headers: { "token": token },
            data: {
                "unitId": unitId,
                "productId": productId,
                "customerId": customerId,
                "latest": "true",
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    if (response.data) {
                        $("#price").val(response.data[0].price);
                    } else {
                        $("#price").val(0);
                    }
                }
            }
        });

        $.ajax({
            type: "GET",
            url: "/api/supplier/find-price",
            headers: { "token": token },
            data: {
                "unitId": unitId,
                "productId": productId,
                "latest": "true",
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    if (response.data) {
                        $("#buy-price").val(response.data[0].price);
                    } else {
                        $("#buy-price").val(0);
                    }
                }
            }
        });
    }
}

function changeMasterData() {
    dataRow = [];
    mapProductVal = new Map();
    reloadTable();
    initHarga();
}


function addRow() {
    prodId = $('#product-select').val()
    unitId = $('#unit-select').val()
    productId = mapProductVal.get($('#product-select').val());

    if ($("#quantity").val() != "") {
        if (productId !== undefined) {
            toastr.warning("Data produk dengan kode '" + mapProduct.get(productId).code + "' sudah ada");
        } else {
            mapProductVal.set(prodId, prodId)
            dataRow.push(
                {
                    "productId": prodId,
                    "unitId": unitId,
                    "buyPrice": parseInt($("#buy-price").val()),
                    "price": parseInt($("#price").val()),
                    "quantity": parseInt($("#quantity").val()),
                }
            )

            reloadTable();
        }
    }

    $("#quantity").val("");
}

function removeRow(index) {
    mapProductVal.delete(dataRow[index].productId);

    dataRow.splice(index, 1);
    reloadTable();
}

function reloadTable() {
    total = 0;
    tableProduct.clear().draw();
    for (i in dataRow) {
        tableProduct.row.add([
            mapProduct.get(dataRow[i].productId).code + " (" + mapProduct.get(dataRow[i].productId).name + ")",
            mapUnit.get(dataRow[i].unitId).code,
            dataRow[i].buyPrice,
            dataRow[i].price,
            dataRow[i].quantity,
            (dataRow[i].price * dataRow[i].quantity),
            '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus" onclick="removeRow(' + i + ');"></button>'
        ]).draw(false);

        total = total + (dataRow[i].price * dataRow[i].quantity);
    }


    footer = '<tr><td colspan="5"><strong>Total</strong></td><td class="numeric"><strong>' + total + '</strong></td><td></td></tr>';
    $('#product-data-footer').html(footer);
}

function submit() {

    if (dataRow.length == 0) {
        toastr.warning("Harap tambahkan produk pada transaksi yang akan dibuat");
    } else {
        transaction = {
            "stakeholderId": $('#customer-select').val(),
            "date": $('#date').val(),
            "transactionType": "SELL",
            "transactionDetail": dataRow,
        }

        $.ajax({
            type: "POST",
            url: "/api/transaction/create",
            headers: { "token": token },
            data: JSON.stringify(transaction),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    init();
                }
            }
        });
    }


}


init();
$('.select2').select2()