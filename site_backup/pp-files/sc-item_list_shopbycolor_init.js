window.GPItemList = new GPItemList({
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
	},
	'filtersUI' : {
		'category' : 'select'
	},
	'itemListCellTemplate' : '<div class="item-cell"><p class="thumb"><a href="/s.nl/it.A/id.{{id}}/.f" class="cellimg"><img src="{{custitem_display_thumbnail}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{storedisplayname}}<\/a></h2><p class="price">${{onlinecustomerprice}}</p><\/div>',
	'itemsPerPage' : 24
});
GPItemList.setAttributes([{
	"id" : "storedisplayname",
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
	"id" : "category",
	"label" : "Show me",
	"type" : "multi",
	"filterOrder" : 1,
	"useInFilter" : true
}]);
$j(function() {
	GPItemList.getItemsByColor();
});