// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListDetails.View'
,	['ProductListItem.Collection','ProductListDeletion.View', 'ProductList.Model', 'ItemDetails.Model', 'ProductListLists.View', 'ProductListAddedToCart.View', 'ProductListItemEdit.View', 'ProductListItem.Model', 'ProductListControl.Views']
,	function (ProductListItemCollection, ProductListDeletionView, ProductListModel, ItemDetailsModel, ProductListListsView, ProductListAddedToCartView, ProductListItemEditView, ProductListItemModel, ProductListControlViews)
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'product_list_details'
		
	,	attributes: {'class': 'ProductListDetailsView'}
		
	,	events: {
			// lists events
			'change [data-action="show"]' : 'filterView'
		,	'change [data-action="sort-by"]' : 'sortBy'
		,	'click [data-action="display-option"]' : 'changeDisplayOption'		

			// items events
		,	'click [data-action="add-to-cart"]' : 'addItemToCartHandler'
		,	'click [data-action="delete-item"]' : 'askDeleteListItem'
		,	'click [data-action="edit-item"]' : 'askEditListItem'
		,	'click [data-ui-action="show-edit-notes"]' : 'showEditNotes'
		,	'click [data-ui-action="cancel-edit-notes-form"]' : 'showViewNotes'
		,	'click [data-ui-action="plus-one"]' : 'addPlusOne'
		,	'click [data-ui-action="minus-one"]' : 'addMinusOne'
		,	'click [data-action="add-list-to-cart"]': 'addListToCart_'

		,	'click [data-action="edit-list"]': 'editListHandler'
		,	'click [data-action="delete-list"]': 'deleteListHandler'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.model = options.model;
			this.application = options.application;
			this.cart = this.application.getCart();			
			this.displayOptions = this.application.Configuration.product_lists.itemsDisplayOptions; 
			this.title = this.model.get('name');
			
			// set css class for the current display option
			this.$el.addClass('display-' + this.getCurrentDisplayOpt());		
		}

		// Navigates through backbone to a specific url given the urlParameters
	,	navigateTo: function (urlParameters)
		{
			this.options.params = _.extend(this.options.params, {id: this.model.get('internalid')}, urlParameters);

			var query = this.urlQueryParams(this.options.params);
			
			Backbone.history.navigate('/productlist/' + this.options.params.id + query, {trigger: true});
		}

		// Generate query params url
		// TODO: I think there's a method in utils.js for this
	,	urlQueryParams: function (params)
		{
			var query_params = []
			,	query = '';

			if (params.sortBy)
			{
				query_params.push({
					key: 'sortBy'
				,	value: params.sortBy
				});
			}

			if (params.show)
			{
				query_params.push({
					key: 'show'
				,	value: params.show
				});
			}

			if (params.display)
			{
				query_params.push({
					key: 'display'
				,	value: params.display
				});
			}

			_(query_params).each(function (q, i)
			{
				if (i === 0)
				{
					query += '/?' + q.key + '=' + q.value;
				}
				else
				{
					query += '&' + q.key + '=' + q.value;
				}
			});

			return query;
		}

		// add this list to cart handler
	,	addListToCart_: function ()
		{
			this.addListToCart(this.model);
		}
	
	,	addListToCart: ProductListListsView.prototype.addListToCart

	,	showConfirmationMessage: ProductListListsView.prototype.showConfirmationMessage

	,	showWarningMessage: ProductListListsView.prototype.showWarningMessage
	
		// Filter listed items
	,	filterView: function ()
		{
			//TODO: filter list items
		}

		// Re-sort the list of item inside a product list
	,	sortBy: function (e)
		{
			this.navigateTo({
				sortBy: e.target.value
			});
		}

		// Change the list view according to the display option selected (default: Full View)
	,	changeDisplayOption: function (e)
		{		
			e.preventDefault();
			this.navigateTo({
				display: this.$(e.target).parent('a').data('nav')
			});
		}	

		// Retrieve current selected display option or 'list' by default
	,	getCurrentDisplayOpt: function ()
		{			
			return (this.options.params && this.options.params.display) || 'list';			
		}

		// Shows the delete confirmation modal view
	,	askDeleteListItem : function (e)
		{
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete item').translate()
			,	body_text: _('Are you sure you want to remove this item?').translate()
			,	confirm_delete_method: 'deleteListItemHandler'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// Add a particular item into the cart
	,	addItemToCartHandler : function (e)
		{
			e.preventDefault();

			var self = this
			,	error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate()
			,	product_list_itemid = self.$(e.target).closest('article').data('id')			
			,	selected_item = self.model.get('items').findWhere({
					internalid: product_list_itemid.toString()
				})

			,	selected_product_list_item = self.model.get('items').findWhere({
					internalid: product_list_itemid.toString()
				})

			,	item_detail = self.getItemForCart(selected_item.get('item').internalid, selected_product_list_item.get('quantity'), selected_product_list_item.get('options'));
			
			this.addItemToCart(item_detail).done(function(){
				self.showConfirmationMessage(_('Good! The item was successfully added to your cart. You can continue to <a href="#" data-touchpoint="viewcart">view cart and checkout</a>').translate()); //TODO: links

				self.addedToCartView = new ProductListAddedToCartView({
					application: self.application
				,	parentView: self
				,	item: selected_item
				});
				self.application.getLayout().showInModal(self.addedToCartView); 

			}).fail(function(){
				// TODO: Handle error message display
				console.log(error_message);
			}); 
		}

		// Gets the ItemDetailsModel for the cart
	,	getItemForCart: function (id, qty, opts)
		{
			return new ItemDetailsModel({
				internalid: id
			,	quantity: qty
			,	options: opts
			});
		}

		// Adds the item to the cart
	,	addItemToCart: function (item)
		{
			return this.cart.addItem(item);
		}

		// Product list item deletion handler
	,	deleteListItemHandler: function (target)
		{			
			var self = this
			,	itemid = jQuery(target).closest('article').data('id')
			,	product_list_item = this.model.get('items').findWhere({
					internalid: itemid + ''
				});

			var success = function ()
			{
				self.application.getLayout().updateMenuItemsUI();
				self.deleteConfirmationView.$containerModal.modal('hide');
				self.showConfirmationMessage(_('The item was removed from your product list').translate()); 
			};

			self.application.getProductLists().where({internalid: self.model.id })[0].get('items').remove(product_list_item);
			self.deleteListItem(product_list_item, success);			
		}
		// Remove an product list item from the current list
	,	deleteListItem: function (product_list_item, succesFunc)
		{
			this.model.get('items').remove(product_list_item);
			return product_list_item.destroy({success: succesFunc});
		}

		// Edit a product list item from the current list
	,	askEditListItem : function(e)
		{
			var product_list_itemid = this.$(e.target).closest('article').data('id')			
			,	selected_item = this.model.get('items').findWhere({
				internalid: product_list_itemid.toString()
			});

			this.editView = new ProductListItemEditView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	model: selected_item
			,	title: _('Edit Item').translate()
			,	confirm_edit_method: 'editListItemHandler'
			});

			this.editView.showInModal();
		}

		// Product list item edition handler
	,	editListItemHandler: function (product_list_item)
		{
			var self = this
			,	edit_result = product_list_item.save();

			if (!edit_result)
			{
				return;
			}

			edit_result.done(function (new_attributes)
			{
				var new_model = new ProductListItemModel(new_attributes);

				self.model.get('items').add(new_model, {merge: true});
				self.editView.$containerModal.modal('hide');
				self.editView.destroy();
				self.render();
			});
		}

		// Retrieve the current (if any) items display option
	,	getDisplayOption: function ()
		{		
			var search = this.options.params.display || 'list';
			return _(this.displayOptions).findWhere({
				id: search
			});
		}

	,	render: function() 
		{
			Backbone.View.prototype.render.apply(this, arguments);

			var self = this
			,	out_of_stock_items = []
			,	items = this.model.get('items')
			,	is_single_list = this.application.ProductListModule.isSingleList();

			items.each(function(item) {				
				if (!item.get('item').ispurchasable)
				{
					out_of_stock_items.push(item);
				}				

				self.renderOptions(item);

				if (!is_single_list)
				{
					self.renderMove(item);
				}
				
			});

			var warning_message = null;

			if (out_of_stock_items.length === 1)
			{
				warning_message =  '$(0) of $(1) items in your list is currently not available for purchase. If you decide to add the list to your cart, only available products will be added.';
			}
			else if (out_of_stock_items.length > 1)
			{
				warning_message =  '$(0) of $(1) items in your list are currently not available for purchase. If you decide to add the list to your cart, only available products will be added.';
			}

			if (warning_message)
			{
				self.showWarningMessage(_(warning_message).translate(out_of_stock_items.length, items.length));
			}
		}

		// Render the item options (matrix and custom)
	,	renderOptions: function (pli_model)
		{	
			var item_detail_model = pli_model.get('itemDetails');
			var posible_options = item_detail_model.getPosibleOptions();
			
			// Will render all options with the macros they were configured
			this.$('article[data-id="' + pli_model.id + '"]').find('div[data-type="all-options"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	exclude = _.map(($container.data('exclude-options') || '').split(','), function (result)
					{
						return jQuery.trim(result);
					})
				,	result_html = '';

				_.each(posible_options, function (posible_option)
				{
					if (!_.contains(exclude, posible_option.cartOptionId))
					{
						result_html += item_detail_model.renderOptionSelected(posible_option);
					}
				});

				$container.append(result_html);

				if(result_html.length === 0)
				{
					$container.remove();
				}
			});
		}

		// Renders the move control for a product list
	,	renderMove: function (product_list_model)
		{
			var self = this;

			var container = this.$('article[data-id="' + product_list_model.id + '"]').find('div[data-type="productlist-control-move"]');
			var control = new ProductListControlViews.Control({
				collection: self.getMoveLists(self.application.getProductLists(), self.model, product_list_model)
			,	product: product_list_model.get('item')
			,	application: self.application
			,	moveOptions: 
				{ 
					parentView: self
				,	productListItem: product_list_model
				}
			});
			
			jQuery(container).empty().append(control.$el);
			control.render();
		}

		// Filters all lists so it does not include the current list and the lists where the item is already present
	,	getMoveLists: function (all_lists, current_list, list_item)
		{
			return all_lists.filtered( function(model)
			{
				return model.get('internalid') !== current_list.get('internalid') &&
					!model.get('items').find(function (product_item)
					{
						return product_item.get('item').internalid+'' === list_item.get('item').internalid+''; 
					});
			});
		}

		// Shows the edit modal view
	,	editListHandler: function(event)
		{	
			event.preventDefault();
			ProductListListsView.prototype.editList.apply(this, [this.model]); 
		}

		// Shows the delete modal view
	,	deleteListHandler: function(event)
		{
			event.preventDefault();
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: null
			,	title: _('Delete list').translate()
			,	body_text: _('Are you sure you want to remove this list?').translate()
			,	confirm_delete_method: 'deleteList'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// Delete confirm callback
	,	deleteList: function()
		{
			var self = this
			,	list = this.model;
			this.application.getProductLists().remove(list); 
			list.url = ProductListModel.prototype.url; //TODO: remove this, it was a fix because something was overwritten this property in our models

			list.destroy().done(function ()
			{				
				self.deleteConfirmationView.$containerModal.modal('hide');	
				Backbone.history.navigate('/productlists', {trigger: true}); 
				self.application.getLayout().updateMenuItemsUI();
				self.application.getLayout().currentView.showConfirmationMessage(
					_('Your $(0) list was removed').
						translate('<span class="product-list-name">' + list.get('name') + '</span>')
				);			
			}); 
		}

		// Get the label for showContent()
	,	getViewLabel: function ()
		{
			return 'productlist_' + (this.model.get('internalid') ? this.model.get('internalid') : 'tmpl_' + this.model.get('templateid')); 
		}

		// override showContent() for showing the breadcrumb
	,	showContent: function()
		{
			var breadcrumb = [
				{
					text: _('Product Lists').translate(),
					href: '/productlists'
				}
			,	{
					text: this.model.get('name'),
					href: '/productlist/' + (this.model.get('internalid') ? this.model.get('internalid') : 'tmpl_' + this.model.get('templateid'))
				}
			]; 
			if (this.application.ProductListModule.isSingleList())
			{
				breadcrumb.splice(0, 1); //remove first
			}
			this.application.getLayout().showContent(this, this.getViewLabel(), breadcrumb); 
		}

	});
});
