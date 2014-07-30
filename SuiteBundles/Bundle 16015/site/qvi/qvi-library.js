 /**
 * Description: SuiteCommerce Advanced Features (Quick view)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 1.0
*/
var GPR_AAE_QVI = function($){
    var objOptions = {
		isIE7: $.browser.msie && $.browser.version == "7.0",
        itemNameCntId: "qvi_item_name",
        itemMediaImgCntId: "qvi_media_image",
        itemDescriptionCntId: "qvi_description",
        itemPriceCntId: "qvi_item_price",
        itemStockCntId: "qvi_stock",
        itemOptionsCntId: "qvi_options",
        itemAddToCartCntId: "qvi_addtocart",
        itemCellClass: ".item-list-cell",
        itemCellImageClass: ".thumbnail-cell",
        showInfoCntId: "qvi_info",
		inStockMsg: "In Stock"
    }, arrItems = [];
	
    function Item(){
        this.id = '';
        this.name = '';
        this.mediaImage = '';
        this.url = '';
        this.description = '';
    }
    
    return {
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            $('.qvi, .qvi_bg').fadeTo(0, 0).hide();            
        },
        
        popUp: function(strItemId){
            var objItem = arrItems[strItemId];
			GPR_AAE_QVI.hidePopUp(strItemId,true);
			
            $('.qvi_bg').css('display', 'block').fadeTo(500, 0.75);
            $.ajax({
                url: objItem.url,
                type: "GET",
                cache: false,
                dataType: "html",
                success: function(htmlData){
                    var objOrigForm = $('#form' + strItemId);
                    if (objOptions.isIE7) {
                        /* Workaround for navigationName bug in ie7 */
                        var objAuxForm = document.createElement("form");
                        $(objAuxForm).attr("class", objOrigForm.attr("class")); //'class' is a reserved word in ie
                        $(objAuxForm).attr({
                            style: objOrigForm.attr("style"),
                            id: "qvi_form" + strItemId
                        });
                        objOrigForm.after(objAuxForm);
                        objOrigForm.children().appendTo(objAuxForm);
                        objOrigForm.appendTo("#qvi_addtocart_form");
                    }
                    else {
                        $(objOrigForm).attr({
                            id: 'qvi_form' + strItemId,
                            name: 'qvi_form' + strItemId
                        });
                        $("<form>").attr({
                            id: "form" + strItemId,
                            onsubmit: "return checkmandatory" + strItemId + "();",
                            action: "/app/site/backend/additemtocart.nl?c=" + GPR_OPTIONS.options().companyId + "&n=" + GPR_OPTIONS.options().siteNumber,
                            name: "form" + strItemId,
                            method: "post"
                        }).appendTo("#qvi_addtocart_form");
                    }
                    
                    $('span[id^="itemprice"]').attr("id", "qvi_itemprice" + strItemId);
                    $('span[id^="itemavail"]').attr("id", "qvi_itemavail" + strItemId);
                    
                    $("#" + objOptions.itemNameCntId).html(objItem.name);
                    $("#" + objOptions.itemMediaImgCntId + ' img').attr({
                        'src': objItem.mediaImage,
                        'alt': objItem.name
                    });
                    $("#" + objOptions.itemDescriptionCntId).html(objItem.description);
					
                    var strHtmlItemTpl = htmlData;
                    var strStart = '<!--BEGIN_GPR_SALESPRICE';
                    var strEnd = 'END_GPR_SALESPRICE-->';
                    var intI = strHtmlItemTpl.indexOf(strStart);
                    var intF = strHtmlItemTpl.indexOf(strEnd);
                    var strPrice = '&nbsp;';
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strPrice = strHtmlItemTpl.substring(intI, intF);
                    }
                    $('#' + objOptions.itemPriceCntId).html(strPrice);
                    
                    strStart = '<!--BEGIN_GPR_STKMESSAGE';
                    strEnd = 'END_GPR_STKMESSAGE-->';
                    intI = strHtmlItemTpl.indexOf(strStart);
                    intF = strHtmlItemTpl.indexOf(strEnd);
                    var strStkMessage = '';
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strStkMessage = strHtmlItemTpl.substring(intI, intF);
                    }					
					$("#" + objOptions.itemStockCntId).html(unescape(strStkMessage));	
					if ($('#itemavail'+strItemId).html() == ""){
						$("#" + objOptions.itemStockCntId).html(objOptions.inStockMsg);
					}
						
                    strStart = '<!--BEGIN_GPR_ITEMOPTIONS';
                    strEnd = 'END_GPR_ITEMOPTIONS-->';
                    intI = strHtmlItemTpl.indexOf(strStart);
                    intF = strHtmlItemTpl.indexOf(strEnd);
                    var strItemOptions = '';
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strItemOptions = strHtmlItemTpl.substring(intI, intF);
                    }
                    
                    strStart = '<!--BEGIN_GPR_ADDTOCARTITEMID';
                    strEnd = 'END_GPR_ADDTOCARTITEMID-->';
                    intI = strHtmlItemTpl.indexOf(strStart);
                    intF = strHtmlItemTpl.indexOf(strEnd);
                    var strAddtoCartItemId = '&nbsp;';
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strAddtoCartItemId = strHtmlItemTpl.substring(intI, intF);
                    }
                    
                    strStart = '<!--BEGIN_GPR_ADDTOCARTQTY';
                    strEnd = 'END_GPR_ADDTOCARTQTY-->';
                    intI = strHtmlItemTpl.indexOf(strStart);
                    intF = strHtmlItemTpl.indexOf(strEnd);
                    var strAddtoCartQty = '&nbsp;';
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strAddtoCartQty = strHtmlItemTpl.substring(intI, intF);
                    }
                    
                    strStart = '<!--BEGIN_GPR_ADDTOCARTSUBMITSCRIPT';
                    strEnd = 'END_GPR_ADDTOCARTSUBMITSCRIPT-->';
                    intI = strHtmlItemTpl.indexOf(strStart);
                    intF = strHtmlItemTpl.indexOf(strEnd);
                    var strAddtoCartSubmitScript = "";
                    if (intI != -1 && intF != -1) {
                        intI += strStart.length;
                        strAddtoCartSubmitScript = strHtmlItemTpl.substring(intI, intF);
                    }
                    
                    $('.qvi #form' + strItemId).html(strItemOptions + strAddtoCartItemId + strAddtoCartQty);
                    $('#qvi_addtocart_btn img').click(function(){
                        $('.qvi #form' + strItemId).submit();
                    });                    
                    $('#qvi_addtocart_onsubmit').html(strAddtoCartSubmitScript);
                    
                    $('.qvi').css('display', 'block').fadeTo(500, 1);
                    $('.qvi_bg, .qvi .close').click(function(){
                    	GPR_AAE_QVI.hidePopUp(strItemId,false);
                    });
                },
                beforeSend: function(XMLHttpRequest){
                    $("#qvi_info").show();
                },
                complete: function(XMLHttpRequest, textStatus){
                    $("#qvi_info").hide();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Item Info', textStatus, errorThrown);
                }
            });
        },
        
        hidePopUp: function(strItemId,bolInit) {
            if (objOptions.isIE7) {
                var objOrigForm = $('.qvi #form' + strItemId);
                var objAuxForm = $('#qvi_form' + strItemId);
                objOrigForm.children().remove();
                objAuxForm.after(objOrigForm);
                objAuxForm.children().appendTo(objOrigForm);
                objAuxForm.remove();
            }
            else {
                $("#qvi_addtocart_form").html("");
                $('#qvi_form' + strItemId).attr({
                    id: "form" + strItemId,
                    name: "form" + strItemId
                });
            }
            $("#" + objOptions.itemNameCntId).html("");
            $("#" + objOptions.itemMediaImgCntId + ' img').attr({
                'src': '',
                'alt': ''
            });
            $("#" + objOptions.itemDescriptionCntId).html("");
            $("#" + objOptions.itemPriceCntId).html("");
            $("#" + objOptions.itemStockCntId).html("");
            $('#qvi_addtocart_onsubmit').html("");
            $('span[id^="qvi_itemprice"]').attr("id", "itemprice" + strItemId);
            $('span[id^="qvi_itemavail"]').attr("id", "itemavail" + strItemId);
			$('.qvi_bg, .qvi .close').unbind('click');
			$('#qvi_addtocart_btn img').unbind('click');      
			if (!bolInit) {
				$('.qvi, .qvi_bg').animate({
					opacity: 0
				}, 500, function(){
					$(this).css('display', 'none');
				});
			}
        },
        
        newItem: function(){
            return new Item();
        },
        
        addItem: function(objItem){
            arrItems[objItem.id] = objItem;
        }
    }
}(jQuery);
