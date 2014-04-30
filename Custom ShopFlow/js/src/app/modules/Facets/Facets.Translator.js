// Facets.Translator.js
// --------------------
// Holds the mapping of a url compoment with an api call, 
// is able to translate and to return different configurations of himself with diferent options
define('Facets.Translator'
,	function ()
{
	'use strict';

	// Categories is not a rea l dependency, so if it is present we use it other ways we dont 
	var Categories = false;
	try {
		Categories = require('Categories');
	}
	catch (e)
	{
		console.log('Couldn\'t load Categories. ' + e);
	}
	
	// This is just for internal use only, DO NOT EDIT IT HERE!!
	// the same options should be somewhere in the configuration file
	var default_config = {
		fallbackUrl: 'search'
	,	defaultShow: null
	,	defaultOrder: null
	,	defaultDisplay: null
	,	facets: []
	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
	};
	
	function FacetsTranslator(facets, options, configuration)
	{
		// Enfofces new
		if (!(this instanceof FacetsTranslator)) {
			return new FacetsTranslator(facets, options, configuration);
		}
		
		// Facets go Here
		this.facets = [];
		
		// Other options like page, view, etc. goes here 
		this.options = {};
		
		// This is an object that must contain a fallbackUrl and a lists of facet configurations
		this.configuration = configuration || default_config;
		
		// We cast on top of the passed in parameters.
		if (facets && options)
		{
			this.facets = facets;
			this.options = options;
		}
		else if (_.isString(facets))
		{
			// It's a url
			this.parseUrl(facets);
		}
		else if (facets)
		{
			// It's an API option object
			this.parseOptions(facets);
		}
	}
	
	_.extend(FacetsTranslator.prototype, {
		
		defaultFacetConfig: { 
			behavior: 'single'
		,	max: 5
		}

		// facetsTranslator.parseUrl:
		// Url strings get translated into the differnts part of the object, facets and options
	,	parseUrl: function (url)
		{
			// We remove a posible 1st / (slash)
			url = (url[0] === '/') ? url.substr(1) : url;
			
			// given an url with options we split them into 2 strings (options and facets)
			var facets_n_options = url.split(this.configuration.facetDelimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.configuration.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || '';
			
			// We treat category as the 1st unmaned facet filter, so if you are using categories
			// we will try to take that out by comparig the url with the category tree
			if (this.getFacetConfig('category'))
			{
				var categories = Categories && Categories.getBranchLineFromPath(facets) || [];

				if (categories && categories.length)
				{
					// We set the value for this facet
					var category_string = _.pluck(categories, 'urlcomponent').join('/');
					this.parseFacet('category', category_string);
					
					// And then we just take it out so other posible facets are computed
					facets = facets.replace(category_string, '');
				}	
				
				// We remove a posible 1st / (slash) (again, it me be re added by taking the category out)
				facets = (facets[0] === '/') ? facets.substr(1) : facets;
			}
			
			// The facet part of the url gets splited and computed by pairs
			var facet_tokens = facets.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenDifferentFacets +'\\'+ this.configuration.facetDelimiters.betweenFacetNameAndValue +']+', 'ig'));
			while (facet_tokens.length > 0)
			{
				this.parseUrlFacet(facet_tokens.shift(), facet_tokens.shift());
			}
			
			// The same for the options part of the url
			var options_tokens = options.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenOptionNameAndValue +'\\'+ this.configuration.facetDelimiters.betweenDifferentOptions +']+', 'ig'))
			,	tmp_options = {};
			
			while (options_tokens.length > 0)
			{
				tmp_options[options_tokens.shift()] = options_tokens.shift();
			}
			
			this.parseUrlOptions(tmp_options);
		}
		
		// facetsTranslator.sanitizeValue:
		// Translates values that came from the url into JS data types that this objects know of
		// Examples for different types: 
		// - range/10to100 gets translated to {from: '10', to: '100'}
		// - range/100 gets translated to {from: '0', to: '100'}
		// - multi/1,2,3 gets translated to ['1', '2', '3']
	,	sanitizeValue: function (value, behavior)
		{
			var parsed_value;
			switch (behavior)
			{
			case 'range':
				// we return an object like {from: string, to: string }
				if (_.isString(value))
				{
					if (value.indexOf(this.configuration.facetDelimiters.betweenRangeFacetsValues) !== -1)
					{
						var tokens = value.split(this.configuration.facetDelimiters.betweenRangeFacetsValues);
						parsed_value = {from: tokens[0], to: tokens[1]};
					}
					else
					{
						parsed_value = {from: '0', to: value};
					}
				}
				else 
				{
					parsed_value = value;
				}
				
				break;
			case 'multi':
				// we allways return an array for a multi value 
				if (value.indexOf(this.configuration.facetDelimiters.betweenDifferentFacetsValues) !== -1)
				{
					parsed_value = value.split(this.configuration.facetDelimiters.betweenDifferentFacetsValues);
				}
				else 
				{
					parsed_value = [value];
				}
				break;
			default: 
				parsed_value = value;
			}
			return parsed_value;
		}
		
		// facetsTranslator.getUrlFacetValue
		// Returns the value of an active facet by the facet URL component
	,	getUrlFacetValue: function (facet_url)
		{
			return (_.find(this.facets, function (facet) { return facet.url === facet_url; }) || {}).value;
		}
		
		// facetsTranslator.getFacetValue:
		// Returns the value of an active facet by the facet id
	,	getFacetValue: function (facet_id)
		{
			return (_.find(this.facets, function (facet) { return facet.id === facet_id; }) || {}).value;
		}
		
		// facetsTranslator.getAllFacets:
		// Returns a copy of the internal array of facets containing values and configuration
	,	getAllFacets: function ()
		{
			return this.facets.slice(0);
		}
		
		// facetsTranslator.getOptionValue:
		// Returns the value of an active options or it's default value
	,	getOptionValue: function (option_id)
		{
			return this.options[option_id] || null;
		}
		
		// facetsTranslator.parseUrlFacet:
		// for a given name value, it gets the config, sanitaze the value and stores it all in the internal facets array
	,	parseUrlFacet: function (name, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(name, 'url');
			
			if (config.id === 'category' || !name)
			{
				return;
			}
			
			this.facets.push({
				config: config,
				id: config.id,
				url: config.url,
				value: this.sanitizeValue(value, config.behavior)
			});
		}
		
		// facetsTranslator.parseFacet:
		// Same as parseUrlFacet but from id
	,	parseFacet: function (facet_id, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(facet_id, 'id');
			
			this.facets.push({
				config: config,
				id: config.id,
				url: config.url,
				value: this.sanitizeValue(value, config.behavior)
			});
		}
		
		// facetsTranslator.parseUrlOptions:
		// Sets options from the options argument or sets default values
	,	parseUrlOptions: function (options)
		{
			this.options.show = options.show || this.configuration.defaultShow;
			this.options.order = options.order || this.configuration.defaultOrder;
			this.options.page = parseInt(options.page, 10) || 1;
			this.options.display = options.display || this.configuration.defaultDisplay;
			this.options.keywords = options.keywords || this.configuration.defaultKeywords;
		}
		
		// facetsTranslator.getFacetConfig:
		// Gets the configuration for a given facet by id,
		// You can also get it by name or url component if you pass the second parameter
	,	getFacetConfig: function (name, by)
		{debugger;
			var result =  _.find(this.configuration.facets, function (facet) { return facet[by || 'id'] === name; });
			return result || _.extend({ id: name, name: name, url: name }, this.defaultFacetConfig);
		}
		
		

		// facetsTranslator.getUrl:
		// Gets the url for current stae of the object
	,	getUrl: function ()
		{
			var url = ''
			,	self = this;
			
			// Prepears the seo limits 
			var facets_seo_limits = {}; 
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				facets_seo_limits = {
					numberOfFacetsGroups: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsGroups || false
				,	numberOfFacetsValues: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsValues || false
				,	options: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.options || false
				};
			}
			
			// If there are too many facets selected 
			if (facets_seo_limits.numberOfFacetsGroups && this.facets.length > facets_seo_limits.numberOfFacetsGroups)
			{
				return '#';
			}

			// Adds the category if it's prsent
			var category_string = this.getFacetValue('category');
			if (category_string)
			{
				url = self.configuration.facetDelimiters.betweenDifferentFacets + category_string;
			}
			
			// Encodes the other Facets
			var sorted_facets = _.sortBy(this.facets, 'url');
			for (var i = 0; i < sorted_facets.length; i++)
			{
				var facet = sorted_facets[i];
				// Category should be already added
				if (facet.id === 'category')
				{
					break;
				}
				var name = facet.url || facet.id,
					value = '';
				switch (facet.config.behavior)
				{
				case 'range':
					facet.value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					value = facet.value.from + self.configuration.facetDelimiters.betweenRangeFacetsValues + facet.value.to;
					break;
				case 'multi':
					value = facet.value.sort().join(self.configuration.facetDelimiters.betweenDifferentFacetsValues);

					if (facets_seo_limits.numberOfFacetsValues && facet.value.length > facets_seo_limits.numberOfFacetsValues)
					{
						return '#';
					}

					break;
				default: 
					value = facet.value;
				}
				
				url += self.configuration.facetDelimiters.betweenDifferentFacets + name + self.configuration.facetDelimiters.betweenFacetNameAndValue + value;
			}
			
			url = (url !== '') ? url : '/'+this.configuration.fallbackUrl;
			
			// Encodes the Options
			var tmp_options = {};
			if (this.options.order && this.options.order !== this.configuration.defaultOrder)
			{
				tmp_options.order = 'order' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.order;
			}
			
			if (this.options.page && parseInt(this.options.page, 10) !== 1)
			{
				tmp_options.page = 'page' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.page;
			}
			
			if (this.options.show && parseInt(this.options.show, 10) !== this.configuration.defaultShow)
			{
				tmp_options.show = 'show' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.show;
			}
			
			if (this.options.display && this.options.display !== this.configuration.defaultDisplay)
			{
				tmp_options.display = 'display' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.display;
			}

			if (this.options.keywords && this.options.keywords !== this.configuration.defaultKeywords)
			{
				tmp_options.keywords = 'keywords' + this.configuration.facetDelimiters.betweenOptionNameAndValue + this.options.keywords;
			}
			
			var tmp_options_keys = _.keys(tmp_options)
			,	tmp_options_vals = _.values(tmp_options);

			// If there are options that should not be indexed also return #
			if (facets_seo_limits.options && _.difference(tmp_options_keys, facets_seo_limits.options).length)
			{
				return '#';
			}

			url += (tmp_options_vals.length) ? this.configuration.facetDelimiters.betweenFacetsAndOptions + tmp_options_vals.join(this.configuration.facetDelimiters.betweenDifferentOptions) : '';
			
			return _(url).fixUrl();
		}
		
		// facetsTranslator.getApiParams:
		// Gets the api parameters representing the current status of the object
	,	getApiParams: function ()
		{
			var params = {};
			
			_.each(this.facets, function (facet)
			{
				switch (facet.config.behavior)
				{
				case 'range':
					var value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					params[facet.id + '.from'] = value.from;
					params[facet.id + '.to'] = value.to;
					break;
				case 'multi':
					params[facet.id] = facet.value.sort().join(',') ; // this coma is part of the api call so it should not be removed
					break;
				default: 
					params[facet.id] =  facet.value ;
				}
			});
			
			params.sort = this.options.order;
			params.limit = this.options.show;
			params.offset = (this.options.show * this.options.page) - this.options.show;

			params.q = this.options.keywords;
			
			return params;
		}
		
		// facetsTranslator.cloneForFacetId:
		// retruns a deep copy of this object with a new value for one facet, 
		// if in a name value that is the same as what's in, it will take it out
	,	cloneForFacetId: function (facet_id, facet_value) {
			// Using jQuery here because it offers deep cloning
			var facets	= _.toArray(jQuery.extend(true, {}, this.facets))
			,	options	= jQuery.extend(true, {}, this.options);
			
			var current_facet = _.find(facets, function (facet) { return facet.id === facet_id; });
			if (current_facet)
			{
				if (current_facet.config.behavior === 'multi')
				{
					if (_.indexOf(current_facet.value, facet_value) === -1)
					{
						current_facet.value.push(facet_value);
					}
					else
					{
						current_facet.value = _.without(current_facet.value, facet_value); 
					}
					
					if (current_facet.value.length === 0)
					{
						facets = _.without(facets, current_facet);
					}
				}
				else
				{
					if (!_.isEqual(current_facet.value, facet_value))
					{
						current_facet.value = facet_value;
					}
					else
					{
						facets = _.without(facets, current_facet); 
					}
				}
			}
			
			options.page = 1;
			
			var translator = new FacetsTranslator(facets, options, this.configuration);
			
			if (!current_facet)
			{
				translator.parseFacet(facet_id, facet_value);
			}
			
			return translator;
		}
		
		// facetsTranslator.cloneWithoutFacetId:
		// retruns a deep copy of this object without a facet, 
	,	cloneWithoutFacetId: function (facet_id)
		{
			var facets = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);
			
			facets = _.without(facets, _.find(facets, function (facet) { return facet.id === facet_id; })); 
			
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.cloneForFacetUrl:
		// same as cloneForFacetId but passing the url component of the facet
	,	cloneForFacetUrl: function (facet_url, facet_value) {
			return this.cloneForFacetId(this.getFacetConfig(facet_url, 'url').id, facet_value);
		}
		
		
		// facetsTranslator.cloneWithoutFacetId:
		// same as cloneWithoutFacetId but passing the url component of the facet
	,	cloneWithoutFacetUrl: function (facet_url) {
			return this.cloneWithoutFacetId(this.getFacetConfig(facet_url, 'url').id);
		}

		// facetsTranslator.cloneWithoutFacets:
		// Clones the translator removeing all the facets, leaving only options
	,	cloneWithoutFacets: function () 
		{
			// Creates a new translator with the same params as this;
			var translator = new FacetsTranslator(this.facets, this.options, this.configuration);

			_.each(translator.getAllFacets(), function (facet)
			{
				// Categories are not facets, so lets not remove those
				if (facet.id !== 'category')
				{
					translator = translator.cloneWithoutFacetId(facet.id);	
				}
			});

			return translator;
		}
		


	,	cloneForOption: function (option_id, option_value) {
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options);
			
			options[option_id] = option_value;
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		
		// facetsTranslator.cloneForOptions:
		// same as cloneForFacetId but for options instead of facets
	,	cloneForOptions: function (object)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options, object);
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.cloneWithoutOption:
		// same as cloneWithoutFacetId but for options instead of facets
	,	cloneWithoutOption: function (option_id) {
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets)),
				options = jQuery.extend(true, {}, this.options);
			
			delete options[option_id];
			
			return new FacetsTranslator(facets, options, this.configuration);
		}
		
		// facetsTranslator.resetAll:
		// Returns a blank instance of itself
	,	resetAll: function ()
		{
			return new FacetsTranslator([], {}, this.configuration);
		}
		
		// facetsTranslator.getMergedCategoryTree: 
		// Returns a Category tree based on the site's one 
		// but merged with the values passed in
		// it expect the format that the search api returns 
		// Be aware that this is a recursive function, and this same function will be used to compute sub categories
	,	getMergedCategoryTree: function (values, branch)
		{
			var self = this;
			// if branch is omited it will start from the top level
			branch = branch || Categories && Categories.getTree() || {};
			
			_.each(values, function (value)
			{
				var id = _.last(value.id.split('/'));
				if (branch[id])
				{
					branch[id].count = value.count;
					
					if (branch[id].sub && _.keys(branch[id].sub).length && value.values.length)
					{
						branch[id].sub = self.getMergedCategoryTree(value.values, branch[id].sub);
					}
				}
			});
			
			return branch;
		}

		// facetsTranslator.setLabelsFromFacets:
		// This let the translator known about labels the api proportions
		// Tho this make the translator a bit less API agnostic
		// this step is totaly optional and it should work regardless of this step
	,	setLabelsFromFacets: function (facets_labels)
		{
			this.facetsLabels = facets_labels;
		}

		// facetsTranslator.getLabelForValue:
		// If facets labes have been setted it will try to look for the label for the 
		// [id, value] combination and return it's label, otherways it will return the value
	,	getLabelForValue: function (id, value)
		{
			var facet = _.where(this.facetsLabels || [], {id: id});

			if (facet.length)
			{
				var label = _.where(facet[0].values || [], {name: value});
				
				if (label.length)
				{
					return label[0].label;
				}
			}

			return value;

		}

	});
	
	return FacetsTranslator;
});
