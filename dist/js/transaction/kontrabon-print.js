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
                }

                var m = new Date();
                var dateString = m.getDate() + "/" + (m.getMonth() + 1) + "/" + m.getFullYear();
                $('#tanggalcetak').html("Bandung, "+dateString);
                $('#kepada').html(kepada);

            }
        }
    }
});