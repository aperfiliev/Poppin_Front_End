// Backbone.Model.js
// -----------------
// Extends native Backbone.Model to make internalid the idAttribute
(function ()
{
	'use strict';

	_.extend(Backbone.Model.prototype, {

		url: function ()
		{
			// http://underscorejs.org/#result
			var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

			if (this.isNew()) 
			{
				return base;
			}

			/// This will pass the id as a parameter instead of as part of the url
			return base +'?internalid='+ encodeURIComponent(this.id);
		}

	,	idAttribute: 'internalid'

	});

})();