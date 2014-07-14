function AjaxItemListGetter(strItemListCellInfoSelector) {
	this.itemCell = strItemListCellInfoSelector;
}

AjaxItemListGetter.prototype = {
	"getItems" : function() {
		//Get the item list additional pages
		var that = this;

		if (that.arrItems && that.arrItems.length) {
			that.success(that.arrItems);
			return;
		}

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
				that.success(arrItems);
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
					_checkItemsLoaded();
				}
			});
		}

		function _getItemList(arrItems, itemList) {
			$j(itemList).find(that.itemCell).each(function() {
				var objItem = {
					"id" : this.title
				};
				var attrs = {}
				var children = this.children;
				var ch;
				for (var i = 0, len = children.length; i < len; i++)
					attrs[( ch = children[i]).className] = ch.innerHTML;
				objItem["attributes"] = attrs;
				arrItems.push(objItem);
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
			this.success(arrItems);
			that.arrItems = arrItems;
		}
	},
	"bindOnSuccess" : function(fnHandler) {
		this.success = fnHandler;
	},
	"bindOnError" : function(fnHandler) {
		this.err = fnHandler;
	}
};
