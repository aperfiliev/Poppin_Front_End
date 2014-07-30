/*
 * JavaScript file created by Rockstarapps Concatenation
*/

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/common/gpr-aae-library.js
 */
 /*!
 * Description: SuiteCommerce Advanced Features
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_PUP = function($){
    var objOptions = {
        fade: 500,
        winTimeOut: 7000
    };
    return {
        /**
         * POP UP MESSAGGES
         * Init
         * @param {Object} objOptions
         */
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
        /**
         * POP UP MESSAGGES
         * Show
         * @param {String} strMsg
         */
        show: function(strMsg){
            $('.gpr-pup-win').remove();
            $('body').append('<div class="gpr-pup-win">' + strMsg + '</div>');
            $('.gpr-pup-win').fadeTo(0, 0);
            $('.gpr-pup-win').append('<div class="gpr-pup-close">X Close</div>');
            $('.gpr-pup-win').fadeTo(objOptions.fade, 1);
            $('.gpr-pup-close').click(function(){
                $('.gpr-pup-win').fadeTo(objOptions.fade, 0, function(){
                    $('.gpr-pup-win').remove();
                });
            });
            setTimeout(function(){
                $('.gpr-pup-win').fadeTo(objOptions.fade, 0, function(){
                    $('.gpr-pup-win').remove();
                });
            }, objOptions.winTimeOut);
        }
    }
}(jQuery);

var GPR_COOKIES = function($){
    return {
        /**
         * COOKIES
         * Create a cookie
         * @param {String} strName
         * @param {String} strValue
         * @param {Integer} intDays
         */
        create: function(strName, strValue, intDays){
            var strExpires = "";
            if (intDays) {
                var dteDate = new Date();
                dteDate.setTime(dteDate.getTime() + (intDays * 24 * 60 * 60 * 1000));
                strExpires = "; expires=" + dteDate.toGMTString();
            }
            document.cookie = strName + "=" + escape(strValue) + strExpires + "; path=/";
        },
        /**
         * COOKIES
         * Read a cookie
         * @param {String} strName
         */
        read: function(strName){
            var strStart = "", strEnd = "";
            if (document.cookie.length > 0) {
                strStart = document.cookie.indexOf(strName + "=");
                if (strStart != -1) {
                    strStart = strStart + strName.length + 1;
                    strEnd = document.cookie.indexOf(";", strStart);
                    if (strEnd == -1) {
                        strEnd = document.cookie.length;
                    }
                    return unescape(document.cookie.substring(strStart, strEnd));
                }
            }
            return null;
        },
        /**
         * COOKIES
         * Erase a cookie
         * @param {String} strName
         */
        erase: function(strName){
            this.create(strName, "", -1);
        }
    }
}(jQuery);

var GPR_OPTIONS = function($){
    var objOptions = {
        loginURL: document.location,
        cartURL: document.location,
        checkoutURL: document.location,
        siteNumber: 1,
        customerId: "",
        companyId: ""
    };
    
    return {
        /**
         * POP UP MESSAGGES
         * Init
         * @param {Object} objOptions
         */
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
        
        options: function(){
            return objOptions;
        },
        
        getUrlVar: function(name){
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var tmpURL = window.location.href;
            var results = regex.exec(tmpURL);
            if (results == null) 
                return "";
            else 
                return results[1];
        }
    }
    
}(jQuery);

var GPR_AJAX_TOOLS = function($){
    var objOptions = {
        loadingImgURL: ""
    };
    return {
        /**
         * AJAX TOOLS
         * Init
         * @param {Object} objOptions
         */
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
        /**
         * AJAX TOOLS
         * Starts Loading ajax request
         * @param {String} strCntId
         * @param {String} strMsg
         */
        startLoading: function(strCntId, strMsg){
            $("#" + strCntId + " .gpr-loading").remove();
            $("#" + strCntId + " .gpr-errors").remove();
            $("#" + strCntId).append('<div class="gpr-loading"><span>' + strMsg + '</span><img src="' + objOptions.loadingImgURL + '"/></div>');
        },
        
        /**
         * AJAX TOOLS
         * Show ajax request errors
         * @param {String} strCntId
         */
        stopLoading: function(strCntId){
            $("#" + strCntId + " .gpr-loading").remove();
            $("#" + strCntId + " .gpr-errors").remove();
        },
        
        /**
         * AJAX TOOLS
         * Show ajax request errors
         * @param {String} strCntId
         * @param {String} strSource
         * @param {String} strCode
         * @param {String} strDetails
         */
        showError: function(strCntId, strSource, strCode, strDetails){
            $("#" + strCntId + " .gpr-loading").remove();
            $("#" + strCntId + " .gpr-errors").remove();
            $("#" + strCntId).append('<div class="gpr-errors">' + strSource + ", code: " + unescape(strCode) + ", details: " + unescape(strDetails) + '</div>');
        }
    }
}(jQuery);

/**
 * 	Utilities for adding items to the shopping cart.
 */
var GPR_CART_TOOLS = function($){

    var _url = "/app/site/backend/additemtocart.nl", _account = null;
    
    /*
     * Item declaration
     */
    function Item(id, category, qty, opts){
        this.id = id;
        this.category = category;
        this.qty = qty;
        this.opts = opts
    }
    Item.prototype.hasOptions = function(){
        return this.opts != null;
    }
    
    function makeSyncAjaxRequest(d){
        var _callback = function(){
        };
        if (arguments.length > 1) {
            _callback = arguments[1]
        }
        $.ajax({
            type: 'POST',
            url: _url,
            cache: false,
            async: false,
            data: d,
            error: function(){
                throw new Error("Failed attempt to add items to the shopping cart.")
            },
            complete: _callback
        })
    }
    
    function addSimpleItems(arrItems){
        var data = {
            c: _account
        }
        if (arrItems.length > 1) {
            /* Add various items */
            data.buyid = "multi";
            data.qtyadd = 1;
            data.multi = "";
            for (var i = 0; i < arrItems.length; i++) {
                data.multi += arrItems[i].id + "," + arrItems[i].qty + ";";
            }
            data.multi = data.multi.slice(0, -1);
        }
        else {
            /* Add a single item */
            with (arrItems[0]) {
                data.buyid = data.itemid = id;
                data.qty = qty;
                data.category = category;
            }
        }
        makeSyncAjaxRequest(data);
    }
    
    function addItemsWithOptions(arrItems){
        var data = {
            c: _account
        }
        var item = arrItems.splice(0, 1)[0];
        data.buyid = data.itemid = item.id;
        data.qty = item.qty;
        for (var opname in item.opts) {
            data[opname] = item.opts[opname]
        }        
        if (arrItems.length) {
            /* Add the first item and make a recursive call for the remaining ones. */
            makeSyncAjaxRequest(data, function(){
                addItemsWithOptions(arrItems)
            });
        }
        else {
            /* Add a single item */
            makeSyncAjaxRequest(data);
        }
    }
    
    return {
        /**
         * Returns an Item object from the Add to Cart form referenced in 'objForm'.
         *
         * @param {Object} objForm HTML form object reference.
         * @return An item object.
         */
        getItemInstanceFromForm: function(objForm){
			var elems = objForm.elements; 
            with (elems) {
                var _id = buyid.value, _qty = qty.value, _cat = category.value;
            }
            var _sel = $(elems).filter("select"), _opts = null;
            if (_sel.length) {
                _opts = {};
                for (var i = 0; i < _sel.length; i++) {
                    _opts[_sel[i].id] = _sel[i].value
                }
            }
            return this.getItemInstance(_id, _qty, _cat, _opts);
        },
        /**
         * Returns an Item object from the data.
         * 'options' is an associative array, where each cell corresponds to an item
         * option value, and the key is its name.
         * @param {String} id The item id
         * @param {Integer} qty The quantity to be added
         * @param {Integer} category The item category
         * @param {Array} options (optional) The item options selected
         */
        getItemInstance: function(id, qty, category){
            var options = (arguments.length > 3) ? arguments[3] : null;
            return new Item(id, category, qty, options);
        },
        /**
         * Add a single item or an array of them to the shopping cart.
         * The item(s) in arrItems must be created using GPR_CART_TOOLS.getItemInstanceFromForm or
         * GPR_CART_TOOLS.getItemInstance.
         * @param {Array} arrItems The items to be added
         * @param {function} callback (optional) The function to be run after the items are added successfully
         */
        addToCart: function(arrItems){
            if (_account === null) {
                throw new Error("Account number is not set.");
            }
            var _sItems = new Array(), _oItems = new Array();
            for (var i = 0; i < arrItems.length; i++) {
                if (arrItems[i].hasOptions()) {
                    _oItems.push(arrItems[i]);
                }
                else {
                    _sItems.push(arrItems[i]);
                }
            }
            if (_sItems.length) {
                addSimpleItems(_sItems)
            }
            if (_oItems.length) {
                addItemsWithOptions(_oItems)
            }
            if ((arguments.length > 1) && (typeof arguments[1] == "function")) {
                arguments[1]();
            }
        },
        /**
         * Sets the site account number if it was not previously set
         * @param {Integer} c
         */
        setAccountNumber: function(c){
            if (_account === null) {
                _account = c
            }
        }
    }
}(jQuery);

var GPR_TOOLS = function($){
    var objOptions = {
        
    };
	
	var arrDecToHex = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1A", "1B", "1C", "1D", "1E", "1F", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "2C", "2D", "2E", "2F", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3A", "3B", "3C", "3D", "3E", "3F", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4A", "4B", "4C", "4D", "4E", "4F", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5A", "5B", "5C", "5D", "5E", "5F", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6A", "6B", "6C", "6D", "6E", "6F", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7A", "7B", "7C", "7D", "7E", "7F", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8A", "8B", "8C", "8D", "8E", "8F", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9A", "9B", "9C", "9D", "9E", "9F", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "AA", "AB", "AC", "AD", "AE", "AF", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BA", "BB", "BC", "BD", "BE", "BF", "C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CA", "CB", "CC", "CD", "CE", "CF", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DA", "DB", "DC", "DD", "DE", "DF", "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "EA", "EB", "EC", "ED", "EE", "EF", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "FA", "FB", "FC", "FD", "FE", "FF"];
	
    return {
        
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
		
        uncode: function(strText){
		 	var strCoded = '';    
		    for (i = 0; i < strText.length; i++) {
		        strCoded += "%" + arrDecToHex[strText.charCodeAt(i)];
		    }
		    return strCoded;  
		}
    }
}(jQuery);

var _gprCommon = function($) {

	var objCommonOptions = {
		loginURL : document.location,
		cartURL : document.location,
		checkoutURL : document.location,
		siteNumber : 1,
		customerId : "",
		companyId : ""
	};

	var arrDecToHex = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1A", "1B", "1C", "1D", "1E", "1F", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2A", "2B", "2C", "2D", "2E", "2F", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3A", "3B", "3C", "3D", "3E", "3F", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4A", "4B", "4C", "4D", "4E", "4F", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5A", "5B", "5C", "5D", "5E", "5F", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6A", "6B", "6C", "6D", "6E", "6F", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7A", "7B", "7C", "7D", "7E", "7F", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8A", "8B", "8C", "8D", "8E", "8F", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9A", "9B", "9C", "9D", "9E", "9F", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "AA", "AB", "AC", "AD", "AE", "AF", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BA", "BB", "BC", "BD", "BE", "BF", "C0", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CA", "CB", "CC", "CD", "CE", "CF", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DA", "DB", "DC", "DD", "DE", "DF", "E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "EA", "EB", "EC", "ED", "EE", "EF", "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "FA", "FB", "FC", "FD", "FE", "FF"];

	return {
		init : function(obj) {
			$.extend(objCommonOptions, (obj || {}));
		},
		options : function() {
			return objCommonOptions;
		}(),
		popUp : function() {
			var objOptions = {
				fade : 500,
				winTimeOut : 7000
			};
			function createPopUp(strMsg){
				$('.gpr-pup-win').remove();
				$('body').append('<div class="gpr-pup-win">' + strMsg + '</div>');
				$('.gpr-pup-win').fadeTo(0, 0);
				$('.gpr-pup-win').append('<div class="gpr-pup-close">X Close</div>');
				$('.gpr-pup-win').fadeTo(objOptions.fade, 1);
				$('.gpr-pup-close').click(function() {
					$('.gpr-pup-win').fadeTo(objOptions.fade, 0, function() {
						$('.gpr-pup-win').remove();
					});
				});
			} 
			return {
				/**
				 * POP UP MESSAGGES
				 * Init
				 * @param {Object} objOptions
				 */
				init : function(obj) {
					$.extend(objOptions, (obj || {}));
				},
				/**
				 * POP UP MESSAGGES
				 * Show
				 * @param {String} strMsg
				 */
				show : function(strMsg) {
					createPopUp(strMsg);
					setTimeout(function() {
						$('.gpr-pup-win').fadeTo(objOptions.fade, 0, function() {
							$('.gpr-pup-win').remove();
						});
					}, objOptions.winTimeOut);
				},
				showModal : function(strMsg) {
					createPopUp(strMsg);					
				},
				hideModal : function(){
					$('.gpr-pup-win').fadeTo(objOptions.fade, 0, function() {
						$('.gpr-pup-win').remove();
					});	
				}
			};
		}(),
		cookies : function() {
			return {
				/**
				 * COOKIES
				 * Create a cookie
				 * @param {String} strName
				 * @param {String} strValue
				 * @param {Integer} intDays
				 */
				create : function(strName, strValue, intDays) {
					var strExpires = "";
					if(intDays) {
						var dteDate = new Date();
						dteDate.setTime(dteDate.getTime() + (intDays * 24 * 60 * 60 * 1000));
						strExpires = "; expires=" + dteDate.toGMTString();
					}
					document.cookie = strName + "=" + (escape(strValue)).trim() + strExpires + "; path=/";
				},
				/**
				 * COOKIES
				 * Read a cookie
				 * @param {String} strName
				 */
				read : function(strName) {
					var strStart = "", strEnd = "";
					if(document.cookie.length > 0) {
						strStart = document.cookie.indexOf(strName + "=");
						if(strStart != -1) {
							strStart = strStart + strName.length + 1;
							strEnd = document.cookie.indexOf(";", strStart);
							if(strEnd == -1) {
								strEnd = document.cookie.length;
							}
							var strValue = (unescape(document.cookie.substring(strStart, strEnd))).trim();
							if(strValue.length > 0){
								return strValue;
							}else{
								return null;
							}
						}
					}
					return null;
				},
				/**
				 * COOKIES
				 * Erase a cookie
				 * @param {String} strName
				 */
				erase : function(strName) {
					this.create(strName, "", -1);
				}
			}
		}(),
		getUrlVar : function(name) {
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var tmpURL = window.location.href;
			var results = regex.exec(tmpURL);
			if(results == null)
				return "";
			else
				return results[1];
		},
		ajax : function() {
			var objOptions = {
				loadingStateHtml : "",
				follower : null,
				loadingIconHeight : 32,
				loadingIconWidth : 32
			};
			/**
			 * AJAX TOOLS
			 * Starts Loading ajax request
			 * @param {String} strCntId
			 * @param {String} strMsg
			 */
			function _startLoading() {
				objOptions.follower.css("display", "block");
			}

			/**
			 * AJAX TOOLS
			 * Show ajax request errors
			 * @param {String} strCntId
			 */
			function _stopLoading() {
				objOptions.follower.css("display", "none");
			}

			return {
				/**
				 * AJAX TOOLS
				 * Init
				 * @param {Object} objOptions
				 */
				init : function(obj) {
					$.extend(objOptions, (obj || {}));
					objOptions.follower.html(objOptions.loadingStateHtml).ajaxStart(function() {
						_startLoading();
					}).ajaxStop(function() {
						_stopLoading();
					});
					$(document).bind("mousemove", function(e) {
						objOptions.follower.css({
							"top" : (e.pageY - objOptions.loadingIconHeight) + "px",
							"left" : (e.pageX - objOptions.loadingIconWidth) + "px"
						});
					});
				},
				/**
				 * AJAX TOOLS
				 * Show ajax request errors
				 * @param {String} strCntId
				 * @param {String} strSource
				 * @param {String} strCode
				 * @param {String} strDetails
				 */
				showError : function(strCntId, strSource, strCode, strDetails) {
					$("#" + strCntId + " .gpr-loading").remove();
					$("#" + strCntId + " .gpr-errors").remove();
					$("#" + strCntId).append('<div class="gpr-errors">' + strSource + ", code: " + unescape(strCode) + ", details: " + unescape(strDetails) + '</div>');
				}
			};
		}(),
		addToCart : function() {

			var _url = "/app/site/backend/additemtocart.nl", _account = null;

			/*
			 * Item declaration
			 */
			function Item(id, category, qty, opts) {
				this.id = id;
				this.category = category;
				this.qty = qty;
				this.opts = opts;
			}


			Item.prototype.hasOptions = function() {
				return this.opts != null;
			};
			
			function makeSyncAjaxRequest(d) {
				var _callback = function() {
				};
				//	async : false,
				if(arguments.length > 1) {
					_callback = arguments[1];					
				}
				$.ajax({
					type : 'POST',
					url : _url,
					cache : false,				
					data : d,
					error : function(XMLHttpRequest) {
						throw new Error("Failed attempt to add items to the shopping cart.");
					},
					complete : _callback
				});
			}
						
			return {
				/**
				 * Returns an Item object from the Add to Cart form referenced in 'objForm'.
				 *
				 * @param {Object} objForm HTML form object reference.
				 * @return An item object.
				 */
				getItemInstanceFromForm : function(objForm) {
					var elems = objForm.elements;
					with(elems) {
						var _id = buyid.value, _qty = qty.value, _cat = category.value;
					}
					var _sel = $(elems).filter("[name^=custcol]"), _opts = null;
					if(_sel.length) {
						_opts = {};
						for(var i = 0; i < _sel.length; i++) {
							if(_sel[i].getAttribute("type") == "checkbox")
								_opts[_sel[i].name] = _sel[i].checked ? "T" : "F";
							else
								_opts[_sel[i].name] = _sel[i].value;
						}
					}
					return this.getItemInstance(_id, _qty, _cat, _opts);
				},
				/**
				 * Returns an Item object from the data.
				 * 'options' is an associative array, where each cell corresponds to an item
				 * option value, and the key is its name.
				 * @param {String} id The item id
				 * @param {Integer} qty The quantity to be added
				 * @param {Integer} category The item category
				 * @param {Array} options (optional) The item options selected
				 */
				getItemInstance : function(id, qty, category) {
					var options = (arguments.length > 3) ? arguments[3] : null;
					return new Item(id, category, qty, options);
				},
				/**
				 * Add a single item or an array of them to the shopping cart.
				 * The item(s) in arrItems must be created using GPR_CART_TOOLS.getItemInstanceFromForm or
				 * GPR_CART_TOOLS.getItemInstance.
				 * @param {Array} arrItems The items to be added
				 * @param {function} callback (optional) The function to be run after the items are added successfully
				 */
				addToCart : function(arrItems) {
					if(_account === null) {
						throw new Error("Account number is not set.");
					}
					//c=123456&buyid=multi&multi=51,1,custcolsize|1||custcolcolor|1;52,2,custcolsize|2||custcolcolor|2
					var data = {
						c : _account
					};					
					data.buyid = "multi";
					var arrMulti = []					
					for(var i = 0; i < arrItems.length; i++) {
						var arrItem = [];
						var arrOpts = [];						
						arrItem.push(arrItems[i].id);
						arrItem.push(arrItems[i].qty);						 
						if(arrItems[i].hasOptions()) {
							for(var opname in arrItems[i].opts) {
								var arrOpt = [];
								var value = arrItems[i].opts[opname];
								if( value != "" && value != null && value != undefined){
									value = value.replace(",","-").replace("|","-").replace(";","-");
									arrOpt.push(opname);
									arrOpt.push(value);
									arrOpts.push(arrOpt.join("|"));
								}
							}
							if(arrOpts.length)
								arrItem.push(arrOpts.join("||"));
						}
						if(arrItem.length)
							arrMulti.push(arrItem.join(","))
					}
					if(arrMulti.length) {
						data.multi = arrMulti.join(";");
						if((arguments.length > 1) && ( typeof arguments[1] == "function")) {
							makeSyncAjaxRequest(data, arguments[1]);						
						}else{
							makeSyncAjaxRequest(data);	
						}					
					}
				},
				/**
				 * Sets the site account number if it was not previously set
				 * @param {Integer} c
				 */
				setAccountNumber : function(c) {
					if(_account === null) {
						_account = c
					}
				}
			}
		}(),
		uncode : function(strText) {
			var strCoded = '';
			for( i = 0; i < strText.length; i++) {
				strCoded += "%" + arrDecToHex[strText.charCodeAt(i)];
			}
			return strCoded;
		}
	}
}(jQuery)

//trim() method implementation
if( typeof String.prototype.trim != "function") {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, "");
	};
}

//Capitalize() method implementation
if( typeof String.prototype.capitalize != "function") {
	String.prototype.capitalize = function() {
		return this.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
			return p1 + p2.toUpperCase();
		});
	};
}

if( typeof Number.prototype.formatMoney != "function") {
	Number.prototype.formatMoney = function(c, d, t) {
		var n = this, c = isNaN( c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt( n = Math.abs(+n || 0).toFixed(c)) + "", j = ( j = i.length) > 3 ? j % 3 : 0;
		return s + ( j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + ( c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};
}


/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/common/gpr-aae-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/bsn/bsn-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Back in Stock Notifications)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_AAE_BSN = function($){
	 var objOptions = {
	 	checkChildQtyURL: '/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_bsn_chkchildqty&deploy=customdeploy_gpr_aae_ss_bsn_chkchildqty',
		checkQtyURL: '/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_bsn_chkqty&deploy=customdeploy_gpr_aae_ss_bsn_chkqty',
		saveFormURL: '',
		showInfoCntId: 'bsn_info',
		formLinkId: 'bsn_save_link',
		formIframeId: 'bsn_save_iframe',
		containerId: 'bsn_save'
     };
	 
	 return {
	 	init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
		
		setOptionsEvent: function(){
			$("select[id^='custcol']").change(function(){
					GPR_AAE_BSN.checkChildQty();
			});
		},
		
		checkQty: function(){
			$('#' + objOptions.formIframeId).hide();
			var objParams = {
				parentid: objOptions.itemId
			};
			$.ajax({
				url: objOptions.checkQtyURL,	      
				type: "GET",		
				dataType: "jsonp",
				data: objParams,
				success: function(data){
					if (data.Errors.length > 0) {  
						$.each(data.Errors, function(i, val){	
							GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Stock', val.code, val.details);
							$('#' + objOptions.containerId).hide();		  		 			            
						});
					}else{												
						if(data.Results.matrix){
							GPR_AAE_BSN.setOptionsEvent();
						}else{
							if (data.Results.available) {
								$('#' + objOptions.containerId).hide();
							}else{
								$('#' + objOptions.formIframeId).attr('src', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId  + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		    					$('#' + objOptions.formLinkId).attr('href', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId  + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
								$('#' + objOptions.containerId).show();
							}
						}					        
					}
				},
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Checking Stock...');
                },
                complete: function(XMLHttpRequest, textStatus){
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Stock', textStatus, errorThrown);
                }		  
			});
		},
		
		checkChildQty: function(){
			$('#' + objOptions.formIframeId).hide();
			var arrItemOptions = [];
			var bolAllSelected = true;			
			$("select[id^='custcol'] option:selected").each(function(){		
				if ($(this).val() != ''){
					arrItemOptions.push($(this).text());
				}else{
					bolAllSelected = false;
				}
			});
			if (bolAllSelected){
				var strItemOptions ;
				var objParams = {
					parentid: objOptions.itemId,
					itemoptions: GPR_TOOLS.uncode(arrItemOptions.join('|'))
				};
				
				$.ajax({
					url: objOptions.checkChildQtyURL,	      
					type: "GET",		
					dataType: "jsonp",
					data: objParams,
					success: function(data){
						if (data.Errors.length > 0) {  
							$.each(data.Errors, function(i, val){	
								GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Child Stock', val.code, val.details);
								$('#' + objOptions.containerId).hide();		  		 			            
							});
						}else{												
							if (data.Results.available) {
								$('#' + objOptions.containerId).hide();
							}else{
								$('#' + objOptions.formIframeId).attr('src', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_bsn_childid=' + data.Results.childid + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		    					$('#' + objOptions.formLinkId).attr('href', objOptions.saveFormURL + '&custrecord_gpr_aae_bsn_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_bsn_childid=' + objOptions.childid + '&custrecord_gpr_aae_bsn_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_bsn_sitenumber=' + GPR_OPTIONS.options().siteNumber);
								$('#' + objOptions.containerId).show();
							}				        
						}
					},
                    beforeSend: function(XMLHttpRequest){
                        GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Checking Child Stock...');
                    },
                    complete: function(XMLHttpRequest, textStatus){
                        GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Check Child Stock', textStatus, errorThrown);
                    }		  
				});
			}
		},
		
		showForm: function(){
			if ($('#' + objOptions.formIframeId).is(':hidden')) {
		        $('#' + objOptions.formIframeId).show();
		    }
		    else {
		        $('#' + objOptions.formIframeId).hide();
		    }
		}
	 }	
}(jQuery);


/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/bsn/bsn-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/cpr/cpr-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Compare Items)
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


/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/cpr/cpr-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/crv/crv-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Customer Reviews)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/

var GPR_AAE_CRV = function($){
	 var objOptions = {
        saveFormURL: "",
	    itemId: "",	
	    saveId: "crv_save",
		formIframeId: "crv_save_iframe",
		formLinkId: "crv_save_link",
		starsWrapId: "crv_stars_wrap",
		ratingInputId: "custrecord_gpr_aae_crv_rating",
		anonymousText: "Your Identity is Anonymous",
		reviewerInputId: "custrecord_gpr_aae_crv_reviewer",
		maxReviewsCount: 5	
     }, strReviewerCnt = "";
	 
	 return {
	 	init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }			
        },
		
		showForm: function(){
			if ($('#' + objOptions.formIframeId).is(':hidden')) {
		        $('#' + objOptions.formIframeId).slideDown(500);
		    }
		    else {
		        $('#' + objOptions.formIframeId).slideUp(500);
		    }
		},
		
		setFormURL: function(){
			var strURL = objOptions.saveFormURL + '&custrecord_gpr_aae_crv_itemid=' + objOptions.itemId + '&custrecord_gpr_aae_crv_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_crv_sitenumber=' + GPR_OPTIONS.options().siteNumber + '&custrecord_gpr_aae_crv_state=3'; 
			var objIFrame = $('<iframe>');			
			objIFrame.attr({id: 'crv_save_iframe',name: 'crv_save_iframe', src: strURL, frameborder: '0', scrolling: 'no', marginwidth: '0', marginheight: '0', allowtransparency: 'yes'});
			//objIFrame.addClass('save-iframe');
			objIFrame.css('display', 'none');
			objIFrame.appendTo('#' + objOptions.saveId);	
		},
		
		setAnonymous: function(obj){
			var bolAnonymus = obj.checked;
		    var objNameInput = $("#" + objOptions.reviewerInputId);		    
		    if (bolAnonymus) {       
				strReviewerCnt = objNameInput.val();				
		        objNameInput.val(objOptions.anonymousText);
				objNameInput.attr({'class': 'input-disable', 'disabled': true});				
		    }
		    else {		
				objNameInput.val(strReviewerCnt);
				objNameInput.removeAttr('disabled');
		        objNameInput.attr('class', 'inputreq');
		        strReviewerCnt = "";
		    }
		},
		
		initRatingLinks: function (){
		    for (var i = 1; i <= objOptions.maxReviewsCount; i++) {		        
		        $("<a>").attr({
		            'title': "Rating " + i,
		            'href': "javascript:void(0);",
					'class': "stars",
					'id': i
		        }).click(function(e){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if (bolOk) {
				            $(val).attr('class', 'stars-selected');
				            if (val == e.target) {
				                $("#" + objOptions.ratingInputId).val(i + 1);
				                bolOk = false;
				            }
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });					
				}).hover(function(e){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if (bolOk) {
				            $(val).attr('class', 'stars-hover');
				            if (val == e.target) {
				                bolOk = false;
				            }
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });
				},function(){
					var bolOk = true;
				    $("#" + objOptions.starsWrapId + ">a").each(function(i, val){
				        if ($("#" + objOptions.ratingInputId).val() == i) {
				            bolOk = false;
				        }
				        if (bolOk) {
				            $(val).attr('class', 'stars-selected');
				        }
				        else {
				            $(val).attr('class', 'stars');
				        }
				    });
				}).appendTo("#" + objOptions.starsWrapId);
		    }
		} 
	 }	
}(jQuery);
/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/crv/crv-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/gir/gir-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Gift Registry)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 3.0
*/
var GPR_AAE_GIR = function($){
    var objOptions = {
        getGiftRegistriesURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_gir_get&deploy=customdeploy_gpr_aae_ss_gir_get",
		getSharedGiftRegistriesURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_gir_getshared&deploy=customdeploy_gpr_aae_ss_gir_getshared",
        removeGiftRegistryURL: "/app/site/hosting/scriptlet.nl?script=customscript_gpr_aae_ss_gir_remove&deploy=customdeploy_gpr_aae_ss_gir_remove",
        createFormURL: "",	    
		createFormIframeId: "gir_create_iframe",
		createFormLinkId: "gir_create_link",		  
	    giftRegistriesCntId: "gir_giftregistries",	
		sharedGiftRegistriesCntId: "gir_shared_giftregistries",
		giftRegistriesItemsInfoCntId: "gir_items_info",
	    addBtnCntId: "gir_addbtn",
	    loginLnkCntId: "gir_loginlnk",
	    showInfoCntId: "gir_info",
        msgs: ["Item was added successfully.", "Item already added", "Invalid parameters sent, please contact the administrator...", "Wish List disable, please contact the administrator...", "Item was removed successfully.", "Items were cleared successfully.", "Unespected error, please contact the administrator...", "No Item Found", "No Items Found", "Items were added successfully.", "No items found in the Shopping Cart", "All Items already added"]
    };
    var arrItems = [];
    
    function showPopUp(strMsg){
        GPR_PUP.show(strMsg);
    }
    
    return {
        /**
         * GIFT REGISTRY
         * Init the Gift Registry
         * @param {Object} objOptions
         */
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }			
            if (GPR_OPTIONS.options().customerId !== null && GPR_OPTIONS.options().customerId !== "") {
                var strGiftRegistryUrl = GPR_COOKIES.read('_gpr_aae_gir_url');
                if (strGiftRegistryUrl !== null && strGiftRegistryUrl !== "") {
                    GPR_COOKIES.erase('_gpr_aae_gir_url');
                    window.location.href = strGiftRegistryUrl;
                }
            }
			
			$('#' + objOptions.createFormIframeId).load(function(){
				GPR_AAE_GIR.get();
				GPR_AAE_GIR.getShared();
			});
			
        },
		
		setCreateFormURL: function(){
			$('#' + objOptions.createFormIframeId).attr('src', objOptions.createFormURL + '&custrecord_gpr_aae_gir_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_gir_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		    $('#' + objOptions.createFormLinkId).attr('href', objOptions.createFormURL + '&custrecord_gpr_aae_gir_customerid=' + GPR_OPTIONS.options().customerId + '&custrecord_gpr_aae_gir_sitenumber=' + GPR_OPTIONS.options().siteNumber);
		},
		
		showCreateForm: function(){
			if ($('#' + objOptions.createFormIframeId).is(':hidden')) {
		        $('#' + objOptions.createFormIframeId).slideDown(500);
		    }
		    else {
		        $('#' + objOptions.createFormIframeId ).slideUp(500);
		    }
		},
        
        addItemCookie: function(){
            var strItemId = GPR_COOKIES.read('_gpr_aae_wlp_itemid');
            if (strItemId !== null && strItemId !== "") {
                GPR_COOKIES.erase('_gpr_aae_wlp_itemid');
                var strParams = {
                    sitenumber: GPR_OPTIONS.options().siteNumber,
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    itemid: strItemId
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
        addItem: function(strItemId){
            if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create('_gpr_aae_wlp_itemid', strItemId, 10);
                window.location.href = GPR_OPTIONS.options().loginURL;
            }
            else {
                var strParams = {
                    sitenumber: GPR_OPTIONS.options().siteNumber,
                    customerid: escape(GPR_OPTIONS.options().customerId),
                    itemid: strItemId
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
        addCartItems: function(){
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
                                var strItemFullId = $j(arrCartRows[i]).find("input").attr("id");
                                var arrMatchId = strItemFullId.match(/item([^s]*)/);
                                var strItemId = arrMatchId[1].replace(/item/, '');
                                arrItems.push(strItemId);
                            }
                            var strParams = {
                                sitenumber: GPR_OPTIONS.options().siteNumber,
                                customerid: escape(GPR_OPTIONS.options().customerId),
                                itemsid: escape(arrItems.join(";"))
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
                                        GPR_AAE_WLP.getItems();
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
        removeItem: function(strItemId){
            var strParams = {
                sitenumber: GPR_OPTIONS.options().siteNumber,
                customerid: escape(GPR_OPTIONS.options().customerId),
                itemid: strItemId
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
                        GPR_AAE_WLP.getItems();
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
        clearItems: function(){
            var strParams = {
                sitenumber: GPR_OPTIONS.options().siteNumber,
                customerid: escape(GPR_OPTIONS.options().customerId)
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
                        GPR_AAE_WLP.getItems();
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
		
		checkLogin: function(){
			if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create("_gpr_aae_gir_url", document.location.href);
                //Redirect to login page
                window.location.href = GPR_OPTIONS.options().loginURL;
            }
		},
		
        get: function(){
            var strParams = {
                customerid: escape(GPR_OPTIONS.options().customerId),
                sitenumber: GPR_OPTIONS.options().siteNumber
            };
            $.ajax({
                url: objOptions.getGiftRegistriesURL + "&callback=?",
                type: "GET",
                dataType: "jsonp",
                data: strParams,
                success: function(json){
                    if (json.Errors.length > 0) {
                        $.each(json.Errors, function(i, val){
                            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Gif Registries', val.code, val.details);
                        });
                    }
                    else {
                        $("#" + objOptions.giftRegistriesCntId).html(unescape(json.Results.html));                        
                    }
                },
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Gif Registries...');
                },
                complete: function(XMLHttpRequest, textStatus){                  
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Gif Registries', textStatus, errorThrown);
                }
            });
            
        },
		
		getShared: function(){
			 var strParams = {
                customeremail: escape(GPR_OPTIONS.options().customerEmail),
                sitenumber: GPR_OPTIONS.options().siteNumber
            };
            $.ajax({
                url: objOptions.getSharedGiftRegistriesURL + "&callback=?",
                type: "GET",
                dataType: "jsonp",
                data: strParams,
                success: function(json){
                    if (json.Errors.length > 0) {
                        $.each(json.Errors, function(i, val){
                            GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Shared Gif Registries', val.code, val.details);
                        });
                    }
                    else {
                        $("#" + objOptions.sharedGiftRegistriesCntId).html(unescape(json.Results.html));                        
                    }
                },
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Shared Gif Registries...');
                },
                complete: function(XMLHttpRequest, textStatus){                    
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Shared Gif Registries', textStatus, errorThrown);
                }
            });
		},
        
        /**
         * WISH LIST PROFESSIONAL
         * Shows the items in the Customer Wishlist
         */
        getItems: function(){
            if (GPR_OPTIONS.options().customerId === "") {
                GPR_COOKIES.create("_gpr_aae_wlp_url", document.location.href);
                //Redirect to login page
                window.location.href = GPR_OPTIONS.options().loginURL;
            }
            else {
                $("#" + objOptions.loginLnkCntId).remove();
                var strParams = {
                    customerid: escape(GPR_OPTIONS.options().customerId),
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

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/gir/gir-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/imb/imb-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Image Browser)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_AAE_IMB = function($){
    //GLOBAL VARIABLES
    var isIE6 = ($.browser.msie && $.browser.version < 7);
    var body = $(document.body);
    var jqzoompluging_disabled = false; //disables the plugin globally
    $.fn.jqzoom = function(options){
        return this.each(function(){
            var node = this.nodeName.toLowerCase();
            if (node == 'a') {
                new jqzoom(this, options);
            }
        });
    };
    
    /**
     * Shows the entire large image
     */
    var popup = (function(){
        var img, p, imgcnt, pmouseDown = false, loading = false, bg = $('<div class="bgpopup">'), w = $(window);
        
        function getCenterCoords(jqElem){
            return {
                left: Math.floor((w.width() - jqElem.width()) / 2) + "px",
                top: Math.floor((w.height() - jqElem.height()) / 2) + "px"
            }
        }
        
        function setImageContainerSize(){
            $(imgcnt).css({
                height: img.offsetHeight,
                width: img.offsetWidth
            })
        }
        
        function showLoadingMsg(){
        
        }
        function hideLoadingMsg(){
        
        }
        return {
            init: function(popupref, imgcont, closebtn, dragarea){
                if (!popupref) {
                    throw new Error("Invalid popup.init call: popupref is not defined.");
                }
                var that = this;
                bg.click(function(){
                    that.close()
                }).hide().appendTo("body");
                p = popupref;
                imgcnt = imgcont || p;
                $(p).css({
                    top: 0,
                    left: "-10000px"
                }).show();
                if (closebtn) {
                    $(closebtn).click(function(e){
                        e.preventDefault();
                        that.close();
                        return false
                    })
                }
                if (dragarea) {
                    document.body.ondragstart = function(){
                        return false;
                    };
                    $(dragarea).mousedown(function(evt){
                        var o = $(p).offset(), evt_offset = {
                            x: evt.pageX - o.left + w.scrollLeft(),
                            y: evt.pageY - o.top + w.scrollTop()
                        }
                        $(document).bind("mousemove.gpImbPopup", function(e){
                            /* Move the popup */
                            $(p).css({
                                top: (e.pageY - evt_offset.y) + 'px',
                                left: (e.pageX - evt_offset.x) + 'px'
                            })
                        })
                    }).mouseup(function(){
                        $(document).unbind("mousemove.gpImbPopup")
                    });
                }
                return this
            },
            setImage: function(image){
                var cnt = $(imgcnt);
                img = $(image).clone().removeAttr("style").removeAttr("class").removeAttr("height").removeAttr("width").get(0);
                cnt.children().remove();
                cnt.append(img);
                return this
            },
            close: function(){
                var i = $(img).unbind('load');
                img = null;
                loading = false;
                i.remove();
                $(p).css({
                    top: 0,
                    left: "-10000px"
                }).show();
                bg.hide();
                return this
            },
            show: function(){
                if (!img) {
                    throw new Error("popup.show method cannot be called before setting an image.")
                }
                bg.css({
                    width: w.width() + "px",
                    height: w.height() + "px"
                }).show();
                var jqp = $(p), coords;
                if (img.complete) {
                    //The image is already loaded
                    setImageContainerSize();
                    coords = getCenterCoords(jqp);
                    jqp.hide().css(coords).fadeIn("slow");
                }
                else {
                    loading = true;
                    showLoadingMsg();
                    $(img).bind('load', function(){
                        setImageContainerSize();
                        coords = getCenterCoords(jqp);
                        hideLoadingMsg();
                        jqp.hide().css(coords).fadeIn("slow");
                        loading = false;
                    })
                }
                return this
            }
        }
    })();
    
    var jqzoom = function(el, options){
        var api = null;
        api = $(el).data("jqzoom");
        if (api) 
            return api;
        var obj = this;
        var settings = $.extend({}, $.jqzoom.defaults, options || {});
        obj.el = el;
        el.rel = $(el).attr('rel');
        //ANCHOR ELEMENT
        el.zoom_active = false;
        el.zoom_disabled = false; //to disable single zoom instance
        el.largeimageloading = false; //tell us if large image is loading
        el.largeimageloaded = false; //tell us if large image is loaded
        el.scale = {};
        el.timer = null;
        el.mousepos = {};
        el.mouseDown = false;
        $(el).css({
            'outline-style': 'none',
            'text-decoration': 'none'
        });
        //BASE IMAGE
        var img = $("img:eq(0)", el);
        el.title = $(el).attr('title');
        el.imagetitle = img.attr('title');
        var zoomtitle = ($.trim(el.title).length > 0) ? el.title : el.imagetitle;
        var smallimage = new Smallimage(img);
        var lens = new Lens();
        var stage = new Stage();
        var largeimage = new Largeimage();
        var loader = new Loader();
        //preventing default click,allowing the onclick event [exmple: lightbox]
        $(el).bind(settings.swapImageTrigger, function(e){
            e.preventDefault();
            return false;
        });
        //setting the default zoomType if not in settings
        var zoomtypes = ['standard', 'drag', 'innerzoom', 'reverse'];
        if ($.inArray($.trim(settings.zoomType), zoomtypes) < 0) {
            settings.zoomType = 'standard';
        }
        $.extend(obj, {
            create: function(){ //create the main objects
                //create ZoomPad
                if ($(".zoomPad", el).length == 0) {
                    el.zoomPad = $('<div/>').addClass('zoomPad');
                    img.wrap(el.zoomPad);
                }
                if (settings.zoomType == 'innerzoom') {
                    settings.zoomWidth = smallimage.w;
                    settings.zoomHeight = smallimage.h;
                }
                //creating ZoomPup
                if ($(".zoomPup", el).length == 0) {
                    lens.append();
                }
                //creating zoomWindow
                if ($(".zoomWindow", el).length == 0) {
                    stage.append();
                }
                //creating Preload
                if ($(".zoomPreload", el).length == 0) {
                    loader.append();
                }
                //preloading images
                if (settings.preloadImages || settings.zoomType == 'drag' || settings.alwaysOn) {
                    obj.load();
                }
                obj.init();
            },
            init: function(){
                //drag option
                if (settings.zoomType == 'drag') {
                    $(".zoomPad", el).mousedown(function(){
                        el.mouseDown = true;
                    });
                    $(".zoomPad", el).mouseup(function(){
                        el.mouseDown = false;
                    });
                    document.body.ondragstart = function(){
                        return false;
                    };
                    $(".zoomPad", el).css({
                        cursor: 'default'
                    });
                    $(".zoomPup", el).css({
                        cursor: 'move'
                    });
                }
                if (settings.enableRolloverZoom) {
                    if (settings.zoomType == 'innerzoom') {
                        $(".zoomWrapper", el).css({
                            cursor: 'crosshair'
                        });
                    }
                    $(".zoomPad", el).bind('mouseenter mouseover', function(event){
                        img.attr('title', '');
                        $(el).attr('title', '');
                        el.zoom_active = true;
                        //if loaded then activate else load large image
                        smallimage.fetchdata();
                        if (el.largeimageloaded) {
                            obj.activate(event);
                        }
                        else {
                            obj.load();
                        }
                    });
                    $(".zoomPad", el).bind('mouseleave', function(event){
                        obj.deactivate();
                    });
                    $(".zoomPad", el).bind('mousemove', function(e){
                    
                        //prevent fast mouse movements not to fire the mouseout event
                        if (e.pageX > smallimage.pos.r || e.pageX < smallimage.pos.l || e.pageY < smallimage.pos.t || e.pageY > smallimage.pos.b) {
                            lens.setcenter();
                            return false;
                        }
                        el.zoom_active = true;
                        if (el.largeimageloaded && !$('.zoomWindow', el).is(':visible')) {
                            obj.activate(e);
                        }
                        if (el.largeimageloaded && (settings.zoomType != 'drag' || (settings.zoomType == 'drag' && el.mouseDown))) {
                            lens.setposition(e);
                        }
                    });
                }
                var thumb_preload = new Array();
                var i = 0;
                //binding click event on thumbnails
                var thumblist = new Array();
                thumblist = $('a').filter(function(){
                    var regex = new RegExp("gallery[\\s]*:[\\s]*'" + $.trim(el.rel) + "'", "i");
                    var rel = $(this).attr('rel');
                    if (regex.test(rel)) {
                        return this;
                    }
                });
                if (thumblist.length > 0) {
                    //getting the first to the last
                    var first = thumblist.splice(0, 1);
                    thumblist.push(first);
                }
                thumblist.each(function(){
                    //preloading thumbs
                    if (settings.preloadImages) {
                        var thumb_options = $.extend({}, eval("(" + $.trim($(this).attr('rel')) + ")"));
                        thumb_preload[i] = new Image();
                        thumb_preload[i].src = thumb_options.largeimage;
                        i++;
                    }
                    $(this).bind(settings.swapImageTrigger, function(e){
                        if (!$(this).hasClass('zoomThumbActive')) {
                            thumblist.each(function(){
                                $(this).removeClass('zoomThumbActive');
                            });
                            e.preventDefault();
                            obj.swapimage(this);
                        }
                        return false;
                    });
                    if (settings.enableLargeImagePopup) {
                        $(this).bind(settings.showLareImgHdlr, function(e){
                            e.preventDefault();
                            popup.close().setImage(largeimage.node).show();
                            return false;
                        });
                    }
                });
            },
            load: function(){
                if (el.largeimageloaded == false && el.largeimageloading == false) {
                    var url = $(el).attr('href');
                    el.largeimageloading = true;
                    largeimage.loadimage(url);
                }
            },
            activate: function(e){
                clearTimeout(el.timer);
                //show lens and zoomWindow
                lens.show();
                stage.show();
            },
            deactivate: function(e){
                switch (settings.zoomType) {
                    case 'drag':
                        //nothing or lens.setcenter();
                        break;
                    default:
                        img.attr('title', el.imagetitle);
                        $(el).attr('title', el.title);
                        if (settings.alwaysOn) {
                            lens.setcenter();
                        }
                        else {
                            stage.hide();
                            lens.hide();
                        }
                        break;
                }
                el.zoom_active = false;
            },
            swapimage: function(link){
                el.largeimageloading = false;
                el.largeimageloaded = false;
                var options = new Object();
                options = $.extend({}, eval("(" + $.trim($(link).attr('rel')) + ")"));
                if (options.smallimage && options.largeimage) {
                    var smallimage = options.smallimage;
                    var largeimage = options.largeimage;
                    $(link).addClass('zoomThumbActive');
                    $(el).attr('href', largeimage);
                    img.attr('src', smallimage);
                    lens.hide();
                    stage.hide();
                    obj.load();
                }
                else {
                    alert('ERROR :: Missing parameter for largeimage or smallimage.');
                    throw 'ERROR :: Missing parameter for largeimage or smallimage.';
                }
                return false;
            }
        });
        //sometimes image is already loaded and onload will not fire
        if (img[0].complete) {
            //fetching data from sallimage if was previously loaded
            smallimage.fetchdata();
            if ($(".zoomPad", el).length == 0) 
                obj.create();
        }
        /*========================================================,
         |   Smallimage
         |---------------------------------------------------------:
         |   Base image into the anchor element
         `========================================================*/
        function Smallimage(image){
            var $obj = this;
            this.node = image[0];
            this.findborder = function(){
                var bordertop = 0;
                bordertop = image.css('border-top-width');
                btop = '';
                var borderleft = 0;
                borderleft = image.css('border-left-width');
                bleft = '';
                if (bordertop) {
                    for (i = 0; i < 3; i++) {
                        var x = [];
                        x = bordertop.substr(i, 1);
                        if (isNaN(x) == false) {
                            btop = btop + '' + bordertop.substr(i, 1);
                        }
                        else {
                            break;
                        }
                    }
                }
                if (borderleft) {
                    for (i = 0; i < 3; i++) {
                        if (!isNaN(borderleft.substr(i, 1))) {
                            bleft = bleft + borderleft.substr(i, 1)
                        }
                        else {
                            break;
                        }
                    }
                }
                $obj.btop = (btop.length > 0) ? eval(btop) : 0;
                $obj.bleft = (bleft.length > 0) ? eval(bleft) : 0;
            };
            this.fetchdata = function(){
                $obj.findborder();
                $obj.w = image.width();
                $obj.h = image.height();
                $obj.ow = image.outerWidth();
                $obj.oh = image.outerHeight();
                $obj.pos = image.offset();
                $obj.pos.l = image.offset().left + $obj.bleft;
                $obj.pos.t = image.offset().top + $obj.btop;
                $obj.pos.r = $obj.w + $obj.pos.l;
                $obj.pos.b = $obj.h + $obj.pos.t;
                $obj.rightlimit = image.offset().left + $obj.ow;
                $obj.bottomlimit = image.offset().top + $obj.oh;
                
            };
            this.node.onerror = function(){
                alert('Problems while loading image.');
                throw 'Problems while loading image.';
            };
            this.node.onload = function(){
                $obj.fetchdata();
                if ($(".zoomPad", el).length == 0) 
                    obj.create();
            };
            return $obj;
        };
        /*========================================================,
         |  Loader
         |---------------------------------------------------------:
         |  Show that the large image is loading
         `========================================================*/
        function Loader(){
            var $obj = this;
            this.append = function(){
                this.node = $('<div/>').addClass('zoomPreload').css('visibility', 'hidden').html(settings.preloadText);
                $('.zoomPad', el).append(this.node);
            };
            this.show = function(){
                this.node.top = (smallimage.oh - this.node.height()) / 2;
                this.node.left = (smallimage.ow - this.node.width()) / 2;
                //setting position
                this.node.css({
                    top: this.node.top,
                    left: this.node.left,
                    position: 'absolute',
                    visibility: 'visible'
                });
            };
            this.hide = function(){
                this.node.css('visibility', 'hidden');
            };
            return this;
        }
        /*========================================================,
         |   Lens
         |---------------------------------------------------------:
         |   Lens over the image
         `========================================================*/
        function Lens(){
            var $obj = this;
            this.node = $('<div/>').addClass('zoomPup');
            //this.nodeimgwrapper = $("<div/>").addClass('zoomPupImgWrapper');
            this.append = function(){
                $('.zoomPad', el).append($(this.node).hide());
                if (settings.zoomType == 'reverse') {
                    this.image = new Image();
                    this.image.src = smallimage.node.src; // fires off async
                    $(this.node).empty().append(this.image);
                }
            };
            this.setdimensions = function(){
                this.node.w = (parseInt((settings.zoomWidth) / el.scale.x) > smallimage.w) ? smallimage.w : (parseInt(settings.zoomWidth / el.scale.x));
                this.node.h = (parseInt((settings.zoomHeight) / el.scale.y) > smallimage.h) ? smallimage.h : (parseInt(settings.zoomHeight / el.scale.y));
                this.node.top = (smallimage.oh - this.node.h - 2) / 2;
                this.node.left = (smallimage.ow - this.node.w - 2) / 2;
                //centering lens
                this.node.css({
                    top: 0,
                    left: 0,
                    width: this.node.w + 'px',
                    height: this.node.h + 'px',
                    position: 'absolute',
                    display: 'none',
                    borderWidth: 1 + 'px'
                });
                
                if (settings.zoomType == 'reverse') {
                    this.image.src = smallimage.node.src;
                    $(this.node).css({
                        'opacity': 1
                    });
                    
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                }
            };
            this.setcenter = function(){
                //calculating center position
                this.node.top = (smallimage.oh - this.node.h - 2) / 2;
                this.node.left = (smallimage.ow - this.node.w - 2) / 2;
                //centering lens
                this.node.css({
                    top: this.node.top,
                    left: this.node.left
                });
                if (settings.zoomType == 'reverse') {
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                    
                }
                //centering large image
                largeimage.setposition();
            };
            this.setposition = function(e){
                el.mousepos.x = e.pageX;
                el.mousepos.y = e.pageY;
                var lensleft = 0;
                var lenstop = 0;
                
                function overleft(lens){
                    return el.mousepos.x - (lens.w) / 2 < smallimage.pos.l;
                }
                
                function overright(lens){
                    return el.mousepos.x + (lens.w) / 2 > smallimage.pos.r;
                    
                }
                
                function overtop(lens){
                    return el.mousepos.y - (lens.h) / 2 < smallimage.pos.t;
                }
                
                function overbottom(lens){
                    return el.mousepos.y + (lens.h) / 2 > smallimage.pos.b;
                }
                
                lensleft = el.mousepos.x + smallimage.bleft - smallimage.pos.l - (this.node.w + 2) / 2;
                lenstop = el.mousepos.y + smallimage.btop - smallimage.pos.t - (this.node.h + 2) / 2;
                if (overleft(this.node)) {
                    lensleft = smallimage.bleft - 1;
                }
                else 
                    if (overright(this.node)) {
                        lensleft = smallimage.w + smallimage.bleft - this.node.w - 1;
                    }
                if (overtop(this.node)) {
                    lenstop = smallimage.btop - 1;
                }
                else 
                    if (overbottom(this.node)) {
                        lenstop = smallimage.h + smallimage.btop - this.node.h - 1;
                    }
                
                this.node.left = lensleft;
                this.node.top = lenstop;
                this.node.css({
                    'left': lensleft + 'px',
                    'top': lenstop + 'px'
                });
                if (settings.zoomType == 'reverse') {
                    if ($.browser.msie && $.browser.version > 7) {
                        $(this.node).empty().append(this.image);
                    }
                    
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                }
                
                largeimage.setposition();
            };
            this.hide = function(){
                img.css({
                    'opacity': 1
                });
                this.node.hide();
            };
            this.show = function(){
            
                if (settings.zoomType != 'innerzoom' && (settings.lens || settings.zoomType == 'drag')) {
                    this.node.show();
                }
                
                if (settings.zoomType == 'reverse') {
                    img.css({
                        'opacity': settings.imageOpacity
                    });
                }
            };
            this.getoffset = function(){
                var o = {};
                o.left = $obj.node.left;
                o.top = $obj.node.top;
                return o;
            };
            return this;
        };
        /*========================================================,
         |   Stage
         |---------------------------------------------------------:
         |   Window area that contains the large image
         `========================================================*/
        function Stage(){
            var $obj = this;
            this.node = $("<div class='zoomWindow'><div class='zoomWrapper'><div class='zoomWrapperTitle'></div><div class='zoomWrapperImage'></div></div></div>");
            this.ieframe = $('<iframe class="zoomIframe" src="javascript:\'\';" marginwidth="0" marginheight="0" align="bottom" scrolling="no" frameborder="0" ></iframe>');
            this.setposition = function(){
                this.node.leftpos = 0;
                this.node.toppos = 0;
                if (settings.zoomType != 'innerzoom') {
                    //positioning
                    switch (settings.position) {
                        case "left":
                            this.node.leftpos = (smallimage.pos.l - smallimage.bleft - Math.abs(settings.xOffset) - settings.zoomWidth > 0) ? (0 - settings.zoomWidth - Math.abs(settings.xOffset)) : (smallimage.ow + Math.abs(settings.xOffset));
                            this.node.toppos = Math.abs(settings.yOffset);
                            break;
                        case "top":
                            this.node.leftpos = Math.abs(settings.xOffset);
                            this.node.toppos = (smallimage.pos.t - smallimage.btop - Math.abs(settings.yOffset) - settings.zoomHeight > 0) ? (0 - settings.zoomHeight - Math.abs(settings.yOffset)) : (smallimage.oh + Math.abs(settings.yOffset));
                            break;
                        case "bottom":
                            this.node.leftpos = Math.abs(settings.xOffset);
                            this.node.toppos = (smallimage.pos.t - smallimage.btop + smallimage.oh + Math.abs(settings.yOffset) + settings.zoomHeight < screen.height) ? (smallimage.oh + Math.abs(settings.yOffset)) : (0 - settings.zoomHeight - Math.abs(settings.yOffset));
                            break;
                        default:
                            this.node.leftpos = (smallimage.rightlimit + Math.abs(settings.xOffset) + settings.zoomWidth < screen.width) ? (smallimage.ow + Math.abs(settings.xOffset)) : (0 - settings.zoomWidth - Math.abs(settings.xOffset));
                            this.node.toppos = Math.abs(settings.yOffset);
                            break;
                    }
                }
                this.node.css({
                    'left': this.node.leftpos + 'px',
                    'top': this.node.toppos + 'px'
                });
                return this;
            };
            this.append = function(){
                $('.zoomPad', el).append(this.node);
                this.node.css({
                    position: 'absolute',
                    display: 'none',
                    zIndex: 5001
                });
                if (settings.zoomType == 'innerzoom') {
                    this.node.css({
                        cursor: 'default'
                    });
                    var thickness = (smallimage.bleft == 0) ? 1 : smallimage.bleft;
                    $('.zoomWrapper', this.node).css({
                        borderWidth: thickness + 'px'
                    });
                }
                
                $('.zoomWrapper', this.node).css({
                    width: Math.round(settings.zoomWidth) + 'px',
                    borderWidth: thickness + 'px'
                });
                $('.zoomWrapperImage', this.node).css({
                    width: '100%',
                    height: Math.round(settings.zoomHeight) + 'px'
                });
                //zoom title
                $('.zoomWrapperTitle', this.node).css({
                    width: '100%',
                    position: 'absolute'
                });
                
                $('.zoomWrapperTitle', this.node).hide();
                if (settings.title && zoomtitle.length > 0) {
                    $('.zoomWrapperTitle', this.node).html(zoomtitle).show();
                }
                $obj.setposition();
            };
            this.hide = function(){
                switch (settings.hideEffect) {
                    case 'fadeout':
                        this.node.fadeOut(settings.fadeoutSpeed, function(){
                        });
                        break;
                    default:
                        this.node.hide();
                        break;
                }
                this.ieframe.hide();
            };
            this.show = function(){
                switch (settings.showEffect) {
                    case 'fadein':
                        this.node.fadeIn();
                        this.node.fadeIn(settings.fadeinSpeed, function(){
                        });
                        break;
                    default:
                        this.node.show();
                        break;
                }
                if (isIE6 && settings.zoomType != 'innerzoom') {
                    this.ieframe.width = this.node.width();
                    this.ieframe.height = this.node.height();
                    this.ieframe.left = this.node.leftpos;
                    this.ieframe.top = this.node.toppos;
                    this.ieframe.css({
                        display: 'block',
                        position: "absolute",
                        left: this.ieframe.left,
                        top: this.ieframe.top,
                        zIndex: 99,
                        width: this.ieframe.width + 'px',
                        height: this.ieframe.height + 'px'
                    });
                    $('.zoomPad', el).append(this.ieframe);
                    this.ieframe.show();
                }
            };
        };
        /*========================================================,
         |   LargeImage
         |---------------------------------------------------------:
         |   The large detailed image
         `========================================================*/
        function Largeimage(){
            var $obj = this;
            this.node = new Image();
            this.loadimage = function(url){
                //showing preload
                loader.show();
                this.url = url;
                this.node.style.position = 'absolute';
                this.node.style.border = '0px';
                this.node.style.display = 'none';
                this.node.style.left = '-10000px';
                this.node.style.top = '0px';
                document.body.appendChild(this.node);
                this.node.src = url; // fires off async
            };
            this.fetchdata = function(){
                var image = $(this.node);
                var scale = {};
                this.node.style.display = 'block';
                $obj.w = image.width();
                $obj.h = image.height();
                $obj.pos = image.offset();
                $obj.pos.l = image.offset().left;
                $obj.pos.t = image.offset().top;
                $obj.pos.r = $obj.w + $obj.pos.l;
                $obj.pos.b = $obj.h + $obj.pos.t;
                scale.x = ($obj.w / smallimage.w);
                scale.y = ($obj.h / smallimage.h);
                el.scale = scale;
                document.body.removeChild(this.node);
                $('.zoomWrapperImage', el).empty().append(this.node);
                //setting lens dimensions;
                lens.setdimensions();
            };
            this.node.onerror = function(){
                alert('Problems while loading the big image.');
                throw 'Problems while loading the big image.';
            };
            this.node.onload = function(){
            	//Fix for ie bug
            	$(this).removeAttr('height').removeAttr('width');
                //fetching data
                $obj.fetchdata();
                loader.hide();
                el.largeimageloading = false;
                el.largeimageloaded = true;
                if (settings.enableRolloverZoom && (settings.zoomType == 'drag' || settings.alwaysOn)) {
                    lens.show();
                    stage.show();
                    lens.setcenter();
                }
            };
            this.setposition = function(){
                var left = -el.scale.x * (lens.getoffset().left - smallimage.bleft + 1);
                var top = -el.scale.y * (lens.getoffset().top - smallimage.btop + 1);
                $(this.node).css({
                    'left': left + 'px',
                    'top': top + 'px'
                });
            };
            return this;
        };
        
        $(el).data("jqzoom", obj);
    };
    //es. $.jqzoom.disable('#jqzoom1');
    $.jqzoom = {
        defaults: {
            zoomType: 'standard',
            //innerzoom/standard/reverse/drag
            zoomWidth: 300,
            //zoomWindow  default width
            zoomHeight: 300,
            //zoomWindow  default height
            xOffset: 10,
            //zoomWindow x offset, can be negative(more on the left) or positive(more on the right)
            yOffset: 0,
            //zoomWindow y offset, can be negative(more on the left) or positive(more on the right)
            position: "right",
            //zoomWindow default position
            preloadImages: true,
            //image preload
            preloadText: 'Loading zoom',
            title: true,
            lens: true,
            imageOpacity: 0.4,
            alwaysOn: false,
            showEffect: 'show',
            //show/fadein
            hideEffect: 'hide',
            //hide/fadeout
            fadeinSpeed: 'slow',
            //fast/slow/number
            fadeoutSpeed: '2000',
            //fast/slow/number
            swapImageTrigger: "click",
            // Event listened in order to change the media image.
            enableRolloverZoom: true
            // Enables the rollover functionallity.
        
        },
        disable: function(el){
            var api = $(el).data('jqzoom');
            api.disable();
            return false;
        },
        enable: function(el){
            var api = $(el).data('jqzoom');
            api.enable();
            return false;
        },
        disableAll: function(el){
            jqzoompluging_disabled = true;
        },
        enableAll: function(el){
            jqzoompluging_disabled = false;
        }
    };
    return {
        init: function(obj, images, options){
            var defaults = {
                draggablePopup: true,
                // If true, the large image popup is draggable.
                enableLargeImagePopup: true,
                // Enables the large image popup.
                popupDragArea: null,
                //Specifies the popup draggable area.
                popupSelector: ".imb .popup",
                popupCloseBtn: ".popup-close",
                popupImgCnt: ".popup-image",
                showLareImgHdlr: "dblclick",
                // Event listened in order to show up the large image popup.
                thumbsList: ".imb #thumblist"
                //Thumbnails list selector
            }
            $.extend(defaults, options);
            obj = $(obj);
            /* Check images and build the gallery */
            var th = images.arrThumbs, med = images.arrImages, lg = images.arrLarge, maxlen = Math.min(th.length, med.length), images = 0;
            if (maxlen > 1) {
                var thlist = $(defaults.thumbsList), elem;
                thlist.hide();
                for (var i = 0; i < maxlen; i++) {
                    if (th[i] !== '' && med[i] !== '') {
                        images++;
                        elem = $("<li>");
                        elem.append($("<a>").attr({
                            href: "javascript:void(0)",
                            rel: "{gallery:'imb-gal',smallimage:'" + med[i] + "',largeimage:'" + ((lg[i] !== '') ? lg[i] : med[i]) + "'}"
                        }).append($("<img>").attr("src", th[i])));
                        thlist.append(elem)
                    }
                }
                if (images > 1) {
                    if (th.length) {
                        $('a:first', thlist).addClass("zoomThumbActive")
                    }
                    thlist.show();
                }
                else {
                    thlist.remove()
                }
            }
            if (defaults.enableLargeImagePopup) {
                var p = $(defaults.popupSelector), imgcnt = $(defaults.popupImgCnt, p), closebtn = $(defaults.popupCloseBtn, p), darea;
                if (defaults.draggablePopup) {
                    darea = $(defaults.popupDragArea, p).get(0) || p.get(0);
                }
                popup.init(p.get(0), imgcnt.get(0), closebtn.get(0), darea);
                if (images == 1) {
                    var img = new Image();
                    img.src = lg[0] || med[0];
                    obj.bind(defaults.showLareImgHdlr, function(){
                        popup.setImage(img);
                        popup.show();
                    })
                }
            }
            obj.attr("title", $(".imb .gallerytitle").html()).jqzoom(defaults);
        }
    }
}(jQuery);

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/imb/imb-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/mct/mct-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Mini Cart)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
GPR_AAE_MCT = function($){
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
        pricePos: 6
    }, bolViewMore = false;
    
    function removeItem(){
        //Removes an item from the shopping cart.
        //Used only by the minicart remove buttons.
        //'this' references to the remove button
        $($(this).parents("li")[0]).find("input").val(0);
        updateCart();
    }
    
    function updateCart(){
        var arrUpdateItems = [];
        $('#' + objOptions.itemsCntId + ' input').each(function(){
            var arrItem = [];
            arrItem.push($(this).attr("id"));
            arrItem.push($(this).val());
            arrUpdateItems.push(arrItem);
        });
        $("#mct_updcart").remove();
        var objIframe = $('<iframe>');
        var strCartURL = GPR_OPTIONS.options().cartURL
        var strOption = "?";
        if (strCartURL.indexOf('?') != -1) {
            strOption = "&"
        }
        objIframe.attr("src", GPR_OPTIONS.options().cartURL + strOption + objOptions.urlParamId + "=" + escape(arrUpdateItems.join(';')));
        objIframe.attr("id", "mct_updcart");
        objIframe.css("display", "none");
        objIframe.appendTo("#div__header");
        objIframe.load(function(){
            window.location.reload();
        })
    }
    
    return {
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
        },
        
        getItems: function(){
            $.ajax({
                url: GPR_OPTIONS.options().cartURL,
                type: "GET",
                success: function(data){
                    var bolMore = false;
                    $('<ul>').attr({
                        'id': 'mct_list',
                        'class': 'item-list'
                    }).appendTo('#' + objOptions.itemsCntId);
                    $(data).find("tr[id^=carttablerow]").each(function(i){
                        var li = $('<li>');
                        if (i >= objOptions.maxItems) {
                            li.css("display", "none");
                            li.addClass("item-hidden");
                            bolMore = true;
                        }
                        li.attr('id', 'mct_list_item' + i).appendTo('#mct_list');
                        $(".mct .cell_template").children().clone().appendTo(li);
                        li.find(".cell-image").append($(this).children(':nth-child(' + objOptions.imagePos + ')').html());
                        li.find(".cell-name").append($(this).children(':nth-child(' + objOptions.namePos + ')').html());
                        li.find(".cell-price").append($(this).children(':nth-child(' + objOptions.pricePos + ')').html());
                        li.find(".cell-qty").append($(this).children(':nth-child(' + objOptions.qtyPos + ')').html());
                        li.find(".cell-options").append($(this).children(':nth-child(' + objOptions.optionsPos + ')').html());
                        li.find(".remove-item").bind("click", removeItem);
                    });
                    
                    
                    $('<a href="javascript:void(0);">Update Total</a>').click(updateCart).appendTo('#' + objOptions.itemsCntId);
                    
                    if (bolMore) {
                        $('<a id="mct_viewmore" href="javascript:void(0);">View More</a>').click(function(){
                            GPR_AAE_MCT.viewMore();
                        }).appendTo('#' + objOptions.itemsCntId);
                    }
                    
                    $('#' + objOptions.itemsCntId).fadeIn(1000);
                },
                beforeSend: function(XMLHttpRequest){
                    GPR_AJAX_TOOLS.startLoading(objOptions.showInfoCntId, 'Getting Cart Items...');
                },
                complete: function(XMLHttpRequest, textStatus){
                    GPR_AJAX_TOOLS.stopLoading(objOptions.showInfoCntId);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    GPR_AJAX_TOOLS.showError(objOptions.showInfoCntId, 'Get Cart Items', textStatus, errorThrown);
                }
            });
        },
        
        viewMore: function(){
            if (!bolViewMore) {
                $('#mct_viewmore').html("Reset");
                $('.mct .item-hidden').show();
                bolViewMore = true;
            }
            else {
                $('#mct_viewmore').html("View More");
                $('.mct .item-hidden').hide();
                bolViewMore = false;
            }
        },
        
        updateCart: function(){
            var strUpdateItems = unescape(GPR_OPTIONS.getUrlVar(objOptions.urlParamId));
            if (strUpdateItems !== "") {
                var arrUpdateItems = strUpdateItems.split(';');
                for (var i = 0; i < arrUpdateItems.length; i++) {
                    var arrItem = arrUpdateItems[i].split(',');
                    $('input#' + arrItem[0]).val(arrItem[1]);
                };
                $('form#cart').submit();
            }
        }
    }
}(jQuery);

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/mct/mct-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/pni/pni-library.js
 */
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
/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/pni/pni-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/qio/qio-library.js
 */
 /**
 * Description: SuiteCommerce Advanced Features (Quick order)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author rtucat
*  @version 2.0
*/
var GPR_AAE_QIO = function($){
    var objOptions = {
        searchInputId: "qio_search",
        itemInputId: "qio_item",
        qioRowListId: "qio_list",
        maxRows: 10
    };
    
    var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g');
    var intRows = 1;
    var objAutOptions;
    
    return {
        init: function(obj){
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            $('#form_qio #n').val(GPR_OPTIONS.options().siteNumber);
        },
        
        onSelect: function(value, data, el){
            $(el).parent().find('.item').val(data.itemid);
        },
        
        initRows: function(obj){
            objAutOptions = obj;
            $('#' + objOptions.searchInputId + '_0').autocomplete(obj);
            var objRemoveRow = $('<a>').attr({
                "href": "javascript:void(0);"
            }).click(function(){
                GPR_AAE_QIO.delRow($(this).parent().attr("id"));
            });
            objRemoveRow.html("-");
            $('#qvi_row_0').append(objRemoveRow);
        },
        
        addRow: function(){
            intRows = $('.qio .list li').length;
            if (intRows < objOptions.maxRows) {
                var li = $('<li>').attr('id', 'qvi_row_' + intRows);
                li.append($('<input>').attr({
                    "class": "search",
                    "id": objOptions.searchInputId + "_" + intRows,
                    "name": objOptions.searchInputId + "_" + intRows,
                    "type": "input"
                }));
                li.append($('<input>').attr({
                    "class": "item",
                    "type": "hidden",
                    "id": objOptions.itemInputId + "_" + intRows
                }));
                li.append($('<input class="qty" type="input" value="1">'));
                var objRemoveRow = $('<a>').attr({
                    "href": "javascript:void(0);"
                }).click(function(){
                    GPR_AAE_QIO.delRow($(this).parent().attr("id"));
                });
                objRemoveRow.html("-");
                li.append(objRemoveRow);
                li.appendTo('#' + objOptions.qioRowListId);
                $('#' + objOptions.searchInputId + '_' + intRows).autocomplete(objAutOptions);
            }
            else {
                GPR_PUP.show("You reach the max rows limit");
            }
        },
        
        delRow: function(strId){
            intRows = $('.qio .list li').length;
            if (intRows > 1) {
                if (strId == null || strId == undefined) {
                    intRows--;
                    $('.qio .list li').last().remove();
                }
                else {
                    intRows--;
                    $('#' + strId).remove();
                }
            }
            else {
                GPR_PUP.show("Must have at least one row");
            }
        },
        
        addToCart: function(){
            var arrItems = [];
            var bolOk = true;
            $('.qio li .qty').each(function(){
                var arrItem = [];
                var intQty = parseInt($(this).val());
                if (intQty == 'NaN' || intQty == 0) {
                    bolOk = false;
                    $(this).focus();
                    GPR_PUP.show("The Quantity must be greater than 0.");
                    return false;
                }
                else {
                    var strItemId = $(this).parent().find('input.item').val();
                    if (strItemId == "" || strItemId == null || strItemId == undefined) {
                        bolOk = false;
                        $(this).parent().find('input.item').focus();
                        GPR_PUP.show("Please select an Item.");
                        return false;
                    }
                    else {
                        arrItem.push(strItemId);
                        arrItem.push($(this).val());
                        arrItems.push(arrItem);
                    }
                }
            });
            intCntItems = arrItems.length;
            if (bolOk && intCntItems > 0) {
                if (intCntItems > 1) {
                    for (var i = arrItems.length - 2; i >= 0; i--) {
                        $.post("/app/site/backend/additemtocart.nl", {
                            c: GPR_OPTIONS.options().companyId,
                            n: GPR_OPTIONS.options().siteNumber,
                            buyid: arrItems[i][0],
                            itemid: arrItems[i][0],
                            qty: arrItems[i][1]
                        });
                    }
                }
                setTimeout(function(){
                    $('#form_qio #itemid').val(arrItems[intCntItems - 1][0]);
                    $('#form_qio #buyid').val(arrItems[intCntItems - 1][0]);
                    $('#form_qio #qty').val(arrItems[intCntItems - 1][1]);
                    $('#form_qio').submit();
                }, (500 * intCntItems));
            }
        },
        
        formatResult: function(value, data, currentValue){
            var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
            var strDisplayValue = value + ((data.name == "" || data.name == undefined) ? "" : " - " + data.name);
            return ('<span class="value">' + strDisplayValue.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>') + '</span><a class="link" href="' + data.url + '">View</a>');
        },
        
        formatResultSearch: function(value, data, currentValue){
            var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
            var strTitle = '';
            var strDesc = '';
            switch (data.type) {
                case 'first-cat':
                    strTitle = '<div class="search-title">Categories</div>';
                    break;
                case 'first-itm':
                    strTitle = '<div class="search-title">Products</div>'
                    break;
                default:
                    strTitle = ''
                    break;
            }
            strDesc = unescape(data.desc);
            if (strDesc.length > 80) {
                strDesc = strDesc.substr(0, 80) + '...';
            }
            else {
                strDesc = unescape(data.desc);
            }
            return (strTitle + ((data.img != null && data.img != '' && data.img != 'undefined') ? '<img src="' + data.img + '" title="">' : '') + '<span class="search-text"><h5><a href="' + data.url + '" title="">' + value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>') + '</a></h5><p>' + strDesc + '</p></span>');
        },
        
        parseResponseSearch: function parseResponse(text, query){
            var auxResponseCategories = $(text).find("div#cat-list-cell");
            var auxResponseItems = $(text).find("div .item-list-cell");
            var bolItems = true;
            var bolCategories = true
            
            if (auxResponseCategories.length === 0) {
                bolCategories = false
            }
            if (auxResponseItems.length === 0) {
                bolItems = false;
            }
            if (!bolItems && !bolCategories) {
                response = eval("({query: '" + query + "',suggestions: [],data: []})");
                return response;
            }
            else {
                var strSuggestions = "";
                var strData = "";
                $(auxResponseCategories).each(function(i){
                    var strCategoryName = $(this).find('.cat-desc-cell a').text();
                    var strCategoryUrl = $(this).find('.cat-desc-cell a').attr('href');
                    var strCategoryImg = $(this).find('.cat-thumbnail-cell img').attr('src');
                    strCategoryImg = ((strCategoryImg != '' && strCategoryImg != null && strCategoryImg != 'undefined') ? strCategoryImg.split(';') : '');
                    var strCategoryDesc = $(this).find('.cat-detail-desc-cell').html();
                    strCategoryDesc = escape(strCategoryDesc.replace(/'/gi, '-'));
                    strSuggestions += "'" + strCategoryName.replace(/'/gi, '-') + "',";
                    if (i == 0) {
                        strData += "{url: '" + strCategoryUrl + "',img: '" + strCategoryImg[0] + "', desc:'" + strCategoryDesc + "', type: 'first-cat'},";
                    }
                    else {
                        strData += "{url: '" + strCategoryUrl + "',img: '" + strCategoryImg[0] + "', desc:'" + strCategoryDesc + "', type: 'cat'},";
                    }
                });
                $(auxResponseItems).each(function(i){
                    var strName = $(this).find('.desc-cell a').text();
                    var strItemUrl = $(this).find('.desc-cell a').attr('href');
                    var strItemImg = $(this).find('.thumbnail-cell img').attr('src');
                    strItemImg = ((strItemImg != '' && strItemImg != null && strItemImg != 'undefined') ? strItemImg.split(';') : '');
                    var strItemDesc = $(this).find('.detail-desc-cell').html();
                    strItemDesc = escape(strItemDesc.replace(/'/gi, '-'));
                    strSuggestions += "'" + strName.replace(/'/gi, '-') + "',";
                    if (i == 0) {
                        strData += "{url: '" + strItemUrl + "',img: '" + strItemImg[0] + "', desc:'" + strItemDesc + "', type: 'first-itm'},";
                    }
                    else {
                        strData += "{url: '" + strItemUrl + "',img: '" + strItemImg[0] + "', desc:'" + strItemDesc + "', type: 'itm'},";
                    }
                });
                strSuggestions = strSuggestions.substring(0, (strSuggestions.length - 1));
                strData = strData.substring(0, (strData.length - 1));
                response = eval("({query: '" + query + "',suggestions: [" + strSuggestions + "],data: [" + strData + "]})");
                return response;
            }
        },
        
        viewMoreSearch: function(query){
            return ('<div class="view-more"><a href="/s.nl?search=' + query + '" title="">View all search results</a></div>')
        },
        
        onSelectSearch: function(value, data, obj){
            window.location = data.url;
        }
    }
}(jQuery);


/**
 * Create's the autosuggestions with the search results for a specific input field
 * @param {Object} el The input field
 * @param {Object} options
 * 	autoSubmit 		- Automatically submit the parent form for the input field
 * 	minChar 		- Minimum quantity for begin searching
 *  maxHeight		- Maximum Height for the search results box
 *  deferRequestBy	- Delay the autosuggestion process in x milliseconds
 *  width			- Width for the search results box
 *  highlight		- Highlight the results in the search results box
 *  params{}		- Array object with the parameters
 *  delimiter		- Results delimiter
 *  searchBkgStyle	- CSS Style for the input field when begin the autosuggestion
 *  searchCSSClass	- CSS Class for the search results box
 *  maxResults		- Maximum results to show in the search results box
 *  zIndex			- CSS zindex for the search results box
 *  fnFormatResult	- Function to be executed on each result in order to give a special custom format - Parameters (Value, data, Current Value)
 *  fnViewMore		- Function to customize a especial behavior in order to display more results - Parameters (Query Value)
 *  fnParseResponse	- Function to customize the parse of the response for the ajax call - Parameters (Text Response, Query Value)
 *  fnOnSelect		- Function to be executed after the selection on the search results box - Parameters (Value, Data, Input Field)
 */
(function($){
    function Autocomplete(el, options){
        this.el = $(el);
        this.el.attr('autocomplete', 'off');
        this.suggestions = [];
        this.data = [];
        this.badQueries = [];
        this.selectedIndex = -1;
        this.currentValue = this.el.val();
        this.intervalId = 0;
        this.cachedResponse = [];
        this.onChangeInterval = null;
        this.ignoreValueChange = false;
        this.serviceUrl = options.serviceUrl;
        this.isLocal = false;
        this.options = {
            autoSubmit: false,
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            width: 0,
            highlight: true,
            params: {},
            delimiter: null,
            searchBkgStyle: 'none',
            searchCSSClass: 'autocomplete',
            maxResults: 0,
            zIndex: 9999
        };
        this.initialize();
        this.setOptions(options);
    }
    $.fn.autocomplete = function(options){
        return new Autocomplete(this.get(0) || $('<input />'), options);
    };
    Autocomplete.prototype = {
        killerFn: null,
        initialize: function(){
            var me, uid, autocompleteElId;
            me = this;
            uid = Math.floor(Math.random() * 0x100000).toString(16);
            autocompleteElId = 'Autocomplete_' + uid;
            this.killerFn = function(e){
                if ($(e.target).parents('.autocomplete').size() === 0) {
                    me.killSuggestions();
                    me.disableKillerFn();
                }
            };
            if (!this.options.width) {
                this.options.width = this.el.width();
            }
            this.mainContainerId = 'AutocompleteContainter_' + uid;
            $('<div id="' + this.mainContainerId + '" style="position:absolute;z-index:9999;"><div class="' + this.options.searchCSSClass + '-w1"><div class="' + this.options.searchCSSClass + '" id="' + autocompleteElId + '" style="display:none; width:300px;"></div></div></div>').appendTo('.qio .results');
            this.container = $('#' + autocompleteElId);
            this.fixPosition();
            if (window.opera) {
                this.el.keypress(function(e){
                    me.onKeyPress(e);
                });
            }
            else {
                this.el.keydown(function(e){
                    me.onKeyPress(e);
                });
            }
            this.el.keyup(function(e){
                me.onKeyUp(e);
            });
            this.el.blur(function(){
                me.enableKillerFn();
            });
            this.el.focus(function(){
                me.fixPosition();
            });
        },
        setOptions: function(options){
            var o = this.options;
            $.extend(o, options);
            if (o.lookup) {
                this.isLocal = true;
                if ($.isArray(o.lookup)) {
                    o.lookup = {
                        suggestions: o.lookup,
                        data: []
                    };
                }
            }
            $('#' + this.mainContainerId).css({
                zIndex: o.zIndex
            });
            this.container.css({
                maxHeight: o.maxHeight + 'px',
                width: o.width
            });
        },
        clearCache: function(){
            this.cachedResponse = [];
            this.badQueries = [];
        },
        disable: function(){
            this.disabled = true;
        },
        enable: function(){
            this.disabled = false;
        },
        fixPosition: function(){
            var offset = this.el.offset();
            $('#' + this.mainContainerId).css({
                top: (offset.top + this.el.innerHeight()) + 'px',
                left: offset.left + 'px'
            });
        },
        enableKillerFn: function(){
            var me = this;
            $(document).bind('click', me.killerFn);
        },
        disableKillerFn: function(){
            var me = this;
            $(document).unbind('click', me.killerFn);
        },
        killSuggestions: function(){
            var me = this;
            this.stopKillSuggestions();
            this.intervalId = window.setInterval(function(){
                me.hide();
                me.stopKillSuggestions();
            }, 300);
        },
        stopKillSuggestions: function(){
            window.clearInterval(this.intervalId);
        },
        onKeyPress: function(e){
            if (this.disabled || !this.enabled) {
                return;
            }
            switch (e.keyCode) {
                case 27:
                    this.el.val(this.currentValue);
                    this.hide();
                    break;
                case 9:
                case 13:
                    if (this.selectedIndex === -1) {
                        this.hide();
                        return;
                    }
                    this.select(this.selectedIndex);
                    if (e.keyCode === 9) {
                        return;
                    }
                    break;
                case 38:
                    this.moveUp();
                    break;
                case 40:
                    this.moveDown();
                    break;
                default:
                    return;            }
            e.stopImmediatePropagation();
            e.preventDefault();
        },
        onKeyUp: function(e){
            if (this.disabled) {
                return;
            }
            switch (e.keyCode) {
                case 38:
                case 40:
                    return;            }
            clearInterval(this.onChangeInterval);
            if (this.currentValue !== this.el.val()) {
                if (this.options.deferRequestBy > 0) {
                    var me = this;
                    this.onChangeInterval = setInterval(function(){
                        me.onValueChange();
                    }, this.options.deferRequestBy);
                }
                else {
                    this.onValueChange();
                }
            }
        },
        onValueChange: function(){
            clearInterval(this.onChangeInterval);
            this.currentValue = this.el.val();
            var q = this.getQuery(this.currentValue);
            this.selectedIndex = -1;
            if (this.ignoreValueChange) {
                this.ignoreValueChange = false;
                return;
            }
            if (q === '' || q.length < this.options.minChars) {
                this.hide();
            }
            else {
                this.getSuggestions(q);
            }
        },
        getQuery: function(val){
            var d, arr;
            d = this.options.delimiter;
            if (!d) {
                return $.trim(val);
            }
            arr = val.split(d);
            return $.trim(arr[arr.length - 1]);
        },
        getSuggestionsLocal: function(q){
            var ret, arr, len, val, i;
            arr = this.options.lookup;
            len = arr.suggestions.length;
            ret = {
                suggestions: [],
                data: []
            };
            q = q.toLowerCase();
            for (i = 0; i < len; i++) {
                val = arr.suggestions[i];
                if (val.toLowerCase().indexOf(q) === 0) {
                    ret.suggestions.push(val);
                    ret.data.push(arr.data[i]);
                }
            }
            return ret;
        },
        getSuggestions: function(q){
            var cr, me;
            cr = this.isLocal ? this.getSuggestionsLocal(q) : this.cachedResponse[q];
            if (cr && $.isArray(cr.suggestions)) {
                this.suggestions = cr.suggestions;
                this.data = cr.data;
                this.suggest();
            }
            else 
                if (!this.isBadQuery(q)) {
                    me = this;
                    me.options.params.search = q;
                    me.options.params.query = q;
                    this.el.css('background', me.options.searchBkgStyle);
                    $.get(this.serviceUrl, me.options.params, function(txt){
                        me.processResponse(txt);
                    }, 'text');
                }
        },
        isBadQuery: function(q){
            var i = this.badQueries.length;
            while (i--) {
                if (q.indexOf(this.badQueries[i]) === 0) {
                    return true;
                }
            }
            return false;
        },
        hide: function(){
            this.enabled = false;
            this.selectedIndex = -1;
            this.container.hide();
        },
        suggest: function(){
            var me, len, maxResults, viewMore, div, f, v, i, s, mOver, mClick;
            if (this.suggestions.length === 0) {
                this.hide();
                this.container.hide().empty();
                div = $('<div class="selected" title="No Results Found">No Results Found</div>');
                this.container.append(div);
                this.enabled = true;
                this.container.show();
                return;
            }
            me = this;
            len = this.suggestions.length;
            f = this.options.fnFormatResult;
            v = this.getQuery(this.currentValue);
            more = this.options.fnViewMore;
            maxResults = this.options.maxResults;
            viewMore = false;
            mOver = function(xi){
                return function(){
                    me.activate(xi);
                };
            };
            mClick = function(xi){
                return function(){
                    me.select(xi);
                };
            };
            this.container.hide().empty();
            if (!maxResults) {
                maxResults = len;
            }
            else {
                if (len > maxResults) {
                    viewMore = true;
                }
            }
            for (i = 0; i < len && i < maxResults; i++) {
                s = this.suggestions[i];
                div = $((me.selectedIndex === i ? '<div class="selected"' : '<div') + ' title="' + s + '">' + ($.isFunction(f) ? f(s, this.data[i], v) : s) + '</div>');
                div.mouseover(mOver(i));
                div.click(mClick(i));
                this.container.append(div);
            }
            if ($.isFunction(more) && viewMore) {
                this.container.append(more(this.options.params.query));
            }
            this.enabled = true;
            this.container.show();
        },
        processResponse: function(text){
            var response, f;
            try {
                f = this.options.fnParseResponse;
                if ($.isFunction(f)) {
                    response = f(text, this.options.params.query);
                }
                else {
                    response = eval('(' + text + ')');
                }
            } 
            catch (err) {
                return;
            }
            if (!$.isArray(response.data)) {
                response.data = [];
            }
            if (!this.options.noCache) {
                this.cachedResponse[response.query] = response;
                if (response.suggestions.length === 0) {
                    this.badQueries.push(response.query);
                }
            }
            if (response.query === this.getQuery(this.currentValue)) {
                this.suggestions = response.suggestions;
                this.data = response.data;
                this.suggest();
            }
            this.el.css('background', 'none');
        },
        activate: function(index){
            var divs, activeItem;
            divs = this.container.children();
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                $(divs.get(this.selectedIndex)).removeClass();
            }
            this.selectedIndex = index;
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                activeItem = divs.get(this.selectedIndex);
                $(activeItem).addClass('selected');
            }
            return activeItem;
        },
        deactivate: function(div, index){
            div.className = '';
            if (this.selectedIndex === index) {
                this.selectedIndex = -1;
            }
        },
        select: function(i){
            var selectedValue, f;
            selectedValue = this.suggestions[i];
            if (selectedValue) {
                this.el.val(selectedValue);
                if (this.options.autoSubmit) {
                    f = this.el.parents('form');
                    if (f.length > 0) {
                        f.get(0).submit();
                    }
                }
                this.ignoreValueChange = true;
                this.hide();
                this.onSelect(i);
            }
        },
        moveUp: function(){
            if (this.selectedIndex === -1) {
                return;
            }
            if (this.selectedIndex === 0) {
                this.container.children().get(0).className = '';
                this.selectedIndex = -1;
                this.el.val(this.currentValue);
                return;
            }
            this.adjustScroll(this.selectedIndex - 1);
        },
        moveDown: function(){
            if (this.selectedIndex === (this.suggestions.length - 1)) {
                return;
            }
            this.adjustScroll(this.selectedIndex + 1);
        },
        adjustScroll: function(i){
            var activeItem, offsetTop, upperBound, lowerBound;
            activeItem = this.activate(i);
            offsetTop = activeItem.offsetTop;
            upperBound = this.container.scrollTop();
            lowerBound = upperBound + this.options.maxHeight - 25;
            if (offsetTop < upperBound) {
                this.container.scrollTop(offsetTop);
            }
            else 
                if (offsetTop > lowerBound) {
                    this.container.scrollTop(offsetTop - this.options.maxHeight + 25);
                }
            this.el.val(this.getValue(this.suggestions[i]));
        },
        onSelect: function(i){
            var me, fn, s, d;
            me = this;
            fn = me.options.fnOnSelect;
            s = me.suggestions[i];
            d = me.data[i];
            me.el.val(me.getValue(s));
            if ($.isFunction(fn)) {
                fn(s, d, me.el);
            }
        },
        getValue: function(value){
            var del, currVal, arr, me;
            me = this;
            del = me.options.delimiter;
            if (!del) {
                return value;
            }
            currVal = me.currentValue;
            arr = currVal.split(del);
            if (arr.length === 1) {
                return value;
            }
            return currVal.substr(0, currVal.length - arr[arr.length - 1].length) + value;
        }
    };
}(jQuery));








/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/qio/qio-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/qvi/qvi-library.js
 */
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

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/qvi/qvi-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/rvi/rvi-library.js
 */
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

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/rvi/rvi-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/sld/sld-library.js
 */
/**
 * Description: SuiteCommerce Advanced Features (Slider)
 *
 * @copyright (c) 2000-2012, NetSuite Inc.
 * @author fbuschiazzo 
*  @version 1.0
*/

GPR_AAE_SLD = function($) {
    var objOptions = {
        "Columns" : [{
            "name" : "custrecord_gpr_aae_sld_slidesort",
            "sort" : true
        }, {
            "name" : "custrecord_gpr_aae_sld_slidelink"
        }, {
            "name" : "custrecord_gpr_aae_sld_slideimage"
        }],
        "Filters" : [],
        "processFn" : null,
        "onErrorFn" : null
    };

    return {
        init : function(obj) {
            if (obj !== null && obj !== undefined) {
                $.extend(objOptions, obj);
            }
            GPR_AAE_SLD.createSlide();
        },

        createSlide : function() {
            var objRequest = {};
            objRequest.Columns = objOptions.Columns
            objRequest.Filters = objOptions.Filters
            $.ajax({
                url : "/app/site/hosting/restlet.nl?script=customscript_gpr_aae_ss_sld_slideimages&deploy=customdeploy_gpr_aae_ss_sld_slideimages",
                type : "GET",
                data : {
                    'request' : JSON.stringify(objRequest)
                },
                contentType : "application/json",
                dataType : "json",
                success : function(data) {
                    if (data.hasOwnProperty('Error')) {
                        if ($.isFunction(objOptions.onErrorFn))
                           objOptions.onErrorFn(); 
                        else
                           alert("An Unexpected error occurred. Please Try again...");                                                 
                    } else {
                        if ($.isFunction(objOptions.processFn))
                            objOptions.processFn(data);
                        else
                            console.log(data);                        
                    }
                },
                error : function(XMLHttpRequest) {
                    if ($.isFunction(objOptions.onErrorFn))
                        objOptions.onErrorFn(); 
                    else
                       alert("An Unexpected error occurred. Please Try again...");
                        
                }
            });
        }
    }
}(jQuery); 
/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/sld/sld-library.js
 */

/*
 * START OF FILE - /Advanced_eCommerce_Module/src/site/wlp/wlp-library.js
 */
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

/*
 * END OF FILE - /Advanced_eCommerce_Module/src/site/wlp/wlp-library.js
 */

/*
 * JavaScript file created by Rockstarapps Concatenation
*/
