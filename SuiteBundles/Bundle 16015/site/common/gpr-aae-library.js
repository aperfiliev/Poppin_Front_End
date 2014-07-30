/**
 * Description: SuiteCommerce Advanced Features (Common Library)
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

