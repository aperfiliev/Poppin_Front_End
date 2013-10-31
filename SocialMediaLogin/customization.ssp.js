$("td.text:last").html("<div class='phoneDiv'>866 &#8226; 926 &#8226; 4922</div>");

$(".breadcrumbs").css("display", "none");

var popuphtml = '<p class="popup_header">Ready to make your mark?</p>'
	+'<p class="popup_text">Give us a call to get started 866.926.4922</p>';

$(".customization_item").mouseenter(function(){
	var item_id = $(this).children(":first").attr('id');
	this.popupTimeout = setTimeout(function() {
		powerTip.create(item_id, popuphtml, 'popup'+item_id, -262, 281);
	}, 3000);
});

$(".customization_item").mouseleave(function(){
	var item_id = $(this).children(":first").attr('id');
	clearTimeout(this.popupTimeout);
	powerTip.hide('popup'+item_id);
});