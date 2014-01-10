// LiveOrder.Model.js
// -----------------------
// Model for showing information about an open order
define('LiveOrder.Model', ['Order.Model', 'OrderLine.Model', 'OrderLine.Collection', 'ItemDetails.Model'], function (OrderModel, OrderLineModel, OrderLineCollection, ItemDetailsModel)
{
	'use strict';

	var LiveOrderLine = {};

	LiveOrderLine.Model = OrderLineModel.extend({
		urlRoot: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	LiveOrderLine.Collection = OrderLineCollection.extend({
		model: LiveOrderLine.Model
	,	url: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	return OrderModel.extend({
		
		urlRoot: _.getAbsoluteUrl('services/live-order.ss')

	,	linesCollection: LiveOrderLine.Collection
		
	,	initialize: function ()
		{
			// call the initialize of the parent object, equivalent to super()
			OrderModel.prototype.initialize.apply(this, arguments);

			// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
			this.on('change:touchpoints', function (model, touchpoints)
			{
				if (SC.ENVIRONMENT.siteSettings) 
				{
					SC.ENVIRONMENT.siteSettings.touchpoints = touchpoints;
				}

				_.each(SC._applications, function (application)
				{
					if (application.getConfig('siteSettings'))
					{
						application.getConfig('siteSettings').touchpoints = touchpoints;
					}
				});

			});
		}
	,	getRelatedItems: function ()
		{
			var relatedItems = []
			,	relatedItemsId = []
			,	lines = this.get('lines');			
			// TODO: add support for sites type standard
			if (lines.models && SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED')
			{
				_.each(lines.models, function (line)
				{
					var item = line.get('item');

					if (item)
					{
						var relatedItemsDetail = item.get('relateditems_detail');

						_.each(relatedItemsDetail, function (relatedItem)
						{
							if (!_.contains(relatedItemsId, relatedItem.internalid))
							{
								// we create an item detail object for easy templating								
								var itemDetail = new ItemDetailsModel(relatedItem);
								relatedItems.push(itemDetail);		
								// then we add the id to our check array for algorithm optimization
								relatedItemsId.push(relatedItem.internalid);
							}						
						});
					}
				});
			}

			return relatedItems; 
		}

	,	getLatestAddition: function ()
		{
			var model = null;

			if (this.get('latest_addition'))
			{
				model = this.get('lines').get(this.get('latest_addition'));
			}

			if (!model && this.get('lines').length)
			{
				model = this.get('lines').at(0);
			}

			return model;
		}

	,	wrapOptionsSuccess: function (options)
		{
			var self = this;
			// if passing a succes function we need to wrap it
			options = options || {};
			options.success = _.wrap(options.success || function (){}, function (fn, item_model, result)
			{
				// This method is called in 2 ways by doing a sync and by doing a save 
				// if its a save result will be the raw object 
				var attributes = result;
				// If its a sync resilt will be a string
				if (_.isString(result))
				{
					attributes = item_model;
				}

				// Tho this should be a restfull api, the live-order-line returns the full live-order back (lines and summary are interconnected)
				self.set(attributes);
				
				// Calls the original success function
				fn.apply(self, _.toArray(arguments).slice(1));
			});

			return options;
		}

	,	addItem: function (item, options)
		{
			// Calls the addItems funtion passing the item as an array of 1 item 
			return this.addItems([item], options);
		}

	,	addItems: function (items, options)
		{
			// Obteins the Collection constructor
			var LinesCollection = this.linesCollection;

			// Prepares the input for the new collection
			var lines = _.map(items, function (item)
			{
				var line_options = item.getItemOptionsForCart();

				return {
					item: {
						internalid: item.get('internalid')
					}
				,	quantity: item.get('quantity')
				,	options: _.values(line_options).length ? line_options : null
				};
			});

			// Creates the Colection 
			var lines_collection = new LinesCollection(lines);

			// Saves it
			return lines_collection.sync('create', lines_collection, this.wrapOptionsSuccess(options));
		}

	,	updateItem: function (line_id, item, options)
		{
			var line = this.get('lines').get(line_id)
			,	line_options = item.getItemOptionsForCart();
			
			line.set({
				quantity: item.get('quantity')
			,	options: _.values(line_options).length ? line_options : null
			});

			return line.save({}, this.wrapOptionsSuccess(options));
		}

	,	updateLine: function (line, options)
		{
			// Makes sure the quantity is a number
			line.set('quantity', parseInt(line.get('quantity'), 10));
			
			return line.save({}, this.wrapOptionsSuccess(options));
		}

	,	removeLine: function (line, options)
		{
			return line.destroy(this.wrapOptionsSuccess(options));
		}

	,	submit: function ()
		{
			var self = this;
			
			this.set('internalid', null);
			var creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'});
			if (creditcard && !creditcard.get('creditcard'))
			{
				this.set(this.get('paymentmethods').remove(creditcard));
			}
			var paypal = this.get('paymentmethods').findWhere({type: 'paypal'});
			if (paypal && !paypal.get('complete'))
			{
				this.set(this.get('paymentmethods').remove(paypal));
			}
			return this.save().fail(function ()
			{
				self.set('internalid', 'cart');
			});
		}


	,	save: function ()
		{console.log('save liveorder');
			if (this.get('confirmation'))
			{
				return jQuery.Deferred().resolve();
			}

			return OrderModel.prototype.save.apply(this, arguments);
		}
		
	,	getTotalItemCount: function ()
		{
			return _.reduce(this.get('lines').pluck('quantity'), function (memo, quantity)
			{
				return memo + (parseFloat(quantity) || 1);
			}, 0);
		}

	,	parse: function (resp, options)
		{
			if (options && !options.parse)
			{
				return;
			}
			
			return resp;
		}
	});
});