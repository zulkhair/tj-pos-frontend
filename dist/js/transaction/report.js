var mapTrx = new Map();
var tableTrx;
var tableDetail;
var selectedTrxId;

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
    $('#startDate').val(startDate());
    $('#endDate').val(endDate());

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

    customerId = $('#customer-select').val();

    $.ajax({
        type: "GET",
        url: "/api/transaction/find",
        headers: { "token": token },
        data: {
            "txType": "SELL",
            "startDate": $('#startDate').val(),
            "endDate": $('#endDate').val(),
            "status": "DIBAYAR",
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
                        stylerow = '';
                        if (first) {
                            code = response.data[i].code;
                            nopo = response.data[i].referenceCode;
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

                        tableTrx.row.add([
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + date + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + code + '</p>',
                            '<p style="' + stylerow + 'padding:12px;margin:0">' + nopo + '</p>',
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

                    total = total + lr;

                    next = parseInt(i) + 1
                    if (next == response.data.length || (dateTotal != '' && dateTotal != response.data[next].date)) {
                        firstDate = true;
                        dateTotal = response.data[i].date;
                        styleSection = totalSection <= 0 ? 'class="bgred"' : 'class="bggreen"';
                        tableTrx.row.add([
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
                            ''
                        ]).draw(false);

                        totalSection = 0;
                        totalSellSection = 0;
                        totalBuySection = 0;
                    }

                }
                styleTotal = total <= 0 ? 'class="bgred"' : '';
                $('#total').html('<p style="margin:0;padding:12px;" ' + styleTotal + '>' + total.toLocaleString('id') + '</p>');
            }
        }
    });
}
init();
