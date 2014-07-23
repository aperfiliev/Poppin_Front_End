if (jQuery('form#newcust').length) {
	_gaq.push(['_trackPageview','/checkout-register']);
} else {
	if (jQuery('form#login').length) {
		_gaq.push(['_trackPageview','/checkout-login']);
	} else {
		var mainForm = jQuery('form#main_form');
		if(mainForm.length){
			if (jQuery('input#category',mainForm).val() == 'billing') {
				 _gaq.push(['_trackPageview','/checkout-address']);
			}
		} else {
			var checkoutForm = jQuery('form#checkout');
			if (checkoutForm.length) {
				var category = jQuery('input[name=category]', checkoutForm).val();
				switch (category) {
					case 'paymeth':
						_gaq.push(['_trackPageview','/checkout-paymeth']);
						break;
					case 'shipping':
						_gaq.push(['_trackPageview','/checkout-shipping']);
						break;
					case 'confirm':
						_gaq.push(['_trackPageview','/checkout-confirm']);
						break;
					case 'thanks':
						_gaq.push(['_trackPageview','/checkout-thanks']);
						break;
				}
			} else {
				_gaq.push(['_trackPageview']);
			}
		}
	}
}