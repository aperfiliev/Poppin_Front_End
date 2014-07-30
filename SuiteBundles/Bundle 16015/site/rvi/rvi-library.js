/**
 * Description: SuiteCommerce Advanced Features (Recently Viewed Items)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/
var GPR_AAE_RVI = function($){
    var objOptions = {
        getItemsURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_rvi_getitems&deploy=customdeploy_gpr_aae_ss_rvi_getitems",
        itemsCntId: "rvi_cnt_items",
        showInfoCntId: "rvi_info",
        msgs: ["Item was added successfully.", "Item already added", "Invalid parameters sent, please contact the administrator...", "Wish List disable, please contact the administrator..."]
    };
    
    function showPopUp(strMsg){
        GPR_PUP.show(strMsg);
    }
    
    return {
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
        
        getItems: function(){
             var strItems = GPR_COOKIES.read("rvi_n" + GPR_OPTIONS.options().siteNumber);			
            if (strItems !== "" && strItems != null) {
				var arrItemsNoCart = [];
				var arrItems = strItems.split(',');				
				for (var j = 0; j < arrItems.length; j++) {
                    if (arrItems[j] == null || arrItems[j] == '') {                        
						arrItems.splice(j, 1);
						j--;
                    }else{
						var objForms = $("form");
						for (var i = 0; i < objForms.length; i++) {												
							if ($(objForms[i]).attr("id") == "form"+arrItems[j]){
								arrItemsNoCart.push(arrItems[j]);
								break;
							}									
						};	
					}					
                }	
				
				var strItemsNoCart = arrItemsNoCart.join();	
				var strItems = arrItems.join();	
                var strParams = {
                    items: strItems,
					itemsnocart: strItemsNoCart,
                    sitenumber: GPR_OPTIONS.options().siteNumber
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
                            arrItems = json.Items;
                            $("#" + objOptions.itemsCntId).html(unescape(json.Results.html));
							$(".rvi_item").hide();
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
                                            $("#rvi_price_" + val.internalid).html(unescape(price));
                                            
                                            strStart = '<!--BEGIN_GPR_STKMESSAGE';
                                            strEnd = 'END_GPR_STKMESSAGE-->';
                                            intI = strHtmlItemTpl.indexOf(strStart);
                                            intF = strHtmlItemTpl.indexOf(strEnd);
                                            var stkmessage = '';
                                            if (intI != -1 && intF != -1) {
                                                intI += strStart.length;
                                                stkmessage = strHtmlItemTpl.substring(intI, intF);
                                            }
                                            $("#rvi_stkmessage_" + val.internalid).html(unescape(stkmessage));
                                            
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
											
											if(!val.nocart && $('#wlp_cnt_items').length <=0){
	                                            $(".rvi_item #form" + val.internalid + " #rvi_ops_" + val.internalid).prepend(unescape(itemoptions + addtocartitemid));
												$(".rvi_item #form" + val.internalid + " #rvi_qty_" + val.internalid).prepend(unescape(addtocartqty));
	                                            strStart = '<!--BEGIN_GPR_ADDTOCARTCLICKSCRIPT';
	                                            strEnd = 'END_GPR_ADDTOCARTCLICKSCRIPT-->';
	                                            intI = strHtmlItemTpl.indexOf(strStart);
	                                            intF = strHtmlItemTpl.indexOf(strEnd);
	                                            var addtocartclickscript = '#';
	                                            if (intI != -1 && intF != -1) {
	                                                intI += strStart.length;
	                                                addtocartclickscript = strHtmlItemTpl.substring(intI, intF);
	                                            }
	                                            
	                                            $("#rvi_addtocart_img_" + val.internalid).click(function(){
	                                                if (document.forms["form" + val.internalid].onsubmit()) {
	                                                    document.forms["form" + val.internalid].submit()
	                                                }
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
	                                            $("#rvi_addtocart_onsubmit_" + val.internalid).html(unescape(addtocartsubmitscript));
											}else{
												$("#rvi_addtocart_" + val.internalid).remove();
												$("#rvi_price_" + val.internalid).find('span[id^="itemprice"]').attr("id","");												
												$("#rvi_stkmessage_" + val.internalid).find('span[id^="itemavail"]').attr("id","");
											}
											$("#rvi_item_" + val.internalid).fadeIn(500);
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
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId + "_items");
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId + "_items", 'Get Items', textStatus, errorThrown);
                    }
                });            
			}
			
        },
        
        saveItem: function(strItemId){
            var strRvi_items = "";
            var strCookieValue = "";
            var bolExists = false;
            if (strItemId !== "") {
                var strCookieValue = GPR_COOKIES.read("rvi_n" + GPR_OPTIONS.options().siteNumber);
                if (strCookieValue == null) {
                    strRvi_items = strItemId;
                }
                else {
                    var arrItems = strCookieValue.split(",");
                    for (var i = 0; i < arrItems.length; i++) {
                        if (strItemId == arrItems[i]) {
                            bolExists = true;
                            break;
                        }
                    }
                    if (!bolExists) {
                        strRvi_items = strItemId + "," + strCookieValue;
                    }
                    else {
                        strRvi_items = strCookieValue;
                    }
                }
                GPR_COOKIES.create("rvi_n" + GPR_OPTIONS.options().siteNumber, strRvi_items, 10);
            }            
        }
    }
}(jQuery);
