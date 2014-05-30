// Merchandising.Context
// ---------------------
define('Merchandising.Context', function ()
{
	'use strict';
	
	var MerchandisingContext = function MerchandisingContext (view)
	{
		if (view.MerchandisingContext)
		{
			return view.MerchandisingContext;
		}
		// REVIEW
		this.view = view;
		view.MerchandisingContext = this;
	};
	
	_.extend(MerchandisingContext, {

		// list of registered handlers
		handlers: []

		// registerHandlers
		// pushes a new handler for a specific view to the handler list
	,	registerHandlers: function (view_constructor, methods)
		{
			if (view_constructor)
			{
				// if there was already a handler for that view
				// we remove it from the list, and extend the new
				// handler with any events that the previous one had
				var new_handler = _.extend(
					this.removeHandler(view_constructor)
				,	methods
				);

				new_handler.viewConstructor = view_constructor;
				// then we add it first on the list
				this.handlers.unshift(new_handler);
			}

			return this;
		}

		// based on the constructor passed as a parameter
		// it removes any handler that matches the constructor
		// from the handlers list.
		// returns the removed handler
	,	removeHandler: function (view_constructor)
		{
			var removed = {};

			this.handlers = _.reject(this.handlers, function (handler)
			{
				if (handler.viewConstructor === view_constructor)
				{
					removed = handler;
					return true;
				}
			});

			return removed;
		}

		// retuns a handler based on the view
	,	getHandlerForView: function (view)
		{
			return _.find(this.handlers, function (handler)
			{
				return view instanceof handler.viewConstructor;
			});
		}

	,	escapeValue: function (value)
		{
			return value ? value.toString().replace(/\s/g, '-') : '';
		}

		// callHandler
		// calls 'callback_key' from the handler for that view passing all of the arguments
	,	callHandler: function (callback_key, context, parameters)
		{
			var handler = this.getHandlerForView(context.view);
			return handler && _.isFunction(handler[callback_key]) && handler[callback_key].apply(context, parameters);
		}
	});
	
	_.extend(MerchandisingContext.prototype, {

		callHandler: function (callback_key)
		{
			return MerchandisingContext.callHandler(callback_key, this, _.toArray(arguments).slice(1));
		}

	,	getFilters: function (filters, isWithin)
		{
			var parsed_filters = this.callHandler('getFilters', filters, isWithin);

			if (!parsed_filters)
			{
				parsed_filters = {};
				
				_.each(filters, function (values, key)
				{
					values = _.without(values, '$current');

					if (values.length)
					{
						parsed_filters[key] = values.join(',');
					}
				});
			}

			return parsed_filters;
		}

	,	getIdItemsToExclude: function ()
		{
			return this.callHandler('getIdItemsToExclude') || [];
		}
	});

	return MerchandisingContext;
});