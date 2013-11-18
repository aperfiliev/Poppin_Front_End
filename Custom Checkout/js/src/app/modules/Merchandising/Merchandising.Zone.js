// Merchandising.Zone
// ------------------
define('Merchandising.Zone'
,	['Merchandising.ItemCollection', 'Merchandising.Rule', 'Merchandising.Context']
,	function (MerchandisingItemCollection, MerchandisingRule, MerchandisingContext)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	var MerchandisingZone = function MerchandisingZone (element, options)
	{
		this.$element = jQuery(element).empty();
		// we try to get the model based on option.id (if passed) or the elements data id
		this.model = MerchandisingRule.Collection.getInstance().get(
			options.id || this.$element.data('id')
		);

		if (this.model)
		{
			var layout = options.application.getLayout();

			this.options = options;
			this.application = options.application;
			this.items = new MerchandisingItemCollection();
			this.context = new MerchandisingContext(layout.modalCurrentView || layout.currentView);

			this.initialize();
		}
	};

	_.extend(MerchandisingZone.prototype, {

		initialize: function ()
		{
			this.addLoadingClass();
			// the listeners MUST be added before the fetch ocurrs
			this.addListeners();

			// add the error handling
			this.items.fetch({
				cache: true
			,	data: this.getApiParams()
			});
		}

	,	addListeners: function ()
		{
			// [jQuery.proxy](http://api.jquery.com/jQuery.proxy/)
			var proxy = jQuery.proxy;

			this.items.on({
				sync: proxy(this.excludeItems, this)
			,	excluded: proxy(this.appendItems, this)
			,	appended: proxy(this.removeLoadingClass, this)
			,	error: proxy(this.handleRequestError, this)
			});
		}

		// pre: this.model and this.options must be defined
	,	getApiParams: function ()
		{
			var filters = this.parseApiFilterOptions()
			,	sorting = this.parseApiSortingOptions();

			if (sorting.length)
			{
				filters.sort = sorting.join(',');
			}
			
			// # Response
			// parameters to be passed to the item's fetch query
			return _.extend({
				limit: this.getLimit()
			,	fieldset: this.model.get('fieldset')
			}, filters);
		}

	,	parseApiFilterOptions: function ()
		{
			var	filters = {};

			// parses the merchandising rule filters into the filters obj
			_.each(this.model.get('filter'), function (rule_filter)
			{
				filters[rule_filter.field_id] = rule_filter.field_value;
			});

			return this.context.getFilters(filters, this.model.get('within'));
		}

	,	parseApiSortingOptions: function ()
		{
			// turn sorting obj into a string for the query
			return _.map(this.model.get('sort'), function (value)
			{
				return value.field_id +':'+ value.dir;
			});
		}

		// if there are items to get excluded from the collection
		// we need to ask for more items from the api
		// because the filtering gets done after the request
	,	getLimit: function ()
		{
			var model = this.model
			,	limit = model.get('show')
			,	exclude = model.get('exclude');
			
			if (exclude.length)
			{
				if (_.contains(exclude, '$cart'))
				{
					limit += this.application.getCart().get('lines').length;
				}
				
				if (_.contains(exclude, '$current'))
				{
					limit += this.context.getIdItemsToExclude().length;
				}
			}
			
			return limit <= 100 ? limit : 100;
		}

	,	excludeItems: function ()
		{
			var self = this;

			_.each(this.model.get('exclude'), function (filter)
			{
				self.applyFilterToItems(filter);
			});

			this.items.trigger('excluded');

			return this;
		}

		// narrows down the collection if excludes set up on the merchandising rule
	,	applyFilterToItems: function (filter)
		{
			var self = this;

			switch (filter)
			{
			case '$cart':

				var id = 0
				,	item = null;

				this.application.getCart().get('lines').each(function (line)
				{
					item = line.get('item');
					id = item.get('_matrixParent').get('_id') || item.get('_id');

					self.items.remove(self.items.get(id));
				});

			break;

			case '$current':

				_.each(this.context.getIdItemsToExclude(), function (id)
				{
					self.items.remove(self.items.get(id));
				});

			break;
			}

			return this;
		}
		
		// pre: this.$element must be defined
	,	appendItems: function ()
		{
			var items = this.items;

			if (items.length)
			{
				// we try to get the 'template' from either
				// the merchandising rule or the default configuration
				var model = this.model
				,	application = this.application
				,	template = SC.macros[model.get('template')] || SC.macros[application.getConfig('macros.merchandisingZone')];

				// then we append the parsed template to the element
				this.$element.append(
					template({
						application: application
					,	title: model.get('title')
					,	description: model.get('description')
					,	items: _.first(items.models, model.get('show'))
					})
				);
			}

			items.trigger('appended');

			return this;
		}

	,	loadingClassNames: 'loading loading-merchandising-zone'

	,	addLoadingClass: function ()
		{
			this.$element.addClass(this.loadingClassNames);
		}

	,	removeLoadingClass: function ()
		{
			this.$element.removeClass(this.loadingClassNames);
		}

	,	handleRequestError: function ()
		{
			this.removeLoadingClass();
			console.error('Merchandising Zone - Request Error', arguments);
		}
	});

	return MerchandisingZone;
});