var tableKontrabon;
var tableTrx;
var mapSelected = new Map();
var tableTrxEdit1;
var tableTrxEdit;
var mapSelectedEdit = new Map();
var selectedKontrabonId;
var mapKontrabon = new Map();
var mapCustomer = new Map();
var arrData = [];
var arrDataEdit = [];
var total1 = 0;
var total2 = 0;

function init() {
    tableKontrabon = $("#table-kontrabon").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    tableTrx = $("#table-trx").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "lengthMenu": [
            [-1, 20, 10],
            ['All', 20, 10],
        ],
    });

    tableTrxEdit1 = $("#table-trx-edit1").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "lengthMenu": [
            [-1, 20, 10],
            ['All', 20, 10],
        ],
    });

    tableTrxEdit = $("#table-trx-edit").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "lengthMenu": [
            [-1, 20, 10],
            ['All', 20, 10],
        ],
    });

    initData();
    $('.select2').select2()
    initTrx();
    home();
}

function home() {
    showTag("first");
    hideTag("second");
    hideTag("third");
}

function create() {
    hideTag("first");
    showTag("second");
    hideTag("third");
    total1 = 0;
    $('#total1').html(total1.toLocaleString('id'));
}

function edit() {
    hideTag("first");
    hideTag("second");
    showTag("third");
}

function initData() {
    tableKontrabon.clear();

    $('#startDate').val(startDate());
    $('#endDate').val(endDate());

    initCustomer();
    initKontrabon();
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
                    mapCustomer.set(response.data[i].id, response.data[i]);
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#customer-select').html(optionhtml);

                option2 = '<option disabled selected value> -- pilih salah satu -- </option>' + optionhtml;
                $('#customer-select-main').html(option2);
            }
        }
    });
}

function initKontrabon() {
    selectedKontrabonId = ""
    tableKontrabon.clear().draw();

    $.ajax({
        type: "GET",
        url: "/api/kontrabon/find",
        headers: {
            "token": token
        },
        data: {
            "customerId": $('#customer-select-main').val()
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                no = 0;
                for (i in response.data) {
                    no = no + 1;
                    btnDisabled = response.data[i].status == "CREATED" ? "" : "disabled"
                    buttonEdit = '<button  type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit Data" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>'
                    buttonPrint = '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-receipt " title="Cetak" onclick="printKontrabon(\'' + response.data[i].id + '\');"></button>';
                    buttonLunas = '<button ' + btnDisabled + ' data-toggle="modal" data-target="#lunas-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-check " title="Ubah Status ke Lunas" onclick="prepareLunas(\'' + response.data[i].id + '\');"></button>';
                    mapKontrabon.set(response.data[i].id, response.data[i]);
                    tableKontrabon.row.add([
                        no,
                        mapCustomer.get(response.data[i].customerId).code,
                        response.data[i].code,
                        response.data[i].createdTime,                        
                        response.data[i].total.toLocaleString('id'),
                        !response.data[i].paymentDate ? "" : response.data[i].paymentDate, 
                        !response.data[i].totalPayment ? "" : response.data[i].totalPayment.toLocaleString('id'),
                        response.data[i].status == "CREATED" ? "BELUM DIBAYAR" : "LUNAS",
                        buttonEdit + buttonPrint + buttonLunas
                    ]).draw(false);
                }
            }
        }
    });
}

function printKontrabon(trxId) {
    window.open("kontrabon-print.html?trxId=" + trxId)
}

function initTrx() {
    tableTrx.clear().draw();
    mapSelected = new Map();
    arrData = [];

    $.ajax({
        type: "GET",
        url: "/api/transaction/find",
        headers: { "token": token },
        data: {
            "txType": "SELL",
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": "PEMBUATAN",
            "stakeholderId": $('#customer-select').val()
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    arrData.push(response.data[i]);
                    tableTrx.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total.toLocaleString('id'),
                        '<input type="checkbox" id="checkbox' + i + '">'
                    ]).draw(false);
                    setChkbxListener(i, response.data[i].id, response.data[i]);
                }
            }
        }
    });
}

function initTrxEdit() {
    arrData = [];
    arrDataEdit = [];
    kontrabon = mapKontrabon.get(selectedKontrabonId);
    customer = mapCustomer.get(kontrabon.customerId);
    $('#kontrabon-code').val(kontrabon.code);
    $('#edit-customer').val(customer.code + " | " + customer.name);

    $('#edit-startDate').val(startDate());
    $('#edit-endDate').val(endDate());

    initKontrabonEdit();
}

function initKontrabonEdit(){
    tableTrxEdit1.clear().draw();
    mapSelected = new Map();
    tableTrxEdit.clear().draw();
    mapSelectedEdit = new Map();

    $.ajax({
        type: "GET",
        url: "/api/transaction/find",
        headers: { "token": token },
        data: {
            "txType": "SELL",
            "startDate": $('#edit-startDate').val(),
            "endDate": $('#edit-endDate').val(),
            "status": "PEMBUATAN",
            "stakeholderId": customer.id,
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    arrData.push(response.data[i]);
                    tableTrxEdit1.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total.toLocaleString('id'),
                        '<input type="checkbox" id="checkbox1' + i + '">'
                    ]).draw(false);

                    setChkbx1Listener(i, response.data[i].id, response.data[i]);
                }
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/kontrabon/findTransaction",
        headers: { "token": token },
        data: {
            "kontrabonId": kontrabon.id
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    arrDataEdit.push(response.data[i]);
                    tableTrxEdit.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total.toLocaleString('id'),
                        '<input type="checkbox" id="checkboxedit' + i + '">'
                    ]).draw(false);

                    setChkbxListenerEdit(i, response.data[i].id, response.data[i]);
                }
            }
        }
    });
}

function setChkbxListener(i, id, data) {
    const checkbox = document.getElementById('checkbox' + i);
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            mapSelected.set(id, data);
            total1 = total1 + data.total;
            $('#total1').html(total1.toLocaleString('id'));
        } else {
            mapSelected.delete(id);
            total1 = total1 - data.total;
            $('#total1').html(total1.toLocaleString('id'));
        }
    })
}

function setChkbx1Listener(i, id, data) {
    const checkbox = document.getElementById('checkbox1' + i);
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            mapSelected.set(id, data);
        } else {
            mapSelected.delete(id);
        }
    })
}

function setChkbxListenerEdit(i, id, data) {
    const checkbox = document.getElementById('checkboxedit' + i);
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            mapSelectedEdit.set(id, data);
        } else {
            mapSelectedEdit.delete(id);
        }
    })
}

function createKontrabon() {
    if (mapSelected.size <= 0) {
        toastr.warning("Harap tambahkan transaksi yang akan dimasukan kedalam kontrabon");
    } else {
        txId = [];

        for (const key of mapSelected.keys()) {
            txId.push(key)
        }

        kontrabon = {
            "customerId": $('#customer-select').val(),
            "transactionIds": txId
        }

        $.ajax({
            type: "POST",
            url: "/api/kontrabon/create",
            headers: { "token": token },
            data: JSON.stringify(kontrabon),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    initData();
                    initTrx();
                    home();
                }
            }
        });
    }

}

function addKontrabon() {
    if (mapSelected.size <= 0) {
        toastr.warning("Harap tambahkan transaksi yang akan dimasukan kedalam kontrabon");
    } else {
        txId = [];

        for (const key of mapSelected.keys()) {
            txId.push(key)
        }

        kontrabon = {
            "kontrabonId": selectedKontrabonId,
            "transactionIds": txId
        }

        $.ajax({
            type: "POST",
            url: "/api/kontrabon/add",
            headers: { "token": token },
            data: JSON.stringify(kontrabon),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    initTrxEdit();
                }
            }
        });
    }
}

function removeKontrabon() {
    if (mapSelectedEdit.size <= 0) {
        toastr.warning("Harap tambahkan transaksi yang akan dimasukan kedalam kontrabon");
    } else {
        txId = [];

        for (const key of mapSelectedEdit.keys()) {
            txId.push(key)
        }

        kontrabon = {
            "kontrabonId": selectedKontrabonId,
            "transactionIds": txId
        }

        $.ajax({
            type: "POST",
            url: "/api/kontrabon/remove",
            headers: { "token": token },
            data: JSON.stringify(kontrabon),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    initTrxEdit();
                }
            }
        });
    }
}

function totBayarChange() {
    value = $("#total-payment").val();
    if (value == "" || value == undefined){
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#total-payment").val(harga.toLocaleString('id'));
}

function submitLunas() {
    payload = {
        "kontrabonId": selectedKontrabonId,
        "paymentDate": $('#payment-date').val(),
        "totalPayment": parseInt($("#total-payment").val().replaceAll('.', ''))
    }

    $.ajax({
        type: "POST",
        url: "/api/kontrabon/update-lunas",
        headers: { "token": token },
        data: JSON.stringify(payload),
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

function prepareLunas(id) {
    selectedKontrabonId = id;
}

function prepareEdit(id) {
    selectedKontrabonId = id;
    edit();
    initTrxEdit();
}

function selectAll() {
    total1 = 0;
    for (i in arrData) {
        mapSelected.set(arrData[i].id, arrData[i]);
        $("#checkbox" + i).prop("checked", true);
        total1 = total1 + arrData[i].total;
        $('#total1').html(total1.toLocaleString('id'));
    }
}

function selectAll2() {
    for (i in arrData) {
        mapSelected.set(arrData[i].id, arrData[i]);
        $("#checkbox1" + i).prop("checked", true);
    }
}

function selectAll3() {
    for (i in arrDataEdit) {
        mapSelectedEdit.set(arrDataEdit[i].id, arrDataEdit[i]);
        $("#checkboxedit" + i).prop("checked", true);
    }
}

init();
