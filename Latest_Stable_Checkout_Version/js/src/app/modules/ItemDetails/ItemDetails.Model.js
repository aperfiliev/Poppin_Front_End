// ItemDetails.Model.js
// --------------------
// Represents 1 single product of the web store
define('ItemDetails.Model', ['ItemOptionsHelper'], function (ItemOptionsHelper)
{
	'use strict';
	
	var Model = Backbone.CachedModel.extend({
		
		urlRoot: '/api/items'

		// The api returns the items as an array allways this takes care of returning the object
	,	parse: function (response)
		{
			// if we are performing a direct API call the item is response.items[0] 
			// but if you are using the ItemDetails.Collection to fetch this guys
			// The item is the response
			var single_item = response.items && response.items[0];

			if (single_item)
			{
				single_item.facets = response.facets;
			}

			return single_item || response;
		}
		
	,	initialize: function ()
		{
			this.itemOptions = {};

			if (_.isArray(this.get('options')))
			{
				this.setOptionsArray(this.get('options'), true);
			}
		}

	,	getOption: function (option_name)
		{
			return this.itemOptions[option_name];
		}

	,	setOptionsArray: function (options, dont_validate)
		{
			var self = this;
			_.each(options, function (option)
			{
				self.setOption(option.id, {
					internalid: option.value
				,	label: option.displayvalue ? option.displayvalue : option.value
				}, dont_validate);
			});
		}

	,	setOption: function (option_name, value, dont_validate)
		{

			// Setting it to null means you dont wan a value for it
			if (option_name === 'quantity')
			{
				this.set('quantity', parseInt(value, 10) || 1);
			}
			else if (_.isNull(value))
			{
				delete this.itemOptions[option_name];
			}
			else
			{
				// Sometimes the name comes in all uppercase
				var option = this.getPosibleOptionByCartOptionId(option_name) || this.getPosibleOptionByCartOptionId(option_name.toLowerCase());

				// You can pass in the internalid on the instead of the full item 
				if (option && option.values)
				{
					value = _.isObject(value) ? value : _.where(option.values, {internalid: value.toString()})[0];
				}
				else if (!_.isObject(value))
				{
					value = {
						internalid: value
					,	label: value
					};
				}
				
				// if it's a matrix option this will make sure it's compatible to what its already set!
				if (!dont_validate && option.isMatrixDimension && !_.contains(this.getValidOptionsFor(option.itemOptionId), value.label))
				{
					throw new RangeError('The combination you selected is invalid');
				}
				if (option && option.cartOptionId)
				{
					this.itemOptions[option.cartOptionId] = value;
				}

			}
			return value;
			
		}

	,	getItemOptionsForCart: function ()
		{
			var result = {};

			_.each(this.itemOptions, function (value, name)
			{
				result[name] = value.internalid;
			});

			return result;
		}

		// model.get:
		// We have override the get function for this model in order to honor the itemsKeyMapping
		// It also makes sure that _matrixChilds and _relatedItems are ItemDetails.Collection and 
		// _matrixParent is an ItemDetails.Model
		// TODO: Deprecate the dont_cache param and make sure that mappings to functions are not chaced
	,	get: function (attr, dont_cache)
		{
			var keyMapping = this.keyMapping || this.collection.keyMapping;
			
			if (dont_cache || (keyMapping && !this.attributes[attr] && keyMapping[attr]))
			{
				var mapped_key = keyMapping[attr];
				
				if (_.isFunction(mapped_key))
				{
					this.attributes[attr] = mapped_key(this);
				}
				else if (_.isArray(mapped_key))
				{
					for (var i = 0; i < mapped_key.length; i++)
					{
						if (this.attributes[mapped_key[i]])
						{
							this.attributes[attr] = this.attributes[mapped_key[i]];
							break;
						}
					}
				}
				else
				{
					this.attributes[attr] = this.attributes[mapped_key];
				}

				if (attr === '_matrixChilds' || attr === '_relatedItems')
				{
					var Collection = require('ItemDetails.Collection');
					this.attributes[attr] = new Collection(this.attributes[attr] || []);
				}
				else if (attr === '_matrixParent')
				{
					this.attributes[attr] = new Model(this.attributes[attr] || {});
				}
			}
			
			return this.attributes[attr];
		}
		
		// model.getPrice:
		// Gets the price based on the selection of the item and the quantity
	,	getPrice: function ()
		{
			var self = this
			,	details_object = this.get('_priceDetails') || {}
			,	matrix_children = this.getSelectedMatrixChilds()
			,	result =  { 
					price: details_object.onlinecustomerprice
				,	price_formatted: details_object.onlinecustomerprice_formatted
				};

			// Computes Quantity pricing.
			if (details_object.priceschedule && details_object.priceschedule.length)
			{
				var quantity = this.get('quantity'),
					price_schedule, min, max;

				for (var i = 0; i < details_object.priceschedule.length; i++)
				{
					price_schedule = details_object.priceschedule[i];
					min = parseInt(price_schedule.minimumquantity, 10);
					max = parseInt(price_schedule.maximumquantity, 10);
					
					if ((min <= quantity && quantity < max) || (min <= quantity && !max))
					{
						result  = {
							price: price_schedule.price
						,	price_formatted: price_schedule.price_formatted
						};
					}
				}
			}

			// if it's a matrix it will compute the matrix price
			if (matrix_children.length)
			{
				// Gets the price of each child
				var children_prices = [];

				_.each(matrix_children, function (child)
				{
					child.setOption('quantity', self.get('quantity'));
					children_prices.push(child.getPrice());
				});

				if (children_prices.length === 1)
				{
					// If there is only one it means there is only one price to show
					result = children_prices[0];
				}
				else
				{
					// otherways we should compute max and min to show a range in the gui
					var children_prices_values = _.pluck(children_prices, 'price')
					,	min_value = _.min(children_prices_values)
					,	max_value = _.max(children_prices_values);

					if (min_value !== max_value)
					{
						// We return them alongside the result of the parent
						result.min = _.where(children_prices, {price: min_value})[0];
						result.max = _.where(children_prices, {price: max_value})[0];
					}
					else
					{
						// they are all alike so we can show any of them
						result = children_prices[0];
					}
				}
			}

			// Adds the compare agains price if its not setted by one if the childs
			if (!result.compare_price && this.get('_comparePriceAgainst'))
			{
				result.compare_price = this.get('_comparePriceAgainst');
				result.compare_price_formatted = this.get('_comparePriceAgainstFormated');
			}

			return result;
		}

		// model.getStockInfo
		// Returns an standar formated object for the stock info
		// It also consider matrix childs
	,	getStockInfo: function ()
		{
			// Standarize the result object 
			var stock_info = {
					stock: this.get('_stock')
				,	isInStock: this.get('_isInStock')

				,	outOfStockMessage: this.get('_outOfStockMessage')
				,	showOutOfStockMessage: this.get('_showOutOfStockMessage')

				,	inStockMessage: this.get('_inStockMessage')
				,	showInStockMessage: this.get('_showInStockMessage')

				,	stockDescription: this.get('_stockDescription')
				,	showStockDescription: this.get('_showStockDescription')
				,	stockDescriptionClass: this.get('_stockDescriptionClass')
				}
				
			,	matrix_children = this.getSelectedMatrixChilds();

			// if there is matrix children this will compute them all
			if (matrix_children.length)
			{
				var matrix_children_stock_info = [];

				_.each(matrix_children, function (child)
				{
					matrix_children_stock_info.push(child.getStockInfo());
				});

				// If all matrix childs return the same value for a given attribute that becomes the output, 
				// with the exeption of stock that is an adition of the stocks of the childs
				_.each(stock_info, function (value, key)
				{
					var children_values_for_attribute = _.pluck(matrix_children_stock_info, key);

					if (key === 'stock')
					{
						stock_info.stock = _.reduce(children_values_for_attribute, function (memo, num) { return memo + num; }, 0);
					}
					else if (key === 'isInStock')
					{
						// the parent is in stock if any of the child items is in stock
						// so, if in the array of the values of 'isInStock' for the childs
						// there is a 'true', then the parent item is in stock
						stock_info.isInStock = _.contains(children_values_for_attribute, true);
					}
					else
					{
						children_values_for_attribute = _.uniq(children_values_for_attribute);

						if (children_values_for_attribute.length === 1)
						{
							stock_info[key] = children_values_for_attribute[0];
						}
					}
				});
			}
			
			return stock_info;
		}

		// model.isReadyForCart:
		// if it has mandatory options, checks for all to be filled
		// also checks if the item is purchasable
	,	isReadyForCart: function ()
		{
			// if the item is a matrix, we check if the selection is completed
			// for non-matrix items isSelectionComplete always returns true
			if (this.isSelectionComplete())
			{
				var is_purchasable = this.get('_isPurchasable')
				,	child = this.getSelectedMatrixChilds();

				if (child.length)
				{
					is_purchasable = child[0].get('_isPurchasable');
				}

				return is_purchasable;
			}

			return false;
		}
	});
	
	Model.prototype = _.extend(Model.prototype, ItemOptionsHelper);

	return Model;
});
