 /**
 * Description: SuiteCommerce Advanced Features (Previous & Next Item)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_AAE_PNI = function($){
    var objOptions = {
    	"itemListCell" : ".pni-cell",
		"itemName" : ".name",
		"itemURL" : ".url",
		"itemThumbnail" : ".thumbnail",		
		"noThumbnail" : "",
		'itemCategoryURL' : '',
		'currentItemId' : ''
    };
    var bolItemFound = false;
    var objNext = null;
	var objPrevious = null;
	var objFirst = null;
	var objLast = null;
	var arrPages = [];
	var arrPagesUrls = {};
	var intTotalItems = 0;	
	
	function _getItemList(jqSelectorOrHtmlMarkup) {
		var intIndex = -1;
		var arrItems = 	$(jqSelectorOrHtmlMarkup).find(objOptions.itemListCell);
		var intLength = arrItems.length;
		if(intLength){
			if(objFirst == null){
				_setFirst($(arrItems[0]));
			}
			if(arrPages.length == 0 && intLength > 0){
				_setLast($(arrItems[intLength-1]));
			}
			if (!bolItemFound){
				arrItems.each(function(i){
					if($(this).is("#pni_"+objOptions.currentItemId)){
						intIndex = i;
						bolItemFound = true;
						return false;	
					}			
				});	
				intTotalItems = intTotalItems + intLength;		
				if(bolItemFound && intLength > 1){
					switch (intIndex){
						case 0:
							_setNext($(arrItems[intIndex+1]));
							break;
						case (intLength-1):
							_setPrevious($(arrItems[intIndex-1]));
							break;
						default:
							_setPrevious($(arrItems[intIndex-1]));
							_setNext($(arrItems[intIndex+1]));							
							break;
					}
				}
			}else{
				if(!objPrevious){
					if(arrPages.length == 0){
						objPrevious = objLast;
					}
				}
				if(!objNext){
					_setNext($(arrItems[0]));	
				}
			}		
		}
	}

	//Get the pages links
	function _getItemListAjax(arrPagesURLsQueue) {
		if(arrPagesURLsQueue && arrPagesURLsQueue.length && (objNext == null || objPrevious == null)) {
			$.ajax({
				'url' : arrPagesURLsQueue.shift(),
				'async' : false,
				'success' : function(data) {
					data = data.replace(/<img\b[^>]*>/ig, '');
					_getItemList(data);
					if(objNext){
						arrPagesURLsQueue.splice(0,arrPagesURLsQueue.length-1);
					}
					_getItemListAjax(arrPagesURLsQueue);										
				}
			});
		}
	}
	
	function _setFirst(obj) {
		objFirst = {
			"id" : obj.attr('id').replace('pni_',''), 
			"name" : obj.find(objOptions.itemName).html(), 
			"url" : obj.find(objOptions.itemURL).html(),
			"thumbnail" : obj.find(objOptions.itemThumbnail).html()
		};
	}
	
	function _setLast(obj) {
		objLast = {
			"id" : obj.attr('id').replace('pni_',''), 
			"name" : obj.find(objOptions.itemName).html(), 
			"url" : obj.find(objOptions.itemURL).html(),
			"thumbnail" : obj.find(objOptions.itemThumbnail).html()
		};
	}
	
	function _setPrevious(obj){
		objPrevious = {
			"id" : obj.attr('id').replace('pni_',''), 
			"name" : obj.find(objOptions.itemName).html(), 
			"url" : obj.find(objOptions.itemURL).html(),
			"thumbnail" : obj.find(objOptions.itemThumbnail).html()
		};
		
	}
	
	function _setNext(obj){
		objNext = {
			"id" : obj.attr('id').replace('pni_',''), 
			"name" : obj.find(objOptions.itemName).html(), 
			"url" : obj.find(objOptions.itemURL).html(),
			"thumbnail" : obj.find(objOptions.itemThumbnail).html()
		};
	}
	
    return {       
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
			
            //Get the Category Items
			$.ajax({
				'url' : objOptions.itemCategoryURL,		
				'success' : function(data) {	
					data = data.replace(/<img\b[^>]*>/ig, '');		
					$('#handle_itemMainPortlet [href*="range="]:eq(0)', data).parents('table:eq(0)').find('a').each(function() {
						var a = $(this);						
						if(!arrPagesUrls[a.attr('href')]){
							arrPages.push(a.attr('href'));
							arrPagesUrls[a.attr('href')] = true;	
						}	
					});					
					_getItemList(data);
					_getItemListAjax(arrPages);					
					if(intTotalItems > 1){
						if (!objNext){
							objNext = objFirst;
						}
						if (!objPrevious){
							objPrevious = objLast;
						}
						if(objPrevious){
							objOptions.prev.attr({"href" : objPrevious.url, "title" : objPrevious.name});
							var strThumbnail = (objPrevious.thumbnail.length && objPrevious.thumbnail.replace(/amp;/gi,'')) ||  objOptions.noThumbnail;							
							objOptions.prevThumb.append('<img src="' + strThumbnail + '">');
							objOptions.prevName.html(objPrevious.name);							
						}
						if(objNext){
							objOptions.next.attr({"href" : objNext.url, "title" : objNext.name});
							var strThumbnail = (objNext.thumbnail.length && objNext.thumbnail.replace(/amp;/gi,'')) ||  objOptions.noThumbnail; 
	   						objOptions.nextThumb.append('<img src="' + strThumbnail + '">');
							objOptions.nextName.html(objNext.name);
						}						
						objOptions.wraper.show();
					}else{
						objOptions.wraper.hide();
					}
				}
			});	
            
        }        
    }
}(jQuery);