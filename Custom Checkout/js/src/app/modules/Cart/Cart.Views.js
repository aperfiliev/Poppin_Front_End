// Cart.Views.js
// -------------
// Cart and Cart Confirmation views
define('Cart.Views', ['ErrorManagement'], function (ErrorManagement)
{
	'use strict';

	var Views = {}
	,	colapsibles_states = {};

	// Views.Detailed:
	// This is the Shopping Cart view
	Views.Detailed = Backbone.View.extend({
		
		template: 'shopping_cart'
		
	,	title: _('Shopping Cart').translate()
		
	,	page_header: _('Shopping Cart').translate()
		
	,	attributes: { 
			'id': 'shopping-cart'
		,	'class': 'view shopping-cart' 
		}
		
	,	events: {
			'blur [name="quantity"]': 'updateItemQuantity'
		,	'submit [data-action="update-quantity"]': 'updateItemQuantity'
		
		,	'click [data-action="remove-item"]': 'removeItem'

		,	'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'

		,	'submit form[data-action="estimate-tax-ship"]': 'estimateTaxShip'
		,	'click [data-action="remove-shipping-address"]': 'removeShippingAddress'
		,	'change [data-action="estimate-tax-ship-country"]': 'changeCountry'
		}
		
		// showContent:
		// initializes tooltips.
		// TODO: NOT NECESARY WITH LATEST VERSION OF BOOTSTRAP
		// calls the layout's default show content method
	,	showContent: function ()
		{
			return this.options.application.getLayout().showContent(this, true).done(function (view)
			{
				view.$('[data-toggle="tooltip"]').tooltip({html: true});
			});
		}

	,	hideError: function (selector)
		{
			var el = (selector)? selector.find('[data-type="alert-placeholder"]') : this.$('[data-type="alert-placeholder"]');
			el.empty();
		}

	,	showError: function (message, line, error_details)
		{

			this.hideError();
			var placeholder;

			if (line)
			{
				// if we detect its a rolled back item, (this i an item that was deleted 
				// but the new options were not valid and was added back to it original state)
				// We will move all the references to the new line id
				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					var new_line_id = error_details.newLineId;

					line.attr('id', new_line_id);

					line.find('[name="internalid"]').attr({
						id: 'update-internalid-' + new_line_id
					,	value: new_line_id
					});
				}

				placeholder = line.find('[data-type="alert-placeholder"]');
				this.hideError(line);
			}
			else 
			{
				placeholder = this.$('[data-type="alert-placeholder"]');
				this.hideError();
			}
			// Finds or create the placeholder for the error message
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append( 
				SC.macros.message( message, 'error', true ) 
			);

			// Re Enables all posible disableded buttons of the line or the entire view
			if (line)
			{
				line.find(':disabled').attr('disabled', false);
			}
			else
			{
				this.$(':disabled').attr('disabled', false);
			}
		}
		
		// updateItemQuantity:
		// executes on blur of the quantity input
		// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: function (e)
		{
			e.preventDefault();

			var self = this
			,	$line = null
			,	options = jQuery(e.target).closest('form').serializeObject()
			,	line = this.model.get('lines').get(options.internalid);

			if (parseInt(line.get('quantity'),10) !==  parseInt(options.quantity,10))
			{
				line.set('quantity', options.quantity);

				$line = this.$('#' + options.internalid);

				this.model.updateLine(line)
					.success(_.bind(this.showContent, this))
					.error(
						function (jqXhr)
						{
							jqXhr.preventDefault = true;
							var result = JSON.parse(jqXhr.responseText);

							self.showError(result.errorMessage, $line, result.errorDetails);
						}
					);
			}
		}
		
		// removeItem: 
		// handles the click event of the remove button
		// removes the item from the cart model and saves it.
	,	removeItem: function (e)
		{
			this.model.removeLine(this.model.get('lines').get(jQuery(e.target).data('internalid')))
				.success(_.bind(this.showContent, this));
		}
		
		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			e.preventDefault();
			
			this.$('[data-type=promocode-error-placeholder]').empty();
			
			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

			this.model.save({ promocode: { code: options.promocode } }).success(
				function()
				{
					self.showContent();
				}
			).error(
				function (jqXhr) 
				{
					self.model.unset('promocode');
					jqXhr.preventDefault = true;
					var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
					self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
					$target.find('input[name=promocode]').val('').focus();
				}
			).always(
				function(){
					// enable inputs and buttons
					$target.find('input, button').prop('disabled', false);
				}
			);
		}

		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({ promocode: null }, { 
				success: function()
				{
					self.showContent();
				}
			});
		}
		
		// estimateTaxShip
		// Sets a fake address with country and zip code based on the options.
	,	estimateTaxShip: function (e)
		{
			e.preventDefault();

			var options = jQuery(e.target).serializeObject()
			,	self = this;
			
			var address_internalid = options.zip + '-' + options.country + '-null';
			this.model.get('addresses').push({
				internalid: address_internalid
			,	zip: options.zip
			,	country: options.country
			});
			this.model.set('shipaddress', address_internalid);

			this.model.save().success(function()
			{
				self.showContent();
			});
		}

		// removeShippingAddress:
		// sets a fake null address so it gets removed by the backend
	,	removeShippingAddress: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({ shipmethod: null, shipaddress: null }).success(function () {
				self.showContent();
			});
		}

	,	changeCountry: function(e)
		{
			e.preventDefault();
			this.storeColapsiblesState();
			var options = jQuery(e.target).serializeObject();

			var AddressModel = this.model.get('addresses').model;
			this.model.get('addresses').add(new AddressModel({ country: options.country, internalid: options.country }));
			this.model.set({ shipaddress: options.country });

			this.showContent().done(function(view){
				view.resetColapsiblesState();
			});
			
		}
		
	,	resetColapsiblesState: function ()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[ is_in ? 'addClass' : 'removeClass' ]('in').css('height',  is_in ? 'auto' : '0');
			});
		}

	,	storeColapsiblesState: function ()
		{
			this.storeColapsiblesStateCalled = true;
			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}	
	});

	// Views.Confirmation:
	// Cart Confirmation Modal
	Views.Confirmation = Backbone.View.extend({
		
		template: 'shopping_cart_confirmation_modal'
	
	,	title: _('Added to Cart').translate()
	
	,	page_header: _('Added to Cart').translate()
	
	,	attributes: {
			'id': 'shopping-cart'
		,	'class': 'cart-confirmation-modal shopping-cart'
		}
	
	,	events: { 
			'click [data-trigger=go-to-cart]': 'dismisAndGoToCart'
		}
	
	,	initialize: function (options)
		{
			this.line = options.model.getLatestAddition();
		}
		
		
		// dismisAndGoToCart
		// Closes the modal and calls the goToCart 
	,	dismisAndGoToCart: function (e)
		{
			e.preventDefault();

			this.$containerModal.modal('hide');
			this.options.layout.goToCart();
		}
	});

	return Views;
});
