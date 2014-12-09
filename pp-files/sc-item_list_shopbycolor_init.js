window.GPItemList = new GPItemList({
	itemListColumns : 3,
	itemListGetter : new AjaxItemListGetter(".itemcellinfo"),
	onItemsLoaded : function(b) {
		$j("img", b).each(function() {
			if (this.getAttribute("src") == "") {
				this.setAttribute("src", "//poppin.imgix.net/pp-templates/thumb.gif?auto=format")
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
			this.style.backgroundImage = "url(//poppin.imgix.net/pp-templates/available-colors/" + this.className + ".gif?auto=format)"
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
	itemListCellTemplate : '<div class="item-cell"><p class="thumb"><input type="hidden" class="flipimage" value="{{flipimage}}"><a href="/s.nl/it.A/id.{{id}}/.f"><img src="{{thumbnailurl}}" alt="{{displayname}}" /></a></p><p class="short-desc">{{storedescription}}</p><h2><a href="/s.nl/it.A/id.{{id}}/.f">{{displayname}}</a></h2><p class="price">${{salesprice}}</p><div class="div__addtocart"><div class="div__addtocart1"><input type="hidden" class="itemtype" value="{{itemtype}}"><input type="hidden" class="isdropshipitem" value="{{isdropshipitem}}"><input type="hidden" class="onlinematrixpricerange" value="{{onlinematrixpricerange}}"><input type="hidden" class="quantityavailable" value="{{quantityavailable}}"><input type="hidden" class="subclass" value="{{subclass}}"><a href="/app/site/query/additemtocart.nl?c=3363929&n=1&buyid={{buyid}}" onClick="_gaq.push([' + "'_trackEvent', 'Shop By Color', 'AddToCart', '{{displayname}}'" + ']);">ADD TO CART</a></div></div></div>',
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