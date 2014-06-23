// Facets.Views.js
// ---------------
// View that handles the item list
define('Facets.Views', ['Cart', 'Facets.Helper', 'Categories'], function (Cart, Helper, Categories)
{	
	'use strict';

	var Views = {}
		// statuses stores the statuses of the collapsible for use of the
	,	statuses = window.statuses = {};
	
	Views.Browse = Backbone.View.extend({
		
		template: 'facet_browse'
	,	page_header: _('<b>$(0)</b> Products').translate('{itemscount}')
	,	description: _('This is a description').translate()
		
	,	attributes: {
			'id': 'facet-browse'
		,	'class': 'view facet-browse'
		}
		
	,	events: {
			'click [data-toggle="collapse"]': 'clickCollapsable'
		,	'click [data-toggle="facet-navigation"]': 'toggleFacetNavigation'
		,	'slide div[data-toggle="slider"]': 'updateRangeValues'
		,	'stop div[data-toggle="slider"]': 'updateRangeSelection'
		,	'submit [data-toggle="add-to-cart"]': 'addToCart'
		}

	,	initialize: function (options)
		{
			this.statuses = statuses;
			this.translator = options.translator;
			this.application = options.application;
			//this.category = Categories.getBranchLineFromPath(this.translator.getFacetValue('category'))[0];
			this.category = Categories.getFilteredPoppinTree();
		}

	,	getPath: function ()
		{
			var canonical = window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment
			,	index_of_query = canonical.indexOf('?');

			// !~ means: indexOf == -1
			return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
		}

	,	getCanonical: function ()
		{
			var canonical_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page > 1)
			{
				canonical_url += '?page=' + current_page;
			}

			return canonical_url;
		}

	,	getRelPrev: function ()
		{
			var previous_page_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page > 1)
			{
				if (current_page === 2)
				{
					return previous_page_url;
				}

				if (current_page > 2)
				{
					return previous_page_url += '?page=' + (current_page - 1);
				}
			}

			return null;
		}
	
	,	getRelNext: function ()
		{
			var next_page_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page < this.totalPages)
			{
				return next_page_url += '?page='+ (current_page + 1);
			}

			return null;
		}

		// view.renderFacets:
		// Generates a new translator, grabs the facets of the model, 
		// look for elements with data-type="facet" or data-type="all-facets"
		// and then execute all the macros and injects the results in the elements
	,	renderFacets: function (url)
		{
			var self = this
			,	translator = Helper.parseUrl(url, this.options.translatorConfig)
			,	facets = this.model.get('facets');

			this.$('div[data-type="facet"]').each(function (i, nav)
			{
				var $nav = jQuery(nav).empty()
				,	facet_id = $nav.data('facet-id')
				,	facet_config = translator.getFacetConfig( facet_id )
				,	facet_macro = $nav.data('facet-macro') || facet_config.macro || self.application.getConfig('macros.facet')
				,	facet = _.find(facets, function (facet) {
						return facet.id === facet_id;
					});
				if (facet_id == "category") {
					var options = {
							categoryTree : Categories.getFilteredPoppinTree()
						};
					$nav.append( SC.macros[ facet_macro ](translator, facet_config, facet, options) );
				} else {
					$nav.append( SC.macros[ facet_macro ](translator, facet_config, facet) );					
				}
			});
			
			this.$('div[data-type="all-facets"]').each(function (i, nav)
			{
				var $nav = jQuery(nav).empty()
				,	exclude = _.map( ( $nav.data('exclude-facets') || '').split(','), function (result) {
						return jQuery.trim( result );
					})
				,	ordered_facets = facets && facets.sort(function (a, b) {
						// Default Prioriry is 0
						return (translator.getFacetConfig(b.id).priority || 0) - (translator.getFacetConfig(a.id).priority || 0);
					})
				,	content = '';

				_.each(ordered_facets, function (facet)
				{
					var facet_config = translator.getFacetConfig(facet.id);
					if ( !_.contains(exclude, facet.id) )
					{
						content += SC.macros[facet_config.macro || self.application.getConfig('macros.facet')](translator, facet_config, facet);
					}
				});

				$nav.append( content );
			});
			
			this.$('[data-toggle="collapse"]').each(function (index, collapser)
			{
				self.fixStatus(collapser);
			});

			this.$('[data-toggle="slider"]').slider();
		}
		
		// view.fixStatus:
		// Tries to keep the status of the collapeser based on what they were previously setted
	,	fixStatus: function (collapser)
		{
			var $collapser = jQuery(collapser)
			,	$facet = $collapser.closest('div[data-type="rendered-facet"]')
			,	$placeholder = $collapser.closest('div[data-type="all-facets"], div[data-type="facet"]')
			,	$target = jQuery( $collapser.data('target') );
			
			// Checks the path in the Status object is present
			this.statuses[$placeholder.attr('id')] = this.statuses[$placeholder.attr('id')] || {};
			this.statuses[$placeholder.attr('id')][$facet.data('facet-id')] = this.statuses[$placeholder.attr('id')][$facet.data('facet-id')] || {};

			if (_.isUndefined(this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')]))
			{
				if ($collapser.data('type') !== 'collapse' && !$target.hasClass('in'))
				{
					this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')] = false;
				}
				else
				{
					this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')] = !this.translator.getFacetConfig($facet.data('facet-id')).collapsed;
				}
			}
			
			if (this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')])
			{
				$target.addClass('in').removeClass('collapse');
			}
			else
			{
				$target.addClass('collapse').removeClass('in');
			}
			
			this.toggleCollapsableIndicator($collapser, !this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')]);
		}

		//view.formatFacetTitle: accepts a facet object and returns a string formatted to be displayed on the document's title according with user facet configuration property titleToken
	,	formatFacetTitle: function (facet)
		{
			var defaults = {
				range: '$(2): $(0) to $(1)'
			,	multi: '$(1): $(0)'
			,	single: '$(1): $(0)'
			}; 

			if (facet.id === 'category')
			{
				//we search for a category title starting from the last category of the branch
				var categories = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category')); 
				if(categories && categories.length > 0)
				{
					for(var i = categories.length - 1; i >= 0; i--)
					{
						var category = categories[i]; 
						var category_title = category.pagetitle || category.itemid;
						if(category_title)
						{
							return category_title; 
						}
					}
				}
				return null;
			}

			if (!facet.config.titleToken)
			{
				facet.config.titleToken = defaults[facet.config.behavior] || defaults.single; 
			}
			if (_.isFunction(facet.config.titleToken))
			{
				return facet.config.titleToken(facet);
			}
			else if (facet.config.behavior === 'range') 
			{
				return _(facet.config.titleToken).translate(facet.value.to, facet.value.from, facet.config.name); 
			}
			else if (facet.config.behavior === 'multi') 
			{
				var buffer = []; 
				_.each(facet.value, function (val)
				{
					buffer.push(val); 
				}); 
				return _(facet.config.titleToken).translate(buffer.join(', '), facet.config.name); 
			}
			else 
			{
				return _(facet.config.titleToken).translate(facet.value, facet.config.name); 
			}
		}

		// overrides Backbone.Views.getTitle
	
	,   getSubcategoryImage: function () {
		var categories = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category')); 
		if(categories && categories.length > 0)
		{
			var category = categories[categories.length - 1]; 
			return category.storedisplayimage; 
		}
		return null;
	}
	
	,	getTitle: function ()
		{
			if (this.title)
			{
				return this.title;
			}

			var facets = this.options.translator.facets
			,	title = '';

			if (facets && facets.length)
			{
				var buffer = []
				,	facet = null;

				for (var i = 0; i < facets.length; i++)
				{
					facet = facets[i];
					buffer.push(this.formatFacetTitle(facet));

					if (i < facets.length - 1)
					{
						buffer.push(facet.config.titleSeparator || ', ');
					}
				}

				title = this.application.getConfig('searchTitlePrefix', '') + 
						buffer.join('') + 
						this.application.getConfig('searchTitleSufix', ''); 
			}
			else if (this.translator.getOptionValue('keywords'))
			{
				title = _('Search results for "$(0)"').translate(
					this.translator.getOptionValue('keywords')
				);
			}
			else
			{
				title = this.application.getConfig('defaultSearchTitle', '');
			}

			return title;
		}
		
		// view.showContent:
		// Works with the title to find the proper wording and calls the layout.showContent
	,	showContent: function ()
		{
			// If its a free text search it will work with the title
			var keywords = this.translator.getOptionValue('keywords')
			,	resultCount = this.model.get('total')
			,	self = this;

			if (keywords)
			{
				keywords = decodeURIComponent(keywords);
				
				if (resultCount > 0)
				{
					this.subtitle =  resultCount > 1 ? _('Results for "$(0)"').translate(keywords) : _('Result for "$(0)"').translate(keywords);
				}
				else
				{
					this.subtitle = _('We couldn\'t find any items that match "$(0)"').translate(keywords);
				}
			}

			this.totalPages = Math.ceil(resultCount / this.translator.getOptionValue('show'));
			// once the showContent is done the afterAppend is called
			this.application.getLayout().showContent(this).done(function ()
			{
				// Looks for placeholders and injects the facets
				self.renderFacets(self.translator.getUrl());
			});
		}

		// view.clickCollapsable
	,	clickCollapsable: function (e)
		{
			var $target = jQuery(e.target);

			if (!($target.is('a') || $target.parent().is('a')))
			{
				this.toggleCollapsableIndicator(e.target);
			}
		}
		
		// view.toggleCollapsableIndicator
		// Handles the collapsables and store the status
	,	toggleCollapsableIndicator: function (element, is_open)
		{
			var $element = jQuery(element).closest('*[data-toggle="collapse"]'),
				$facet_container = $element.closest('div[data-type="rendered-facet"]');

			is_open = _.isUndefined(is_open) ? jQuery($element.data('target')).hasClass('in') : is_open;

			$element
				.find('*[data-collapsed!=""]')
				.filter('[data-collapsed="true"]')[is_open ? 'hide' : 'show']().end()
				.filter('[data-collapsed="false"]')[is_open ? 'show' : 'hide']();

			var holder_html_id = $facet_container.parent().attr('id')
			,	facet_id = $facet_container.data('facet-id')
			,	type = $element.data('type');

			this.statuses[holder_html_id][facet_id][type] = !is_open;
		}

		// view.updateRangeValues
		// Talks to the Bootstrap.Slider.js 
		// Displays the numbers under the slider while you are slider 
	,	updateRangeValues: function (e, slider)
		{
			var $container = slider.$element.closest('div[data-type="rendered-facet"]')
			,	parser = this.translator.getFacetConfig( $container.data('facet-id') ).parser
			,	start = _.isFunction(parser) ? parser(slider.values.low, true) : slider.values.low
			,	end = _.isFunction(parser) ? parser(slider.values.high, false) : slider.values.high;
			
			$container
				.find('span[data-range-indicator="start"]').html(start).end()
				.find('span[data-range-indicator="end"]').html(end);
		}
		
		// view.updateRangeSelection
		// Talks to the Bootstrap.Slider.js 
		// Once the user releases the Slider controller this takes care of
		// generating a new url and of navigating to it 
	,	updateRangeSelection: function (e, slider)
		{
			var facet_id = slider.$element.data('facet-id')
			,	translator = this.translator
				// the currently selected slider values
			,	slider_values = slider.values
				// currently selected values for that facet
			,	facet_values = translator.getFacetValue(facet_id)
				// facet for the slider
			,	facet = _.find(this.model.get('facets'), function (item) {
					return item.id === facet_id;
				})
				// available values for that facet
			,	values = _.map(facet.values, function (item) {
					return parseFloat(item.url);
				});

			// if the low selected value equals the minimum available value
			// and the high selected value equals the maximum available value
			if (_.min(values) === slider_values.low && _.max(values) === slider_values.high)
			{
				// then we remove the facet from the selection
				Backbone.history.navigate(translator.cloneWithoutFacetId(facet_id).getUrl(), {trigger: true});
			}
			// else, if there are not values selected OR
			// the selected from value is different than the slider low value OR
			// the selected to value is different than the slider high value
			else if (!facet_values || parseFloat(facet_values.from) !== slider_values.low || parseFloat(facet_values.to) !== slider_values.high)
			{
				// then we navigate to that page
				Backbone.history.navigate(translator.cloneForFacetId(facet_id, {
					from: slider_values.low.toFixed(2)
				,	to: slider_values.high.toFixed(2)
				}).getUrl(), {trigger: true});
			}
		}

		// view.addToCart
		// Adds the item to the cart
	,	addToCart: function (e)
		{
			e.preventDefault();

			var options = jQuery(e.target).serializeObject()
			,	model = this.model.get('items').get(options.item_id);

			// Updates the quantity of the model
			model.setOption('quantity', options.quantity);

			if (model.isReadyForCart())
			{
				var self = this
				,	cart = this.application.getCart()
				,	layout = this.application.getLayout()
				,	cart_promise = jQuery.Deferred()
					// TODO: this hardcoded error message should be here?
				,	error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate();

				if (model.cartItemId)
				{
					cart_promise = cart.updateItem(model.cartItemId, model).success(function ()
					{
						if (cart.getLatestAddition())
						{
							if (self.$containerModal)
							{
								self.$containerModal.modal('hide');
							}
							
							if (layout.currentView instanceof require('Cart').Views.Detailed)
							{
								layout.currentView.showContent();
							}	
						}
						else
						{
							self.showError(error_message);
						}
					});
				}
				else
				{
					cart_promise = cart.addItem(model).success(function ()
					{
						if (cart.getLatestAddition())
						{
							layout.showCartConfirmation();
						}
						else
						{
							self.showError(error_message);
						}
					});
				}

				// disalbes the btn while it's being saved then enables it back again
				if (e && e.currentTarget)
				{
					jQuery('input[type="submit"]', e.currentTarget).attr('disabled', true);
					cart_promise.always(function () {
						jQuery('input[type="submit"]', e.currentTarget).attr('disabled', false);
					});	
				}
			}
		}
		// view.getBreadcrumb:
		// It will generate an array suitable to pass it to the breadcrumb macro
		// It looks in the category facet value
	,	getBreadcrumb: function ()
		{
			var category_string = this.translator.getFacetValue('category')
			,	breadcrumb = [{
					href: '/'
				,	text: _('Home').translate()
				}];
			
			if (category_string)
			{
				var category_path = '';
				_.each(Categories.getBranchLineFromPath(category_string), function (cat)
				{
					category_path += '/'+cat.urlcomponent;
					
					breadcrumb.push({
						href: category_path
					,	text: _(cat.itemid).translate()
					});
				});
				
			}
			else if (this.translator.getOptionValue('keywords'))
			{
				breadcrumb.push({
					href: '#'
				,	text: _('Search Results').translate()
				});
			}
			else
			{
				breadcrumb.push({
					href: '#'
				,	text: _('Shop').translate()
				});
			}
			
			return breadcrumb;
		}

		// view.toggleFacetNavigation
		// Hides/Shows the facet navigation area
	,	toggleFacetNavigation: function ()
		{
			this.$el.toggleClass('narrow-by');
			this.toggleNavigationListener(this.$el.hasClass('narrow-by'));
		}

		// view.toggleNavigationListener
		// adds/removes event listeners to the HTML to hide the facet navigation area
	,	toggleNavigationListener: function (isOn)
		{
			var self = this
			,	touch_started = null;

			// turn listeners on
			if (isOn)
			{
				jQuery('html')
					// we save the time when the touchstart happened
					.on('touchstart.narrow-by', function ()
					{
						touch_started = new Date().getTime();
					})
					// code for touchend and mousdown is the same
					.on('touchend.narrow-by mousedown.narrow-by', function (e)
					{
						// if there wasn't a touch event, or the time difference between
						// touch start and touch end is less that 200 miliseconds
						// (this is to allow scrolling without closing the facet navigation area)
						if (!touch_started || new Date().getTime() - touch_started < 200)
						{
							var $target = jQuery(e.target);

							// if we are not touching the narrow by button or the facet navigation area
							if (!$target.closest('[data-toggle="facet-navigation"]').length && !$target.closest('#faceted-navigation').length)
							{
								// we hide the navigation
								self.toggleFacetNavigation();
							}	
						}
					});
			}
			else
			{
				jQuery('html')
					// if the navigation area is hidden, we remove the event listeners from the HTML
					.off('mousedown.narrow-by touchstart.narrow-by touchend.narrow-by');
			}
		}

	});

	
	Views.BrowseCategories = Backbone.View.extend({
		
		template: 'category_browse'

	,	initialize: function ()
		{
			var self = this;
			this.category = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category'))[0];
			this.translator = this.options.translator;

			this.hasThirdLevelCategories = _.every(this.category.categories, function (sub_category)
			{
				return _.size(sub_category.categories) > 0;
			});

			this.facets = [];

			if (this.hasThirdLevelCategories)
			{
				_.each(this.category.categories, function (sub_category)
				{
					var facet = {
						configuration: {
							behavior: 'single'
						,	id: 'category'
						,	name: sub_category.itemid
						,	uncollapsible: false
						,	collapsed : true
						,	url: self.category.urlcomponent + '/' + sub_category.urlcomponent			
						}
					,	values: {
							id: 'category' 
						,	values: []
						}
					};
					_.each(sub_category.categories, function (third_level_category)
					{
						var url = self.category.urlcomponent + '/' + sub_category.urlcomponent + '/' + third_level_category.urlcomponent;

						facet.values.values.push({
							label: third_level_category.itemid
						,	url: url
						,	image: third_level_category.storedisplaythumbnail
						});
					});

					self.facets.push(facet);
				});
			}
			else
			{
				var facet = {
					configuration: {
						behavior: 'single'
					,	id: 'category'
					,	name: ''
					,	uncollapsible: true
					,	hideHeading: true
					}
				,	values: {
						id: 'category' 
					,	values: []
					}
				};
				
				_.each(this.category.categories, function (sub_category)
				{
					var url = self.category.urlcomponent + '/' + sub_category.urlcomponent;

					facet.values.values.push({
						label: sub_category.itemid
					,	url: url
					,	image: sub_category.storedisplaythumbnail
					});
				});

				this.facets.push(facet);
			}
		}

	,	getBreadcrumb: Views.Browse.prototype.getBreadcrumb

	,	getTitle: function ()
		{
			return this.category.pagetitle || this.category.itemid;
		}
	});
	
	return Views;
});
