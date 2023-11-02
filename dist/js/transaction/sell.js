var mapProduct = new Map();
var mapProductCodeName = new Map();
var arrProduct = [];
var mapUnit = new Map();
var dataRow = [];
var mapData = new Map();
var mapProductVal = new Map();
var tableProduct;
var index = 0;
var mapHarga = new Map();
var mapIndex = new Map();

function init() {
    tableProduct = $("#table-product").DataTable({
        "paging": false,
        "lengthChange": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    initData();
    $('.select2').select2()
}

function initData() {
    mapProduct = new Map();
    mapUnit = new Map();
    dataRow = [];
    mapProductVal = new Map();
    tableProduct.clear();

    today = new Date();
    yyyy = today.getFullYear();
    mm = today.getMonth() + 1; // Months start at 0!
    dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    today = yyyy + '-' + mm + '-' + dd;
    $('#date').val(today);

    initCustomer();
    initProduct();
    addNewRow();
    changeMasterData();
    $("#total-all").val(0);
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
                optionhtml = '<option disabled selected value> -- pilih salah satu -- </option>';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#customer-select').html(optionhtml);
            }
        }
    });
}

function initProduct() {
    customerId = $('#customer-select').val();
    if (customerId != null) {
        arrProduct = [];
        $.ajax({
            type: "GET",
            url: "/api/product/findActive",
            headers: { "token": token },
            data: {
                "active": true
            },
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    for (i in response.data) {
                        mapProduct.set(response.data[i].id, response.data[i]);
                        mapProductCodeName.set(response.data[i].code + ' | ' + response.data[i].name, response.data[i])
                        arrProduct.push(response.data[i]);
                    }

                }
            }
        });
    }
}

function initHarga(productId, index) {
    customerId = $('#customer-select').val();
    if (customerId != null) {

        if (productId !== "") {
            $.ajax({
                type: "GET",
                url: "/api/customer/find-price",
                headers: { "token": token },
                data: {
                    "productId": productId,
                    "customerId": customerId,
                    "latest": "true",
                },
                async: false,
                success: function (response) {
                    if (response.status != 0) {
                        toastr.warning(response.message);
                    } else {
                        if (response.data) {
                            $("#jual-" + index).val(response.data[0].price.toLocaleString('id'));
                        } else {
                            $("#jual-" + index).val(0);
                        }
                    }
                }
            });
        }
    }
}

function changeMasterData() {
    initProduct();
    index = 0;
    dataRow = [];
    mapData = new Map();
    addNewRow();
}

function removeRow(value) {
    values = value.split(",");

    dataRow.splice(values[1], 1);
    mapData.delete(values[0]);

    if (dataRow.length == 0) {
        addNewRow();
    }

    reloadTable(undefined)
}

function getProductDropdown(index) {
    optionhtml = '<select class="select2" id="product-select-' + index + '" value="" style="width:200px" onchange="productChange(' + index + ')">';
    optionhtml = optionhtml + '<option value="">-</option>';
    for (i in arrProduct) {
        optionhtml = optionhtml + '<option value="' + arrProduct[i].id + '">' + arrProduct[i].code + '</option>';
    }
    optionhtml = optionhtml + '</select>';

    return optionhtml;
}

function getProductInput(index) {
    optionhtml = '<input type="text" class="form-control" id="product-select-' + index + '" value="" list="products" style="width:200px" onkeyup="productChange(' + index + ')">';
    optionhtml = optionhtml + '<datalist id="products">';
    for (i in arrProduct) {
        optionhtml = optionhtml + '<option>' + arrProduct[i].code + ' | ' + arrProduct[i].name + '</option>';
    }
    optionhtml = optionhtml + '</datalist></input>';

    return optionhtml;
}

function getText(id, index, type, placeholder, disabled, func) {
    return '<input ' + disabled + ' class="form-control" type="' + type + '" id="' + id + '-' + index + '" placeholder="' + placeholder + '" onkeyup="' + func + '(' + index + ')"/>'
}

function addNewRow() {
    index++;
    dataRow.push(index);
    mapData.set(index, {
        "productCodeName": "",
        "jumlah": "",
        "satuan": "",
        "jual": ""
    })
    reloadTable(index);
}

function reloadTable(indexnew) {
    tableProduct.clear();
    count = 1;
    for (i in dataRow) {
        index = dataRow[i];
        arrIndex = i;
        tableProduct.row.add([
            count,
            getProductInput(index),
            getText("jumlah", index, "number", "0", "", "jumlahChange"),
            getText("satuan", index, "text", "-", "disabled", ""),
            getText("jual", index, "text", "0", "", "jualChange"),
            getText("total", index, "text", "0", "disabled", ""),
            '<button type="button" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus" onclick="removeRow(\'' + index + ',' + arrIndex + '\');"></button>'
        ]).draw(false);

        data = mapData.get(index);
        if (data != undefined) {
            $("#product-select-" + index).val(data.productCodeName);
            $("#jumlah-" + index).val(data.jumlah);
            $("#jual-" + index).val(parseInt(data.jual).toLocaleString('id'));
            $("#satuan-" + index).val(data.satuan);
            $("#total-" + index).val((data.jual * data.jumlah).toLocaleString('id'));
        }

        count++;

        var product = document.getElementById("product-select-" + index);
        var jumlah = document.getElementById("jumlah-" + index);
        var jual = document.getElementById("jual-" + index);

        product.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });

        jumlah.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });

        jual.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                addNewRow();
            }
        });
    }
    if (indexnew != undefined) {
        document.getElementById("product-select-" + indexnew).focus();
    }
}

function productChange(index) {
    productCodeName = $("#product-select-" + index).val();
    product = mapProductCodeName.get(productCodeName);

    if (product != undefined) {
        initHarga(product.id, index)

        $("#satuan-" + index).val(product.unitCode);

        setMapData(index);
        document.getElementById("jumlah-" + index).focus();
    }
}

function jumlahChange(index) {
    value = $("#jumlah-" + index).val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    jumlah = parseFloat(value);
    jual = parseInt($("#jual-" + index).val().replaceAll('.', ''));
    $("#total-" + index).val((jumlah * jual).toLocaleString('id'));

    setMapData(index);
    sumTotal();
}

function jualChange(index) {
    value = $("#jual-" + index).val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    jumlah = parseFloat($("#jumlah-" + index).val());
    jual = parseInt(value.replaceAll('.', ''));
    $("#total-" + index).val((jumlah * jual).toLocaleString('id'));
    $("#jual-" + index).val(jual.toLocaleString('id'));

    setMapData(index);
    sumTotal();
}

function setMapData(index) {
    data = mapData.get(index);
    data.productCodeName = $("#product-select-" + index).val();
    data.jumlah = $("#jumlah-" + index).val();
    data.jual = $("#jual-" + index).val().replaceAll('.', '');
    data.satuan = $("#satuan-" + index).val();

    mapData.set(index, data);

}

function submit() {
    if (dataRow.length <= 0 || mapData.get(dataRow[0]) == undefined || mapData.get(dataRow[0]).productCodeName == "") {
        toastr.warning("Harap tambahkan produk pada transaksi yang akan dibuat");
    } else {
        detail = [];

        for (i in dataRow) {
            data = mapData.get(dataRow[i]);
            product = mapProductCodeName.get(data.productCodeName);
            detail.push(
                {
                    "productId": product.id,
                    "buyPrice": 0,
                    "sellPrice": parseInt(data.jual),
                    "quantity": parseFloat(data.jumlah),
                }
            )
        }

        transaction = {
            "stakeholderId": $('#customer-select').val(),
            "date": $('#date').val(),
            "transactionType": "SELL",
            "transactionDetail": detail,
            "referenceCode": $('#nopo').val()
        }

        $.ajax({
            type: "POST",
            url: "/api/transaction/create",
            headers: { "token": token },
            data: JSON.stringify(transaction),
            contentType: 'application/json',
            async: false,
            success: function (response) {
                if (response.status != 0) {
                    toastr.warning(response.message);
                } else {
                    toastr.info(response.message);
                    initData();
                    $('#nopo').val("");
                    txId = response.data.id;
                    window.open('sell-print.html?trxId=' + txId);
                }
            }
        });
    }

}

function sumTotal() {
    total = 0;
    for (i in dataRow) {
        data = mapData.get(dataRow[i]);
        total = total + (parseFloat(data.jumlah) * parseInt(data.jual));
    }
    $("#total-all").val(total.toLocaleString('id'));
}

init();
