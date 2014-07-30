/**
 * Description: SuiteCommerce Advanced Features (Wish List)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/

var GPR_AAE_WLP = function($){
    var objOptions = {
        addItemURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_additem&deploy=customdeploy_gpr_aae_ss_wlp_additem",
        addCartItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_addcartitems&deploy=customdeploy_gpr_aae_ss_wlp_addcartitems",
        removeItemURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_removeitem&deploy=customdeploy_gpr_aae_ss_wlp_removeitem",
        clearItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_clearitems&deploy=customdeploy_gpr_aae_ss_wlp_clearitems",
        getItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_getitems&deploy=customdeploy_gpr_aae_ss_wlp_getitems",
		getSavedCartItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_wlp_getscartitem&deploy=customdeploy_gpr_aae_ss_wlp_getscartitem",
        itemsCntId: "wlp_cnt_items",
        wishListRowClass: "wlp-item",
        addBtnCntId: "wlp_addbtn",
        addCartBtnCntId: "wlp_addcartbtn",
        loginLnkCntId: "wlp_loginlnk",
        showInfoCntId: "wlp_info",
        msgs: ["Item was added successfully.", "Item already added", "Invalid parameters sent, please contact the administrator...", "Wish List disable, please contact the administrator...", "Item was removed successfully.", "Items were cleared successfully.", "Unespected error, please contact the administrator...", "No Item Found", "No Items Found", "Items were added successfully.", "No items found in the Shopping Cart", "All Items already added"]
    };
    var arrItems = [];
    
    function showPopUp(strMsg){
        GPR_PUP.show(strMsg);		
    }
    
    return {
        /**
         * WISH LIST PROFESSIONAL
         * Init the Wish List
         * @param {Object} objOptions
         */
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            if (GPR_OPTIONS.options().customerId !== null && GPR_OPTIONS.options().customerId !== "") {
                var strWishListUrl = GPR_COOKIES.read('_gpr_aae_wlp_url');
                if (strWishListUrl !== null && strWishListUrl !== "") {
                    GPR_COOKIES.erase('_gpr_aae_wlp_url');
                    window.location.href = strWishListUrl;
                }
            }
        },
        /**
         * WISH LIST PROFESSIONAL
         * Adds the item to wish list when the customer it's not loggued
         * Recivies the customer internal id and the site number
         * @param {String} strCustomerId
         * @param {String} strSiteNumber
         */
        addItemCookie: function(strWlpNumber){
            var strItemId = GPR_COOKIES.read('_gpr_aae_wlp_itemid');
            if (strItemId !== null && strItemId !== "") {
                GPR_COOKIES.erase('_gpr_aae_wlp_itemid');
                var strParams = {
                    sitenumber: GPR_OPTIONS.options().siteNumber,
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    itemid: strItemId,
					wlpnumber: strWlpNumber
                };
                $.ajax({
                    url: objOptions.addItemURL + "&callback=?",
                    type: "GET",
                    dataType: "jsonp",
                    data: strParams,
                    success: function(json){
                        if (json.Errors.length > 0) {
                            $.each(json.Errors, function(i, val){
                                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_" + strItemId, 'Add Item', val.code, val.details);
                            });
                        }
                        else {
                            showPopUp(objOptions.msgs[json.Results.msgcode]);
                        }
                    },
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_" + strItemId, 'Adding...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_" + strItemId);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_" + strItemId, 'Add Item', textStatus, errorThrown);
                    }
                });
            }
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * Adds the item to the customer wish list, the customer is already logged
         * Recives the customer internal id and the item internal id
         * @param {String} strCustomerId
         * @param {String} strSiteNumber
         * @param {String} strItemId
         * @param (String) strLoginUrl
         */
        addItem: function(strWlpNumber,strItemId){
            if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create('_gpr_aae_wlp_itemid', strItemId, 10);
                window.location.href = GPR_OPTIONS.options().loginURL;
            }
            else {
                var strParams = {
                    sitenumber: GPR_OPTIONS.options().siteNumber,
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    itemid: strItemId,
					wlpnumber: strWlpNumber
                };
                $.ajax({
                    url: objOptions.addItemURL + "&callback=?",
                    type: "GET",
                    dataType: "jsonp",
                    data: strParams,
                    success: function(json){
                        if (json.Errors.length > 0) {
                            $.each(json.Errors, function(i, val){
                                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_" + strItemId, 'Add Item', val.code, val.details);
                            });
                        }
                        else {
                            showPopUp(objOptions.msgs[json.Results.msgcode]);
                        }
                    },
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_" + strItemId, 'Adding...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_" + strItemId);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_" + strItemId, 'Add Item', textStatus, errorThrown);
                    }
                });
            }
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * Adds the items in the shopping cart to the customer wish list, the customer is already logged
         * Recives the customer internal id and the item internal id
         * @param {String} strCustomerId
         * @param {String} strSiteNumber
         * @param {String} strItemsId
         * @param (String) strLoginUrl
         */
        addCartItems: function(strWlpNumber){
            if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create('_gpr_aae_wlp_itemsid', strItemsId, 10);
                window.location.href = GPR_OPTIONS.options().loginURL + "&did_javascript_redirect=T&redirect_count=1";
            }
            else {
                $.ajax({
                    url: GPR_OPTIONS.options().cartURL,
                    type: "GET",
                    success: function(html){
                        var arrItems = [];
                        var arrCartRows = $(html).find("tr[id^=carttablerow]");
                        if (arrCartRows.length > 0) {
                            for (var i = 0; i < arrCartRows.length; i++) {
                                var strItemFullId = $(arrCartRows[i]).find("input").attr("id");
                                var arrMatchId = strItemFullId.match(/item([^s]*)/);
                                var strItemId = arrMatchId[1].replace(/item/, '');
                                arrItems.push(strItemId);
                            }
                            var strParams = {
                                sitenumber: GPR_OPTIONS.options().siteNumber,
                                customerid: escape(GPR_OPTIONS.options().customerId),
                                itemsid: escape(arrItems.join(";")),
								wlpnumber: strWlpNumber
                            };
                            $.ajax({
                                url: objOptions.addCartItemsURL + "&callback=?",
                                type: "GET",
                                dataType: "jsonp",
                                data: strParams,
                                success: function(json){
                                    if (json.Errors.length > 0) {
                                        $.each(json.Errors, function(i, val){
                                            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_save", 'Add Cart Items', val.code, val.details);
                                        });
                                    }
                                    else {
                                        GPR_AAE_WLP.getItems(strWlpNumber);
                                        showPopUp(objOptions.msgs[json.Results.msgcode]);                                        
                                    }
                                },
                                beforeSend: function(XMLHttpRequest){
                                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_save", 'Adding...');
                                },
                                complete: function(XMLHttpRequest, textStatus){
                                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_save");
                                },
                                error: function(XMLHttpRequest, textStatus, errorThrown){
                                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_save", 'Add Items', textStatus, errorThrown);
                                }
                            });
                        }
                        else {
                            showPopUp(objOptions.msgs[10]);
                        }
                    },
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_save", 'Getting Cart Items...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_save");
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_save", 'Get Cart Items', textStatus, errorThrown);
                    }
                });
            }
        },
        /**
         * WISH LIST PROFESSIONAL
         * @param {String} customerId
         * @param {String} itemId
         */
        removeItem: function(strWlpNumber,strItemId){
            var strParams = {
                sitenumber: GPR_OPTIONS.options().siteNumber,
                customerid: escape(GPR_OPTIONS.options().customerId),
                itemid: strItemId,
				wlpnumber: strWlpNumber
            };
            $.ajax({
                url: objOptions.removeItemURL + "&callback=?",
                type: "GET",
                dataType: "jsonp",
                data: strParams,
                success: function(json){
                    if (json.Errors.length > 0) {
                        $.each(json.Errors, function(i, val){
                            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Remove Item', val.code, val.details);
                        });
                    }
                    else {
                        showPopUp(objOptions.msgs[json.Results.msgcode]);                        
                        GPR_AAE_WLP.getItems(strWlpNumber);
                        
                    }
                },
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Removing...');
                },
                complete: function(XMLHttpRequest, textStatus){
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Remove Items', textStatus, errorThrown);
                }
            });
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * @param {String} customerId
         */
        clearItems: function(strWlpNumber){
            var strParams = {
                sitenumber: GPR_OPTIONS.options().siteNumber,
                customerid: escape(GPR_OPTIONS.options().customerId),
				wlpnumber: strWlpNumber
            };
            $.ajax({
                url: objOptions.clearItemsURL + "&callback=?",
                type: "GET",
                dataType: "jsonp",
                data: strParams,
                success: function(json){
                    if (json.Errors.length > 0) {
                        $.each(json.Errors, function(i, val){
                            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Clear Items', val.code, val.details);
                        });
                    }
                    else {
                        showPopUp(objOptions.msgs[json.Results.msgcode]);
                        GPR_AAE_WLP.getItems(strWlpNumber);
                    }
                },
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Clearing...');
                },
                complete: function(XMLHttpRequest, textStatus){
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Clear Items', textStatus, errorThrown);
                }
            });
            
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * Show or hide the add to wish list button
         */
        getAddBtn: function(){
            if (GPR_OPTIONS.options().customerId === "") {
                $("#" + objOptions.addBtnCntId).remove();
                $("#" + objOptions.loginLnkCntId).show();
            }
            else {
                $("#" + objOptions.addBtnCntId).show();
                $("#" + objOptions.loginLnkCntId).remove();
            }
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * Show or hide the add the cart items to wish list button
         */
        getAddCartBtn: function(){
            if (GPR_OPTIONS.options().customerId === "") {
                $("#" + objOptions.addCartBtnCntId).remove();
                $("#" + objOptions.loginLnkCntId).show();
            }
            else {
                $("#" + objOptions.addCartBtnCntId).show();
                $("#" + objOptions.loginLnkCntId).remove();
            }
        },
        
        /**
         * WISH LIST PROFESSIONAL
         * Adds the items to the NetSuite Shopping Cart.
         */
        addToCart: function(strItem){
            if (document.forms['form' + strItem].onsubmit()) {
                document.forms['form' + strItem].submit();
            }
        },
        /**
         * WISH LIST PROFESSIONAL
         * Adds the checked items in the wish list to the NetSuite Shopping Cart.
         */
        multiAddToCart: function(){
            var arrItems = [];
            $("." + objOptions.wishListRowClass + " input[type=checkbox]:checked").each(function(){
                var form = $($(this).parents("." + objOptions.wishListRowClass).get(0)).find("form[id^=form]").get(0)
                arrItems.push(form.elements.buyid.value);
            });
            if (arrItems.length) {
                /* Get the valid forms to be submitted */
                var i = 0, items = [document.forms['form' + arrItems[0]]];
                /* Initialize GPR_CART_TOOLS */
                GPR_CART_TOOLS.setAccountNumber(GPR_OPTIONS.options().companyId);
                while (i < arrItems.length - 1 && items[i].onsubmit()) {
                    items.push(document.forms['form' + arrItems[++i]])
                }
                if ((i == arrItems.length - 1) && (items[i].onsubmit())) {
                    /* All the forms are valid. */
                    for (var i = 0; i < items.length; i++) {
                        items[i] = GPR_CART_TOOLS.getItemInstanceFromForm(items[i]);
                    }
                    try {
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Adding items to the Shopping Cart...');
                        GPR_CART_TOOLS.addToCart(items, function(){
                            GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                            window.location.reload();
                        });
                    } 
                    catch (e) {
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                        showPopUp("An error has occured: " + e.message);
                    }
                }
            }
            else {
                showPopUp("Please select at least one item.");
            }
        },
        
                        
        /**
         * WISH LIST PROFESSIONAL
         * Shows the items in the Customer Wishlist
         */
        getItems: function(strWlpNumber){
            if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create("_gpr_aae_wlp_url", document.location.href);
                //Redirect to login page
                window.location.href = GPR_OPTIONS.options().loginURL;
            }
            else {
                $("#" + objOptions.loginLnkCntId).remove();
                var strParams = {
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    sitenumber: GPR_OPTIONS.options().siteNumber,
					wlpnumber: strWlpNumber
                };
                $.ajax({
                    url: objOptions.getItemsURL + "&callback=?",
                    type: "GET",
                    dataType: "jsonp",
                    data: strParams,
                    success: function(json){
                        if (json.Errors.length > 0) {
                            $.each(json.Errors, function(i, val){
                                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Show Items', val.code, val.details);
                            });
                        }
                        else {
                            $("#" + objOptions.itemsCntId).html(unescape(json.Results.html));
                            arrItems = json.Items;
                            $.each(json.Items, function(i, val){
                                $.ajax({
                                    url: unescape(val.url),
                                    type: "GET",
                                    dataType: "html",
                                    success: function(htmlData){
                                        var strHtmlItemTpl = htmlData;
                                        /*
                                         <!--BEGIN_GPR_ITEMOPTIONS    END_GPR_ITEMOPTIONS-->
                                         <!--BEGIN_GPR_ADDTOCARTITEMID    END_GPR_ADDTOCARTITEMID-->
                                         <!--BEGIN_GPR_SALESPRICE    END_GPR_SALESPRICE-->
                                         <!--BEGIN_GPR_STKMESSAGE    END_GPR_STKMESSAGE-->
                                         <!--BEGIN_GPR_ADDTOCARTQTY    END_GPR_ADDTOCARTQTY-->
                                         <!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT    END_GPR_ADDTOCARTCLICKSCRIPT-->
                                         <!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT    END_GPR_ADDTOCARTSUBMITSCRIPT-->
                                         */
                                        strStart = '<!--BEGIN_GPR_SALESPRICE';
                                        strEnd = 'END_GPR_SALESPRICE-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var price = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            price = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_price_" + val.internalid).html(unescape(price));
                                        
                                        strStart = '<!--BEGIN_GPR_STKMESSAGE';
                                        strEnd = 'END_GPR_STKMESSAGE-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var stkmessage = '';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            stkmessage = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_stkmessage_" + val.internalid).html(unescape(stkmessage));
                                        
                                        strStart = '<!--BEGIN_GPR_ITEMOPTIONS';
                                        strEnd = 'END_GPR_ITEMOPTIONS-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var itemoptions = '';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            itemoptions = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTITEMID';
                                        strEnd = 'END_GPR_ADDTOCARTITEMID-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartitemid = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartitemid = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTQTY';
                                        strEnd = 'END_GPR_ADDTOCARTQTY-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartqty = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartqty = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $(".wlp-item #form" + val.internalid).html(unescape(itemoptions + addtocartitemid + addtocartqty));
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT';
                                        strEnd = 'END_GPR_ADDTOCARTCLICKSCRIPT-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartclickscript = '#';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartclickscript = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        $("#wlp_addtocart_" + val.internalid).click(function(){
                                            GPR_AAE_WLP.addToCart(val.internalid);
                                        });
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT';
                                        strEnd = 'END_GPR_ADDTOCARTSUBMITSCRIPT-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartsubmitscript = '#';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartsubmitscript = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_addtocart_onsubmit_" + val.internalid).html(unescape(addtocartsubmitscript));
                                    },
                                    beforeSend: function(XMLHttpRequest){
                                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Getting Item Info...');
                                    },
                                    complete: function(XMLHttpRequest, textStatus){
                                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown){
                                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Get Item Info', textStatus, errorThrown);
                                    }
                                });
                            });
                        }
                    },
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Getting Items...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        $("#" + objOptions.itemsCntId).fadeIn(500);
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Get Items', textStatus, errorThrown);
                    }
                });
            }
        },
		
		/**
         * WISH LIST PROFESSIONAL
         * Shows the items in the Customer Wishlist
         */
        getSavedCartItems: function(strWlpNumber){
            if (GPR_OPTIONS.options().customerId === "") {
                //GPR_COOKIES.create("_gpr_aae_wlp_url", document.location.href);				
                //Redirect to login page
                //window.location.href = GPR_OPTIONS.options().loginURL;
            }
            else {
                $("#" + objOptions.loginLnkCntId).remove();
                var strParams = {
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    sitenumber: GPR_OPTIONS.options().siteNumber,
					wlpnumber: strWlpNumber
                };
                $.ajax({
                    url: objOptions.getSavedCartItemsURL + "&callback=?",
                    type: "GET",
                    dataType: "jsonp",
                    data: strParams,
                    success: function(json){
                        if (json.Errors.length > 0) {
                            $.each(json.Errors, function(i, val){
                                GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Show Items', val.code, val.details);
                            });
                        }
                        else {
                            $("#" + objOptions.itemsCntId).html(unescape(json.Results.html));
                            arrItems = json.Items;
                            $.each(json.Items, function(i, val){
                                $.ajax({
                                    url: unescape(val.url),
                                    type: "GET",
                                    dataType: "html",
                                    success: function(htmlData){
                                        var strHtmlItemTpl = htmlData;
                                        /*
                                         <!--BEGIN_GPR_ITEMOPTIONS    END_GPR_ITEMOPTIONS-->
                                         <!--BEGIN_GPR_ADDTOCARTITEMID    END_GPR_ADDTOCARTITEMID-->
                                         <!--BEGIN_GPR_SALESPRICE    END_GPR_SALESPRICE-->
                                         <!--BEGIN_GPR_STKMESSAGE    END_GPR_STKMESSAGE-->
                                         <!--BEGIN_GPR_ADDTOCARTQTY    END_GPR_ADDTOCARTQTY-->
                                         <!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT    END_GPR_ADDTOCARTCLICKSCRIPT-->
                                         <!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT    END_GPR_ADDTOCARTSUBMITSCRIPT-->
                                         */
                                        strStart = '<!--BEGIN_GPR_SALESPRICE';
                                        strEnd = 'END_GPR_SALESPRICE-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var price = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            price = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_price_" + val.internalid).html(unescape(price));
                                        
                                        strStart = '<!--BEGIN_GPR_STKMESSAGE';
                                        strEnd = 'END_GPR_STKMESSAGE-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var stkmessage = '';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            stkmessage = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_stkmessage_" + val.internalid).html(unescape(stkmessage));
                                        
                                        strStart = '<!--BEGIN_GPR_ITEMOPTIONS';
                                        strEnd = 'END_GPR_ITEMOPTIONS-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var itemoptions = '';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            itemoptions = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTITEMID';
                                        strEnd = 'END_GPR_ADDTOCARTITEMID-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartitemid = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartitemid = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTQTY';
                                        strEnd = 'END_GPR_ADDTOCARTQTY-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartqty = '&nbsp;';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartqty = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $(".wlp-item #form" + val.internalid).html(unescape(itemoptions + addtocartitemid + addtocartqty));
                                        
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT';
                                        strEnd = 'END_GPR_ADDTOCARTCLICKSCRIPT-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartclickscript = '#';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartclickscript = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        
                                        $("#wlp_addtocart_" + val.internalid).click(function(){
                                            GPR_AAE_WLP.addToCart(val.internalid);
                                        });
                                        strStart = '<!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT';
                                        strEnd = 'END_GPR_ADDTOCARTSUBMITSCRIPT-->';
                                        intI = strHtmlItemTpl.indexOf(strStart);
                                        intF = strHtmlItemTpl.indexOf(strEnd);
                                        var addtocartsubmitscript = '#';
                                        if (intI != -1 && intF != -1) {
                                            intI += strStart.length;
                                            addtocartsubmitscript = strHtmlItemTpl.substring(intI, intF);
                                        }
                                        $("#wlp_addtocart_onsubmit_" + val.internalid).html(unescape(addtocartsubmitscript));
                                    },
                                    beforeSend: function(XMLHttpRequest){
                                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Getting Item Info...');
                                    },
                                    complete: function(XMLHttpRequest, textStatus){
                                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown){
                                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Get Item Info', textStatus, errorThrown);
                                    }
                                });
                            });
                        }
                    },
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId + "_items", 'Getting Items...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        $("#" + objOptions.itemsCntId).fadeIn(500);
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Get Items', textStatus, errorThrown);
                    }
                });
            }
        }		
    };
}(jQuery);
