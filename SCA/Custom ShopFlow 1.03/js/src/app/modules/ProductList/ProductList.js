// ProductList.js
// -----------------
// Defines the ProductList module (Model, Views, Router). 
define('ProductList',
['ProductListControl.Views', 'ProductListDetails.View', 'ProductList.Collection','ProductList.Model','ProductListItem.Collection','ProductListItem.Model', 'ProductList.Router','ProductListDeletion.View', 'ProductListCreation.View', 'ProductListLists.View'],
function (ProductListControlViews, ProductListDetailsView, ProductListCollection, ProductListModel, ProductListItemCollection, ProductListItemModel, ProductListRouter, ProductListDeleteView, ProductListCreateView, ProductListListsView)
{
	'use strict';

	// ProductLists myaccount's menu items. This is a good example of dynamic-multilevel myaccount's menuitems definition.
	var productlists_menuitems = function(application) 
	{
		if (!application.ProductListModule.isProductListEnabled()) 
		{
			return undefined;
		}

		return {

			id: function (application)
			{
				// Returns the correct id of the list in the case of single list and 'productlists' otherwise.
				var is_single_list = application.ProductListModule.isSingleList(); 
				if (is_single_list) 
				{
					var the_single_list = application.getProductLists().at(0);
					// Check if it's a predefined list before return
					return 'productlist_' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateid')));
				}
				else
				{
					return 'productlists';
				}
			}
		,	name: function (application)
			{
				// The name of the first list in the case of single list or generic 'Product Lists' otherwise
				return application.ProductListModule.isSingleList() ? 
					application.getProductLists().at(0).get('name') :
					_('Product Lists').translate();
			}
		,	url: function (application)
			{				
				// Returns a link to the list in the case of single list and no link otherwise.
				var is_single_list = application.ProductListModule.isSingleList(); 
				if(is_single_list) 
				{
					var the_single_list = application.getProductLists().at(0); 
					return 'productlist/' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateid'))); 
				}
				else 
				{
					return ''; 
				}
			}
			// Index of the menu item for menu order
		,	index: 2
			// Sub-menu items
		,	children: function (application) 
			{
				// If it's single list, there is no sub-menu
				if (application.ProductListModule.isSingleList())
				{
					return [];
				}
				// The first item (if not single list) has to be a link to the landing page
				var items = [
					{
						id: 'productlist_all'
					,	name: _('All my lists').translate()
					,	url: 'productlists/?'
					,	index: 1
					}
				];
				// Then add all the lists
				application.getProductLists().each(function (productlist)
				{
					items.push({
						id: 'productlist_' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateid'))
					,	url: 'productlist/' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateid'))
					,	name: productlist.get('name') + '&nbsp;(' + productlist.get('items').length + ')'
					,	index: 2
					}); 
				});				
				return items; 

				/*
				// alternative configuration example: separating in public and private sub levels: 
				var public_lists = application.getProductLists().filter(function(productlist)
					{
						return productlist.get('scope').name === 'public'; 
					})
				,	private_lists = application.getProductLists().filter(function(productlist)
					{
						return productlist.get('scope').name === 'private'; 
					})
				,	private_lists_menu_items = _(private_lists).map(function(productlist){
						return {
							id: 'productlist_' + productlist.get('internalid')
						,	url: 'productlist/' + productlist.get('internalid')
						,	name: productlist.get('name')
						,	index: 1
						};
					})
				,	public_lists_menu_items = _(public_lists).map(function(productlist){
						return {
							id: 'productlist_' + productlist.get('internalid')
						,	url: 'productlist/' + productlist.get('internalid')
						,	name: productlist.get('name')
						,	index: 1
						};
					}); 
				return [
					{
						name: _('All lists').translate()
					,	url: 'productlists/?'
					,	index: 1
					}
				,	{
						name: _('Public').translate()
					,	children: public_lists_menu_items
					,	index: 3
					}
				,	{
						name: 'Private'
					,	children: private_lists_menu_items
					,	index: 2
					}
				]; 
				*/
			}
		}; 
	}; 

	// Encapsulate all product list elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var ProductListModule = function()
	{
		var app = {};
		// this application will render some of its views in existing DOM elements (placeholders)
		var placeholder = {
			control: '[data-type="product-lists-control"]'
		};

		var views = {
				Control: ProductListControlViews
			,	Details: ProductListDetailsView
			,	NewList: ProductListCreateView
			,	Lists: ProductListListsView
			,	Delete: ProductListDeleteView
			}
		,	models = {
				ProductList: ProductListModel
			,	ProductListItem: ProductListItemModel
			}
		,	collections = {
				ProductList: ProductListCollection
			,	ProductListItem: ProductListItemCollection
			};

		// is the Product-List functionality available for this application ?
		var isProductListEnabled = function () 
		{
			var application = app;

			return application.getConfig('product_lists') !== undefined; 
		};

		// are we in the single-list modality ? 
		var isSingleList = function ()
		{
			var application = app;

			return !application.getConfig('product_lists.additionEnabled') && 
				application.getConfig('product_lists.list_templates') && 
				application.getConfig('product_lists.list_templates').length === 1 ;
		};

		var mountToApp = function (application)
		{
			app = application;

			// Product Lists model singleton - should be loaded in starter.js
			application.getProductLists = function ()
			{
				if (!application.productListsInstance)
				{
					application.productListsInstance =  new ProductListCollection({application: application});
				}
				return application.productListsInstance;
			};

			// obtain a single ProductList with all its item's data
			application.getProductList = function (id)
			{
				var productList = new ProductListModel();

				productList.set('internalid', id);
				
				return productList.fetch();
			};

			// Application.ProductListModule - reference to this module
			application.ProductListModule = ProductListModule;

			// rendering subscriptions
			application.ProductListModule.renderProductLists();
			
			application.getLayout().on('afterAppendView', function (view)
			{
				application.ProductListModule.renderProductLists(view);
			});

			application.getLayout().on('afterAppendToDom', function ()
			{
				application.ProductListModule.renderProductLists();
			});

			ProductListItemModel.prototype.keyMapping = application.getConfig('itemKeyMapping', {});

			ProductListItemModel.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);

			// always start our router.
			var router =  new ProductListRouter(application);

			return router;
		};

		// renders the control used in shopping pdp and quickview
		var renderControl = function (view_)
		{	
			var application = app;

			jQuery(placeholder.control).each(function()
			{
				var view = view_ || application.getLayout().currentView
				,	is_single_list_mode = application.ProductListModule.isSingleList()
				,	$container = jQuery(this);

				// this control needs a reference to the StoreItem model !
				if (view && view.model && view.model.getPosibleOptions)
				{
					var control = null;

					if (is_single_list_mode)
					{
						control = new ProductListControlViews.ControlSingle({
							collection: application.getProductLists()
						,	product: view.model
						,	application: application
						});
					}
					else 
					{
						control = new ProductListControlViews.Control({
							collection: application.getProductLists()
						,	product: view.model
						,	application: application
						});
					}

					$container.empty().append(control.$el);
					control.render();
				}
			}); 
		};

		// render all product-lists related widgets
		var renderProductLists = function (view)
		{	
			var application = app;
			if (!application.ProductListModule.isProductListEnabled())
			{
				return;
			}

			//global variable with the customer internalid. TODO: stop using it! use application.getUser().get('internalid') instead
			SC.ENVIRONMENT.customer_internalid = application.getUser().get('internalid'); 

			application.ProductListModule.renderControl(view);
		};

		// Gets the internal product id for a store item considering it could be a matrix child. TODO: move this to ItemDetails.Model.
		var internalGetProductId = function (product)
		{
			// If its matrix its expected that only 1 item is selected, not more than one nor 0 
			if (product.getPosibleOptions().length)
			{
				var selected_options = product.getSelectedMatrixChilds();

				if (selected_options.length === 1)
				{
					return selected_options[0].get('internalid') + '';
				}
			}

			return product.get('_id') + '';
		};

		return {
			Views : views
		,	Models: models
		,	Collections: collections
		,	Router: ProductListRouter
		,	isProductListEnabled: isProductListEnabled
		,	isSingleList: isSingleList
		,	mountToApp: mountToApp
		,	renderControl: renderControl
		,	renderProductLists: renderProductLists
		,	internalGetProductId: internalGetProductId
		,	placeholder: placeholder
		,	MenuItems: productlists_menuitems
		};

	}();

	return ProductListModule;

});
