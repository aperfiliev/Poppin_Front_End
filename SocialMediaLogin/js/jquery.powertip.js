var powerTip = {
	create : function(inputId, data, popupId, top, left) {
		tipElement = jQuery('<div/>', { id: popupId, html: data})
			.attr("class", "n")
			.css("top", top)
			.css("left", left)
			.css("display", "block");
		jQuery("#"+inputId).parent().append(tipElement);
	},
	hide : function(popupId) {
		jQuery("#"+popupId).remove();
	}
};