var mapProduct = {};
var dataTable = $("#table-product").DataTable();
var ws_data = [];
var responseData;
var mapCustomer = new Map();
var mapKontrabon = new Map();

function init() {

    $('#month').val(todayMonth());

    initCustomer();
    initData();
    $('.select2').select2()
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
                $('#customer-select-main').html(optionhtml);
            }
        }
    });
}

function initData() {
    customerId = $('#customer-select-main').val();
    if (customerId == null) {
        return;
    }

    $('#table-footer').html("");
    dataTable.clear().destroy();
    $.ajax({
        type: "GET",
        url: "/api/transaction/findCustomerReport",
        headers: { "token": token },
        data: {
            "month": $('#month').val(),
            "stakeholderId": customerId
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                responseData = response.data;
            }
        }
    });

    $('#order').val(responseData.totalOrder);

    // mapping kontrabon
    optionhtml = '';
    for (i in responseData.kontrabon) {
        optionhtml = optionhtml + '<option value="' + responseData.kontrabon[i].id + '">' + responseData.kontrabon[i].createdTime + '</option>';
        mapKontrabon.set(responseData.kontrabon[i].id, responseData.kontrabon[i]);
    }
    $('#kontrabon').html(optionhtml);
    changeKontrabon();

    theadhtml = "<tr>";
    theadhtml += "<th>No</th>";
    theadhtml += "<th>Item</th>";
    headerData = [];
    headerData.push("No");
    headerData.push("Item");
    for (let index = 1; index <= responseData.days; index++) {
        theadhtml += "<th>" + index + "</th>";
        headerData.push(index);
    }
    theadhtml += "</tr>"

    $('#table-head').html(theadhtml);

    columnClass = []
    for (let index = 1; index <= responseData.days + 2; index++) {
        if (index <= 2) {
            columnClass.push({ className: "" });
        } else {
            columnClass.push({ className: "numeric" });
        }
    }

    dataTable = $("#table-product").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "columns": columnClass
    });

    ws_data = [];
    ws_data.push(headerData);
    no = 0;
    totalAll = 0;
    totalPerDate = [];
    for (let index = 0; index <= responseData.days; index++) {
        totalPerDate.push(0)
    }
    for (i in responseData.productData) {
        no = no + 1;
        rowData = [];
        rowData.push(no);
        rowData.push(responseData.productData[i].productName);

        rowDataDownload = [];
        rowDataDownload.push(no);
        rowDataDownload.push(responseData.productData[i].productName);

        for (let index = 1; index <= responseData.days; index++) {
            if (responseData.productData[i].counts != null && index in responseData.productData[i].counts) {
                rowData.push(responseData.productData[i].counts[index]);
                rowDataDownload.push(responseData.productData[i].counts[index]);
            } else {
                rowData.push("");
                rowDataDownload.push("");
            }
        }

        dataTable.row.add(rowData).draw(false);

        ws_data.push(rowDataDownload);
    }
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Laporan per Customer",
        Subject: "Laporan per Customer",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Laporan per Customer");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Laporan per Customer"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'laporan-penjualan.xlsx');
}

function changeKontrabon() {
    kontrabonId = $('#kontrabon').val();
    if (kontrabonId == null) {
        $('#kontrabon-val').val("0");
        $('#kontrabon-cair-val').val("0");
        $('#sisa').val("0");
        return;
    }
    kontrabon = mapKontrabon.get(kontrabonId);
    $('#kontrabon-val').val(kontrabon.total.toLocaleString('id'));
    $('#kontrabon-cair').val(kontrabon.paymentDate);
    $('#kontrabon-cair-val').val(kontrabon.totalPayment.toLocaleString('id'));
    $('#sisa').val((kontrabon.total - kontrabon.totalPayment).toLocaleString('id'));
}

init();