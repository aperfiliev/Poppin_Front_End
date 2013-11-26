window.GPItemList = new GPItemList({
	itemListColumns : 3,
	itemListGetter : new AjaxItemListGetter(".itemcellinfo"),
	onItemsLoaded : function(b) {
		$j("img", b).each(function() {
			if (this.getAttribute("src") == "") {
				this.setAttribute("src", "/site/pp-templates/thumb.gif")
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
			this.style.backgroundImage = "url(http://cdn-web.poppin.com/site/pp-templates/available-colors/" + this.className + ".gif)"
		});
		$j(".item-cell .price").each(function() {
			this.innerHTML = this.innerHTML.replace(".00", "")
		})
	},
	enableSortOrderSwitcher : false,
	itemListCellTemplate : '<div class="item-cell"><p class="thumb"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">${{salesprice}}</p><div class="div__addtocart"><div class="div__addtocart1"><a href="/app/site/query/additemtocart.nl?c=3363929&n=1&buyid={{buyid}}" onClick="_gaq.push([' + "'_trackEvent', 'Shop By Color', 'AddToCart', '{{displayname}}'" + ']);">ADD TO CART</a></div></div></div>',
	itemsPerPage : 0
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