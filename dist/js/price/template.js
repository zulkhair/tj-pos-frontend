var mapProduct = {};
var productPriceMap = {};
var selectedTemplateId = ''
var selectedProductId = ''
var tableTemplate;
var tableProduct;
var mapUnit = {};
var mapTemplate = {};
var ws_data = [];
var mapSelected = new Map();
var mapPrice = {};

function init() {


    tableTemplate = $("#table-product").DataTable({
        "paging": true,
        "lengthChange": false,
        "searching": true,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
    });

    tableProduct = $("#table-product2").DataTable({
        "paging": true,
        "lengthChange": true,
        "searching": false,
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "responsive": false,
        "lengthMenu": [
            [-1, 20, 10],
            ['All', 20, 10],
        ],
    });

    initData();
    initUnit();
    showTag("card1");
}

function initUnit() {
    mapUnit = {};
    $.ajax({
        type: "GET",
        url: "/api/unit/find",
        headers: { "token": token },
        data: { "active": true },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    mapUnit[response.data[i].id] = response.data[i];
                }
            }
        }
    });
}

function initData() {
    mapTemplate = {};
    tableTemplate.clear().draw();

    $.ajax({
        type: "GET",
        url: "/api/price/template/find",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    mapTemplate[response.data[i].id] = response.data[i]
                    tableTemplate.row.add([
                        response.data[i].name,
                        '<button class="btn-tbl btn btn-block btn-primary fas fa-search " title="Lihat Template" onclick="prepareEdit(\'' + response.data[i].id + '\');"></button>' +
                        '<button data-toggle="modal" data-target="#status-modal" class="btn-tbl btn btn-block btn-primary fas fa-check " title="Terapkan Harga" onclick="prepareApply(\'' + response.data[i].id + '\');"></button>' +
                        '<button data-toggle="modal" data-target="#copy-modal" class="btn-tbl btn btn-block btn-primary fas fa-copy " title="Copy Template" onclick="prepareCopy(\'' + response.data[i].id + '\');"></button>' +
                        '<button type="button" data-toggle="modal" data-target="#remove-modal" class="btn-tbl btn btn-block btn-primary fas fa-trash " title="Hapus Template" onclick="prepareDelete(\'' + response.data[i].id + '\');"></button>'
                    ]).draw(false);
                }
            }
        }
    });
}

function submitAdd() {
    data = {};
    data["name"] = $("#name").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/price/template/create",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData()
                $("#name").val("");
            }
        }
    });
}

function prepareEdit(id) {
    $('#templateTitle').text("Edit Template Harga [" + mapTemplate[id].name + "]");
    mapSelected = new Map();

    ws_data = [];
    selectedTemplateId = id;
    hideTag("card1");
    showTag("card2");
    tableProduct.clear();

    mapPrice = {};
    $.ajax({
        type: "GET",
        url: "/api/price/template/findDetail",
        headers: { "token": token },
        data: { "templateId": selectedTemplateId },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                html = '';
                for (i in response.data) {
                    mapPrice[response.data[i].productId] = response.data[i]
                }
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/product/findActive",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                for (i in response.data) {
                    products = response.data[i]
                    var price = 0;
                    var downloadChecked = false;
                    if (mapPrice[products.id] !== undefined) {
                        price = mapPrice[products.id].price;
                        downloadChecked = mapPrice[products.id].checked;
                    }

                    product = {
                        "id": products.id,
                        "code": products.code,
                        "name": products.name,
                        "unit": mapUnit[products.unitId].code,
                        "price": price.toLocaleString('id'),
                    }

                    ws_data.push(
                        [products.id, products.code, products.name, mapUnit[products.unitId].code, price]
                    )

                    productPriceMap[products.id] = product

                    tableProduct.row.add([
                        products.code,
                        products.name,
                        mapUnit[products.unitId].code,
                        price.toLocaleString('id'),
                        '<button data-toggle="modal" data-target="#submit-modal" type="button" class="btn-tbl btn btn-block btn-primary fas fa-pencil " title="Edit" onclick="prepareSubmit(\'' + products.id + '\');"></button>',
                        '<input type="checkbox" ' + (downloadChecked ? 'checked' : '') + ' id="checkbox' + i + '">'
                    ]).draw(false);

                    if (downloadChecked) {
                        mapSelected.set(product.id, product);
                    }

                    setChkbxListener(i, product.id, product);
                }
            }
        }
    });

    var harga = document.getElementById("price");
    harga.addEventListener("keypress", function ef(event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();

            submit();
            $('#submit-modal').modal('toggle');
            harga.removeEventListener("keypress", ef)
        }
    });

    $('#submit-modal').on('shown.bs.modal', function () {
        $(this).find('#price').focus();
    })
}

function setChkbxListener(i, id, data) {
    const checkbox = document.getElementById('checkbox' + i);
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            mapSelected.set(id, data);
        } else {
            mapSelected.delete(id);
        }
    })
}

function oneTimeListener(node, type, callback) {
    // create event
    node.addEventListener(type, function listener(e) {

        // remove event listener
        e.target.removeEventListener(e.type, listener);

        // call handler with original context 
        return callback.call(this, e);

    });
}

function hargaChange() {
    value = $("#price").val();
    if (value == "" || value == undefined) {
        value = "0"
    }
    harga = parseInt(value.replaceAll('.', ''));
    $("#price").val(harga.toLocaleString('id'));
}

function prepareSubmit(productId) {
    selectedProductId = productId
    $("#code-sub").val(productPriceMap[productId].code);
    $("#name-sub").val(productPriceMap[productId].name);
    $("#unit-sub").val(productPriceMap[productId].unit);
    $("#price").val(productPriceMap[productId].price);
    document.getElementById("price").focus();
}

function submit() {
    customerId = $('#supplier-modal-select').val();
    unitId = $('#unit-modal-select').val();
    price = parseInt($("#price").val().replaceAll('.', ''));
    productId = selectedProductId;

    data = {
        "templateId": selectedTemplateId,
        "productId": productId,
        "price": parseInt(price),
    }

    $.ajax({
        type: "POST",
        url: "/api/price/template/edit-price",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData()
                selectedProductId = ""
                prepareEdit(selectedTemplateId); ß
            }
        }
    });
}

function back() {
    hideTag("card2");
    showTag("card1");
}

function prepareApply(id) {
    selectedTemplateId = id;
    selectedAppliedTo = mapTemplate[id].appliedTo.split(";");
    $('#templateName').val(mapTemplate[id].name);

    $("#customer-select").val('');
    $.ajax({
        type: "GET",
        url: "/api/customer/findActive",
        headers: { "token": token },
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                optionhtml = '';
                for (i in response.data) {
                    optionhtml = optionhtml + '<option value="' + response.data[i].id + '">' + response.data[i].code + ' | ' + response.data[i].name + '</option>';
                }
                $('#customer-select').html(optionhtml);
            }
        }
    });

    $('.select2').select2()

    $("#customer-select").val(selectedAppliedTo);
    $("#customer-select").change();
}

function apply() {

    data = {
        "templateId": selectedTemplateId,
        "customerIds": $("#customer-select").val(),
    }

    $.ajax({
        type: "POST",
        url: "/api/price/template/apply",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
            }
        }
    });
}

function prepareDelete(id) {
    selectedTemplateId = id;
}

function deleteTemplate() {
    request = {
        "templateId": selectedTemplateId
    }

    $.ajax({
        type: "POST",
        url: "/api/price/template/delete",
        headers: { "token": token },
        data: JSON.stringify(request),
        contentType: 'application/json',
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData();
            }
        }
    });
}

function download() {
    var wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Template Harga",
        Subject: "Template Harga",
        Author: "UD Tunas Jaya",
        CreatedDate: new Date(2017, 12, 19)
    };

    wb.SheetNames.push("Template Harga");
    dlData = [];
    templateDetailIds = [];
    dlData.push(['Kode', 'Nama', 'Satuan', 'Harga']);
    for (i in ws_data) {
        if (mapSelected.has(ws_data[i][0])) {
            dlData.push([ws_data[i][1], ws_data[i][2], ws_data[i][3], ws_data[i][4]]);

            if (mapPrice[ws_data[i][0]] !== undefined) {
                templateDetailIds.push(mapPrice[ws_data[i][0]].id);
            }

        }
    }
    var ws = XLSX.utils.aoa_to_sheet(dlData);
    wb.Sheets["Template Harga"] = ws;

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {

        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;

    }

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '-' + mm + '-' + yyyy;

    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'template harga ' + mapTemplate[selectedTemplateId].name + ' ' + formattedToday + '.xlsx');

    data = {};
    data["templateId"] = selectedTemplateId;
    data["templateDetailIds"] = templateDetailIds;
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/price/template/download",
        headers: { "token": token },
        data: JSON.stringify(data),
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            }
        }
    });
}

function prepareCopy(id) {
    selectedTemplateId = id;
    $("#name-copy-old").val(mapTemplate[id].name)
}

function submitCopy() {
    data = {};
    data["templateId"] = selectedTemplateId;
    selectedTemplateId = "";
    data["name"] = $("#name-copy").val();
    token = getCookie("token")

    $.ajax({
        type: "POST",
        url: "/api/price/template/copy",
        headers: { "token": token },
        data: JSON.stringify(data),
        async: false,
        success: function (response) {
            if (response.status != 0) {
                toastr.warning(response.message);
            } else {
                toastr.info(response.message);
                initData()
                $("#name-copy").val("");
            }
        }
    });
}


init();