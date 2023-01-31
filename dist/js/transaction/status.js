var mapTrx = new Map();
var tableTrx;
var tableDetail;
var tableEdit;
var selectedTrxId;
var mapProduct = new Map();
var mapUnit = new Map();
var dataRow = [];
var mapProductVal = new Map();
var index = 0;
var mapData = new Map();
var mapProductCodeName = new Map();

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
        ]
    });

    tableEdit = $("#table-edit").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
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
                    btnDis = response.data[i].status == 'PEMBUATAN' ? '' : 'disabled';
                    trxStatus = response.data[i].status;
                    if (response.data[i].status == 'PEMBUATAN') {
                        trxStatus = 'DICETAK';
                    }
                    tableTrx.row.add([
                        count,
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total.toLocaleString('id'),
                        trxStatus,
                        '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-search " title="View Detail" onclick="viewdetail(\'' + response.data[i].id + '\');">' +
                        '</button><button type="button" class="btn-tbl btn btn-block btn-primary fas fa-receipt" title="Print Faktur" onclick="printFaktur(\'' + response.data[i].id + '\');"></button>' +
                        '</button><button ' + btnDis + ' type="button" data-toggle="modal" data-target="#remove-modal" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus Faktur" onclick="prepareDelete(\'' + response.data[i].id + '\');"></button>'
                    ]).draw(false);
                    count++;
                }
            }
        }
    });
}

function printFaktur(trxId) {
    window.open("sell-print.html?trxId=" + trxId)
}

function viewdetail(trxId) {
    selectedTrxId = trxId;
    data = mapTrx.get(trxId);
    dataRowDetail = data.transactionDetail;
    total = 0;
    tableDetail.clear().draw();

    buttonEdit = ''

    count = 1;
    for (i in dataRowDetail) {
        if (data.status != 'DIBAYAR') {
            buttonEdit = '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareSubmit(\'' + dataRowDetail[i].productCode + '\');"></button>';
        }
        tableDetail.row.add([
            count,
            dataRowDetail[i].productCode + " (" + dataRowDetail[i].productName + ")",
            dataRowDetail[i].unitCode,
            dataRowDetail[i].buyQuantity,
            dataRowDetail[i].buyPrice.toLocaleString('id'),
            dataRowDetail[i].quantity,
            dataRowDetail[i].sellPrice.toLocaleString('id'),
            (dataRowDetail[i].sellPrice * dataRowDetail[i].quantity).toLocaleString('id'),
        ]).draw(false);
        count++;
        total = total + (dataRowDetail[i].sellPrice * dataRowDetail[i].quantity);
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

function prepareDelete(txId) {
    selectedTrxId = txId;
}

function deleteFaktur() {
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
    showTag("table-detail_wrapper");
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
    showTag("table-detail_wrapper");

    showTag("btn-kembali");
}

function edit() {
    showTag("table-edit");
    hideTag("edit-sec");
    hideTag("table-detail_wrapper");
    showTag("save-sec");

    showTag("second");
    hideTag("first");
    hideTag("btn-kembali");

    mapProduct = new Map();
    mapUnit = new Map();
    dataRow = [];
    mapProductVal = new Map();
    tableEdit.clear();
    mapData = new Map();
    index = 0;

    initProduct();

    dataRowDetail = data.transactionDetail;
    
    for (i in dataRowDetail) {
        dataRow.push(index);
        data2 = {
            "productCodeName" : dataRowDetail[i].productCode + ' | ' + dataRowDetail[i].productName,
            "jumlah" : dataRowDetail[i].quantity,
            "jual" : dataRowDetail[i].sellPrice,
            "beli" : dataRowDetail[i].buyPrice,
            "satuan" : dataRowDetail[i].unitCode,
        };

        mapData.set(parseInt(i), data2);
        index++;
    }    
    reloadTableEdit(undefined);
}

function initProduct() {
    arrProduct = [];
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
                for (i in response.data) {
                    mapProduct.set(response.data[i].id, response.data[i]);
                    mapProductCodeName.set(response.data[i].code + ' | ' + response.data[i].name, response.data[i])
                    arrProduct.push(response.data[i]);
                }

            }
        }
    });
}

function addNewRow() {
    index++;
    dataRow.push(index);
    mapData.set(index, {
        "productCodeName": "",
        "jumlah": "",
        "satuan": "",
        "jual": "",
        "beli": ""
    })
    reloadTableEdit(index);
}

function reloadTableEdit(indexnew) {
    tableEdit.clear();
    count = 1;
    for (i in dataRow) {
        index = dataRow[i];
        arrIndex = i;
        tableEdit.row.add([
            count,
            getProductInput(index),
            getText("jumlah", index, "number", "0", "", "jumlahChange"),
            getText("satuan", index, "text", "-", "disabled", ""),
            getText("jual", index, "text", "0", "", "jualChange"),
            getText("beli", index, "text", "0", "", "beliChange"),
            getText("total", index, "text", "0", "disabled", ""),
            '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus" onclick="removeRow(\'' + index + ',' + arrIndex + '\');"></button>'
        ]).draw(false);

        data2 = mapData.get(index);
        if (data2 != undefined) {
            $("#product-select-" + index).val(data2.productCodeName);
            $("#jumlah-" + index).val(data2.jumlah);
            $("#jual-" + index).val(parseInt(data2.jual).toLocaleString('id'));
            $("#beli-" + index).val(parseInt(data2.beli).toLocaleString('id'));
            $("#satuan-" + index).val(data2.satuan);
            $("#total-" + index).val((data2.jual * data2.jumlah).toLocaleString('id'));
        }

        count++;

        var product = document.getElementById("product-select-" + index);
        var jumlah = document.getElementById("jumlah-" + index);
        var jual = document.getElementById("jual-" + index);
        var beli = document.getElementById("beli-" + index);

        product.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });

        jumlah.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });

        jual.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });

        beli.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });
    }
    if (indexnew != undefined) {
        document.getElementById("product-select-" + indexnew).focus();
    }
}

function getProductInput(index) {
    optionhtml = '<input type="text" class="form-control" id="product-select-' + index + '" value="" list="products" style="width:200px" onkeyup="productChange(' + index + ')">';
    optionhtml = optionhtml + '<datalist id="products">';
    for (i in arrProduct) {
        optionhtml = optionhtml + '<option>' + arrProduct[i].code + ' | ' + arrProduct[i].name + '</option>';
    }
    optionhtml = optionhtml + '</datalist></input>';

    return optionhtml;
}

function getText(id, index, type, placeholder, disabled, func) {
    return '<input ' + disabled + ' class="form-control" type="' + type + '" id="' + id + '-' + index + '" placeholder="' + placeholder + '" onkeyup="' + func + '(' + index + ')"/>'
}

function productChange(index) {
    productCodeName = $("#product-select-" + index).val();
    product = mapProductCodeName.get(productCodeName);

    if (product != undefined) {
        initHarga(product.id, index)

        $("#satuan-" + index).val(product.unitCode);

        setMapData(index);
        document.getElementById("jumlah-" + index).focus();
    }
}

function jumlahChange(index) {
    value = $("#jumlah-" + index).val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    jumlah = parseFloat(value);
    jual = parseInt($("#jual-" + index).val().replaceAll('.', ''));
    $("#total-" + index).val((jumlah * jual).toLocaleString('id'));

    setMapData(index);
    sumTotal();
}

function jualChange(index) {
    value = $("#jual-" + index).val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    jumlah = parseFloat($("#jumlah-" + index).val());
    jual = parseInt(value.replaceAll('.', ''));
    $("#total-" + index).val((jumlah * jual).toLocaleString('id'));
    $("#jual-" + index).val(jual.toLocaleString('id'));

    setMapData(index);
    sumTotal();
}

function beliChange(index) {
    value = $("#beli-" + index).val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    beli = parseInt(value.replaceAll('.', ''));
    $("#beli-" + index).val(beli.toLocaleString('id'));

    setMapData(index);
}

function setMapData(index) {
    data2 = mapData.get(index);
    data2.productCodeName = $("#product-select-" + index).val();
    data2.jumlah = $("#jumlah-" + index).val();
    data2.jual = $("#jual-" + index).val().replaceAll('.', '');
    data2.beli = $("#beli-" + index).val().replaceAll('.', '');
    data2.satuan = $("#satuan-" + index).val();

    mapData.set(index, data2);

}

function initHarga(productId, index) {
    customerId = $('#customer-select').val();

    if (productId !== "") {
        $.ajax({
            type: "GET",
            url: "/api/customer/find-price",
            headers: { "token": token },
            data: {
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
                        $("#jual-" + index).val(response.data[0].price.toLocaleString('id'));
                    } else {
                        $("#jual-" + index).val(0);
                    }
                }
            }
        });

        $.ajax({
            type: "GET",
            url: "/api/supplier/find-price",
            headers: { "token": token },
            data: {
                "productId": productId,
                "latest": "true",
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    if (response.data) {
                        $("#beli-" + index).val(response.data[0].price.toLocaleString('id'));
                    } else {
                        $("#beli-" + index).val(0);
                    }
                }
            }
        });
    }
}

function sumTotal() {
    total = 0;
    for (i in dataRow) {
        data2 = mapData.get(dataRow[i]);
        total = total + (parseFloat(data2.jumlah) * parseInt(data2.jual));
    }
    $("#total-all").val(total.toLocaleString('id'));
}

function removeRow(value) {
    values = value.split(",");

    dataRow.splice(parseInt(values[1]), 1);
    mapData.delete(parseInt(values[0]));

    if (dataRow.length == 0) {
        addNewRow();
    }

    reloadTableEdit(undefined)
}

function cancel() {
    second();
}

function submitEdit(){
    if (dataRow.length <= 0 || mapData.get(dataRow[0]) == undefined || mapData.get(dataRow[0]).productCodeName == "") {
        toastr.warning("Harap tambahkan produk pada transaksi yang akan dibuat");
    } else {
        detail = [];

        for (i in dataRow) {
            data = mapData.get(dataRow[i]);
            product = mapProductCodeName.get(data.productCodeName);
            detail.push(
                {
                    "productId": product.id,
                    "buyPrice": parseInt(data.beli),
                    "sellPrice": parseInt(data.jual),
                    "quantity": parseFloat(data.jumlah),
                }
            )
        }

        transaction = {
            "id": selectedTrxId,
            "transactionDetail": detail,
        }

        $.ajax({
            type: "POST",
            url: "/api/transaction/update",
            headers: { "token": token },
            data: JSON.stringify(transaction),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {                    
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    initData();
                    first();
                }
            }
        });
    }
}


init();
