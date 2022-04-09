var mapProduct = {};
var mapUnit = {};
var dataRow = [];
var mapProductVal = {};

function init() {
    mapProduct = {};
    mapUnit = {};
    dataRow = [];
    mapProductVal = {};

    initSupplier();
    initUnit();
    initProduct();
    reloadTable();
}

function initSupplier() {
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
                $('#supplier-select').html(optionhtml);
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
                    mapUnit[response.data[i].id] = response.data[i]
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
                    mapProduct[response.data[i].id] = response.data[i]
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + " (" + response.data[i].name + ")" + '</option>';
                }
                $('#product-select').html(optionhtml);

            }
        }
    });
}

function initHarga() {
    unitId = $('#unit-select').val();
    date = $('#date').val();
    productId = $('#product-select').val();
    supplierId = $('#supplier-select').val();

    if (unitId !== "" && date !== "" && productId !== "") {
        $.ajax({
            type: "GET",
            url: "/api/supplier/buy-price",
            headers: { "token": token },
            data: {
                "unitId": unitId,
                "date": date,
                "productId": productId,
                "supplierId": supplierId,
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
    }
}

function changeMasterData() {
    dataRow = [];
    mapProductVal = {};
    reloadTable();
    initHarga();
}


function addRow() {
    prodId = $('#product-select').val()
    unitId = $('#unit-select').val()
    productId = mapProductVal[$('#product-select').val()];

    if (productId !== undefined) {
        toastr.warning("Data produk dengan kode '" + mapProduct[productId].code + "' sudah ada");
    } else if ($("#price").val() == 0) {
        toastr.warning("Harga produk dengan kode '" + mapProduct[prodId].code + "' dengan satuan " + mapUnit[unitId].code + " di tanggal " + $('#date').val() + " belum ditambahkan");
    } else {
        mapProductVal[prodId] = prodId
        dataRow.push(
            {
                "productId": prodId,
                "unitId": unitId,
                "price": parseInt($("#price").val()),
                "quantity": parseInt($("#quantity").val()),
            }
        )

        reloadTable();
    }


    $("#quantity").val("");
}

function removeRow(index) {
    dataRow.splice(index, 1);
    reloadTable();
}

function reloadTable() {
    total = 0;
    html = '';
    for (i in dataRow) {
        html += '<tr>';
        html += '<td>' + mapProduct[dataRow[i].productId].code + " (" + mapProduct[dataRow[i].productId].name + ")" + '</td>';
        html += '<td>' + mapUnit[dataRow[i].unitId].code + '</td>';
        html += '<td class="numeric">' + dataRow[i].price + '</td>';
        html += '<td class="numeric">' + dataRow[i].quantity + '</td>';
        html += '<td class="numeric">' + (dataRow[i].price * dataRow[i].quantity) + '</td>';
        html += '<td><button type="button" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus" onclick="removeRow(' + i + ');"></button>';
        html += '</tr>';

        total = total + (dataRow[i].price * dataRow[i].quantity)
    }

    $('#product-data-body').html(html);

    footer = '<tr><td colspan="4"><strong>Total</strong></td><td class="numeric"><strong>' + total + '</strong></td><td></td></tr>';
    $('#product-data-footer').html(footer)
}

function submit() {

    if (dataRow.length == 0) {
        toastr.warning("Harap tambahkan produk pada transaksi yang akan dibuat");
    } else {
        transaction = {
            "stakeholderId": $('#supplier-select').val(),
            "date": $('#date').val(),
            "transactionType": "BUY",
            "referenceCode": $('#refference').val(),
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