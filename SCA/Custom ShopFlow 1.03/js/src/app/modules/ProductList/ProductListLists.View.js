// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListLists.View'
,	['ProductListDetails.View', 'ProductList.Model', 'ProductListItem.Collection', 'ProductListCreation.View', 'ItemDetails.Model', 'ProductListAddedToCart.View', 'ProductListDeletion.View']
,	function (ProductListDetailsView, ProductListModel, ProductListItemCollection, ProductListCreationView, ItemDetailsModel, ProductListAddedToCartView, ProductListDeletionView)
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'product_list_lists'
		
	,	title: _('Product Lists').translate()
	
	,	attributes: {'class': 'ProductListListsView'}
		
	,	events:
		{
			'change [data-action="sort-by"]': 'sortBy'
		,	'click [data-action="add-list"]': 'createProductList'
		,	'click [data-action="delete-list"]': 'askDeleteList'
		,	'click [data-action="edit-list"]': 'editListHandler'
		,	'click [data-action="share-list"]': 'shareList'
		,	'click [data-action="add-to-cart"]': 'addListToCartHandler'
		}

	,	initialize: function (options)
		{			
			this.options = options;
			this.application = options.application;
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments); 
			//if there are no list we show the list creation form
			if (!this.collection.length) 
			{
				this.newProductListView = new ProductListCreationView({
					application: this.application
				,	parentView: this
				,	model: new ProductListModel() //create!
				});
				this.newProductListView.render();
				this.$('[data-type="new-product-list"]').append(this.newProductListView.$el);
			}			
		}

	,	sortBy: function ()
		{
			// TODO: sortBy implementation 
		}

		// Show create new product list modal form
	,	createProductList: function ()
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: new ProductListModel() //create!
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		// starts the 'delete a list' use case
	,	askDeleteList: function (e)
		{
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete list').translate()
			,	body_text: _('Are you sure you want to remove this list?').translate()
			,	confirm_delete_method: 'deleteListHandler'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);				
		}

		// called from the sub view when the user confirms he wants to delete the product list.
	,	deleteListHandler: function(target) 
		{
			var self = this
			,	list = this.getListFromDom(jQuery(target)); 

			this.collection.remove(list); 
			list.url = ProductListModel.prototype.url;

			list.destroy().done(function ()
			{
				self.application.getLayout().updateMenuItemsUI();
				self.showConfirmationMessage(
					_('Your $(0) list was removed').
						translate('<span class="product-list-name">' + list.get('name') + '</span>')
				);
				self.deleteConfirmationView.$containerModal.modal('hide');				
			}); 
		}

		//TODO: move this to extras/Backbone.View parent class.
	,	showConfirmationMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'success', true));
			this.$('[data-confirm-message]').empty().append($msg_el); 
			setTimeout(function() 
			{
				jQuery('[data-confirm-message]').fadeOut(3000); 
			}, 5000); 
		}

		//TODO: move this to extras/Backbone.View parent class.
	,	showWarningMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'warning', true));
			
			this.$('[data-confirm-message]').empty().append($msg_el);			
		}

		// temporarily highlights a list that has been recently added or edited 
	,	highlightList: function (internalid)
		{
			var $list_dom = jQuery(this.el).find('article[data-product-list-id='+ internalid +']');
			if ($list_dom)
			{
				$list_dom.addClass('new-list');

				setTimeout( function ()
				{
					$list_dom.removeClass('new-list');
				},3000);
			}
		}

		// Add list to cart click handler
	,	addListToCartHandler: function (e)
		{
			e.preventDefault();

			var list_id = jQuery(e.target).closest('[data-product-list-id]').data('product-list-id') + ''
			,	list = this.options.collection.findWhere({
					internalid: list_id
				});

			this.addListToCart(list); 
		}

		// Adds an entire list to the cart
	,	addListToCart: function (list)
		{
			// collect the items data to add to cart
			var add_items = []
			,	self = this
			,	not_purchasable_items_count = 0; 

			list.get('items').each(function (item)
			{
				var store_item = item.get('item');

				if (store_item.ispurchasable)
				{
					add_items.push(new ItemDetailsModel({
						internalid: store_item.internalid
					,	options: item.get('options')
					,	quantity: item.get('quantity')
					}));
				}
				else
				{
					not_purchasable_items_count++;
				}			
			});

			if (add_items.length === 0)
			{
				var errorMessage = _('All items in the list are not available for purchase.').translate();

				self.showWarningMessage(errorMessage); 

				return;
			}

			// add the items to the cart and when its done show the confirmation view
			this.application.getCart().addItems(add_items).done(function ()
			{
				// before showing the confirmation view we need to fetch the items of the list with all the data. 
				self.application.getProductList(list.get('internalid')).done(function(model) 
				{
					self.addedToCartView = new ProductListAddedToCartView({						
						application: self.application
					,	parentView: self
					,	list: new ProductListModel(model) //pass the model with all the data
					,	not_purchasable_items_count: not_purchasable_items_count
					});

					// also show a confirmation message
					var confirmMessage;
					if(list.get('items').length > 1)
					{
						confirmMessage =  _('Good! $(1) items from your $(0) list were successfully added to your cart. You can continue to <a href="">view your cart and checkout</a>').
						translate('<a class="product-list-name" href="/productlist/' + list.get('internalid') + '">'+list.get('name')+'</a>', list.get('items').length);
					}
					else
					{
						confirmMessage =  _('Good! $(1) item from your $(0) list was successfully added to your cart. You can continue to <a href="" data-touchpoint="viewcart">view your cart and checkout</a>').
						translate('<a class="product-list-name" href="/productlist/' + list.get('internalid') + '">'+list.get('name')+'</a>', list.get('items').length);
					}
					
					self.showConfirmationMessage(confirmMessage); 
					self.application.getLayout().showInModal(self.addedToCartView); 
				});	
			}); 
		}

		// Edit list click handler
	,	editListHandler: function (e) 
		{
			var list = this.getListFromDom(jQuery(e.target)); 
			this.editList(list); 
		}

		// Get the list (collection) from dom
	,	getListFromDom: function ($target)
		{
			var list_id = $target.closest('[data-product-list-id]').data('product-list-id') + ''; 
			return this.options.collection.where({internalid: list_id})[0];
		}

		// Edit list click handler (displays edit list modal view)
	,	editList: function (list)
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: list
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		// Get the label for showContent()
	,	getViewLabel: function ()
		{
			return 'productlist_all';
		}

		// override showContent() for showing the breadcrumb
	,	showContent: function()
		{
			this.application.getLayout().showContent(this, this.getViewLabel(), [{
				text: _('Product Lists').translate(),
				href: '/productlists'
			}]);
		}

	});
});
