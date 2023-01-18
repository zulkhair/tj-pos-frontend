tableItem = $("#tableItem").DataTable({
    "paging": false,
    "lengthChange": false,
    "searching": false,
    "ordering": false,
    "info": false,
    "autoWidth": false,
    "responsive": false,
    "columns": [
        { className: "rightTablePrint" },
        { className: "leftTablePrint" },
        { className: "centerTablePrint" },
        { className: "centerTablePrint" },
        { className: "numericTablePrint" },
        { className: "numericTablePrint" },
    ]
});

var urlParams = new URLSearchParams(window.location.search);
txId = urlParams.get('trxId');

$.ajax({
    type: "GET",
    url: "/api/transaction/find",
    headers: { "token": token },
    data: {
        "txId": txId
    },
    async: false,
    success: function (response) {
        if (response.status != 0) {
            toastr.warning(response.message);
        } else {
            if (response.data.length > 1) {

            } else {
                transaction = response.data[0];
                transactionDetail = transaction.transactionDetail

                subtotal = 0;
                for (let index = 0; index < 12; index++) {
                    console.log(index);
                    if (index > transactionDetail.length - 1) {
                        tableItem.row.add([
                            "",
                            "",
                            "",
                            "",
                            "",
                            "",
                        ]).draw(false);
                    } else {
                        tableItem.row.add([
                            index + 1 +".",
                            transactionDetail[index].productName,
                            transactionDetail[index].quantity,
                            transactionDetail[index].unitCode,
                            transactionDetail[index].sellPrice.toLocaleString('id'),
                            (transactionDetail[index].sellPrice * transactionDetail[index].quantity).toLocaleString('id'),
                        ]).draw(false);
                        subtotal = subtotal + (transactionDetail[index].sellPrice * transactionDetail[index].quantity)
                    }
                }

                $('#tanggal').html(transaction.createdTime);
                $('#kepada').html(transaction.stakeholderName);
                $('#nofaktur').html(transaction.code);
                $('#nopo').html(transaction.referenceCode);
                $('#keterangan').html(transaction.referenceCode);
                $('#subtotal').html(subtotal.toLocaleString('id'));
                $('#terbilang').html(terbilang(subtotal) + " rupiah");
                var m = new Date();
                var dateString = m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();
                $('#tanggalcetak').html(dateString);
                $('#userprint').html(getCookie("name"));
            }
        }
    }
});