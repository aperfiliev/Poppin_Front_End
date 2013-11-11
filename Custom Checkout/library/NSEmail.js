/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
var NSEmail = {
	getCartHtml : function(order, homeUrl) {
		if (!order)
			return '';
			
		var cartHead = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html lang="en"> \
		                <head> \
						<style type="text/css"> \
							body{font:11px/1.26 Arial, sans-serif;background: #fff;height: 100%;width: 100%;color:#000;} \
							a{color: #034691;} \
							a:hover{color: #000;} \
							.sub-total{float: right;padding: 0 10px;width: 205px;} \
							/* checkout-hold */ \
							.checkout-hold{padding:0 20px 10px;border:solid #a9a9a9;border-width:0 1px 1px 0;font-size:12px;} \
							.clearfix:before, .clearfix:after, .f-row:before, .f-row:after{content: "";display: table;} \
							.clearfix:after, .f-row:after{clear: both;} \
							.clearfix, .f-row{} \
							.main-container{padding:10px 0;} \
							/* content-part */ \
							.content-part{width:782px;} \
							/* main-wrapper */ \
							.main-wrapper{width:976px;margin:0 auto;} \
							/* cart-list */ \
							.cart-list{padding:0 10px;background:#f8f8f8;border:1px solid #d7d7d7;} \
							.cart-list td{padding:20px 5px;border-top:1px solid #c6c6c6;} \
							.cart-list tr:first-child td{border:none;} \
							.cart-list td.it-pict{padding-left:10px;vertical-align:middle;text-align:center;} \
							.cart-list h3{margin:0;font-size:11px;line-height:14px;} \
							.cart-list h3 a{color:#000;} \
							.cart-list h3 a:hover{color:#034691;} \
							.cart-list .field-count{display:block;width:30px;height:16px;padding:1px 4px;color:#000;font:11px/16px Arial, Helvetica, sans-serif;text-align:right;background:#fff;border:1px solid #7f9db9;} \
							/* order-summary */ \
							.order-summary{margin-bottom:0;background:#e5e5e5 url(../images/bg/ord-sum-btm.png) no-repeat 0 100%;} \
							.list-summary{padding:0;} \
							.list-summary li{overflow:hidden;zoom:1;color:#666;line-height:14px;font-weight:bold;padding:2px 0;} \
							.list-summary li span{float:left;width:116px;} \
							.list-summary li em{display:block;overflow:hidden;zoom:1;text-align:right;color:#000;font-style:normal;} \
							.list-summary li.total{color:#000;border-top:1px solid #8c8c8c;} \
						</style> \
						<link rel="stylesheet" type="text/css" href="http://shopping.netsuite.com/c.1329432/Test-Account-Salt/Reference_Checkout/css/style.css" /> \
						</head> \
						<body> \
					<div class="main-wrapper clearfix">  \
						<!-- main-container --> \
						<div class="main-container clearfix"> \
							<div class="heading-page clearfix"> \
							</div> \
							<!-- content-part --> \
							<div class="content-part fl-l clearfix"> \
								<!-- block --> \
								<div class="block checkout-hold clearfix"> \
									<!-- step 3 --> \
									<div class="checkout-step step-active clearfix"> \
										<!-- checkout-title --> \
										<div class="checkout-title no-bg clearfix"> \
										</div> \
									</div> \
									<!-- checkout-review --> \
									<div class="checkout-review clearfix">';
										

			var items = order.items;
			var cartItemList = '<div class="cart-list"> <table> <tbody>';
			if (items) {
				for(var i=0; i<items.length; i++) {
		
					cartItemList +=	'<tr><td class="it-pict"><a href="'+items[i].storeurl+'"><img width="100" src="'+homeUrl+items[i].storedisplaythumbnail +'" alt="product"></a></td> \
													<td class="it-title"> \
														<h3><a href="#">'+ items[i].storedisplayname2+'</a></h3> \
													</td> \
													<td class="it-price"> \
														<strong class="price">'+items[i].rate+'</strong> \
													</td> \
													<td class="it-count it-count-num">'+items[i].quantity+'</td> \
													<td class="it-total-price"><strong class="price">$'+items[i].amount+'</strong></td> \
												</tr>';
				}
			}								
			cartItemList +=			'</tbody></table></div>';

			var cartSummary = 		'<!-- sub-total --> \
										<div class="sub-total clearfix"> \
											<!-- order summary --> \
											<div class="block order-summary clearfix"> \
												<ul class="list-summary"> \
													<li><span>Subtotal</span><em>$'+order.summary.subtotal+'</em></li> \
													<li class="color-r"><span>Discount</span><em>-$'+order.summary.discounttotal+'</em></li> \
													<li><span>Tax</span><em class="color-gr">$'+order.summary.taxtotal+'</em></li> \
													<li><span>Shipping</span><em class="color-gr">$'+order.summary.shippingcost+'</em></li> \
													<li class="total"><span>Total</span><em>$'+order.summary.total+'</em></li> \
												</ul> \
											</div> \
										</div> \
									</div> \
								</div> \
							</div> \
						</div> \
					</div> \
				</body></html>';
					
		return cartHead + cartItemList + cartSummary;
	},


	// Email cart to customer's email address on record.
	emailCustomerCart : function() 	{
	
		var retobj = {"header": {"status":{"code":"SUCCESS","message":"success"}}, 
					  "result": {}
					};
		
		var order = nlapiGetWebContainer().getShoppingSession().getOrder().getFieldValues();
		var siteSettings = nlapiGetWebContainer().getShoppingSession().getSiteSettings();
		var company = siteSettings.displayname;
		var homeUrl = siteSettings.touchpoints.home;
		
		// Additional parameters could be added at the end of the home url. Strip this out because we only need the hostname for image links.
		if (homeUrl.lastIndexOf('/') > 0) {
			homeUrl = homeUrl.substring(0, homeUrl.lastIndexOf('/')); 
		}
		
		nlapiGetWebContainer().getShoppingSession().getCustomer().emailCustomer('Thanks you for visiting ' + company, this.getCartHtml(order, homeUrl));		
	}
};