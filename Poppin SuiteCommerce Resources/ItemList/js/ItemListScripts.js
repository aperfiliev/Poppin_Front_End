if ( typeof String.prototype.trim != "function") {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, "");
	};
}

GPItemList = (function($) {
	/* Binary sorting tree used for storing
	 * declared attributes values: */
	function BSTree() {
		this.root = null;
	}


	BSTree.prototype = {
		add : function(objValue) {
			var new_node = {
				'val' : objValue,
				'right' : null,
				'left' : null
			};
			if (this.root === null) {
				this.root = new_node;
				return new_node.val;
			} else {
				var current_node = this.root;
				var continue_search = true;
				var target_val = objValue.valueOf();
				while (continue_search) {
					if (current_node.val.valueOf() < target_val) {
						if (current_node.right === null) {
							continue_search = false;
							current_node.right = new_node;
						}
						current_node = current_node.right;
					} else if (current_node.val.valueOf() > target_val) {
						if (current_node.left === null) {
							continue_search = false;
							current_node.left = new_node;
						}
						current_node = current_node.left;
					} else
						continue_search = false;
				}
				return current_node.val;
			}
		},
		get : function(value) {
			var current_node = this.root;
			while (current_node != null) {
				if (current_node.val.valueOf() < value) {
					current_node = current_node.right;
				} else if (current_node.val.valueOf() > value) {
					current_node = current_node.left;
				} else
					return current_node.val;
			}
			return null;
		}
	};

	function Attribute(strLabel) {
		this._values = new Object();
		this._bstValues = new BSTree();
		this._current = null;
	}

	/* Static constants */
	Attribute.PRICE_TYPE = 0;
	Attribute.STRING_TYPE = 1;
	Attribute.INTEGER_TYPE = 2;
	Attribute.FLOAT_TYPE = 3;
	Attribute.MULTI_TYPE = 4;

	Attribute.prototype = {
		'setLabel' : function(strLabel) {
			this._label = strLabel;
		},
		'getLabel' : function() {
			return this._label;
		},
		'addValue' : function(value) {
			if (this._values.hasOwnProperty(value)) {
				this._values[value]++;
				return this._bstValues.get(value);
			} else {
				this._values[value] = 1;
				return this._bstValues.add(new Object(value));
			}
		},
		'getValues' : function(bolDescendingOrder) {
			var valuesList = [];
			var _getVals = bolDescendingOrder ? function(BST, arrList) {
				if (BST !== null) {
					_getVals(BST.right, arrList);
					arrList.push(BST.val.valueOf());
					_getVals(BST.left, arrList);
				}
			} : function(BST, arrList) {
				if (BST !== null) {
					_getVals(BST.left, arrList);
					arrList.push(BST.val.valueOf());
					_getVals(BST.right, arrList);
				}
			};
			_getVals(this._bstValues.root, valuesList);
			return valuesList;
		},
		'setType' : function(type) {
			this._type = type;
			return this;
		},
		'getType' : function() {
			return this._type;
		},
		'setCurrentValue' : function(value1, value2) {
			if (this._values.hasOwnProperty(value1))
				this._current = this._bstValues.get(value1);
			if (value2 && this._values.hasOwnProperty(value2))
				this._highest = this._bstValues.get(value2);
			else
				delete this._highest;
			return this;
		},
		'clearCurrentValue' : function() {
			this._current = this._highest = null;
		},
		'getCurrentValue' : function() {
			return {
				"lowest" : !!this._current && this._current.valueOf(),
				"highest" : !!this._highest && this._highest.valueOf()
			};
		},
		'getCurrentValueItemsCount' : function() {
			var val = this.getCurrentValue();
			if (val && val.lowest)
				if (!val.highest)
					return this._values[val.lowest];
				else {//sum the values in the range and return the result
					var values = this.getValues();
					var i = 0, total = 0;
					//the lower value should be present in the values list
					var low = val.lowest;
					while (values[i] < low)
					i++;
					var high = val.highest;
					while (values[i] && values[i] <= high)
					total += this._values[values[i]];
					return total;
				}
			return false;
		},
		'deleteValues' : function() {
			this._values = new Object();
			this._bstValues = new BSTree();
			this._current = null;
		}
	};

	function Item() {
		var attrs = {};
		this._getAttributes = function() {
			return attrs;
		};
	}


	Item.prototype = {
		'getAttrValue' : function(attrName, index) {
			var _attrs = this._getAttributes();
			if (_attrs.hasOwnProperty(attrName)) {
				var attr = _attrs[attrName];
				if (!!index)
					return attr[index].valueOf();
				else
					return attr;
			}
		},
		'setAttr' : function(attrName, objAttrValues) {
			var attrs = this._getAttributes();
			if ( objAttrValues instanceof Array) {
				if (!!attrs[attrName]) {
					attrs = attrs[attrName];
					for (var i = 0, len = objAttrValues.length; i < len; i++)
						attrs.push(objAttrValues[i]);
				} else
					attrs[attrName] = objAttrValues;
			} else {
				if (!attrs[attrName])
					attrs[attrName] = [];
				attrs[attrName].push(objAttrValues);
			}
			return this;
		},
		'getAllAttributes' : function() {
			var attrs = this._getAttributes();
			var attrs2 = {};
			for (var attr in attrs) {
				var attr_list = [];
				var _attr = attrs[attr];
				for (var i = 0, len = _attr.length; i < len; i++)
					attr_list.push(_attr[i].valueOf());
				attrs2[attr] = attr_list;
			}
			attrs2.id = this._id;
			return attrs2;
		},
		'setID' : function(intId) {
			this._id = intId;
		},
		'getID' : function() {
			return this._id;
		}
	};

	function ItemList(opts) {
		this._opts = {
			'itemsPerPage' : 50
		};
		$.extend(this._opts, opts);
		var item_list = this;

		function _registerAttribute(objAttrInfo) {
			var attr = new Attribute();
			attr.setLabel(objAttrInfo.label);
			switch(objAttrInfo.type) {
				case 'multi':
					attr.setType(Attribute.MULTI_TYPE);
					break;
				case 'int':
					attr.setType(Attribute.INTEGER_TYPE);
					break;
				case 'float':
					attr.setType(Attribute.FLOAT_TYPE);
					break;
				case 'price':
					attr.setType(Attribute.PRICE_TYPE);
					break;
				case 'str':
				default:
					attr.setType(Attribute.STRING_TYPE);
			}

			if (objAttrInfo.useInSort)
				item_list._sortAttrs[objAttrInfo.id] = {
					"order" : objAttrInfo.sortOrder,
					"label" : objAttrInfo.label,
					"desc" : objAttrInfo.sortDesc
				};
			if (objAttrInfo.useInFilter) {
				item_list._filterAttrs[objAttrInfo.id] = {
					"order" : objAttrInfo.filterOrder,
					"label" : objAttrInfo.label
				};
				//Add this attribute option to the initial filter state:
				item_list._filterState[objAttrInfo.id] = {};
			}
			item_list._attributes[objAttrInfo.id] = attr;
		}

		function _addAttributeOption(attrName, attrValue) {
			if ( attrValue instanceof Array) {
				var attrs = item_list._attributes[attrName];
				var values = [];
				for (var i = 0, len = attrValue.length; i < len; i++)
					values.push(attrs.addValue(attrValue[i]));
				return values;
			} else {
				return item_list._attributes[attrName].addValue(attrValue);
			}
		}

		function _isFiltrableAttribute(attrName) {
			return item_list._filterAttrs.hasOwnProperty(attrName);
		}

		function _isSortableAttribute(attrName) {
			return item_list._sortAttrs.hasOwnProperty(attrName);
		}

		function _attributeExists(attrName) {
			return item_list._attributes.hasOwnProperty(attrName);
		}

		function _getItemList(arrItems) {
			var item_list_items = item_list._items;
			for (var i = 0, len = arrItems.length; i < len; i++) {
				var item = new Item();
				var objItem = arrItems[i];
				item.setID(objItem.id);
				var attrs = objItem.attributes;
				for (var key in attrs) {
					var attrVal = attrs[key].name || attrs[key];
					if (item_list.getAttrType(key) == Attribute.STRING_TYPE)
						attrVal = unescape(attrVal);
					else if (item_list.getAttrType(key) == Attribute.PRICE_TYPE) {
						attrVal = parseFloat(attrVal.replace(/\$|,/gi, ""));
						if (isNaN(attrVal))
							attrVal = 0;
					}
					if (_attributeExists(key))
						item.setAttr(key, _addAttributeOption(key, attrVal));
					else
						item.setAttr(key, unescape(attrVal));
				}
				item_list_items.push(item);
			}
		}

		function _finalizeItemlistItinialization() {
			//Select all the items at the beginning:
			for (var i = 0, len = item_list._items.length; i < len; i++) {
				item_list._selectedItems.push(item_list._items[i]);
			}
			//Initialize the filter state with all the items
			var attributes = item_list._filterAttrs;
			for (var attrName in attributes) {
				var attr = item_list._attributes[attrName];
				var vals = attr.getValues();
				for (var i = 0, len = vals.length; i < len; i++) {
					var val = vals[i];
					attr.setCurrentValue(val);
					item_list._filterState[attrName][val] = attr.getCurrentValueItemsCount();
					attr.clearCurrentValue();
				}
			}
		}


		this.setAttributes = function(arrAttributes) {
			item_list._attributes = {};
			item_list._sortAttrs = {};
			item_list._filterAttrs = {};
			//The following attribute will maintain the available filter options at each instance:
			item_list._filterState = {};
			for (var i = 0, len = arrAttributes.length; i < len; i++)
				_registerAttribute(arrAttributes[i]);
		};

		this.initItemsList = function(arrItems) {
			item_list._current_page = 0;
			item_list._items = [];
			item_list._selectedItems = [];
			var attrs = item_list._attributes;
			for (key in attrs) {
				attrs[key].deleteValues();
			}
			_getItemList(arrItems);
			_finalizeItemlistItinialization();
		};
	}


	ItemList.prototype = {
		"setItemsPerPage" : function(intIPP) {
			this._opts.itemsPerPage = intIPP;
		},
		"getItemsPerPage" : function() {
			return this._opts.itemsPerPage;
		},
		"_selectItems" : function() {
			this._current_page = 0;
			delete this._selectedItems;
			delete this._filterState;
			this._selectedItems = [];
			this._filterState = {};
			var currentFiltersVals = {};
			var filterNames = [];
			for (var attrName in this._filterAttrs) {
				filterNames.push(attrName);
				var value = this._attributes[attrName].getCurrentValue();
				if (value.lowest) {
					currentFiltersVals[attrName] = value;
					//assign true to this attribute if a value is selected
					this._filterState[attrName] = {
						'selected' : true,
						'value' : value
					};
				} else
					this._filterState[attrName] = {};
			}
			var _items = this._items;
			var filter_names_length = filterNames.length;
			for (var i = 0, len = _items.length; i < len; i++) {
				var add_item = true;
				var _item = _items[i];
				var j = 0;
				while (add_item && j < filter_names_length) {
					var attr_name = filterNames[j++];
					var val = currentFiltersVals[attr_name];
					if (!!val) {
						var k = 0;
						var currentAttrVals = _item.getAttrValue(attr_name);
						var currAttrsLen = currentAttrVals.length;
						if (val.highest) {
							var AttVal;
							while (k < currAttrsLen && ((( AttVal = currentAttrVals[k].valueOf()) < val.lowest) || AttVal > val.highest))
							k++;
						} else
							while (k < currAttrsLen && currentAttrVals[k].valueOf() != val.lowest)
							k++;
						if (k == currAttrsLen)
							add_item = false;
					}
				}
				if (add_item) {
					this._selectedItems.push(_item);
					//Add the item options to the current filter state
					for ( j = 0; j < filter_names_length; j++) {
						attr_name = filterNames[j];
						var vals = _item.getAttrValue(attr_name);
						var vals_len = vals.length;
						var currentAttr = this._filterState[attr_name];
						if (!currentAttr.selected) {
							for (var k = 0; k < vals_len; k++) {
								var val = vals[k].valueOf();
								if (!!currentAttr[val])
									currentAttr[val]++;
								else
									currentAttr[val] = 1;
							}
						}
					}
				}
			}
			if (!!this._sortingCriteria && this._sortingCriteria.length)
				this.sortItems();
		},
		"addFilter" : function(strAttrName, value1, value2) {
			this._attributes[strAttrName].setCurrentValue(value1, value2);
			this._selectItems();
		},
		"getAttrType" : function(strAttrName) {
			var attr = this._attributes[strAttrName];
			return (!!attr) ? attr.getType() : null;
		},
		"removeFilter" : function(strAttrName) {
			this._attributes[strAttrName].clearCurrentValue();
			this._selectItems();
		},
		"clearFilters" : function() {
			var attrs = this._filterAttrs;
			for (var attr in attrs)
			this._attributes[attr].clearCurrentValue();
			this._selectItems();
		},
		"getPagesCount" : function() {
			if (this._selectedItems != null) {
				if (!this._opts.itemsPerPage)
					return 1;
				var items = this._selectedItems.length;
				var r = items % this._opts.itemsPerPage;
				return (items - r) / this._opts.itemsPerPage + ~~!!r;
			} else
				return 0;
		},
		"setCurrentPage" : function(intPageNumber) {
			this._current_page = intPageNumber % this.getPagesCount();
		},
		"getCurrentPage" : function() {
			return this._current_page;
		},
		"sortItems" : function(arrSortingCriteria) {
			/*
			 * Sorts the selected items list following the specified criteria in arrSortingCriteria.
			 * The parameter is used as a criteria queue. The elements are sorted by the
			 * first attribute name in the list, then by the second one, and so on...
			 * IMPORTANT: Each criteria must be an object with the format
			 *      {'attrName' : <attribute name>, 'descOrder': true|false|undefined}
			 */

			function _sortBy(arrCriteriaQueue, arrItems) {
				var _objItemsByAttrValue = {};
				var _objCriteria = arrCriteriaQueue.shift();
				var _attrName = _objCriteria.attrName;
				var _arrAttrSortedVals = that._attributes[_attrName].getValues(_objCriteria.descOrder);
				//Initialize the hash table:
				for (var i = 0, len = _arrAttrSortedVals.length; i < len; i++) {
					_objItemsByAttrValue[_arrAttrSortedVals[i]] = [];
				}
				//Divide the item list according to the items values
				while (arrItems.length) {
					var _item = arrItems.shift();
					var values = _item.getAttrValue(_attrName);
					//The same item may has several values for a signle attribute
					for (var i = 0, len = values.length; i < len; i++)
						_objItemsByAttrValue[values[i]].push(_item);
				}
				//Sort the sublists
				if (arrCriteriaQueue.length)
					for (var i = 0, len = _arrAttrSortedVals.length; i < len; i++)
						_sortBy(arrCriteriaQueue, _objItemsByAttrValue[_arrAttrSortedVals[i]]);

				//Merge the sublists:
				var insertedItems = {};
				for (var i = 0, len = _arrAttrSortedVals.length; i < len; i++) {
					var _sublist = _objItemsByAttrValue[_arrAttrSortedVals[i]];
					while (_sublist.length) {
						var item = _sublist.shift();
						if (!insertedItems.hasOwnProperty(item.getID())) {
							arrItems.push(item);
							insertedItems[item.getID()] = true;
						}
					}
					//Free memory
					delete _objItemsByAttrValue[_arrAttrSortedVals[i]];
				}
				//Add the criteria back to the queue, so it can be used among same level instances:
				arrCriteriaQueue.unshift(_objCriteria);
			}

			var that = this;
			this._sortingCriteria = arrSortingCriteria || this._sortingCriteria;
			_sortBy(this._sortingCriteria, that._selectedItems);
		},
		'clearSortCriteria' : function() {
			delete this._sortingCriteria;
		},
		"getItems" : function() {
			if (this.getPagesCount() == 1)
				return this._selectedItems;
			else {
				var items_per_page = this._opts.itemsPerPage;
				var current_index = this._current_page * items_per_page;
				return this._selectedItems.slice(current_index, current_index + items_per_page);
			}
		},
		"getSelectedItemsCountInfo" : function() {
			var items_per_page = this._opts.itemsPerPage || this._selectedItems.length;
			var current_item = this._current_page * items_per_page;
			var end = current_item + items_per_page;
			return {
				"total" : this._selectedItems.length,
				"start" : current_item + 1,
				"end" : this._selectedItems.length > end ? end : this._selectedItems.length
			};
		},
		"getFilterOptions" : function() {
			var filters_list = [];
			var _filters = this._filterAttrs;
			var _state = this._filterState;
			for (var attr in _filters) {
				filters_list[_filters[attr].order] = {
					"value" : _state[attr],
					"name" : attr,
					"label" : _filters[attr].label
				};
			}
			for (var i = 0, len = filters_list.length; i < len; i++) {
				if (!filters_list[i])
					filters_list.splice(i, 1);
			}
			return filters_list;
		},
		"getSortOptions" : function() {
			return this._sortAttrs;
		}
	};

	function ItemRenderer(strTemplate) {
		var strHTMLTpl = strTemplate && strTemplate.toString().trim();
		if (!strHTMLTpl.length)
			throw new Error('ItemRenderer: A template must be specified as a constructor parameter');
		this.getTemplate = function() {
			return strHTMLTpl;
		};
	}


	ItemRenderer.prototype.mergeItemData = function(objItemData) {
		var htmlTpl = this.getTemplate();
		var whiteSpaceRegex = /\s/g;
		var specialCharRegex = /[\(\)\\\.\/\-\*\?\+\^\$\:\]\[\}\{]/g;
		for (var attr in objItemData) {
			var attr_vals = objItemData[attr];
			if(attr=="salesprice" && parseInt(attr_vals[0])!==attr_vals[0]){
				attr_vals[0] = attr_vals[0].formatMoney(2,'.');
			}
			var regex = new RegExp('\\{\\{' + attr.replace(specialCharRegex, "\\$&").replace(whiteSpaceRegex, "\\s+") + '\\}\\}', 'g');
			htmlTpl = htmlTpl.replace(regex, attr_vals.toString());
		}
		return htmlTpl;
	};
	function GPItemList(objOptions) {

		console.log(objOptions);
		/**
		 * Note: The implementation of this class may vary depending on the client requirements.
		 */
		var _sortCriteriaQueue = null;
		var _descSortOrder = false;
		var _current_page = 0;

		var _opts = {
			'itemListContainer' : '.itemlist',
			'paginationLinksContainer' : '.pagination',
			'sortCriteriaSelector' : '.sort',
			'sortOrderSwitcherContainer' : '.sort',
			'enableSortOrderSwitcher' : true,
			'filterContainer' : '.filter',
			'itemsCountCont' : '.itemscount',
			'itemListCellTemplate' : '',
			'onItemsLoaded' : null,
			'onAfterShow' : null,
			'attrMultiValSep' : '^',
			'filterByRange' : {/*
				 //Only numeric attributes should be specified, for instance:
				 "Price" : 100*/
			},
			//Specifies the kind of selector to be used. The syntax is:
			//<filter name> : list | select
			//'list' (default) is used when the filter values are shown as an unordered list
			//'select' is used when the filter values are options in a select element
			'filtersUI' : {

			},
			'filterClearDefaultText' : 'Everything',
			'filtersClearCaptions' : {
			},
			'itemListColumns' : 4,
			'itemListGetter' : new ItemListGetter(".itemcellinfo")
		};
		$.extend(_opts, objOptions);
		var _item_renderer = new ItemRenderer(_opts.itemListCellTemplate);
		var _items_container = $(_opts.itemListContainer);
		if (!_items_container.length)
			throw new Error('GPItemList: The specified item list container does not exist.');

		function _isRangeSelector(strAttrName) {
			return !!_opts.filterByRange[strAttrName];
		}

		// gets the items matching the current selection
		var _itemscount = $(_opts.itemsCountCont);
		function _getItemsList(_item_list) {
			_items_container.hide().html('');
			console.log(_items_container);
			var _html_list = "";
			var _items = _item_list.getItems();
			var len = _items.length;
			
			
//			var msieversion = function ()
//			   {
//			      var ua = window.navigator.userAgent;
//			      var msie = ua.indexOf ( "MSIE " );
//
//			      if ( msie > 0 )      // If Internet Explorer, return version number
//			         return parseInt (ua.substring (msie+5, ua.indexOf (".", msie )));
//			      else                 // If another browser, return 0
//			         return 0;
//
//			   };
//			console.log(msieversion());
			console.log(_item_list);
			console.log(_item_list.getItems());
			if (len)
				for (var i = 0; i < len; i++) {
					var cell = _item_renderer.mergeItemData(_items[i].getAllAttributes());
//					console.log("cell");
//					console.log(cell);
//					console.log("_items[i].getAllAttributes()");
//					console.log(_items[i].getAllAttributes());
					_html_list += cell;
					
					//Add sep span
					if((i+1)%_opts.itemListColumns == 0 || (i+1) == len){
						var sep = '<span class="sep-item-list-rows"></span>';
						_html_list += sep;
					}
				}
			else
				_html_list = "No items found.";

			_items_container.html(_html_list);

			_items_container.children("div").each(function(i) {
				if (!(i % _opts.itemListColumns))
					$(this).addClass("first");
			});
			//Trigger the itemListComplete event handler:
			try {
				if ( typeof _opts.onItemsLoaded == 'function')
					_opts.onItemsLoaded(_items_container);
			} catch(e) {
				if (console && console.log)
					console.log(e);
			}
			_items_container.show();
			try {
				if ( typeof _opts.onAfterShow == 'function')
					_opts.onAfterShow();
			} catch(e) {
				if (console && console.log)
					console.log(e);
			}
			var count_info = _item_list.getSelectedItemsCountInfo();
			if (count_info.total)
				_itemscount.html(count_info.start + "-" + count_info.end + " of " + count_info.total);
		}

		function initUI(_item_list) {
//			console.log(_item_list);
			// Sort options selector
			var _sortSelector = $(_opts.sortCriteriaSelector);
			if (_sortSelector.length) {
				var sort_opts = _item_list.getSortOptions();
				//Insert the sorting options respecting the order
				var arrSortOpts = [];
				for (var op in sort_opts) {
					var i = arrSortOpts.length;
					var op_index = sort_opts[op].order;
					arrSortOpts.push({
						"id" : op,
						"index" : op_index
					});
					while (i && op_index < arrSortOpts[i - 1].index)
					i--;
					arrSortOpts.splice(i, 0, arrSortOpts.pop().id);
				}
				if (arrSortOpts.length) {
					_sortSelector = _sortSelector.html('<div class="selectwrap"><select class="sortoptions" title="Select the sort criteria" onchange="_gaq.push([' + "'_trackEvent', 'Categories', 'Sorting'" + ']);"><\/select><\/div>').find("select");
					_sortSelector.append('<option value="clear" selected="selected">Select</option>');
					for (var i = 0; op = arrSortOpts[i]; i++)
						_sortSelector.append('<option value="' + op + '" name="' + sort_opts[op].desc + '">' + sort_opts[op].label + '</option>');

					function _sortItems() {
						_item_list.clearSortCriteria();
						var selected_option = _sortSelector.val();
						var sortDesc = _sortSelector.find(':selected').attr('name') == 'true';
						if (selected_option != 'clear') {
							_item_list.sortItems([{
								'attrName' : selected_option.replace(/[0-9]/g, ''),
								'descOrder' : sortDesc
								//'descOrder' : _descSortOrder
							}]);
							_getItemsList(_item_list);
						}
					}

					_sortSelector.bind('change', _sortItems);
					// Sort order switch

					if (_opts.enableSortOrderSwitcher)
						var _sortOrderSwitch = $('<a>').attr({
							'class' : 'asc',
							'href' : '#',
							'title' : 'Change to descending direction'
						}).bind('click', function(evt) {
							evt.preventDefault();
							_descSortOrder = !_descSortOrder;
							if (_descSortOrder)
								_sortOrderSwitch.attr({
									'class' : 'desc',
									'title' : 'Change to ascending direction'
								}).html('Descending');
							else
								_sortOrderSwitch.attr({
									'class' : 'asc',
									'title' : 'Change to descending direction'
								}).html('Ascending');
							_sortItems();
						}).html('Ascending').appendTo(_opts.sortOrderSwitcherContainer);
				}
			}

			// Filters
			var _filterContainer = $(_opts.filterContainer);
			if (_filterContainer.length) {
				function _getFilterOpts() {
					var _filters = _item_list.getFilterOptions();
					_filterContainer.html('');
					for (var k = 0, len = _filters.length; k < len; k++) {
						var attr = _filters[k].name;
						var label = _filters[k].label;
						var attr_vals = _filters[k].value;
						var _innerContainer = $('<div class="filter_' + attr + '"/>');
						if (attr_vals.selected) {
							var _html = '<p><span>';
							_html += label;
							_html += ' <\/span>';
							_html += attr_vals.value.lowest;
							if (_isRangeSelector(attr)) {
								_html += " to ";
								_html += attr_vals.value.highest;
							}
							_html += ' <a href="#" rel="';
							_html += attr;
							_html += '">remove<\/a><\/p>';
							_innerContainer.append(_html);
							_filterContainer.append(_innerContainer);
						} else {
							if (_opts.filtersUI[attr] === "select") {
								var _html = '<select class="filters" id="filter_';
								_html += attr;
								_html += '" title="';
								_html += attr;
								_html += '"/>';
								var _filterSelector = $(_html).bind('change', function(evt) {
									var target = $(evt.target);
									var attr_name = target.attr('title');
									if (_isRangeSelector(attr_name)) {
										var values = target.val().split(_opts.attrMultiValSep);
										_item_list.addFilter(attr_name, values[0], values[1]);
									} else
										_item_list.addFilter(attr_name, target.val());
									_getFilterOpts();
									console.log("1");
									_setPagination(_pagination, _item_list);
									_getItemsList(_item_list);
								});
								var clearText = _opts.filtersClearCaptions[attr] || _opts.filterClearDefaultText;
								_filterSelector.append('<option value="clear">' + clearText + '<\/option>');
								var options = 0;
								if (_isRangeSelector(attr)) {
									var _attrvalues = [];
									for (var val in attr_vals) {
										options++;
										var j = 0;
										var floatVal = parseFloat(val);
										//Add the value in order
										while (_attrvalues[j] && floatVal > _attrvalues[j].val)
										j++;
										_attrvalues.splice(j, 0, {
											"val" : floatVal,
											"qty" : attr_vals[val]
										});
									}
									var i = 0;
									while (i < options) {
										var in_range = 0;
										var min_range = _attrvalues[i].val;
										var max_range = min_range + _opts.filterByRange[attr];
										while (i < options && _attrvalues[i].val >= min_range && _attrvalues[i].val < max_range) {
											in_range += _attrvalues[i].qty;
											i++;
										}
										max_range = _attrvalues[i - 1].val;
										if (in_range) {
											var _html = '<option value="';
											_html += min_range;
											_html += _opts.attrMultiValSep;
											_html += max_range;
											_html += '">';
											_html += "$" + min_range;
											_html += " to ";
											_html += "$" + max_range;
											_html += ' (';
											_html += in_range;
											_html += ')<\/option>';
											_filterSelector.append($(_html));
										}
									}
									if (options > 1) {
										_innerContainer.append('<label for="filter_' + attr + '">' + label + '<\/label>');
										var _filterCont = $('<div class="selectwrap">').appendTo(_innerContainer);
										_filterCont.append(_filterSelector);
										_filterContainer.append(_innerContainer);
									}
								} else {
									for (var val in attr_vals) {
										options++;
										_filterSelector.append('<option value="' + val + '">' + val + ' (' + attr_vals[val] + ')<\/option>');
									}
									if (options > 1) {
										_innerContainer.append('<label for="filter_' + attr + '">' + label + '<\/label>');
										var _filterCont = $('<div class="selectwrap">').appendTo(_innerContainer);
										_filterCont.append(_filterSelector);
										_filterContainer.append(_innerContainer);
									}
								}
							} else {
								var _html = '<ul class="filters" id="filter_';
								_html += attr;
								_html += '">';
								var _filterSelector = $(_html).bind('click', function(evt) {
									if (evt.target.tagName.toLowerCase() == "a") {
										evt.stopPropagation();
										evt.preventDefault();
										var target = $(evt.target);
										var attr_name = this.getAttribute('id').replace("filter_", "");
										if (_isRangeSelector(attr_name)) {
											var values = target.val().split(_opts.attrMultiValSep);
											_item_list.addFilter(attr_name, values[0], values[1]);
										} else
											_item_list.addFilter(attr_name, target.attr('title'));
										_getFilterOpts();
										console.log("2");
										_setPagination(_pagination, _item_list);
										_getItemsList(_item_list);
									}
								});
								var options = 0;
								if (_isRangeSelector(attr)) {
									var _attrvalues = [];
									for (var val in attr_vals) {
										options++;
										var j = 0;
										var floatVal = parseFloat(val);
										//Add the value in order
										while (_attrvalues[j] && floatVal > _attrvalues[j].val)
										j++;
										_attrvalues.splice(j, 0, {
											"val" : floatVal,
											"qty" : attr_vals[val]
										});
									}
									var i = 0;
									while (i < options) {
										var in_range = 0;
										var min_range = _attrvalues[i].val;
										var max_range = min_range + _opts.filterByRange[attr];
										while (i < options && _attrvalues[i].val >= min_range && _attrvalues[i].val < max_range) {
											in_range += _attrvalues[i].qty;
											i++;
										}
										max_range = _attrvalues[i - 1].val;
										if (in_range) {
											var _html = '<li><a href="#" title="';
											_html += min_range;
											_html += _opts.attrMultiValSep;
											_html += max_range;
											_html += '" onclick="_gaq.push([' + "'_trackEvent', 'Categories', 'Filter', 'ByRange'" + ']);" >';
											_html += min_range;
											_html += " to ";
											_html += max_range;
											_html += ' (';
											_html += in_range;
											_html += ')<\/a><\/li>';
											_filterSelector.append($(_html));
										}
									}
									if (options > 1) {
										_innerContainer.append('<span class="filtertitle ' + attr + '">' + label + '<\/span>');
										_innerContainer.append(_filterSelector);
										_filterContainer.append(_innerContainer);
									}
								} else {
									var arrSorted = [];
									for (var val in attr_vals) {
										if (!!val)
											arrSorted.push(val);
									}
									arrSorted = arrSorted.sort();
									for (var i = 0, len2 = arrSorted.length; i < len2; i++) {
										var val = arrSorted[i];
										options++;
										_filterSelector.append('<li class="' + val.toString().toLowerCase().replace(/\s+|\++/g, "-") + '"><a href="#" onclick="_gaq.push([' + "'_trackEvent', 'Categories', 'Filter', '" + val + "'" + ']);" title="' + val + '">' + val + ' (' + attr_vals[val] + ')<\/a><\/li>');
									}
									if (options > 1) {
										_innerContainer.append('<span class="filtertitle ' + attr + '">' + label + '<\/span>');
										_innerContainer.append(_filterSelector);
										_filterContainer.append(_innerContainer);
									}
								}
							}
						}
					}
				}


				_filterContainer.bind('click', function(evt) {
					evt.preventDefault();
					var target = evt.target;
					if (target.tagName.toLowerCase() == 'a') {
						_item_list.removeFilter(target.getAttribute('rel'));
						_getFilterOpts();
						console.log("3");
						_setPagination(_pagination, _item_list);
						_getItemsList(_item_list);
					}
				});
				_getFilterOpts();
			}

			// Pagination

			var _pagination = $(_opts.paginationLinksContainer);
			if (_pagination.length) {
				_pagination.unbind().bind('click', function(evt) {
					var target = evt.target;
					if (target.tagName.toLowerCase() == "li") {
						target = target.getAttribute('rel');
						var current = _item_list.getCurrentPage();
						if (isNaN(target)) {
							if (target == 'next') {
								target = current;
								if (target < _item_list.getPagesCount() - 1)
									target++;
							} else {//target == 'prev'
								target = current;
								if (target)
									target--;
							}
						} else
							target = parseInt(target);
						if (target != current) {
							$('html, body').animate({
								scrollTop : 0
							}, 'slow');
							_pagination.find('.current').removeClass('current');
							_item_list.setCurrentPage(target);
							target = _pagination.find('li[rel=' + target + ']').addClass('current');
							_getItemsList(_item_list);
						}
					}
				});

				// User interface initialization
				console.log("4");
				_setPagination(_pagination, _item_list);
			}
			// User interface initialization
			_getItemsList(_item_list);
		}

		function _setPagination(_pagination, _item_list) {
//			console.log(_item_list);
			_pagination.html('');
			var pages = _item_list.getPagesCount();
			if (pages > 1) {
				var ul = $('<ul>');
				ul.append('<li class="prev" rel="prev">Prev.</\li>');
				ul.append('<li class="page current" rel="0">1</\li>');
				for (var i = 1; i < pages; i++)
					ul.append('<li class="page" rel="' + i + '">' + (i + 1) + '</\li>');
				ul.append('<li class="next" rel="next">Next</\li>');
			}
			_pagination.append(ul);
		}
		console.log("init_item_list");
		console.log(objOptions);
		var _item_list = new ItemList(objOptions);
		console.log(_item_list);

		this.setAttributes = function(arrAttrsInfo) {
			_item_list.setAttributes(arrAttrsInfo);
		};

		this.getItemsByColor = function(arrColors) {
			this.objCurrentSelectionInfo = arrColors || this.objCurrentSelectionInfo;
			var div = $("<div>").css({
				"background-color" : "#FFFFFF",
				"width" : "100%",
				"height" : "100%",
				"position" : "fixed",
				"top" : 0,
				"left" : 0
			}).fadeTo(0, 0.5).appendTo("body");
			var g = _opts.itemListGetter;
			g.bindOnSuccess(function(arrItems) {
				_item_list.initItemsList(arrItems);
				console.log("initUI");
				initUI(_item_list);
				div.remove();
			});
			g.bindOnError(function() {
				window.alert("An unexpected error occurred");
				div.remove();
			});
			g.getItems(arrColors);
			this.getItemsByColor = function(arrColors) {
				this.objCurrentSelectionInfo = arrColors || this.objCurrentSelectionInfo;
				var div = $("<div>").css({
					"background-color" : "#FFFFFF",
					"width" : "100%",
					"height" : "100%",
					"position" : "fixed",
					"top" : 0,
					"left" : 0
				}).fadeTo(0, 0.5).appendTo("body");
				_opts.itemListGetter.getItems(arrColors);
			};

			this.setItemsPerPage = function(intIPP) {
				_item_list.setItemsPerPage(intIPP);
				console.log("5");
				_setPagination($(_opts.paginationLinksContainer), _item_list);
				_getItemsList(_item_list);
			};
			this.getItemsTotal = function() {
				return _item_list.getSelectedItemsCountInfo().total;
			}
		};
	}

	return GPItemList;
})(jQuery);

function ItemListGetter(strItemListCellInfoSelector) {
	console.log("ItemListGetter");
	console.log(strItemListCellInfoSelector);
	this.itemCell = strItemListCellInfoSelector
	console.log(this);
};

ItemListGetter.prototype = {
	"getItems" : function(arrColors) {
		console.log("getItems");
		//Get the item list additional pages
		var location = window.location.href;
		var range_match = /[?&]range=[^&]+/.exec(location);
		if(range_match && range_match.length)
			window.location.href = location.replace(range_match[0], "");
		var that = this;
		var pages = [];
		var pagination_info = $j('.gp_custom_pagination:eq(0)');
		pagination_info.parents("table:eq(0)").remove();
		var pag_info = /(\d*)\sof\s(\d*)/.exec(pagination_info.text());
		if (pag_info && pag_info.length == 3) {
			var items_per_page = parseInt(pag_info[1]);
			var items_count = parseInt(pag_info[2]);
			if (!isNaN(items_per_page) && !isNaN(items_count)) {
				var pages_count = Math.ceil(items_count / items_per_page);
				var curr_page_url = window.location.href + (window.location.href.indexOf("?") == -1 ? "?range=" : "&range=");
				var last_in_prev_range = 0;
				for (var i = 1, before_last_page = pages_count - 1; i < before_last_page; i++) {
					last_in_prev_range = items_per_page * i;
					var page_index = i - 1;
					pages[page_index] = curr_page_url;
					pages[page_index] += last_in_prev_range + 1;
					pages[page_index] += ",";
					pages[page_index] += last_in_prev_range + items_per_page;
					pages[page_index] += ",";
					pages[page_index] += items_count;
				}
				if (last_in_prev_range < items_count && pages_count) {
					var last_page_url = curr_page_url;
					last_page_url += items_per_page * (pages_count - 1) + 1;
					last_page_url += ",";
					last_page_url += items_count;
					last_page_url += ",";
					last_page_url += items_count;
					pages.push(last_page_url);
				}
			}
		}

		var arrItems = [];
		//This function checks if all the items are already loaded, and triggers the onItemsLoaded event.
		var parsed_pages = 0;
		function _checkItemsLoaded() {
			if (++parsed_pages == pages.length) {
				that.arrItems = arrItems;
				getFullItemList(arrItems);
			}
		}

		//Get the pages links
		function _getItemListAjax(arrItems, pageUrl, currentPosition) {
			$j.ajax({
				'url' : pageUrl,
				'success' : function(data) {
					var _arrItems = [];
					//Prevent the extra requested pages from loading unnecessary content:
					_getItemList(_arrItems, data.replace(/<img[^>]+>/gi, ""));
					for (var i = 0, len = _arrItems.length; i < len; i++, currentPosition++)
						arrItems.splice(currentPosition, 0, _arrItems[i]);
					console.log("_getItemListAjax");
					_checkItemsLoaded();
				}
			});
		}

		function _getItemList(arrItems, itemList) {
			$j(itemList).find(that.itemCell).each(function() {
				arrItems.push(this.title);
			});
		}

		//Get the first page:
		_getItemList(arrItems, "body");

		var _last_index = arrItems.length;
		//Get the remaining pages
		for (var i = 0, len = pages.length; i < len; i++) {
			_getItemListAjax(arrItems, pages[i], _last_index);
			_last_index += _last_index;
		}

		//If there was just one page fire the success event:
		if (!pages.length) {
			that.arrItems = arrItems;
			getFullItemList(arrItems);
		}

		function getFullItemList(arrItems) {
			console.log("getFullItemList");
			$j.ajax({
				"url" : "/app/site/hosting/scriptlet.nl",
				"data" : {
					"sbcitems" : arrItems.join(","),
					"script" : "customscript_pp_ss_getitemsbycolor",
					"deploy" : "customdeploy_pp_ss_getitemsbycolor",
					"columns" : "storedisplayname,custitem_display_thumbnail,custitem_price_description,storedescription,type,onlinecustomerprice,category"
				},
				"dataType" : "json",
				"success" : function(data) {
					if (data.error)
						throw new Error("");
					that.success(data);
				},
				"error" : that.err
			});
		}
	},
	"bindOnSuccess" : function(fnHandler) {
		console.log("bindOnSuccess");
		console.log(fnHandler);
		this.success = fnHandler;
	},
	"bindOnError" : function(fnHandler) {
		this.err = fnHandler;
	}
};
//The tab image is load from the File Cabinet,
//the image name should be the name of the tab
//just text without spaces or special characters and all lowercase
//example: Category Name => categoryname.jpg
var parent_category = $j('.category_data .parent_category').text();
var name_category = $j('.category_data .name_category').text();
if(parent_category == 'No'){
	name_image = name_category.replace(/[^A-Za-z0-9]/g,"");
	name_image = name_image.toLowerCase();
	image_url = '/site/pp-cat-images/'+name_image+'.jpg';
	$j('<img />').error(function(){
		return false;
	}).load(function(){
		$j('.cat-banner').html(this);
	}).attr({src: image_url, alt: name_category});
}


function AjaxItemListGetter(a){this.itemCell=a}AjaxItemListGetter.prototype={getItems:function(){var e=this;if(e.arrItems&&e.arrItems.length){e.success(e.arrItems);return}var j=[];var t=$j(".gp_custom_pagination:eq(0)");t.parents("table:eq(0)").remove();var d=/(\d*)\sof\s(\d*)/.exec(t.text());if(d&&d.length==3){var m=parseInt(d[1]);var p=parseInt(d[2]);if(!isNaN(m)&&!isNaN(p)){var o=Math.ceil(p/m);var c=window.location.href+(window.location.href.indexOf("?")==-1?"?range=":"&range=");var u=0;for(var q=1,b=o-1;q<b;q++){u=m*q;var s=q-1;j[s]=c;j[s]+=u+1;j[s]+=",";j[s]+=u+m;j[s]+=",";j[s]+=p}if(u<p&&o){var a=c;a+=m*(o-1)+1;a+=",";a+=p;a+=",";a+=p;j.push(a)}}}var f=[];var h=0;function k(){if(++h==j.length){e.arrItems=f;e.success(f)}}function n(i,w,v){$j.ajax({url:w,success:function(A){var z=[];g(z,A.replace(/<img[^>]+>/gi,""));for(var y=0,x=z.length;y<x;y++,v++){i.splice(v,0,z[y])}k()}})}function g(v,i){$j(i).find(e.itemCell).each(function(){var B={id:this.title};var x={};var z=this.children;var A;for(var y=0,w=z.length;y<w;y++){x[(A=z[y]).className]=A.innerHTML}B.attributes=x;v.push(B)})}g(f,"body");var l=f.length;for(var q=0,r=j.length;q<r;q++){n(f,j[q],l);l+=l}if(!j.length){this.success(f);e.arrItems=f}},bindOnSuccess:function(a){this.success=a},bindOnError:function(a){this.err=a}};
console.log("init_filter");
window.GPItemList = new GPItemList({
	itemListColumns : 3,
	itemListGetter : new AjaxItemListGetter(".itemcellinfo"),
	onItemsLoaded : function(b) {
		$j("img", b).each(function() {
			if (this.getAttribute("src") == "") {
				this.setAttribute("src", "//poppinsb.imgix.net/pp-templates/thumb.gif?auto=format")
			}
		});
		$j(".div__addtocart", b).each(function() {
			var subclass = $j(this).find(".subclass").val();
			if(subclass === '01 15x15 Art' || subclass === '02 19x19 Art' || subclass === '03 23x23 Art' || subclass === 'Art'){
				// Wall art pages
				$j(this).find("a").css("display", "none");
				$j(this).parent().css("padding-bottom", "10px");
			} else if($j(this).find(".onlinematrixpricerange").val() !== ''){
				// Matrix
				$j(this).find("a").css("display", "none");
				$j(this).parent().css("padding-bottom", "10px");
			}else if($j(this).find(".isdropshipitem").val() === "Yes"){
				// Non-inventory
			}else if($j(this).find(".itemtype").val() === 'Kit') {
				// Kits
				if($j(this).find(".quantityavailable").val() === "0"){
					$j(this).find("a").css("display", "none");
					$j(this).find("a").after('<p>Coming Soon!</p>');
				}
			}else if($j(this).find(".itemtype").val() === 'GiftCert') {
				//If Gift Certificate redirect to form first
				$j(this).find("a").css("display", "none");
					$j(this).find("a").after('<a href="'+$j(this).parent().find("a").attr("href") + '">Add to cart</a>');
console.log($j(this).parent().find("a").attr("href"));
			}else{
				// Inventory
				if($j(this).find(".quantityavailable").val() === "0"){
					$j(this).find("a").css("display", "none");
					$j(this).find("a").after('<p>Coming Soon!</p>');
				}
			}
		});
		$j(".thumb", b).each(function() {
			var flipimage = $j(this).find(".flipimage").val();
			var href = $j(this).find("a").attr("href");
			if(flipimage !== ""){
				var mainimage = $j(this).find("img").attr("src");
				$j(this).addClass("flipper");
				$j(this).html('<div class="face"><a href="'+href+'"><img src="'+mainimage+'"></a></div><div class="back"><a href="'+href+'"><img src="'+flipimage+'"></a></div>');
			}
		});
		var a = $j(".pagination");
		if (!a.html().length) {
			a.prev().hide()
		} else {
			a.prev().show()
		}
		if (!$j(".itemlist div").length) {
			$j(".toolbar, .paginationtoolbar").remove()
		}
		var c = $j("#filter_custitem3");
		if (!c.prev().hasClass("filterselect")) {
			c.before('<div class="filterselect">Filter By Color&nbsp;&nbsp;&nbsp;</div>')
		}
		c.find("li").each(function() {
			this.style.backgroundImage = "url(//poppinsb.imgix.net/pp-templates/available-colors/" + this.className + ".gif?auto=format)"
		});
		$j(".item-cell .price").each(function() {
			this.innerHTML = this.innerHTML.replace(".00", "")
		})
	},
	onAfterShow : function() {
		var h = '', d = '';
		$j(".item-cell").each(function() {
			if($j(this).hasClass("first")) {
				h1 = $j(this).find('h2').height();
				h2 = $j(this).next().find('h2').height();
				h3 = $j(this).next().next().find('h2').height();
				d1 = $j(this).find('.short-desc').height();
				d2 = $j(this).next().find('.short-desc').height();
				d3 = $j(this).next().next().find('.short-desc').height();
				h = Math.max(h1, h2, h3);
				d = Math.max(d1, d2, d3);
			}
			$j(this).find('h2').height(h);
			$j(this).find('.short-desc').height(d);
		});
	},
	enableSortOrderSwitcher : false,
	itemListCellTemplate : '<div class="item-cell"><p class="thumb"><input type="hidden" class="flipimage" value="{{flipimage}}"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">${{salesprice}}</p><div class="div__addtocart"><div class="div__addtocart1"><input type="hidden" class="itemtype" value="{{itemtype}}"><input type="hidden" class="isdropshipitem" value="{{isdropshipitem}}"><input type="hidden" class="onlinematrixpricerange" value="{{onlinematrixpricerange}}"><input type="hidden" class="quantityavailable" value="{{quantityavailable}}"><input type="hidden" class="subclass" value="{{subclass}}"><a href="/app/site/query/additemtocart.nl?c=3363929&n=1&buyid={{buyid}}" onClick="_gaq.push([' + "'_trackEvent', 'Categories', 'AddToCart', '{{displayname}}'" + ']);">ADD TO CART</a></div></div></div>',
	itemsPerPage : 24
});
GPItemList.setAttributes([ {
	id : "displayname",
	label : "Name A-Z",
	type : "str",
	sortDesc: false,
	sortOrder : 1,
	useInSort : true
}, {
	id : "displayname1",
	label : "Name Z-A",
	type : "str",
	sortDesc: true,
	sortOrder : 2,
	useInSort : true
}, {
	id : "salesprice",
	label : "Price (High-Low)",
	type : "price",
	sortDesc: true,
	sortOrder : 3,
	useInSort : true
}, {
	id : "salesprice2",
	label : "Price (Low-High)",
	type : "price",
	sortDesc: false,
	sortOrder : 4,
	useInSort : true
}, {
	id : "custitem3",
	label : "",
	filterOrder : 1,
	useInFilter : true
} ]);
jQuery(function(a) {
	GPItemList.getItemsByColor();
	a("#itemsperpageselector").change(function() {
		GPItemList.setItemsPerPage(parseInt(a(this).val()))
	})
});
console.log("init_filter2");
console.log(window.GPItemList);
