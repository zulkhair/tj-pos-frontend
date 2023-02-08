var urlParams = new URLSearchParams(window.location.search);
var transactionDetail;
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
            }
        }
    }
});

page = `<div class="page" id="{{id}}"><div class="subpage" id="sub-page"></div></div>`;

header = `<table class="faktur-table">
<tr style="height: 40px;">
    <td rowspan="4" style="border: solid thin;vertical-align: middle;text-align: center;">
        <span
            style="font-size: 40pt;padding-right: 5px;padding-left: 5px;">TJ</span>
    </td>
    <td style="font-size: 16pt;font-weight: bold;width: 29%;padding-left: 10px;">FAKTUR PENJUALAN</td>
    <td style="width: 9%;">Tanggal</td>
    <td style="width: 1%;">:</td>
    <td style="width: 22%;" id="{{tanggal}}"></td>
    <td style="padding-left: 20px;width: 8%;vertical-align: top;">Kepada</td>
    <td style="width: 1%;">:</td>
    <td id="{{kepada}}"></td>
</tr>
<tr>
    <td style="font-size: 12pt;font-weight: bold;padding-left: 10px;">UD. TUNAS JAYA</td>
    <td >No. Faktur</td>
    <td style="width: 1%;">:</td>
    <td  id="{{nofaktur}}"></td>
    <td ></td>
    <td ></td>
    <td ></td>
</tr>
<tr>
    <td style="padding-left: 10px;">Pasar Induk Caringin Blok D-25</td>
    <td >No. PO</td>
    <td style="width: 1%;">:</td>
    <td  id="{{nopo}}"></td>
    <td ></td>
    <td ></td>
    <td ></td>
</tr>
<tr>
    <td style="padding-left: 10px;">081 374 335 448</td>
    <td ></td>
    <td ></td>
    <td ></td>
    <td ></td>
    <td ></td>
    <td ></td>
</tr>
</table>`;

content = `<table class="faktur-content" id="{{tableItem}}">
<tr>
    <th style="width: 30px;border-top: solid thin;border-bottom: solid thin;text-align: center;">No</th>
    <th style="width: 350px;border-top: solid thin;border-bottom: solid thin;text-align: center;">Nama Item</th>
    <th style="width: 200px;border-top: solid thin;border-bottom: solid thin;text-align: center;">Jumlah</th>
    <th style="width: 200px;border-top: solid thin;border-bottom: solid thin;text-align: center;">Satuan</th>
    <th style="width: 200px;border-top: solid thin;border-bottom: solid thin;text-align: center;">Harga</th>
    <th style="width: 200px;border-top: solid thin;border-bottom: solid thin;text-align: center;">Total</th>
</tr>
</table>`;

footer = `<hr style="border: solid thin; width:100%; margin: 2px 0 2px 0;">
<table class="faktur-content" style="width: 100%;">
    <tr>
        <td style="padding-left: 10px;width: 100px;">Keterangan</td>
        <td style="width: 10px;">:</td>
        <td style="width: 500px;"></td>
        <td>Sub Total : </td>
        <td style="text-align: right;" id="subtotal"></td>
    </tr>
</table>
<table class="faktur-content" style="width: 100%;">
    <tr>
        <td style="text-align: center;width: 150px;vertical-align: top;">Hormat Kami</td>
        <td style="text-align: center;width: 150px;vertical-align: top;">Penerima</td>
        <td style="width: 100px;vertical-align: top;padding-left: 60px;">Terbilang</td>
        <td style="vertical-align: top;text-align: center;">:</td>
        <td style="height: 60px;vertical-align: top;" id="terbilang"></td>
    </tr>     
    <tr>
        <td style="text-align: center;padding-bottom: 8px;">Isa Anshori</td>
        <td style="font-size: 11pt;text-align: center;padding-bottom: 8px;">(...........................)</td>
    </tr>               
</table>
<table class="faktur-content" style="width: 100%;">
    <tr>
        <td style="font-size: 10pt;font-weight: 400;text-align: left;" id="tanggalcetak">25/09/2022 12:59:59</td>
        <td style="font-size: 10pt;font-weight: 400;text-align: right;" id="userprint">super</td>
    </tr> 
</table>`;

halaman = `<hr style="border: solid thin; width:100%; margin: 2px 0 2px 0;">
<table class="faktur-content" style="width: 100%;">
    <tr>
        <td style="padding-left: 10px;width: 100px;"></td>
        <td style="width: 10px;"></td>
        <td style="width: 500px;"></td>
        <td>Halaman : </td>
        <td style="text-align: center;">{{halaman}}</td>
    </tr>
</table>`;

totalPage = Math.ceil(transactionDetail.length/8);
tableItems = [];
for (let i = 0; i < totalPage; i++) {
    $("#book").append(page.replace("{{id}}", "page" + i));


    $("#page" + i).append(header.replace("{{tanggal}}", "tanggal" + i)
        .replace("{{nofaktur}}", "nofaktur" + i)
        .replace("{{nopo}}", "nopo" + i)
        .replace("{{kepada}}", "kepada" + i));

    $("#page" + i).append(content.replace("{{tableItem}}", "tableItem" + i));

    if (i < totalPage - 1) {
        $("#page" + i).append(halaman.replace("{{halaman}}", (i + 1) + " / " + totalPage));
    }

    if (i == totalPage - 1) {
        $("#page" + i).append(footer);
    }

    tableItem = $("#tableItem" + i).DataTable({
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

    tableItems.push(tableItem);
}

subtotal = 0;
no = 0;
for (let i = 0; i < totalPage; i++) {
    $('#tanggal' + i).html(transaction.date);
    $('#kepada' + i).html(transaction.stakeholderName);
    $('#nofaktur' + i).html(transaction.code);
    $('#nopo' + i).html(transaction.referenceCode);

    for (let index = 0; index < 8; index++) {
        if (no > transactionDetail.length-1) {
            tableItems[i].row.add([
                "",
                "",
                "",
                "",
                "",
                "",
            ]).draw(false);
        } else {
            tableItems[i].row.add([
                (no + 1) + ".",
                transactionDetail[no].productName,
                transactionDetail[no].quantity,
                transactionDetail[no].unitCode,
                transactionDetail[no].sellPrice.toLocaleString('id'),
                (transactionDetail[no].sellPrice * transactionDetail[no].quantity).toLocaleString('id'),
            ]).draw(false);
            subtotal = subtotal + (transactionDetail[no].sellPrice * transactionDetail[no].quantity)
        }
        no++;
    }

}

$('#keterangan').html(transaction.referenceCode);
$('#subtotal').html(subtotal.toLocaleString('id'));
$('#terbilang').html(terbilang(subtotal) + " rupiah");
var m = new Date();
var dateString = m.getFullYear() + "/" + (m.getMonth() + 1) + "/" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();
$('#tanggalcetak').html(dateString);
$('#userprint').html(getCookie("name"));