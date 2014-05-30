// Merchandising.Context.DefaultHandlers
// -------------------------------------
// Registers a set of 'default handlers', this handlers are called
// depending on the execution context (current view they are in when beeing called)
// The following handlers are required for correct funtionality of the Merchandising Zone module:
// * getFilterValues
//   returns an array with the values of a specific filter in the current view
// * getIdItemsToExclude
//   returns an array with the ids of the items in the current view
define('Merchandising.Context.DefaultHandlers'
,	['Merchandising.Context', 'Facets.Views', 'ItemDetails.View', 'Cart.Views']
,	function (MerchandisingContext, FacetsViews, ItemDetailsView, CartViews)
{
	'use strict';
	// TODO: FOR GOD SAKE ADD SOME COMMENTS!

	// REVIEW: variable name
	var DefaultContextHandlers = {

		// REVIEW: function name
		mergeFilterValues: function (current_values, facet_values)
		{
			return _.union(

				_.reject(current_values, function (value)
				{
					return value === '$current';
				})

			,	facet_values || []
			);
		}

		// REVIEW: function name
	,	parseValues: function (filters, callback)
		{
			_.each(filters, function (values, key)
			{
				values = DefaultContextHandlers.mergeFilterValues(values, callback(values, key));

				if (values.length)
				{
					filters[key] = values.join(',');
				}
				else
				{
					delete filters[key];
				}
			});

			return filters;
		}

	,	includeFacetsToFilters: function (facets, filters)
		{
			var facet_id = ''
			,	facet_values = [];

			_.each(facets, function (facet)
			{
				facet_id = facet.id;
				facet_values = facet.value;

				facet_values = _.isArray(facet_values) ? facet_values : [facet_values];

				if (filters.hasOwnProperty(facet_id))
				{
					facet_values = _.union(filters[facet_id], facet_values);
				}

				filters[facet_id] = facet_values;
			});

			return filters;
		}

	,	itemListHandlers: {

			getFilters: function (filters, isWithin)
			{
				var facets = this.view.translator.facets;

				if (isWithin)
				{
					filters = DefaultContextHandlers.includeFacetsToFilters(facets, filters);
				}

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					var facet_values = [];

					if (_.contains(values, '$current'))
					{
						var current_facet = _.findWhere(facets, {id: key});

						facet_values = current_facet && current_facet.value || [];

						if (!_.isArray(facet_values))
						{
							facet_values = [facet_values];
						}
					}

					return facet_values;
				});
			}

			// [_.pluck](http://underscorejs.org/#pluck)
		,	getIdItemsToExclude: function ()
			{
				return this.view.model.get('items').pluck('internalid');
			}
		}

	,	getItemValues: function (facets, field_id)
		{
			return _.pluck(_.findWhere(facets, {
				id: field_id
			}).values, 'url');
		}

	,	itemDetailsHandlers: {
			// depending on the item's attributes
			getFilters: function (filters, isWithin)
			{
				var facets = this.view.model.get('facets');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return DefaultContextHandlers.getItemValues(facets, key);
					}
				});
			}

			// there is only one it, we return its id
			// notice: we are returning it inside of an array
		,	getIdItemsToExclude: function ()
			{
				return [this.view.model.get('internalid')];
			}
		}

	,	getCartLineItemValue: function (item, filter_id)
		{
			var value = item.get(filter_id);

			if (!value)
			{
				var selected = _.findWhere(
					item.getPosibleOptions(), {itemOptionId: filter_id}
				);

				value = selected ? item.getOption(selected.cartOptionId).label : null;
			}

			return value;
		}

		// returns an array with the values
		// [_.compact](http://underscorejs.org/#compact)
		// [_.map](http://underscorejs.org/#map)
	,	getCartItemValues: function (items, filter_id)
		{
			return _.compact(items.map(function (line)
			{
				return MerchandisingContext.escapeValue(
					DefaultContextHandlers.getCartLineItemValue(line.get('item'), filter_id)
				);
			}));
		}

	,	cartDetailedHandlers: {

			getFilters: function (filters, isWithin)
			{
				var items = this.view.model.get('lines');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return DefaultContextHandlers.getCartItemValues(items, key);
					}
				});
			}

			// for each if the lines in the cart, we return either:
			// * the id of the matrix parent, if its a matrix
			// * the id of the line.item, if its not
		,	getIdItemsToExclude: function ()
			{
				var id = 0
				,	item = null;

				// [_.map](http://underscorejs.org/#map)
				return _.map(this.view.model.get('lines'), function (line)
				{
					item = line.get('item');
					id = item.get('_matrixParent').get('_id') || item.get('_id');

					return id;
				});
			}
		}

	,	cartConfirmationHandlers: {

			// returns the value of the attribute in the view's line item
			getFilters: function (filters, isWithin)
			{
				var item = this.view.line.get('item');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return MerchandisingContext.escapeValue(
							DefaultContextHandlers.getCartLineItemValue(item, key)
						);
					}
				});
			}

			// returns either the matrix parent id or the item id
			// of the view's line item
		,	getIdItemsToExclude: function ()
			{
				var item = this.view.line.get('item');
				return [item.get('_matrixParent').get('_id') || item.get('_id')];
			}
		}

	,	mountToApp: function ()
		{
			MerchandisingContext.registerHandlers(FacetsViews.Browse, this.itemListHandlers);
			MerchandisingContext.registerHandlers(ItemDetailsView, this.itemDetailsHandlers);
			MerchandisingContext.registerHandlers(CartViews.Detailed, this.cartDetailedHandlers);
			MerchandisingContext.registerHandlers(CartViews.Confirmation, this.cartConfirmationHandlers);

			return this;
		}
	};

	return DefaultContextHandlers;
});