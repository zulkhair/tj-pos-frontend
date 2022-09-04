var mapTrx = new Map();
var tableTrx;
var tableDetail;
var selectedTrxId;

function init() {
    tableTrx = $("#table-trx").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "columns": [
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "numeric" },
            { className: "" },
            { className: "" },
        ]
    });

    tableDetail = $("#table-detail").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "columns": [
            { className: "" },
            { className: "" },
            { className: "" },
            { className: "numeric" },
            { className: "numeric" },
            { className: "numeric" },
            { className: "numeric" },
            { className: "numeric" },
            { className: "" },
        ]
    });

    $('.select2').select2()

    initData();
    first();
}

function initData() {
    $('#startDate').val(startDate());
    $('#endDate').val(endDate());

    initCustomer();
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
                optionhtml = '<option value="">-</option>';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#customer-select').html(optionhtml);
            }
        }
    });
}

function reloadTable() {
    tableTrx.clear().draw();
    mapTrx = new Map();

    $.ajax({
        type: "GET",
        url: "/api/transaction/find",
        headers: { "token": token },
        data: {
            "txType": "SELL",
            "code": $('#txCode').val(),
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": $('#status-select').val(),
            "stakeholderId": $('#customer-select').val()
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                count = 1;
                for (i in response.data) {
                    mapTrx.set(response.data[i].id, response.data[i])
                    disable = response.data[i].status == 'DIBAYAR' ? 'disabled' : '';
                    btnDis = response.data[i].status == 'PEMBUATAN' ? '' : 'hidden disabled';
                    tableTrx.row.add([
                        count,
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total.toLocaleString('id'),
                        response.data[i].status,
                        '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="View Detail" onclick="viewdetail(\'' + response.data[i].id + '\');"></button><button '+btnDis+' type="button" data-toggle="modal" data-target="#remove-modal" class="btn-tbl btn btn-block btn-primary fas fa-circle-minus " title="Hapus Faktur" onclick="prepareDelete(\'' + response.data[i].id + '\');"></button>'
                    ]).draw(false);
                    count++;                    
                }
            }
        }
    });
}

function viewdetail(trxId) {
    selectedTrxId = trxId;
    data = mapTrx.get(trxId);
    dataRow = data.transactionDetail;
    total = 0;
    tableDetail.clear().draw();

    buttonEdit = ''

    count = 1;
    for (i in dataRow) {
        if (data.status != 'DIBAYAR') {
            buttonEdit = '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareSubmit(\'' + dataRow[i].productCode + '\');"></button>';
        }
        tableDetail.row.add([
            count,
            dataRow[i].productCode + " (" + dataRow[i].productName + ")",
            dataRow[i].unitCode,
            dataRow[i].buyQuantity,
            dataRow[i].buyPrice.toLocaleString('id'),
            dataRow[i].quantity,
            dataRow[i].sellPrice.toLocaleString('id'),
            (dataRow[i].sellPrice * dataRow[i].quantity).toLocaleString('id'),
            '<button data-toggle="modal" data-target="#view-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="Edit" onclick="prepareView(\'' + dataRow[i].productCode + '\');"></button>'
        ]).draw(false);
        count++;
        total = total + (dataRow[i].sellPrice * dataRow[i].quantity);
    }

    $('#txCodesec').val(data.code)
    $('#startDatesec').val(data.date)
    $('#customersec').val(data.stakeholderName + "(" + data.stakeholderCode + ")");
    $('#statussec').val(data.status)

    // footer = '<tr><td colspan="6"><strong>Total</strong></td><td class="numeric"><strong>' + total + '</strong></td><td></td></tr>';
    // $('#detail-data-footer').html(footer);

    second();
}

function back() {
    first();
}

function prepareUpdateStatus(txId) {
    selectedTrxId = txId;
}

function prepareDelete(txId){
    selectedTrxId = txId;
}

function deleteFaktur(){
    request = {
        "transactionId": selectedTrxId
    }
    
    $.ajax({
        type: "POST",
        url: "/api/transaction/cancelTrx",
        headers: { "token": token },
        data: JSON.stringify(request),
        contentType: 'application/json',
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData();
            }
        }
    });
}

function updateStatus() {
    request = {
        "transactionId": selectedTrxId
    }

    $.ajax({
        type: "POST",
        url: "/api/transaction/updateStatus",
        headers: { "token": token },
        data: JSON.stringify(request),
        contentType: 'application/json',
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData();
            }
        }
    });
}

function first() {
    showTag("first");
    hideTag("table-edit");
    hideTag("edit-sec");
    hideTag("save-sec");
    hideTag("second");
}

function second() {
    showTag("second");
    hideTag("table-edit");
    showTag("edit-sec");
    hideTag("save-sec");
    hideTag("first");

    showTag("btn-kembali");
}

function edit() {
    showTag("table-edit");
    hideTag("edit-sec");
    showTag("save-sec");

    showTag("second");
    hideTag("first");
    hideTag("btn-kembali");
}

function cancel(){
    second();
}


init();
