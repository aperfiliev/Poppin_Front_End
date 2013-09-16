(function($) {
	var f = (navigator.userAgent.indexOf("MSIE") == -1) ? function() {
		$(this).remove();
	} : function() {
		$(this).children().unwrap();
	};
	$('.item-list').find('form').each(f);
	var table = $j(".itemcell:last").parent().parent();
	var	trs = table.find("tr");
	var firstTr = trs[0];
	for(var i = 1, len = trs.length; i < len;i++) {
		var tr = $(trs[i]);
		tr.find(".itemcell").appendTo(firstTr);
		tr.remove();
	}
	$(".addset a").click(function(e) {
		e.preventDefault();
		var selected = $j('input[name=itemselection]:checked');
		if (!selected.length) {
			window.alert("Please select at least one item.");
			return;
		}
		var trim_regexp = /^\s+|\s+$/g,
			color = selected.siblings(".redirect-color").html().replace(trim_regexp, ""),
			item_redirect_url = selected.siblings(".redirect-url").html().replace(trim_regexp, ""),
			selected = selected.val();
		$("<div>").css({
			"background-color" : "#FFFFFF",
			"width" : "100%",
			"height" : "100%",
			"position" : "fixed",
			"top" : 0,
			"left" : 0,
			"z-index" : 100
		}).fadeTo(0, 0.5).appendTo("body");
		$("<div>Adding your free items to your cart now, <br>please enjoy some more Pops of Color!<\/div>").css({
			"background-color" : "#FFFFFF",
			"width" : "250px",
			"height" : "100px",
			"position" : "fixed",
			"padding" : "20px",
			"top" : "50%",
			"left" : "50%",
			"margin-top" : "-60px",
			"margin-left" : "-110px",
			"text-align" : "center",
			"z-index" : 101
		}).appendTo("body");
		$.ajax({
			"url" : "/app/site/backend/additemtocart.nl",
			"data" : {
				"buyid" : selected,
				"itemid" : selected,
				"qty" : 1
			},
			"success" : function() {
				location.href = item_redirect_url || deft_redirect_url || "/Shop-By-Color/" + (color.replace(/\s+/g, "-") || ""); 
			},
			"error" : function() {
				window.alert("An unexpected error occurred. The page will be reloaded. Please try again.");
				window.location.reload();
			}
		});
	});
})(jQuery);
