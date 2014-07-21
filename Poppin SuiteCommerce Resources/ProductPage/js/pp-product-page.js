$j(function(){
	//Product view
	if($j('.tabs-container').length > 0){
		$j('.tabs-container').gpTabs();
	}
	//Item list carousel
	if($j('.td-correlated-cell').length > 0){
		$j('.td-correlated-cell').gpItemListCarousel({quantityMove: 2});
	}
	
	var big_message = $j('.product-message-bottom .big-message span').html();
	if (big_message.length == 0) {
		$j('.product-message-bottom').hide();
	}

	var price_text = $j('.price-container').text();
	price_text = price_text.replace(/\$|\.00/g, '');
	var price_html = '<span class="currency-symbol">$</span><span class="price">' + price_text + '</span>';
	$j('.price-container').html(price_html);

	if($j('.wrap-price .custom-detail').text() == ''){
		$j('.wrap-price').addClass('single-price');
	}

	var custopts = $j("#custcol10").scCutsomOptions();
	if (custopts.length) {
		custopts.closest("table").after("<div class='choose'>CHOOSE YOUR INITIAL</div>");
		custopts.hide().closest("tr").hide();
		$j(".colors-list li").each(function(i) {
			if (!(i % 5))
				this.className = "first";
		});
	}	
});


(function() {
	if (typeof jQuery !== "undefined" && jQuery !== null) {
		jQuery(function() {
			var hide_add_to_cart;
			hide_add_to_cart = (function() {
				var count = 1;
				return function() {
					var $bsn_save;
					$bsn_save = jQuery('#bsn_save');
					if ($bsn_save.length) {
						if ($bsn_save.css('display') === 'block') {
							count = false;
							$bsn_save.closest('.right-content').addClass('item-out-of-stock');
							return $bsn_save.parent().parent().find('.addto').hide();
						} else {
							if (count && count < 10) {
								return setTimeout(function() {
									count += 1;
									return hide_add_to_cart();
								}, 400);
							}
						}
					}
				};
			})();
			return hide_add_to_cart();
		});
	}
}).call(this);

