// SiteSearch.js
// -------------
// Defines listeners and methods for the Global Site Search (macro siteSearch.txt)
// Uses Bootstrap's Typeahead plugin
// http://twitter.github.com/bootstrap/javascript.html#typeahead
define('SiteSearch', ['Facets.Translator', 'Facets.Model'], function (Translator, Model)
{
	'use strict';

	// SiteSearch.currentSearchOptions() - Returns current search options formatted as query params.
	var currentSearchOptions = function ()
	{			
		var newOptions = []
		,	currentOptions = SC.Utils.parseUrlOptions(window.location.href);

		_.each(currentOptions, function (value, key)
		{
			var lowerCaseKey = key.toLowerCase();

			if (lowerCaseKey === 'order' || lowerCaseKey === 'show' ||  lowerCaseKey === 'display')
			{
				newOptions.push(lowerCaseKey + '=' + value);
			}
		});

		var newOptionsStr = newOptions.join('&');

		if (newOptionsStr.length > 0)
		{
			newOptionsStr = '&' + newOptionsStr;
		}

		return newOptionsStr;					
	};

	// This object's methods are ment to be added to the layout
	var SiteSearch = {

		// method call on submit of the Search form
		searchEventHandler: function (e)
		{
			e.preventDefault();
			
			var inputSearchVal = jQuery(e.target).find('input').val();
			window.location.href = jQuery('.site-search-container li[data-value="see-all-' + inputSearchVal + '"] a').attr('href');
		}

	,	seeAllEventHandler: function (e, typeahead)
		{
			this.search(typeahead.query);
		}

	,	focusEventHandler: function ()
		{
			this.$search.find('input').typeahead('lookup');
		}
		 
		//SiteSearch.formatKeywords() - format a search query string according to configuration.js (searchPrefs)
	,	formatKeywords: function (app, keywords)
		{
			var keywordFormatter = app.getConfig('searchPrefs.keywordsFormatter');

			if (keywordFormatter && _.isFunction(keywordFormatter))
			{
				keywords = keywordFormatter(keywords); 
				var maxLength = app.getConfig('searchPrefs.maxLength') || 99999; 
				if (keywords.length > maxLength)
				{
					keywords = keywords.substring(0, maxLength); 
				}
			}

			return keywords; 
		}

	,	search: function (keywords)
		{
			var currentView = this.currentView;
			
			keywords = SiteSearch.formatKeywords(this.getApplication(), keywords); 

			if (this.getApplication().getConfig('isSearchGlobal') || !(currentView && currentView.options.translator instanceof Translator))
			{
				var search_url = this.getApplication().getConfig('defaultSearchUrl')
				,	delimiters = this.typeaheadConfg.application.Configuration.facetDelimiters
				,	keywordsDelimited = delimiters.betweenFacetsAndOptions + 'keywords' + delimiters.betweenOptionNameAndValue;

				// If we are not in Shopping we have to redirect to it
				if (this.getApplication().getConfig('currentTouchpoint') !== 'home')
				{
					window.location.href = this.application.getConfig('siteSettings.touchpoints.home') + '#' + search_url + keywordsDelimited + keywords;
				}
				// Else we stay in the same app
				else
				{
					// We navigate to the default search url passing the keywords
					Backbone.history.navigate(search_url + keywordsDelimited + keywords + currentSearchOptions(), {trigger: true});
					// on any type of search, the search term is removed from the global input box
					this.$search.find('input').val('');
				}

			}
			// if search is not global and we are on the Browse Facet View
			// we might want to use the search to narrow the current list of items
			else
			{
				Backbone.history.navigate(currentView.options.translator.cloneForOption('keywords', keywords).getUrl(), {trigger: true});
			}
		}

	,	processAnchorTags: function (e, typeahead)
		{
			var $anchor, value, item, path, self = this
			,	search_url = this.getApplication().getConfig('defaultSearchUrl');

			typeahead.$menu.find('a').each(function (index, anchor)
			{
				$anchor = jQuery(anchor);
				value = $anchor.parent().data('value');
				item = typeahead.results[value];
				path = item ? item.get('_url') : escape(search_url + '?keywords=' + value.replace('see-all-', '') + currentSearchOptions());

				$anchor
					.attr({'href': path})
					.data({
						touchpoint: 'home'
					,	hashtag: '#' + path
					}).click(function ()
					{
						typeahead.$menu.hide();
					});

				// and manually fix the link because it is a touchpoint
				self.getApplication().getLayout().touchpointMousedown({currentTarget: $anchor}); 
			});

			typeahead.$menu.off('click');
		}

		// typeaheadConfg:
		// methods to customize the user experience of the typeahead
		// http://twitter.github.com/bootstrap/javascript.html#typeahead
		// (important to read the source code of the plugin to fully understand)
	,	typeaheadConfg: {
			// source:
			// trims de query
			// adds the 'see-all' label
			// fetches the data from the model
			// and pre-process it
			source: function (query, process)
			{
				var self = this;
				self.ajaxDone = false;

				this.model = this.model || this.options.model;
				this.labels = this.labels || this.options.labels;
				this.results = this.results || this.options.results;
				this.application = this.application || this.options.application;

				query = SiteSearch.formatKeywords(this.application, jQuery.trim(query)); 

				// if the character length from the query is over the min length
				if (query.length >= this.options.minLength)
				{
					this.labels = ['see-all-' + query];
					process(this.labels);
				}

				// silent = true makes it invisible to any listener that is waiting for the data to load
				// http://backbonejs.org/#Model-fetch
				// We can use jQuery's .done, as the fetch method returns a promise
				// http://api.jquery.com/deferred.done/
				this.model.fetch(
					{
						data: {
							q: query
						,	sort: this.options.sort
						,	limit: this.options.limit
						,	offset: 0
						}
					,	killerId: _.uniqueId('ajax_killer_')
					}
				,	{
						silent: true
					}
				).done(function ()
				{
					self.ajaxDone = true;
					self.results = {};
					self.labels = ['see-all-' + query];

					self.model.get('items').each(function (item)
					{
						// In some ocations the search term meay not be in the itemid
						self.results[item.get('_id') + query] = item;
						self.labels.push(item.get('_id') + query);
					});
					
					process(self.labels);
					self.$element.trigger('processed', self);
				});
			}

			// matcher:
			// Method used to match the query within a text
			// we lowercase and trim to be safe
			// returns 0 only if the text doesn't contains the query
		,	matcher: function (text)
			{
				return ~text.indexOf(SiteSearch.formatKeywords(this.application, jQuery.trim(this.query)));
			}

			// highlighter:
			// method to generate the html used in the dropdown box bellow the search input
		,	highlighter: function (itemid)
			{
				var template = ''
				,	macro = this.options.macro
				,	item = this.results[itemid];

				if (item)
				{
					// if we have macro, and the macro exists, we use that for the html
					// otherwise we just highlith the keyword in the item id
					// _.highlightKeyword is in file Utils.js
					template = macro && SC.macros[macro] ? SC.macros[macro](item, this.query, this.application) : _.highlightKeyword(itemid, this.query);
				}
				else
				{
					if (_.size(this.results))
					{
						// 'See All Results' label
						template = '<strong>' + this.options.seeAllLabel + '<span class="hide">' + this.query + '</span></strong>';
					}
					else if (this.ajaxDone)
					{
						template = '<strong>' + this.options.noResultsLabel + '<span class="hide">' + this.query + '</span></strong>';	
					}
					else
					{							
						template = '<strong>' + this.options.searchingLabel + '<span class="hide">' + this.query + '</span></strong>';	
					}
				}

				return template;
			}
			
			// its supposed to return the selected item
		,	updater: function (itemid)
			{
				var a = this.$menu.find('li[data-value="' + itemid + '"] a')
				,	href = a.attr('href');

				if (href && href !== '#')
				{
					a.trigger('click');
				}
				return '';
			}
			
		,	labels: []
		,	results: {}
		,	model: new Model()
		,	seeAllLabel: _('See all results').translate()
		,	noResultsLabel: _('No results').translate()
		,	searchingLabel: _('Searching...').translate()
		}
	};
	
	return {

		SiteSearch: SiteSearch

	,	mountToApp: function (application)
		{
			var Layout = application.getLayout()
			,	config = application.getConfig('typeahead');
			
			// we add the methods to the layout
			_.extend(Layout, SiteSearch);

			// then we extend the key elements
			_.extend(Layout.key_elements, {search: '#site-search-container'});
			Layout.updateUI();

			// and then the event listeners
			_.extend(Layout.events, {
				'submit #site-search-container form': 'searchEventHandler'
			,	'focus #site-search-container input': 'focusEventHandler'
			,	'seeAll #site-search-container input': 'seeAllEventHandler'
			,	'processed #site-search-container input': 'processAnchorTags'
			});
			
			// We extend the previously defined typeaheadConfg
			// with options from the configuration file
			SiteSearch.typeaheadConfg = _.extend(SiteSearch.typeaheadConfg, {
				application: application
			,	minLength: config.minLength
			,	items: config.maxResults + 1
			,	macro: config.macro
			,	limit: config.maxResults
			,	sort: config.sort
			});
			
			Layout.on('afterRender', function ()
			{
				// after the layout has be rendered, we initialize the plugin
				Layout.$search.find('input').typeahead(SiteSearch.typeaheadConfg);
			});
		}
	};
});
