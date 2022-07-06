var tableKontrabon;
var tableTrx;
var mapSelected = new Map();
var tableTrxEdit1;
var tableTrxEdit;
var mapSelectedEdit = new Map();
var selectedKontrabonId;
var mapKontrabon = new Map();
var mapCustomer = new Map();

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
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    tableTrxEdit1 = $("#table-trx-edit1").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    tableTrxEdit = $("#table-trx-edit").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
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
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    button = '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit Data" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button><button data-toggle="modal" data-target="#lunas-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-check " title="Ubah Status ke Lunas" onclick="prepareLunas(\'' + response.data[i].id + '\');"></button>';
                    mapKontrabon.set(response.data[i].id, response.data[i]);
                    tableKontrabon.row.add([
                        response.data[i].code,
                        response.data[i].createdTime,
                        response.data[i].status == "CREATED" ? "BELUM DIBAYAR" : "LUNAS",
                        response.data[i].total,
                        response.data[i].status == "CREATED" ? button : ""
                    ]).draw(false);
                }
            }
        }
    });
}

function initTrx() {
    tableTrx.clear().draw();
    mapSelected = new Map();

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
                    tableTrx.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total,
                        '<input type="checkbox" id="checkbox' + i + '">'
                    ]).draw(false);

                    setChkbxListener(i, response.data[i].id, response.data[i]);
                }
            }
        }
    });
}

function initTrxEdit() {
    kontrabon = mapKontrabon.get(selectedKontrabonId);
    customer = mapCustomer.get(kontrabon.customerId);
    $('#kontrabon-code').val(kontrabon.code);
    $('#edit-customer').val(customer.code + " | " + customer.name);

    $('#edit-startDate').val(startDate());
    $('#edit-endDate').val(endDate());

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
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": "PEMBUATAN",
            "stakeholderId": customer.id,
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    tableTrxEdit1.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total,
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
                    tableTrxEdit.row.add([
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].stakeholderName + "(" + response.data[i].stakeholderCode + ")",
                        response.data[i].total,
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
        } else {
            mapSelected.delete(id);
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

function submitLunas() {
    $.ajax({
        type: "POST",
        url: "/api/kontrabon/update-lunas",
        headers: { "token": token },
        data: selectedKontrabonId,
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

function prepareLunas(id){
    selectedKontrabonId = id;
}

function prepareEdit(id) {
    selectedKontrabonId = id;
    edit();
    initTrxEdit();
}

init();
