var mapTrx = new Map();
var tableTrx;
var tableDetail;
var selectedTrxId;
var ws_data = [];

function init() {
    tableTrx = $("#table-trx").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "columns": [
            { className: "pad0" },
            { className: "pad0" },
            { className: "pad0" },
            { className: "pad0" },
            { className: "pad0" },
            { className: "numericpad0" },
            { className: "numericpad0" },
            { className: "numericpad0" },
            { className: "numericpad0leftBold" },
            { className: "numericpad0" },
            { className: "numericpad0" },
            { className: "numericpad0" },
        ]
    });

    $('.select2').select2()

    initData();
}

function initData() {
    $('#startDate').val(today());
    $('#endDate').val(today());

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
                optionhtml = '<option value="">-Pilih Customer-</option>';
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

    ws_data = [];
    ws_data.push(['Tanggal', 'No Faktur', 'No PO', 'Status', 'Produk', 'Jumlah Beli', 'Harga Beli', 'Total Beli', 'Jumlah Jual', 'Harga Jual', 'Total Jual', 'L/R']);

    customerId = $('#customer-select').val();
    stats = $('#status-select').val();

    $.ajax({
        type: "GET",
        url: "/api/transaction/find",
        headers: { "token": token },
        data: {
            "txType": "SELL",
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": stats,
            "stakeholderId": customerId
        },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                total = 0;
                totalSection = 0;
                dateTotal = '';
                firstTotal = true;
                firstDate = true;
                totalSellSection = 0;
                totalBuySection = 0;
                for (i in response.data) {
                    details = response.data[i].transactionDetail;
                    first = true;

                    if (firstTotal) {
                        dateTotal = response.data[i].date;
                        firstTotal = false;
                    }

                    for (j in details) {
                        code = '';
                        nopo = '';
                        stats = '';
                        stylerow = '';
                        if (first) {
                            code = response.data[i].code;
                            nopo = response.data[i].referenceCode;
                            stats = response.data[i].status;
                            // stylerow = 'background-color: rgba(0,0,0,.05);'
                            first = false;
                        }

                        if (firstDate) {
                            date = response.data[i].date;
                            firstDate = false;
                        } else {
                            date = '';
                        }

                        quantity = details[j].quantity;
                        buyQuantity = details[j].buyQuantity;
                        buyPrice = details[j].buyPrice;
                        totalBuy = buyQuantity * buyPrice;
                        sellPrice = details[j].sellPrice;
                        totalSell = quantity * sellPrice;
                        lr = totalSell - totalBuy;
                        style = ''
                        if (lr < 0) {
                            style = 'class="bgred"'
                        }

                        ws_data.push([date, code, nopo, stats, details[j].productCode, (buyQuantity).toLocaleString('id'), (buyPrice).toLocaleString('id'), 
                        (totalBuy).toLocaleString('id'), (quantity).toLocaleString('id'), (sellPrice).toLocaleString('id'), (totalSell).toLocaleString('id'), 
                        (lr).toLocaleString('id')]);
                        tableTrx.row.add([
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + date + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + code + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + nopo + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + stats + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + details[j].productCode + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (buyQuantity).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (buyPrice).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (totalBuy).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (quantity).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (sellPrice).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + (totalSell).toLocaleString('id') + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0" ' + style + '>' + (lr).toLocaleString('id') + '</p>'
                        ]).draw(false);

                        totalSection = totalSection + lr;
                        totalSellSection = totalSellSection + totalSell;
                        totalBuySection = totalBuySection + totalBuy;
                    }


                    next = parseInt(i) + 1
                    if (next == response.data.length || (dateTotal != '' && dateTotal != response.data[next].date)) {
                        total = total + totalSection;
                        firstDate = true;
                        dateTotal = response.data[i].date;
                        styleSection = totalSection <= 0 ? 'class="bgred"' : 'class="bggreen"';

                        ws_data.push(['', '', '', '', '', '', '', 
                        (totalBuySection).toLocaleString('id'), '', '', (totalSellSection).toLocaleString('id'), 
                        (totalSection).toLocaleString('id')]);
                        tableTrx.row.add([
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>' + (totalBuySection).toLocaleString('id') + '</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>' + (totalSellSection).toLocaleString('id') + '</p>',
                            '<p style="padding:12px;margin:0" ' + styleSection + '>' + (totalSection).toLocaleString('id') + '</p>'
                        ]).draw(false);

                        ws_data.push(['', '', '', '', '', '', '', 
                        '', '', '', '', 
                        '']);
                        tableTrx.row.add([
                            '<p style="padding:0;margin:0">&nbsp;</p>',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            ''
                        ]).draw(false);

                        totalSection = 0;
                        totalSellSection = 0;
                        totalBuySection = 0;
                    }

                }
                ws_data.push(['', '', '', '', '', '', '', 
                        '', '', '', 'Total', 
                        total.toLocaleString('id')]);
                styleTotal = total <= 0 ? 'class="bgred"' : '';
                $('#total').html('<p style="margin:0;padding:12px;" ' + styleTotal + '>' + total.toLocaleString('id') + '</p>');
            }
        }
    });
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Laporan",
        Subject: "Laporan",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date()
    };

    wb.SheetNames.push("Sheet 1");
    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets["Sheet 1"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'laporan.xlsx');
}

init();
