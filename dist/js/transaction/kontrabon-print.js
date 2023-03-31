tableItem = $("#tableItem").DataTable({
    "paging": false,
    "lengthChange": false,
    "searching": false,
    "ordering": false,
    "info": false,
    "autoWidth": false,
    "responsive": false,
    "columns": [
        { className: "centerTablePrintBorderBot" },
        { className: "centerTablePrintBorderBot" },
        { className: "centerTablePrintBorderBot" },
        { className: "numericTablePrintBorderBot" },
    ]
});

var urlParams = new URLSearchParams(window.location.search);
txId = urlParams.get('trxId');

$.ajax({
    type: "GET",
    url: "/api/kontrabon/findTransaction",
    headers: { "token": token },
    data: {
        "kontrabonId": txId
    },
    async: false,
    success: function (response) {
        if (response.status != 0) {
            toastr.warning(response.message);
        } else {
            kepada = "";
            total = 0;
            for (let i = 0; i < 35; i++) {
                if (i > response.data.length - 1) {
                    tableItem.row.add([
                        "",
                        "",
                        "",
                        "",
                    ]).draw(false);
                } else {
                    kepada = response.data[i].stakeholderName
                    tableItem.row.add([
                        i + 1,
                        response.data[i].code,
                        response.data[i].date,
                        response.data[i].total.toLocaleString('id'),
                    ]).draw(false);
                    total = total + response.data[i].total;
                }

                var m = new Date();
                var dateString = m.getDate() + " " + (getDate(m.getMonth() + 1)) + " " + m.getFullYear();
                $('#tanggalcetak').html("Bandung, " + dateString);
                $('#kepada').html(kepada);

            }
            tableItem.row.add([
                "",
                "",
                "Total",
                total.toLocaleString('id'),
            ]).draw(false);
        }
    }
});

function getDate(date) {
    switch (date) {
        case 1:
            return "Januari";
        case 2:
            return "Febuari";
        case 3:
            return "Maret";
        case 4:
            return "April";
        case 5:
            return "Mei";
        case 6:
            return "Juni";
        case 7:
            return "Juli";
        case 8:
            return "Agustus";
        case 9:
            return "September";
        case 10:
            return "Oktober";
        case 11:
            return "November";
        case 12:
            return "Desember";
        default:
            return "";
    }
}