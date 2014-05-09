// Facets.Router.js
// ----------------
// Mixes the Translator, Model and View
define('Facets.Router', ['Facets.Views', 'Facets.Helper', 'Facets.Model', 'Categories'], function (Views, Helper, Model, Categories)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		initialize: function (application)
		{
			this.application = application;
			this.translatorConfig = application.translatorConfig;
			//this.showCategoryPage();
		}
		
		// router.facetLoading
		// This handles all the routes of the item list
	,	facetLoading: function ()
		{
			// If the previouse view was a Views.Browse (Item List) we 
			// re render the facets so links gets upated (For the nervous clicker)
			var current_view = this.application.getLayout().currentView;
			if (current_view instanceof Views.Browse)
			{
				current_view.renderFacets(Backbone.history.fragment); // calls parse url
			}
			
			// Creates a translator
			var translator = Helper.parseUrl(Backbone.history.fragment, this.translatorConfig);

			// Should we show the category Page?
			if (this.isCategoryPage(translator))
			{
				return this.showCategoryPage(translator);
			}

			// Model
			var model = new Model()
			// and View
			,	view = new Views.Browse({
					translator: translator
				,	translatorConfig: this.translatorConfig
				,	application: this.application
				,	model: model
				});
			
			model.fetch({
				data: translator.getApiParams()
			,	killerId: this.application.killerId
			,	success: function ()
				{
					translator.setLabelsFromFacets(model.get('facets') || []);
					view.showContent();
				}
			});
		}

		// router.¡sCategoryPage
		// Returs true if this is the top category page, 
		// override it if your implementation difers from this behavior 
	,	isCategoryPage: function(translator)
		{
			var current_facets = translator.getAllFacets()
			,	categories = Categories.getBranchLineFromPath(translator.getFacetValue('category'));

			return (current_facets.length === 1 && current_facets[0].id === 'category' && categories.length === 1 && _.size(categories[0].categories));
		}

	,	showCategoryPage: function(translator)
		{
			var view = new Views.BrowseCategories({
				translator: translator
			,	translatorConfig: this.translatorConfig
			,	application: this.application
			});
			
			view.showContent();
		}

	});
});
