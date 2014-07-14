window.GPItemList = new GPItemList({
	'itemListGetter' : new AjaxItemListGetter(".itemcellinfo"),
	'itemListColumns' : 3,
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
			this.style.backgroundImage = "url(/site/pp-templates/available-colors/" + this.className + ".gif)";
		});

		//QVI:
		$j(".qvi_info", items_container).each(function() {
			if (this.getAttribute('title') != "infoitem") {
				var children = this.children;
				var item = GPR_AAE_QVI.newItem();
				for (var i = 0, len = children.length; i < len; i++)
					item[children[i].className] = children[i].innerHTML;
				GPR_AAE_QVI.addItem(item);
				$j(this).remove();
				$j('#qvi_thumb_' + item.id).hover(function() {
					$j(this).addClass('qvi_hover').prepend('<div class="qvi_btn_wrap"><img class="qvi_btn" src="/site/pp-templates/btn-qvi.png" alt="" onclick="javascript:GPR_AAE_QVI.popUp(' + item.id + ');"></div>');
				}, function() {
					$j(this).removeClass('qvi_hover').find('.qvi_btn_wrap').remove();
				});
			}
		});
	},
	'itemListCellTemplate' : '<div class="item-cell" id="qvi_thumb_{{id}}"><p class="thumb"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">&#36;{{onlinecustomerprice}}</p></div>',
	'itemsPerPage' : 51
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