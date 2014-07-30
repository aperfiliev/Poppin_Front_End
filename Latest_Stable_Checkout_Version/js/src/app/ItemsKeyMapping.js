// ItemsKeyMapping.js
// ------------------
// Holds the mapping of whats retuned by the search api / Commerce api for items
// to what is used all across the application.
// The main reason behind this file is that you may eventually want to change were an attribute of the item is comming from,
// for example you may want to set that the name of the items are store in a custom item field instead of the display name field,
// then you just change the mapping here instead of looking for that attribute in all templates and js files
(function () 
{
	'use strict';

	// itemImageFlatten: 
	// helper function that receives the itemimages_detail (returned by the search api) 
	// and flatens it into an array of objects containing url and altimagetext
	function itemImageFlatten (images)
	{
		if ('url' in images && 'altimagetext' in images)
		{
			return [images];
		}

		return _.flatten(_.map(images, function (item)
		{
			if (_.isArray(item))
			{
				return item;
			}

			return itemImageFlatten(item);
		}));
	}

	// This file can be used for multiple applications, so we avoided making it application specific 
	// by iterating the collection of defined applications.
	_.each(SC._applications, function (application)
	{
		// Makes double sure that the Configuration is there
		application.Configuration = application.Configuration || {};

		// Extends the itemKeyMapping configuration
		// The key mapping object is simple object were object keys define how the application is going to call it 
		// and values define from which key to read in the result of the search api
		// There are three posible ways to define a key mapping:
		//   - _key: "search_api_key" -- This means, Whenever I ask you for the _key returned anythig that you have in the search_api_key key of the item object
		//   - _key: ["search_api_key", "second_options"] -- similar as avobe, but if the 1st key in the array is falsy go and try the next one, it will retun the 1st truthful value
		//   - _key: function(item) { return "something you want"; } -- you can also set up a function that will recive the item model as argument and you can set what to return.
		application.Configuration.itemKeyMapping = _.extend(application.Configuration.itemKeyMapping || {}, {

			// Item Internal Id: used as a fallback to the url and to add to cart
			// You should not need to change this tho
			_id: 'internalid'

			// Item SKU number
		,   _sku: 'itemid'

			// Name of the item, some times displayname is empty but storedisplayname2 tends to be set always
		,   _name: function (item)
			{
				// If its a matrix child it will use the name of the parent
				if (item.get('_matrixParent').get('internalid') ) 
				{
					return item.get('_matrixParent').get('storedisplayname2') || item.get('_matrixParent').get('displayname');
				}

				// Otherways return its own name
				return item.get('storedisplayname2') || item.get('displayname');
			}

			// Page Title of the PDP
		,   _pageTitle: ['pagetitle', 'storedisplayname2', 'displayname']

			// h1 of the PDP and also the title of the modal
		,   _pageHeader: ['storedisplayname2', 'displayname']

		,	_keywords: 'searchkeywords'

		,	_metaTags: 'metataghtml'
			
			// This retuns the breadcrum json obj for the PDP
		,   _breadcrumb: function (item)
			{
				var breadcrumb = [{
					href: '/'
				,   text: _('Home').translate()
				}];
				
				if (item.get('defaultcategory_detail'))
				{
					var category_path = '';

					_.each(item.get('defaultcategory_detail'), function (cat)
					{
						category_path += '/'+cat.url;
						breadcrumb.push({
							href: category_path
						,   text: cat.label
						});
					});
				}

				breadcrumb.push({
					href: item.get('_url')
				,   text: item.get('_name')
				});
				
				return breadcrumb;
			}

			// Url of the item
		,   _url: function (item)
			{
				
				// If this item is a child of a matrix return the url of the parent
				if (item.get('_matrixParent') && item.get('_matrixParent').get('internalid'))
				{
					return item.get('_matrixParent').get('_url');
				}
				// if its a standar version we need to send it to the canonical url
				else if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD')
				{
					return item.get('canonicalurl');
				}
				// Other ways it will use the url component or a default /product/ID
				return item.get('urlcomponent') ? '/'+ item.get('urlcomponent') : '/product/'+ item.get('internalid');
			}

			// For an item in the cart it returns the url for you to edit the item
		,	_editUrl: function (item)
			{
				var url = (item.get('_matrixParent').get('_id')) ? item.get('_matrixParent').get('_url') : item.get('_url');

				// Appends the options you have configured in your item to the url
				url += item.getQueryString();

				// adds the order item id, the view will update the item in the cart instead of adding it  
				if (item.get('line_id'))
				{
					url += '&cartitemid='+ item.get('line_id');
				}

				return url;
			}

			// Object containing the url and the altimagetext of the thumbnail
		,   _thumbnail: function (item)
			{
				var item_images_detail = item.get('itemimages_detail') || {};

				// If you generate a thumbnail position in the itemimages_detail it will be used
				if (item_images_detail.thumbnail)
				{
					return item_images_detail.thumbnail;
				}

				// otherwise it will try to use the storedisplaythumbnail
				if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD' && item.get('storedisplaythumbnail'))
				{
					return {
						url: item.get('storedisplaythumbnail')
					,	altimagetext: item.get('_name')
					};
				}
				// No images huh? carry on

				var parent_item = item.get('_matrixParent');
				// If the item is a matrix child, it will return the thumbnail of the parent
				if (parent_item && parent_item.get('internalid'))
				{
					return parent_item.get('_thumbnail');
				}

				var images = itemImageFlatten(item_images_detail);
				// If you using the advance images features it will grab the 1st one
				if (images.length)
				{
					return images[0];
				}

				// still nothing? image the not available
				return {
					url: application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				};
			}

			// Array of objects containing the url and the altimagetext of the images of the item
		,	_images: function (item)
			{
				var result = []
				,	selected_options = item.itemOptions
				,	item_images_detail = item.get('itemimages_detail') || {}
				,   swatch = selected_options && selected_options[application.getConfig('multiImageOption')] || null;

				item_images_detail = item_images_detail.media || item_images_detail;
				
				if (swatch && item_images_detail[swatch.label])
				{
					result = itemImageFlatten(item_images_detail[swatch.label]);
				}
				else
				{
					result = itemImageFlatten(item_images_detail);
				}

				return result.length ? result : [{
					url: item.get('storedisplayimage') || application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				}];
			}

			// For matrix child items in the cart we generate this position so we have a link to the parent
		,	_matrixParent: 'matrix_parent'

			// For matrix parent items, where are the attribures of the children
		,   _matrixChilds: 'matrixchilditems_detail'

			// The definition of the options of items with options
		,   _optionsDetails: 'itemoptions_detail'

			// Related items 
		,   _relatedItems: 'related_items'

			// Item price information
		,   _priceDetails: 'onlinecustomerprice_detail'
		,	_price: function (item)
			{

				return item.get('onlinecustomerprice_detail').onlinecustomerprice;
			}

		,   _comparePriceAgainst: 'pricelevel1'
		,   _comparePriceAgainstFormated: 'pricelevel1_formatted'

			// Item Type
		,   _itemType: 'itemtype'

			// Stock, the number of items you have available
		,   _stock: 'quantityavailable'

		,	_minimumQuantity: function(item)
			{
				return item.get('minimumquantity') || 1;
			}

		,	_isInStock: 'isinstock'
		,	_isPurchasable: 'ispurchasable'
		,	_isBackorderable: 'isbackorderable'
		,	_showOutOfStockMessage: 'showoutofstockmessage'

			// Show the IN STOCK label, this can be configured in a per item basis
		,   _showInStockMessage: function ()
			{
				return false;
			}

			// Should we show the stock description? 
		,   _showStockDescription: function ()
			{
				return true;
			}

			// Stock Description, some times used to display messages like New Arrival, Ships in 3 days or Refubrished
		,   _stockDescription: 'stockdescription'

			// Stock Description class, we use this to add a class to the html element containig the _stockDescription so you can easily style it.
			// This implementation will strip spaces and other punctuations from the _stockDescription and prepend stock-description-
			// so if your _stockDescription is Ships in 3 days your _stockDescriptionClass will be stock-description-ships-in-3-days
		,   _stockDescriptionClass: function (item)
			{
				return 'stock-description-'+ item.get('_stockDescription') || ''.toLowerCase().replace(/\W+/g,'-').replace(/\-+/g,'-');
			}

			// What to write when the item is out of stock
		,   _outOfStockMessage: function (item)
			{
				return item.get('outofstockmessage') || _('Out of Stock').translate();
			}

			// What to write when the item is in stock
		,   _inStockMessage: function ()
			{
				return _('In Stock').translate();
			}

			// Reviews related item attributes

			// Overal item rating
		,   _rating: function (item)
			{
				return Math.round(item.get('custitem_ns_pr_rating') * 10) / 10 || 0;
			}

			// How many times this item was reviewd
		,   _ratingsCount: function (item)
			{
				return item.get('custitem_ns_pr_count') || 0;
			}

			// What are the posible attributes I want this item to be rated on
		,   _attributesToRateOn: function (item)
			{
				return item.get('custitem_ns_pr_item_attributes') && item.get('custitem_ns_pr_item_attributes').split(', ') || [];
			}

			// returns a object containing the average rating per atribute
		,   _attributesRating: function (item)
			{
				return JSON.parse(item.get('custitem_ns_pr_attributes_rating'));
			}

			// returns an object containig how many reviews it the item has for each particular rating
		,   _ratingsCountsByRate: function (item)
			{
				return item.get('custitem_ns_pr_rating_by_rate') && JSON.parse(item.get('custitem_ns_pr_rating_by_rate')) || {};
			}
		});
	});
})();