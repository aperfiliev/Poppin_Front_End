/**
 * Description: SuiteCommerce Advanced Features (Compare)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

var _cprTools = function($) {
	
	function _updateForm(bolReset,strItem){
		if(bolReset){//Clicon on remove o close the pop up			
			var objCurForm = $("#cpr_form"+strItem);
			if(objCurForm.length > 0){
				var strCurName = objCurForm.prop("id").replace("cpr_","");
				objCurForm.prop({"name":strCurName,"id":strCurName});				
			}			
			
			$('span[id="cpr_itemprice'+strItem+'"]').prop("id", "itemprice" + strItem);
	        $('span[id="cpr_itemavail'+strItem+'"]').prop("id", "itemavail" + strItem);	
		}else{// open the pop up
			$('span[id="itemprice'+strItem+'"]').prop("id", "cpr_itemprice" + strItem);
    		$('span[id="itemavail'+strItem+'"]').prop("id", "cpr_itemavail" + strItem);    		
    		var objCurForm = $("#form"+strItem);
			var strCurName = objCurForm.prop("name");
			objCurForm.prop({"name":"cpr_"+strCurName,"id":"cpr_"+strCurName});			
		}
	}
	
	function _updateItemForms(){
		var arrItems = GPR_AAE_CPR.getCompareItems();
		for (var i=0; i < arrItems.length; i++) {
			_updateForm(true,arrItems[i].id);	
		}		
	}
	
	
	
	return {
		init: function(){
			$(".img-close").click(function(){
				$('#cpr-pop').hide();	
				_updateItemForms();
			});
			$(".cpr-reset").click(function(){
				_updateItemForms();
				GPR_AAE_CPR.reset();
				$('#cpr-pop').hide();				
			});
			$(".cpr-differences").click(function(){
				$(".different td").css({ width: "200px", background: "#65BBE9", border: "3px solid #FFFFFF" });
				$(".equals td").css({ width: "200px", background: "#F0F0F0", border: "3px solid #FFFFFF" });
				$(".different th").css({ width: "150px", background: "#65BBE9", border: "3px solid #FFFFFF" });
				$(".equals th").css({ width: "150px", background: "#F0F0F0", border: "3px solid #FFFFFF" });				
			});	
		},
		
		updateDifferences : function() {
			$("#cpr-container .cpr-row").each(function(i) {
				var tdValueEquals = true;
				if(i != 0 && i != 1 && i != 6){
					var firstTd = $(this).find("td:first").html();
					$(this).children("td").each(function() {
						var currentTd = $(this).html();
						if(currentTd != firstTd) {
							tdValueEquals = false;
						}
					});
					$(this).removeClass("equals different");
					//$(this).addClass("cpr-row");
					if(tdValueEquals) {
						$(this).addClass("equals cpr-row");
					} else {
						$(this).addClass("different cpr-row");
					}
				}
			});
		},
		compareItems : function(data) {
			$("#cpr-pop").hide();
			_updateItemForms();
			$("#cpr-container").html("");
			if(data !== null) {
				var arrAttributes = data.attributes;
				var arrItems = data.items;
				var objTr = $("<tr>");
				objTr.addClass("cpr-row");
				var objTh = $("<th>");
				objTh.attr("scope", "row");
				objTr.append(objTh);
				$(".cpr-item-count").html(arrItems.length);
				for(var k = 0; k < arrItems.length; k++) {					
					_updateForm(false,arrItems[k].id);
					var objTd = $("<td>");
					objTd.addClass("cpr-col-" + arrItems[k].id);
					var objA = $('<a>');
					objA.attr({"href":"javascript:void(0);","rel":arrItems[k].id});
					objA.text("Remove");					
					objA.click(function() {
						var strItemId = $(this).attr("rel");			
						GPR_AAE_CPR.removeItem(strItemId);
						_updateForm(true,strItemId);
						var objTableTds = $("#cpr-container > tr").first().children("td");
						if(objTableTds.length > 2) {
							var intItemsCount = $(".cpr-item-count").html();
							$(".cpr-item-count").html((parseInt(intItemsCount) - 1));
							$(".cpr-col-" + strItemId).remove();
							_cprTools.updateDifferences();
						} else {
							$(".cpr-col-" + strItemId).remove();							
							$("#cpr-pop").hide();
							$("#cpr-container").html("");
							_updateItemForms();
						}
					});
					objA.appendTo(objTd);					
					objTr.append(objTd);
				}
				$("#cpr-container").append(objTr);
				for(var strAttribute in arrAttributes) {
					var arrValues = arrAttributes[strAttribute].values;
					var objTr = $("<tr>");
					var objTh = $("<th>");
					var tdIsEmpty = true;
					var tdValueEquals = true;
					objTh.prop({"scope":"row","class":"small-text"});					
					objTh.html(unescape(arrAttributes[strAttribute].name));
					objTr.append(objTh);
					if(arrValues.length > 0)
						var firstTd = arrValues[0].toUpperCase();
					for(var j = 0; j < arrValues.length; j++) {
						var currentTd = arrValues[j].toUpperCase();
						if(currentTd != firstTd)
							tdValueEquals = false;
						var objTd = $("<td>");
						objTd.attr("align", "center");
						objTd.addClass("cpr-col-" + arrItems[j].id);
						switch(strAttribute){
							case "0":
								objTd.html("<img src = '" + unescape(arrValues[j]) + "' width='100px' />");
								break;
							case "5":							
								var objForm = $('<form>');
								objForm.attr({"method":"post","name":"form"+ arrItems[j].id,"id":"form"+ arrItems[j].id,"action":"/app/site/backend/additemtocart.nl","onsubmit":"return checkmandatory"+ arrItems[j].id +"();"});								
								objForm.html(unescape(arrValues[j]).replace("<!--", "").replace("-->", ""));
								objForm.appendTo(objTd);																
								break;
							default:
								objTd.html(unescape(arrValues[j]));
						}	
						objTr.append(objTd);
						if($("#cpr-col-" + arrItems[j].id).html() !== "")
							var tdIsEmpty = false;
					}
					if(!tdIsEmpty) {
						if(objTh.html() != "Image" && objTh.html() != "Add to cart") {
							if(!tdValueEquals)
								objTr.addClass("different cpr-row");
							else
								objTr.addClass("equals cpr-row");
							$("#cpr-container").append(objTr);
						} else {
							if(!tdValueEquals){
								objTr.addClass("white cpr-row");
								$(".white th").css({background: "#FFFFFF", border: "3px solid #FFFFFF" });
								$(".white td").css({background: "#FFFFFF", border: "3px solid #FFFFFF" });
							}else{
								objTr.addClass("white cpr-row");
								$(".white th").css({background: "#FFFFFF", border: "3px solid #FFFFFF" });
								$(".white td").css({background: "#FFFFFF", border: "3px solid #FFFFFF" });
							}								
							$("#cpr-container").append(objTr);
						}
					}
				}
				$("#cpr-pop").show();
			}
		},
		widgetCompareItems : function(data) {
			$("#cpr-widget").hide();
			$("#cpr-widget").html("");
			var objUl = $("<ul>");
			for(var i = 0; i < data.length; i++) {
				var objLi = $("<li>");
				objLi.html('<img width="80px" src="' + unescape(data[i].thumbnail) + '">');
				objUl.append(objLi);
			}
			$("#cpr-widget").append(objUl);
			$("#cpr-widget").show();
		}
	};
}(jQuery);