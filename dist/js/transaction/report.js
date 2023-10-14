var mapTrx = new Map();
var tableTrx;
var tableDetail;
var selectedTrxId;
var ws_data = [];
var edit = false;
var selectedTrxId;
var selectedRow;

function initReport() {
    $.ajax({
        type: "GET",
        url: "/api/auth/check",
        headers: { "token": token },
        data: { "permission": "web:transaction:report:updatebuyprice" },
        success: function (response) {
            if (response.status != 0) {
                edit = false;
            } else {
                edit = true;
            }
        }
    });

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

    $('#edit-beli-modal').on('shown.bs.modal', function () {
        $(this).find('#harga-beli-edit').focus();
    })
}

function initData() {
    $('#startDate').val(today());
    $('#endDate').val(today());

    initCustomer();
    initProduct();
    reloadTable();
}

function initProduct() {
    $.ajax({
        type: "GET",
        url: "/api/product/findActive",
        headers: { "token": token },
        data: { "active": true },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '<option value="">-Pilih Produk-</option>';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].name + '</option>';
                }
                $('#product-select').html(optionhtml);
            }
        }
    });
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
    productId = $('#product-select').val();
    stats = $('#status-select').val();

    $('#loading').show();

    $.ajax({
        type: "GET",
        url: "/api/transaction/report",
        headers: { "token": token },
        data: {
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": stats,
            "stakeholderId": customerId,
            "productId": productId
        },
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                total = 0;
                totalSection = 0;
                totalSellSection = 0;
                totalBuySection = 0;

                totalCountSellSection = 0;
                totalCountBuySection = 0;
                totalCountSell = 0;
                totalCountBuy = 0;

                count = 0;
                var textLoading = $('#loading-text');
                $.each(response.data, function (index, item) {

                    date = item.date
                    reports = item.reports;

                    $.each(reports, function (index2, item2) {
                        details = item2.reportDetails
                        code = item2.code;
                        nopo = item2.referenceCode;
                        stats = item2.status;
                        // stylerow = 'background-color: rgba(0,0,0,.05);'
                        stylerow = '';

                        $.each(details, function (index3, item3) {
                            mapTrx.set(item3.id, {
                                "code": item2.code,
                                "productCode": item3.productCode,
                                "productName": item3.productName,
                                "buyPrice": item3.buyPrice,
                            })
                            quantity = item3.quantity;
                            buyQuantity = item3.buyQuantity;
                            buyPrice = item3.buyPrice;
                            totalBuy = buyQuantity * buyPrice;
                            sellPrice = item3.sellPrice;
                            totalSell = quantity * sellPrice;
                            lr = totalSell - totalBuy;
                            style = ''
                            if (lr < 0) {
                                style = 'class="bgred"'
                            }

                            ws_data.push([date, code, nopo, stats, item3.productName, (buyQuantity).toLocaleString('id'), (buyPrice).toLocaleString('id'),
                                (totalBuy).toLocaleString('id'), (quantity).toLocaleString('id'), (sellPrice).toLocaleString('id'), (totalSell).toLocaleString('id'),
                                (lr).toLocaleString('id')]);

                            priceColumn = '<a href="#" data-toggle="modal" data-target="#edit-beli-modal" onclick="prepareEdit(\'' + item3.id + '\', ' + count + ');"><p style="' + stylerow + 'padding:12px;margin:0">' + (buyPrice).toLocaleString('id') + '</p></a>';
                            if (!edit) {
                                priceColumn = '<p style="' + stylerow + 'padding:12px;margin:0">' + (buyPrice).toLocaleString('id') + '</p>';
                            }
                            tableTrx.row.add([
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + date + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + code + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + nopo + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + stats + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + item3.productName + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + (buyQuantity).toLocaleString('id') + '</p>',
                                priceColumn,
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + (totalBuy).toLocaleString('id') + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + (quantity).toLocaleString('id') + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + (sellPrice).toLocaleString('id') + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0">' + (totalSell).toLocaleString('id') + '</p>',
                                '<p style="' + stylerow + 'padding:12px;margin:0" ' + style + '>' + (lr).toLocaleString('id') + '</p>'
                            ]).draw(false);

                            totalSection = totalSection + lr;
                            totalSellSection = totalSellSection + totalSell;
                            totalBuySection = totalBuySection + totalBuy;
                            totalCountSellSection = totalCountSellSection + quantity;
                            totalCountBuySection = totalCountBuySection + buyQuantity;

                            code = '';
                            nopo = '';
                            stats = '';
                            stylerow = '';
                            date = '';
                            count++;

                            // textLoading.html('<p><span>Menyiapkan ' + count + ' dari 100 data</span></p>');

                            // setInterval(function(){
                            //     console.log(count);
                            //    
                            // },1000);
                        });
                    });

                    total = total + totalSection;
                    totalCountSell = totalCountSell + totalCountSellSection;
                    totalCountBuy = totalCountBuy + totalCountBuySection;

                    firstDate = true;
                    dateTotal = response.data[i].date;
                    total = total + totalSection;
                    firstDate = true;
                    dateTotal = response.data[i].date;
                    styleSection = totalSection <= 0 ? 'class="bgred"' : 'class="bggreen"';

                    ws_data.push(['', '', '', '', '', totalCountBuySection, '',
                        (totalBuySection).toLocaleString('id'), totalCountSellSection, '', (totalSellSection).toLocaleString('id'),
                        (totalSection).toLocaleString('id')]);
                    tableTrx.row.add([
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>' + totalCountBuySection + '</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>&nbsp;</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>' + (totalBuySection).toLocaleString('id') + '</p>',
                        '<p style="padding:12px;margin:0" ' + styleSection + '>' + totalCountSellSection + '</p>',
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
                });
                ws_data.push(['', '', '', '', 'Jumalh Beli', totalCountBuy, '', 'Jumlah Jual', totalCountSell, '', 'Total', total.toLocaleString('id')]);
                styleTotal = total <= 0 ? 'class="bgred"' : '';
                $('#total-beli').html('<p style="margin:0;padding:12px;">' + totalCountBuy + '</p>');
                $('#total-jual').html('<p style="margin:0;padding:12px;">' + totalCountSell + '</p>');
                $('#total').html('<p style="margin:0;padding:12px;" ' + styleTotal + '>' + total.toLocaleString('id') + '</p>');
            }
            $('#loading').hide();
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

function prepareEdit(id, row) {
    selectedRow = row;
    selectedTrxId = id;

    $("#no-faktur-edit").val(mapTrx.get(selectedTrxId).code);
    $("#kode-produk-edit").val(mapTrx.get(selectedTrxId).productCode);
    $("#nama-produk-edit").val(mapTrx.get(selectedTrxId).productName);
    $("#harga-beli-edit").val(mapTrx.get(selectedTrxId).buyPrice);

    hargaBeliChange();
    document.getElementById("harga-beli-edit").focus();
}

function editHargaBeli() {
    value = $("#harga-beli-edit").val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    data = {
        "transactionDetailId": selectedTrxId,
        "buyPrice": harga,
    }

    stylerow = '';
    priceColumn = '<a href="#" data-toggle="modal" data-target="#edit-beli-modal" onclick="prepareEdit(\'' + selectedTrxId + '\', ' + selectedRow + ');"><p style="' + stylerow + 'padding:12px;margin:0">' + (harga).toLocaleString('id') + '</p></a>';
    if (!edit) {
        priceColumn = '<p style="' + stylerow + 'padding:12px;margin:0">' + (harga).toLocaleString('id') + '</p>';
    }

    $.ajax({
        type: "POST",
        url: "/api/transaction/updateHargaBeli",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                $("#table-trx tr:nth-child(" + (selectedRow + 1) + ") td:nth-child(" + 7 + ")").html(priceColumn);
                mapTrx.get(selectedTrxId).buyPrice = harga;
                selectedProductId = ""
                selectedRow = -1;
            }
        }
    });

}

function hargaBeliChange() {
    value = $("#harga-beli-edit").val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#harga-beli-edit").val(harga.toLocaleString('id'));
}

initReport();
