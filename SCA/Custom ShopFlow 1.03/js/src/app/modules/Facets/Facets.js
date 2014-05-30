// Facets.js
// ---------
// AKA Item List.
// This is the index, routes in the router are assigned here
define(
	'Facets'
,	['Facets.Translator', 'Facets.Helper', 'Facets.Model', 'Facets.Router', 'Facets.Views', 'Categories']
,	function (Translator, Helper, Model, Router, Views, Categories)
{
	'use strict';
	
	return {
		Translator: Translator
	,	Helper: Helper
	,	Model:  Model
	,	Router: Router
	,	Views: Views
	,	mountToApp: function (application) {
			
			// Formats a configuration object in the way the translator is expecting it
			application.translatorConfig = {
				fallbackUrl: application.getConfig('defaultSearchUrl')
			,	defaultShow: _.find(application.getConfig('resultsPerPage'), function (show) { return show.isDefault; }).items || application.getConfig('resultsPerPage')[0].items
			,	defaultOrder: _.find(application.getConfig('sortOptions'), function (sort) { return sort.isDefault; }).id || application.getConfig('sortOptions')[0].id
			,	defaultDisplay: _.find(application.getConfig('itemsDisplayOptions'), function (display) { return display.isDefault; }).id || application.getConfig('itemsDisplayOptions')[0].id
			,	facets: application.getConfig('facets')
			,	facetDelimiters: application.getConfig('facetDelimiters')
			,	facetsSeoLimits: application.getConfig('facetsSeoLimits')
			};
			
			var routerInstance = new Router(application);
			
			// we are construncting this regexp like:
			// /^\b(toplevelcategory1|toplevelcategory2|facetname1|facetname2|defaulturl)\b\/(.*?)$/
			// and adding it as a route

			// Get the facets that are in the sitesettings but not in the config.
			// These facets will get a default config (max, behavior, etc.) - Facets.Translator
			var only_in_site_settings = _.difference(_.pluck(application.getConfig('siteSettings.facetfield'), 'facetfieldid'),
										_.pluck(application.getConfig('facets'), 'id'));


			// Here we generate an array with:
			// * The default url
			// * The Names of the facets that are in the siteSettings.facetfield config
			// * the url of the configured facets
			// * And the url of the top level categories
			var components = _.compact(_.union(
				[application.translatorConfig.fallbackUrl]
			,	only_in_site_settings || []
			,	_.pluck(application.translatorConfig.facets, 'url') || []
			,	Categories.getTopLevelCategoriesUrlComponent() || []
			));
			
			// Generate the regexp and adds it to the instance of the router
			var facet_regex = '^\\b(' + components.join('|') + ')\\b(.*?)$';
			routerInstance.route(new RegExp(facet_regex), 'facetLoading');

			// Wires some config to the model
			Model.mountToApp(application);
			
			return routerInstance;
		}
	};
});
