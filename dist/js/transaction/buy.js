var mapProduct = {};
var mapUnit = {};
var dataRow = [];
var mapProductVal = {};
var tableTrx;
var tableTrxDetail;
var selectedTrxId;
var mapTrx = new Map();
var mapTrxDetail = new Map();
var mapSupplier = new Map();
var selectedTrxDetailId;

function initBuy() {
    mapProduct = {};
    mapUnit = {};
    dataRow = [];
    mapProductVal = {};

    tableTrx = $("#table-trx").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": true,
    });

    tableTrxDetail = $("#table-trx-detail").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": true,
    });

    $('#startDate').val(today());
    $('#endDate').val(today());
    $('#table-trx-detail').hide();
    $('#btn-kembali').hide();
    $('#nofakturlbl').hide();
    $('#customerlbl').hide();
    $('#nofaktur').hide();
    $('#customer').hide();

    initSupplier();
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
                optionhtml = '<option value="">-Pilih Supplier-</option>';
                for (i in response.data) {
                    mapSupplier.set(response.data[i].id, response.data[i])
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#supplier-select').html(optionhtml);
            }
        }
    });
}

function reloadTable() {
    tableTrx.clear().draw();
    mapTrx = new Map();

    $('#loading').show();

    $.ajax({
        type: "GET",
        url: "/api/transaction/findTrxBuy",
        headers: { "token": token },
        data: {
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
        },
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                $.each(response.data, function (index, item) {
                    mapTrx.set(item.id, item);
                    tableTrx.row.add([
                        item.code,
                        item.customerCode,
                        item.date,
                        '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="View Detail" onclick="viewdetail(\'' + item.id + '\');">'
                    ]).draw(false);


                });
            }
            $('#loading').hide();
        }
    });

}

function viewdetail(id) {
    tableTrxDetail.clear().draw();

    $('#table-trx-detail').show();
    $('#btn-kembali').show();
    $('#table-trx').hide();
    $('#nofakturlbl').show();
    $('#customerlbl').show();
    $('#nofaktur').show();
    $('#customer').show();
    $('#startDatelbl').hide();
    $('#endDatelbl').hide();
    $('#startDate').hide();
    $('#endDate').hide();

    $('#nofaktur').val(mapTrx.get(id).code);
    $('#customer').val(mapTrx.get(id).customerName);

    selectedTrxId = id;
    mapTrxDetail = new Map();

    $('#loading').show();

    $.ajax({
        type: "GET",
        url: "/api/transaction/findTrxBuyDetail",
        headers: { "token": token },
        data: {
            "transactionId": selectedTrxId,
        },
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                

                $.each(response.data, function (index, item) {
                    supplierCode = "-";
                    if (mapSupplier.get(item.supplierId) != undefined) {
                        supplierCode = mapSupplier.get(item.supplierId).code
                    }

                    mapTrxDetail.set(item.id, item)
                    tableTrxDetail.row.add([
                        item.productName,
                        supplierCode,
                        item.quantity,
                        item.price,
                        item.paymentMethod == "" ? "-" : item.paymentMethod,
                        '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareEdit(\'' + item.id + '\');">'
                    ]).draw(false);
                });
            }
            $('#loading').hide();
        }
    });
}

function back() {
    reloadTable();
    $('#table-trx-detail').hide();
    $('#btn-kembali').hide();
    $('#table-trx').show();
    $('#nofakturlbl').hide();
    $('#customerlbl').hide();
    $('#nofaktur').hide();
    $('#customer').hide();
    $('#startDatelbl').show();
    $('#endDatelbl').show();
    $('#startDate').show();
    $('#endDate').show();
}

function prepareEdit(id) {
    selectedTrxDetailId = id;
    initSupplier();

    $("#produk-sub").val(mapTrxDetail.get(id).productName);
    $("#harga-sub").val(mapTrxDetail.get(id).price.toLocaleString('id'));
    $("#jumlah-sub").val(mapTrxDetail.get(id).quantity.toLocaleString('id'));

}

function submit() {

    transaction = {
        "transactionDetailId": selectedTrxDetailId,
        "supplierId": $('#supplier-select').val(),
        "quantity": parseInt($('#jumlah-sub').val().replaceAll('.', '')),
        "price": parseInt($('#harga-sub').val().replaceAll('.', '')),
        "paymentMethod": $('#pembayaran-select').val(),
    }

    $.ajax({
        type: "POST",
        url: "/api/transaction/insertTransactionBuy",
        headers: { "token": token },
        data: JSON.stringify(transaction),
        contentType: 'application/json',
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                viewdetail(selectedTrxId);
            }
        }
    });
}


function hargaChange() {
    value = $("#harga-sub").val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#harga-sub").val(harga.toLocaleString('id'));
}

function jumlahChange() {
    value = $("#jumlah-sub").val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#jumlah-sub").val(harga.toLocaleString('id'));
}

initBuy();
$('.select2').select2()