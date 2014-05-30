// ProductListItemEdit.View.js
// -----------------------
// View to handle Product Lists Item edition.
define('ProductListItemEdit.View', ['ProductListItem.Model'], function (ProductListItemModel)
{
	'use strict';
	
	// TODO: repeated code
	function getItemOptions(itemOptions)
	{
		var result = {};

		_.each(itemOptions, function (value, name)
		{
			result[name] = { value: value.internalid, displayvalue: value.label };
		});

		return result;
	}

	return Backbone.View.extend({
		template: 'product_list_edit_item'
		
	,	title: _('Edit item').translate()

	,	page_header: _('Edit item').translate()

	,	events : 
		{
			'click [data-action="edit"]' : 'edit'
		,	'blur [data-toggle="text-option"]': 'setOption'
		,	'click [data-toggle="set-option"]': 'setOption'
		,	'change [data-toggle="select-option"]': 'setOption'

		,	'change [name="quantity"]': 'updateQuantity'
		,	'keypress [name="quantity"]': 'ignoreEnter'

		,	'change [name="description"]': 'updateDescription'
		,	'keypress [name="description"]': 'ignoreEnter'

		,	'change [name="priority"]': 'updatePriority'

		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'
		
		}

	,	initialize: function (options)
		{			
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;

			if (!options.model)
			{
				throw new Error('A model is needed');
			}

			var attrs = jQuery.extend(true, {}, options.model.attributes);

			this.model = new ProductListItemModel(attrs);
			this.confirm_edit_method = options.confirm_edit_method;
		}

		// Edit the current item
	,	edit: function()
		{	
			var item_detail_model = this.model.get('itemDetails');

			if (item_detail_model.isSelectionComplete())
			{
				this.$('[data-action="edit"]').attr('disabled', 'true');
				this.$('[data-action="cancel"]').attr('disabled', 'true');

				this.model.set('options', getItemOptions(item_detail_model.itemOptions));
				this.model.set('item', { id: this.application.ProductListModule.internalGetProductId(item_detail_model) });
				
				this.parentView[this.confirm_edit_method](this.model);
			}	
		}

		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			var new_quantity = parseInt(jQuery(e.target).val(), 10)
			,	current_quantity = this.model.get('quantity');

			new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

			jQuery(e.target).val(new_quantity);

			if (new_quantity !== current_quantity)
			{
				this.model.set('quantity', new_quantity);
				this.storeFocus(e);	
			}
		}	

		// Updates the description of the model
	,	updateDescription: function (e)
		{			
			var new_description = jQuery(e.target).val()
			,	current_description = this.model.get('description');

			if (new_description !== current_description)
			{
				this.model.set('description', new_description);
				this.storeFocus(e);	
			}
		}	

		// Updates the priority of the model
	,	updatePriority: function (e)
		{
			var new_priority = jQuery(e.target).val()
			,	current_priority = this.model.get('priority');

			if (new_priority !== current_priority)
			{
				this.model.set('priority', { id: new_priority } );
				this.storeFocus(e);
			}
		}

		// Sets an item option (matrix or custom)
	,	setOption: function (e)
		{
			var $target = jQuery(e.target)
			,	value = $target.val() || $target.data('value') || null
			,	cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');

			// Prevent from going away
			e.preventDefault();
			
			// if option is selected, remove the value
			if ($target.data('active'))
			{
				value = null;
			}

			var item_detail_model = this.model.get('itemDetails');

			// it will fail if the option is invalid 
			try 
			{
				item_detail_model.setOption(cart_option_id, value);
			}
			catch (error)
			{
				// Clears all matrix options 
				_.each(item_detail_model.getPosibleOptions(), function (option)
				{
					option.isMatrixDimension && item_detail_model.setOption(option.cartOptionId, null);
				});
				
				// Sets the value once again
				item_detail_model.setOption(cart_option_id, value);
			}
			
			this.storeFocus(e);
			this.render();
		}

		// view.storeFocus
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a history point
	,	storeFocus: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? SC.Utils.getFullPathForElement(focused_element) : null;
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered, 
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e) 
		{
			this.hideError();

			// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
			this.tabNavigation = (e.type === 'keydown' && e.which === 9);
			this.tabNavigationUpsidedown = e.shiftKey;
			this.tabNavigationCurrent = SC.Utils.getFullPathForElement(e.target);
		}

	,	afterAppend: function ()
		{
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}
		}

		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'product_list_edit_item';
			
			return this.application.getLayout().showInModal(this, options);
		}	

		// don't want to trigger form submit when user presses enter when in the quantity input text
	,	ignoreEnter: function (e) 
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				e.stopPropagation();
			}
		}
	});
});
