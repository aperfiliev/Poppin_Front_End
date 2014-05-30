// ItemOptionsHelper.js
// --------------------
// Defines function that will be extended into ItemDetails.Model
define('ItemOptionsHelper', function ()
{
	'use strict';

	var ItemOptionsHelper = {
		// itemOptionsHelper.renderOptionSelected:
		// Renders the option defaulting to the "selected" macro
		renderOptionSelected: function (option_name_or_option_config, macro) 
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = _.isObject(option_name_or_option_config) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selected;

			// if no value is selected just return an empty string
			if (!selected_value)
			{
				return '';
			}
			
			return SC.macros[macro](option, selected_value, this);
		}

		// itemOptionsHelper.renderAllOptionSelected:
		// Renders all the options defaulting to the "selected" macro
	,	renderAllOptionSelected: function (options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function (memo, option) 
				{
					return memo + self.renderOptionSelected(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.renderOptionSelector:
		// Renders the option defaulting to the "selector" macro
	,	renderOptionSelector: function (option_name_or_option_config, macro)
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = _.isObject(option_name_or_option_config) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selector;

			// If it's a matrix it checks for valid combinations 
			if (option.isMatrixDimension)
			{
				var available = this.getValidOptionsFor(option.itemOptionId);
				_.each(option.values, function (value)
				{
					value.isAvailable = _.contains(available, value.label);
				});
			}
			
			return SC.macros[macro](option, selected_value, this);
		}

		// itemOptionsHelper.renderAllOptionSelector:
		// Renders all the options defaulting to the "selector" macro
	,	renderAllOptionSelector: function (options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function (memo, option) 
				{
					return memo + self.renderOptionSelector(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.getValidOptionsFor:
		// returns a list of all valid options for the option you passed in
	,	getValidOptionsFor: function (item_option_id)
		{
			var selection = this.getMatrixOptionsSelection();
			delete selection[item_option_id];
			
			return _.uniq(_.map(this.getSelectedMatrixChilds(selection), function (model)
			{
				return model.get(item_option_id);
			}));
		}

		// itemOptionsHelper.isSelectionComplete
		// returns true if all mandatory options are set,
		// if it's a mtrix it also checks that there is only one sku sleected
	,	isSelectionComplete: function ()
		{
			var posible_options = this.getPosibleOptions()
			,	is_matrix = false;
			
			// Checks all mandatory fields are set
			// in the mean time 
			for (var i = 0; i < posible_options.length; i++)
			{
				var posible_option = posible_options[i];
				
				is_matrix = is_matrix || posible_option.isMatrixDimension;
				
				if (posible_option.isMandatory && !this.getOption(posible_option.cartOptionId))
				{
					return false;
				}
			}
			
			// If its matrix its expected that only 1 item is selected, not more than one nor 0 
			if (is_matrix && this.getSelectedMatrixChilds().length !== 1)
			{
				return false;
			}

			return true;
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its cart id.
	,	getPosibleOptionByCartOptionId: function (cart_option_id)
		{
			return _.where(this.getPosibleOptions(), {cartOptionId: cart_option_id})[0];
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its url component.
	,	getPosibleOptionByUrl: function (url)
		{
			return _.where(this.getPosibleOptions(), {url: url})[0];
		}

		// itemOptionsHelper.getPosibleOptions
		// returns an array of all the posible options with values and information 
	,	getPosibleOptions: function () 
		{
			if (this.cachedPosibleOptions)
			{
				return this.cachedPosibleOptions;
			}

			var result = [];
			if (this.get('_optionsDetails') && this.get('_optionsDetails').fields)
			{
				var self = this;

				// Prepeares a simple map of the configuration 
				var options_config_map = {};
				_.each(this.itemOptionsConfig, function (option)
				{
					if (option.cartOptionId)
					{
						options_config_map[option.cartOptionId] = option;
					}
				});

				// if you are an child in the cart it then checks for the options of the parent
				var fields = this.get('_matrixParent').get('_id') ? this.get('_matrixParent').get('_optionsDetails').fields : this.get('_optionsDetails').fields;

				// Walks the _optionsDetails to generate a standar options responce.
				_.each(fields, function (option_details)
				{
					var option = {
						label: option_details.label
					,	values: option_details.values
					,	type: option_details.type
					,	cartOptionId: option_details.internalid
					,	itemOptionId: option_details.sourcefrom || ''
					,	isMatrixDimension: option_details.ismatrixdimension || false
					,	isMandatory: option_details.ismandatory || false
					,	macros: {}
					};

					// Makes sure all options are availabe by defualt
					_.each(option.values, function (value)
					{
						value.isAvailable = true;
					});

					// Merges this with the configuration object 
					if (options_config_map[option.cartOptionId])
					{
						option = _.extend(option, options_config_map[option.cartOptionId]);
					}

					if (option_details.ismatrixdimension)
					{
						var item_values = self.get('_matrixChilds').pluck(option.itemOptionId);
						
						option.values = _.filter(option.values, function (value)
						{

							if (value.internalid)
							{
								return _.contains(item_values,value.label);
							}
							else
							{
								return true;
							}
						});
					}

					// Sets macros for this option
					if (!option.macros.selector)
					{
						option.macros.selector = self.itemOptionsDefaultMacros.selectorByType[option.type] ? self.itemOptionsDefaultMacros.selectorByType[option.type] : self.itemOptionsDefaultMacros.selectorByType['default']; // using .default brakes ie :(
					}

					if (!option.macros.selected)
					{
						option.macros.selected = self.itemOptionsDefaultMacros.selectedByType[option.type] ? self.itemOptionsDefaultMacros.selectedByType[option.type] : self.itemOptionsDefaultMacros.selectedByType['default']; // using .default brakes ie :(
					}

					// Makes sure the url key of the object is set, 
					// otherways sets it to the cartOptionId (it should allways be there)
					if (!option.url)
					{
						option.url = option.cartOptionId;
					}

					result.push(option);
				});
				
				// Since this is not going to change in the life of the model we can cache it
				this.cachedPosibleOptions = result;
			}
			
			return result;
		}

		// itemOptionsHelper.isProperlyConfigured
		// returns true if all matrix options are mapped to the cart options 
	,	isProperlyConfigured: function ()
		{
			var options = this.getPosibleOptions()
			,	option;

			if (options && options.length)
			{
				for (var i = 0; i < options.length; i++)
				{
					option = options[i];

					if (option.isMatrixDimension && !option.itemOptionId)
					{
						return false;
					}
				}	
			}
			// If you omit item options from the fieldset and use matrix, that an issue.
			else if (this.get('_matrixChilds') && this.get('_matrixChilds').length)
			{
				return false;
			}

			return true;
		}
		
		// itemOptionsHelper.getMatrixOptionsSelection
		// returns an object of all the matrix options with its setted values
	,	getMatrixOptionsSelection: function () 
		{
			var matrix_options = _.where(this.getPosibleOptions(), {isMatrixDimension: true})
			,	result = {}
			,	self = this;

			_.each(matrix_options, function (matrix_option)
			{
				var value = self.getOption(matrix_option.cartOptionId);
				if (value && value.label)
				{
					result[matrix_option.itemOptionId] = value.label;
				}
			});

			return result; 
		}

		// itemOptionsHelper.getSelectedMatrixChilds
		// Returns all the children of a matrix that complies with the current or passed in selection
	,	getSelectedMatrixChilds: function (selection) 
		{
			selection = selection || this.getMatrixOptionsSelection();
			var selection_key = JSON.stringify(selection);

			// Creates the Cache container
			if (!this.matrixSelectionCache)
			{
				this.matrixSelectionCache = {};
			}

			if (!this.get('_matrixChilds'))
			{
				return [];
			}

			// Caches the entry for the item
			if (!this.matrixSelectionCache[selection_key])
			{
				this.matrixSelectionCache[selection_key] = _.values(selection).length ? this.get('_matrixChilds').where(selection) : this.get('_matrixChilds').models;
			}
			
			return this.matrixSelectionCache[selection_key];
		}
		
		// itemOptionsHelper.getQueryString
		// Computes all the selected options and transforms them into a url query string
	,	getQueryString: function () 
		{
			var self = this
			,	result = '?quantity=' + (this.get('quantity') || 1);

			_.each (this.getPosibleOptions(), function (option)
			{
				var value = self.getOption(option.cartOptionId);
				if (value)
				{
					result += '&' + option.url + '=' + encodeURIComponent(value.label);
				}
			});

			return result;
		}

		// itemOptionsHelper.parseQueryStringOptions
		// Given a url query string, it sets the options in the model
	,	parseQueryStringOptions: function (options) 
		{
			var self = this;
			_.each(options, function (value, name)
			{
				if (name === 'quantity')
				{
					self.setOption('quantity', value);
				}
				else if (name === 'cartitemid')
				{
					self.cartItemId = value;
				}
				else if (value && name)
				{
					value = decodeURIComponent(value);
					var option = self.getPosibleOptionByUrl(name);

					if (option)
					{
						if (option.values)
						{
							// We check for both Label and internal id because we detected that sometimes they return one or the other
							value = _.where(option.values, {label: value})[0] || _.where(option.values, {internalid: value})[0];
							self.setOption(option.cartOptionId, value);
						}
						else
						{
							self.setOption(option.cartOptionId, value);
						}
					}
				}
			});
		}
	};

	return ItemOptionsHelper;
});
