// Cart.js
// -------
// Defines the Cart module (Model, Collection, Views, Router)
// mountToApp handles some environment issues
// Add some function to the application
// * getCart()
// and to the layout
// * updateMiniCart()
// * showMiniCart()
// * showCartConfirmationModal()
// * goToCart()
// * showCartConfirmation()
define('Cart'
,	['LiveOrder.Model', 'Cart.Views', 'Cart.Router']
,	function (LiveOrderModel, Views, Router)
{
	'use strict';
	
	return {
		Views: Views
	,	Router: Router
	,	mountToApp: function (application, options)
		{
			var Layout = application.getLayout();
			
			// application.getCart():
			// Use it to acuire the cart model instance
			application.getCart = function ()
			{
				if (!application.cartInstance)
				{
					application.cartInstance = new LiveOrderModel({internalid: 'cart'});
					application.cartInstance.application = application;
				}
				
				return application.cartInstance;
			};

			_.extend(Layout.key_elements, {
				miniCart: '#mini-cart-container'
			,	miniCartSummary: '.mini-cart-summary'
			});
						
			// layout.updateMiniCart()
			// Updates the minicart by running the macro and updateing the miniCart key Element
			Layout.updateMiniCart = function ()
			{
				var cart = application.getCart();
				this.$miniCart.html(SC.macros.miniCart(cart, application));
				this.$miniCartSummary.html(SC.macros.miniCartSummary(cart.getTotalItemCount()));
			};
			
			// layout.showMiniCart()
			Layout.showMiniCart = function ()
			{
				jQuery(document).scrollTop(0);
				// Hide the modal
				Layout.$containerModal && Layout.$containerModal.length && Layout.$containerModal.modal('hide');
				this.$(Layout.key_elements.miniCart +' .dropdown-toggle').parent().addClass('open');
			};
			
			// layout.showCartConfirmationModal()
			Layout.showCartConfirmationModal = function ()
			{
				this.showInModal(new Views.Confirmation({
					layout: this
				,	application: application
				,	model: application.getCart()
				}));
			};
			
			// layout.goToCart()
			Layout.goToCart = function ()
			{
				Backbone.history.navigate('cart', { trigger: true });
			};
			
			// layout.showCartConfirmation()
			// This reads the configuration object and execs one of the fuctions avome 
			Layout.showCartConfirmation = function ()
			{
				// Available values are: goToCart, showMiniCart and showCartConfirmationModal
				Layout[application.getConfig('addToCartBehavior')]();
			};
			
			// Every time the cart changes the mini cart gets updated
			Layout.on('afterRender', function ()
			{
				application.getCart().on('change', function ()
				{
					Layout.updateMiniCart();
				});
			});
			
			// Initializes the router
			if (options && options.startRouter)
			{
				return new Router(application);
			}
		}
	};
});
