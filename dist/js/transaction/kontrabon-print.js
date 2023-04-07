var urlParams = new URLSearchParams(window.location.search);
txId = urlParams.get('trxId');
var transactionData;

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
            transactionData = response.data;
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

page = `<div class="page" id="{{id}}"><div class="subpage" id="sub-page"></div></div>`;

header = `<table>
<tr>
    <td rowspan="3" style="padding:10px;width: 10%;height: 130px;">
        <span style="border: solid;font-size: 80px;padding: 5px;">TJ</span>
    </td>
    <td rowspan="3" style="font-size: 20pt;width: 40%;">UD. TUNAS JAYA</td>
    <td style="font-size: 10pt;text-align: right;width: 270px;padding-right: 10px;">Pasar Induk
        Caringin Blok D-25 Bandung</td>
</tr>
<tr>
    <td style="font-size: 10pt;text-align: right;padding-right: 10px;">Jawa Barat</td>
</tr>
<tr>
    <td style="font-size: 10pt;text-align: right;padding-right: 10px;">Telp. 081 374 335 448</td>
</tr>
<tr>
    <td colspan="3"
        style="font-size: 20pt;text-align: center;border-top: solid;border-bottom: solid;">BUKTI
        TANDA PENYERAHAN FAKTUR</td>
</tr>
</table>

<table>
<tr>
    <td style="font-size: 10pt;padding: 10px;padding-right: 0;width: 40%;">Telah menyerahkan faktur
        ke</td>
    <td style="text-align: center;">:</td>
    <td id="{{kepada}}" style="font-size: 10pt;"></td>
</tr>
</table>`;

content = `<table style="width: 100%;" id="{{tableItem}}">
<tr>
    <th style="border-top: solid;border-bottom: solid;text-align: center;width: 40px;font-size: 10pt;">No.</th>
    <th style="border-top: solid;border-bottom: solid;border-left: none;text-align: center;font-size: 10pt;">No. Faktur</th>
    <th style="border-top: solid;border-bottom: solid;border-left: none;text-align: center;font-size: 10pt;">Tgl Faktur</th>
    <th style="border-top: solid;border-bottom: solid;border-left: none;text-align: center;font-size: 10pt;">Jumlah (Rp.)</th>
</tr>
</table>`;

halaman = `<table style="width: 100%;margin-bottom: 20px;">
<tr>
    <td style="text-align: left;padding-left: 20px;font-size: 10pt;height: 40px;" id="{{halaman}}"></td>
</tr>
</table>`;

footer = `<table style="width: 100%;margin-bottom: 20px;">
<tr>
    <td style="text-align: left;padding-left: 20px;font-size: 10pt;height: 40px;" id="{{halaman}}"></td>
    <td colspan="1" style="text-align: right;padding-right: 20px;font-size: 10pt;height: 40px;" id="{{tanggalcetak}}"></td>
</tr>
<tr>
    <td style="text-align: center;width: 50%;font-size: 10pt;">Penerima</td>
    <td style="text-align: center;width: 50%;font-size: 10pt;">Hormat Kami</td>
</tr>
<tr>
    <td style="text-align: center;width: 50%;padding-top: 70px;font-size: 10pt;">
        (...................................)</td>
    <td style="text-align: center;width: 50%;padding-top: 70px;font-size: 10pt;">Isa Anshori</td>
</tr>
</table>`;

totalPage = Math.ceil(transactionData.length / 35);
tableItems = [];
for (let i = 0; i < totalPage; i++) {
    $("#book").append(page.replace("{{id}}", "page" + i));

    $("#page" + i).append(header.replace("{{kepada}}", "kepada" + i));

    $("#page" + i).append(content.replace("{{tableItem}}", "tableItem" + i));

    if (i == totalPage - 1) {
        $("#page" + i).append(footer.replace("{{halaman}}", "halaman" + i).replace("{{tanggalcetak}}", "tanggalcetak" + i));
    } else {
        $("#page" + i).append(halaman.replace("{{halaman}}", "halaman" + i));
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
            { className: "centerTablePrintBorderBot" },
            { className: "centerTablePrintBorderBot" },
            { className: "centerTablePrintBorderBot" },
            { className: "numericTablePrintBorderBot" },
        ]
    });

    tableItems.push(tableItem);
}

kepada = "";
total = 0;
no = 0;
for (let i = 0; i < totalPage; i++) {
    for (let index = 0; index < 35; index++) {
        if (no > transactionData.length - 1) {
            tableItems[i].row.add([
                "",
                "",
                "",
                "",
            ]).draw(false);
        } else {
            kepada = transactionData[no].stakeholderName
            tableItems[i].row.add([
                no + 1,
                transactionData[no].code,
                transactionData[no].date,
                transactionData[no].total.toLocaleString('id'),
            ]).draw(false);
            total = total + transactionData[no].total;
        }
        no++;
    }
    $('#kepada' + i).html(kepada);
    $('#halaman' + i).html("Halaman : " + (i + 1) + " / " + totalPage);
}

tableItems[totalPage - 1].row.add([
    "",
    "",
    "Total",
    total.toLocaleString('id'),
]).draw(false);

var m = new Date();
var dateString = m.getDate() + " " + (getDate(m.getMonth() + 1)) + " " + m.getFullYear();
$('#tanggalcetak' + (totalPage - 1)).html("Bandung, " + dateString);