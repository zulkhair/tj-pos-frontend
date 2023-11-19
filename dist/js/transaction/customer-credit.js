var mapProduct = {};
var dataTable = $("#table-product").DataTable();
var ws_data = [];
var responseData;

function init() {

    $('#month').val(todayMonth());

    initData();

}

function initData(){
    $('#table-footer').html("");
    dataTable.clear().destroy();
    $.ajax({
        type: "GET",
        url: "/api/transaction/findCustomerCredit",
        headers: { "token": token },
        data: { "month": $('#month').val() },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                responseData = response.data;
            }
        }
    });

    theadhtml = "<tr>";
    theadhtml += "<th>No</th>";
    theadhtml += "<th>Kode Customer</th>";
    theadhtml += "<th>" + responseData['previousMonth'] + "</th>";
    headerData = [];
    headerData.push("No");
    headerData.push("Kode Customer");
    headerData.push(responseData['previousMonth']);
    for (let index = 1; index <= responseData.days; index++) {
        theadhtml += "<th>" + index + "</th>";
        headerData.push(index);
    }
    theadhtml += "<th>Total</th>";
    headerData.push("Total");
    theadhtml += "</tr>"

    $('#table-head').html(theadhtml);

    columnClass = []
    for (let index = 1; index <= responseData.days+4; index++) {
        if (index <= 2){
            columnClass.push({ className: "" });
        }else{
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
    for (i in responseData.transactions) {
        no = no + 1;
        rowData = [];
        rowData.push(no);
        rowData.push(responseData.transactions[i].customerCode);
        rowData.push(responseData.transactions[i].lastCredit.toLocaleString('id'));

        rowDataDownload = [];
        rowDataDownload.push(no);
        rowDataDownload.push(responseData.transactions[i].customerCode);
        rowDataDownload.push(responseData.transactions[i].lastCredit);
        total = responseData.transactions[i].lastCredit;
        for (let index = 1; index <= responseData.days; index++) {

            if (responseData.transactions[i].credits != null && index in responseData.transactions[i].credits) {
                rowData.push(responseData.transactions[i].credits[index].toLocaleString('id'));
                rowDataDownload.push(responseData.transactions[i].credits[index]);
                total += responseData.transactions[i].credits[index];
            } else {
                rowData.push("");
                rowDataDownload.push("");
            }
        }

        rowData.push(total.toLocaleString('id'));
        rowDataDownload.push(total);
        dataTable.row.add(rowData).draw(false);

        ws_data.push(rowDataDownload);
        totalAll = totalAll + total;
    }
    totalDownload = new Array(responseData.days);
    totalDownload[responseData.days+2] = "Total";
    totalDownload[responseData.days+3] = totalAll;
    ws_data.push(totalDownload);

    tfoothtml = "<tr>";
    tfoothtml += "<td colspan=\""+(3+responseData.days)+"\" style=\"text-align: right;\">Total</td>";
    tfoothtml += "<td style=\"text-align: right;\">"+totalAll.toLocaleString('id')+"</td>";
    tfoothtml += "</tr>";

    $('#table-footer').html(tfoothtml);
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Laporan Piutang",
        Subject: "Laporan Piutang",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Laporan Piutang");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Laporan Piutang"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'laporan-piutang.xlsx');
}

init();