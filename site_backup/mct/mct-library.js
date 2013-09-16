GPR_AAE_MCT.getItems = function() {

    var objOptions = {

        itemsCntId: "mct_cnt_items",

        showInfoCntId: "mct_info",

        urlParamId: "_upditm",

        maxItems: 3,

        imagePos: 1,

        namePos: 2,

        qtyPos: 3,

        descriptionPos: 4,

        optionsPos: 5,

        pricePos: 6,

        total: "mct_total",

        totaItems: "mct_total_items"

    };

    var strCartSSURL = "/checkout/services/cart.ss";

   

    function update() {

       

        var strInputId = jQuery(jQuery(this).parents("li")[0]).find("input").attr("id");

        var strInputVal = jQuery(jQuery(this).parents("li")[0]).find("input").val();

       

        jQuery.ajax({

            url : strCartSSURL,

            data: 'data={"method":"update","params":{"orderitemid":"'+strInputId+'","quantity":"'+strInputVal+'"}}',

            type : "POST",

            success : function(data) {

                GPR_AAE_MCT.getItems();

            },

            beforeSend : function(XMLHttpRequest) {

                GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');

            },

            complete : function(XMLHttpRequest, textStatus) {

                GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);

            },

            error : function(XMLHttpRequest, textStatus, errorThrown) {

                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);

            }

        });

           

    };

 

    function remove() {

       

         var strInputId = jQuery(jQuery(this).parents("li")[0]).find("input").attr("id");

       

         jQuery.ajax({

            url : strCartSSURL,

            data: 'data={"method":"remove","params":{"orderitemid":"'+strInputId+'"}}',

            type : "POST",

            success : function(data) {

                GPR_AAE_MCT.getItems();

            },

            beforeSend : function(XMLHttpRequest) {

                GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');

            },

            complete : function(XMLHttpRequest, textStatus) {

                GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);

            },

            error : function(XMLHttpRequest, textStatus, errorThrown) {

                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);

            }

        });       

    };

   

    function processItems(data) {

        jQuery('#' + objOptions.itemsCntId).html("");

            var bolMore = false, arrItems = data.result.items;

            jQuery('<ul>').attr({

                'id' : 'mct_list',

                'class' : 'item-list'

            }).appendTo('#' + objOptions.itemsCntId);

            if (data.header.status.code == "SUCCESS") {                

                for (var i = 0; i < arrItems.length; i++) {

                    var li = jQuery('<li>');

                    if (i >= objOptions.maxItems) {

                        li.css("display", "none");

                        li.addClass("item-hidden");

                        bolMore = true;

                    }

                    li.attr('id', 'mct_list_item' + i).appendTo('#mct_list');

                    jQuery(".mct .cell_template").children().clone().appendTo(li);

                    li.find(".cell-image").append('<img src="'+arrItems[i].storedisplaythumbnail+'" >"');

                    li.find(".cell-name").append(arrItems[i].name);

                    li.find(".cell-price").append(arrItems[i].price);

                    li.find(".cell-qty").append('<input type="text" size="6" id="' + arrItems[i].orderitemid + '" value="' + arrItems[i].quantity + '">');

                    li.find(".cell-options").append();

                    li.find(".remove-item").bind("click", remove);

                    li.find(".update-item").bind("click", update);

                };               

                if (bolMore) {                   

                    jQuery('<a id="mct_viewmore" href="javascript:void(0);">View More</a>').click(function() {

                        GPR_AAE_MCT.viewMore();

                    }).appendTo('#' + objOptions.itemsCntId);

                }

 

                jQuery('#' + objOptions.itemsCntId).fadeIn(1000);

            }

    }

 

    jQuery.ajax({

        url : strCartSSURL,

        data: 'data={"method":"get"}',

        type : "POST",

        success : function(data) {

            processItems(data);

            jQuery('#'+objOptions.total).html(data.result.summary.subtotal);

            jQuery('#'+objOptions.totaItems).html(data.result.totalfound);

        },

        beforeSend : function(XMLHttpRequest) {

            GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');

        },

        complete : function(XMLHttpRequest, textStatus) {

            GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);

        },

        error : function(XMLHttpRequest, textStatus, errorThrown) {

            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);

        }

    });

}