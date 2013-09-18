window.GPItemList = new GPItemList({
	'itemListColumns': 3,
	'itemListGetter' : new AjaxItemListGetter(".itemcellinfo"),
	'onItemsLoaded' : function(items_container) {
		$j("img", items_container).each(function() {
			if (this.getAttribute('src') == "")
				this.setAttribute('src', '/site/pp-templates/thumb.gif');
		});
		var pagination = $j(".pagination");
		if (!pagination.html().length)
			pagination.prev().hide();
		else
			pagination.prev().show();
		if (!$j(".itemlist div").length)
			$j(".toolbar, .paginationtoolbar").remove();
		var filterul = $j("#filter_custitem3");
		if (!filterul.prev().hasClass("filterselect"))
			filterul.before('<div class="filterselect">All</div>');
		filterul.find("li").each(function() {
			this.style.backgroundImage = "url(http://cdn-web.poppin.com/site/pp-templates/available-colors/" + this.className + ".gif)";
		});

		$j(".item-cell .price").each(function() {
			this.innerHTML = this.innerHTML.replace(".00", "");
		});
	},
	'itemListCellTemplate' : '<div class="item-cell"><p class="thumb"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">{{salesprice}}</p></div>',
	'itemsPerPage' : 24
});
GPItemList.setAttributes([{
	"id" : "displayname",
	"label" : "Name",
	"type" : "str",
	"sortOrder" : 1,
	"useInSort" : true
}, {
	"id" : "onlinecustomerprice",
	"label" : "Price",
	"type" : "price",
	"sortOrder" : 2,
	"useInSort" : true
}, {
	"id" : "custitem3",
	"label" : "By Color",
	"filterOrder" : 1,
	"useInFilter" : true
}]);
jQuery(function($) {
	GPItemList.getItemsByColor();
	$("#itemsperpageselector").change(function() {
		GPItemList.setItemsPerPage(parseInt($(this).val()));
	});
});
