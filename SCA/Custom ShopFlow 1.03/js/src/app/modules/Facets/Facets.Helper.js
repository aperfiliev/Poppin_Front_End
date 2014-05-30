// Facets.Helper.js
// ----------------
// Helps you with the creation of translators
define('Facets.Helper', ['Facets.Translator'], function (Translator)
{
	'use strict';

	return {
		settings_stack: []

		// Helper.parseUrl
		// Returns a Facet.Translator for the passed url and configuration
	,	parseUrl: function (url, configuration) {
			return new Translator(url, null, configuration);
		}

	// TODO: Deprecate this current methods. as they are not being used.
	,	setCurrent: function (settings) {
			this.settings_stack.push(settings);
		}
	
	,	getCurrent: function () { 
			return this.settings_stack[this.settings_stack.length - 1];
		}
		
	,	getPrevious: function () {
			return this.settings_stack[this.settings_stack.length - 2];
		}
	};
});