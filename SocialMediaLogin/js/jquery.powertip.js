var powerTip = {
	create : function(inputId, data, popupId, top, left) {
		jQuery("#"+popupId).remove();
		tipElement = jQuery('<div/>', { id: popupId, html: data})
			.attr("class", "n")
			.css("top", top)
			.css("left", left)
			.css("display", "block");
			if(inputId == 'company'){
				tipElement.css("border-color", "rgb(151, 151, 151)");
				tipElement.attr("class", "n_company");
			}
		jQuery("#"+inputId).parent().append(tipElement);
	},
	hide : function(popupId) {
		jQuery("#"+popupId).remove();
	}
};