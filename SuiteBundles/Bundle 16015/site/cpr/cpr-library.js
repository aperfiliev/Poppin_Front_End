/**
 * Description: SuiteCommerce Advanced Features (Compare)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

/**
 * Compare
 * @author Gproxy Solutions Inc.
 * @version 2.0
 */
var GPR_AAE_CPR = function($) {
	/**
	 * @type {Object}
	 */ 
	var objOptions = {
		"cookieName" : "_gpr-aae-cpr",
		"itemAttrContainer" : ".cpr-itemattrs",
		"attributes" : {},
		"maxItems" : 4,
		"checkBoxId" : "cpr_chkbox_",
		"checkBox" : ".chkbox",
		"link" : ".cpr-link",
		"compareItems" : null,
		"widgetCompareItems" : null
	};
		
	/**
	 * Maintain items in compare
	 * @type {Array}
	 */
	var arrCprItems = [];
	/**
	 * Total items in compare
	 * @type {Integer}
	 */
	var intCprItems = 0;
	/**
	 * Items for compare in the current page
	 * @type {Object}
	 */	
	var objPageItems = {};
	/**
	 * Check if the comapre function it's executing
	 * @type {Boolean}
	 */
	var bolCompareExec = false;

	/**
	 *Check if the item is the compare
	 * @param {Array} arrCookieItems  Array containing the items for comparison 
	 * @param {String} strItemId      Item identifier
	 * @return {Integer}              -1 item not found otherwise return the position in the array 
	 */
	function _isInCompare(arrCookieItems, strItemId) {
		for(var i = 0; i < arrCookieItems.length; i++) {
			if(arrCookieItems[i].id == strItemId) {
				return i;
			}
		}
		return -1;
	}
			
	/**
	 * Get the item info from the item tempalte with an ajax call
	 * @param {Object} objItem       Object conataining the item info
	 * @param {Function} fnCallBack  Callback function to be execute after finish getting all the items info, process the items in compare
	 * @return {Void}
	 */
	function _getItemInfo(objItem, fnCallBack) {		
		$.ajax({
			url : unescape(objItem.url),
			type : "GET",
			dataType : "html",
			success : function(html) {
				html.replace(/<img[^>]+>/gi, "");
				$(html).find(objOptions.itemAttrContainer + " > div").each(function(index) {
					var objItemAttr = {};
					var strData = $(this).attr("rel");
					/*var arrData = strData.split(',');*/
					if(strData !== null && strData !== "")
						objOptions.attributes[strData].values.push(escape(($(this).html()).trim()));
				});
				arrCprItems.push(objItem);
				intCprItems--;								
				if(intCprItems === 0) {
					bolCompareExec = false;
					if($.isFunction(fnCallBack)) {
						var objReturn = {
							"items" : arrCprItems,
							"attributes" : objOptions.attributes
						};
						fnCallBack(objReturn);
					}
				}
			},
			error : function(XMLHttpRequest) {
				bolCompareExec = false;
				_gprCommon.popUp.show("Your session has expired. Reloading the page...");
				if(XMLHttpRequest.status == 401) {
					window.location.reload();
				}
			}
		});
	}
	/**
	 * Sets the checkbock for all the items in the compare
	 * @param {Boolean} bolVal
	 * @return {Void}
	 */
	function _setCompareCheckBox(bolVal) {
		var arrCookieItems = GPR_AAE_CPR.getCompareItems();
		if(arrCookieItems.length > 0) {			
			for(var i = 0; i < arrCookieItems.length; i++) {
				$("#" + objOptions.checkBoxId + arrCookieItems[i].id).prop("checked", bolVal);
			}
			if($.isFunction(objOptions.widgetCompareItems)) {
				objOptions.widgetCompareItems(arrCookieItems);
			}
		}

	}
	/**
	 * Initialize the compare
	 * @return {Void}
	 */
	function _initializeCompare() {
		arrCprItems = [];
		var arrAttributes = objOptions.attributes;
		for(var strAttribute in arrAttributes) {
			arrAttributes[strAttribute].values = [];
		}
	}

	return {
		/**
		 * Init the compare object
		 * @param {Object} obj   Compare settings
		 * @return {Void}
		 */
		init : function(obj) {
			if(obj !== null && obj !== undefined) {
				$.extend(objOptions, obj);
			}
			_setCompareCheckBox(true);
			$(objOptions.checkBox).click(function() {
				var objCurrentChkBox = $(this);
				if(objCurrentChkBox.is(':checked')) {
					GPR_AAE_CPR.saveItem(objCurrentChkBox.val());
				} else {
					GPR_AAE_CPR.removeItem(objCurrentChkBox.val());
				}
			});
			$(objOptions.link).click(function() {
				GPR_AAE_CPR.compare(objOptions.compareItems);
			});
		},
		/**
		 * Set the items in the page 
		 * @return {Object} objPageItems   Items in the page
		 */
		items : function() {
			return objPageItems;
		}(),
		/**
		 * Save one item in the compare cookie
		 * @param {String}  stritemId   Item identifier
		 * @return {Void}
		 */
		saveItem : function(strItemId) {
			var arrCookieItems = GPR_AAE_CPR.getCompareItems();
			if(arrCookieItems.length > 0) {
				if(arrCookieItems.length < objOptions.maxItems) {
					if(_isInCompare(arrCookieItems, strItemId) == -1) {
						arrCookieItems.push(objPageItems[strItemId]);
						_gprCommon.cookies.create(objOptions.cookieName, JSON.stringify(arrCookieItems), 730);
						if($.isFunction(objOptions.widgetCompareItems)) {
							objOptions.widgetCompareItems(arrCookieItems);
						}
					}
				} else {
					$("#" + objOptions.checkBoxId + strItemId).prop("checked", false);
					_gprCommon.popUp.show("You can compare Up to " + objOptions.maxItems + " items.");
				}
			} else {
				arrCookieItems.push(objPageItems[strItemId]);
				_gprCommon.cookies.create(objOptions.cookieName, JSON.stringify(arrCookieItems), 730);
				if($.isFunction(objOptions.widgetCompareItems)) {
					objOptions.widgetCompareItems(arrCookieItems);
				}
			}
		},
		/**
		 * Remove one item from the compare cookie
		 * @param {String}  stritemId   Item identifier
		 * @return {Void}
		 */
		removeItem : function(strItemId) {
			var arrCookieItems = GPR_AAE_CPR.getCompareItems();
			if(arrCookieItems.length > 0) {
				var intIndex = _isInCompare(arrCookieItems, strItemId);
				if(intIndex != -1) {
					arrCookieItems.splice(intIndex, 1);
					_gprCommon.cookies.create(objOptions.cookieName, JSON.stringify(arrCookieItems), 730);
					$("#" + objOptions.checkBoxId + strItemId).prop("checked", false);
					if($.isFunction(objOptions.widgetCompareItems)) {
						objOptions.widgetCompareItems(arrCookieItems);
					}
				}
			}
		},
		/**
		 * Remove all the items from the compare cookie		 
		 * @return {Void}
		 */
		reset : function() {
			_setCompareCheckBox(false);
			_gprCommon.cookies.erase(objOptions.cookieName);
			if($.isFunction(objOptions.widgetCompareItems)) {
				objOptions.widgetCompareItems([]);
			}
		},
		/**
		 * Compare the items in the compare cookie
		 * @param {Function}  fnCallBack   Callback function to be execute after finish getting all the items info, process the items in compare
		 * @return {Void}
		 */
		compare : function(fnCallBack) {
			var arrCookieItems = GPR_AAE_CPR.getCompareItems();
			if(arrCookieItems.length > 0) {
				if(arrCookieItems.length > 1) {
					if(!bolCompareExec) {
						bolCompareExec = true;
						intCprItems = arrCookieItems.length;
						_initializeCompare();
						//We have the columns in "arrCookieItems", now we have to create the table whit the columns.
						for(var i = 0; i < arrCookieItems.length; i++) {
							_getItemInfo(arrCookieItems[i], fnCallBack);							
						}
					}
				} else {
					_gprCommon.popUp.show("Please select at least 2 items to compare.");
				}

			} else {
				_gprCommon.popUp.show("No items found to compare");
			}
		},
		
		/**
		 * Get the Array with the cookie items
		 * @return {Array} arrCookieItems   Array containing the items in the cookie
		 */
		getCompareItems: function(){
			var strCookieValue = _gprCommon.cookies.read(objOptions.cookieName), arrCookieItems = [];
			if(strCookieValue !== null) {
				arrCookieItems = JSON.parse(strCookieValue);
			}
			return arrCookieItems;
		}
	};
}(jQuery);

