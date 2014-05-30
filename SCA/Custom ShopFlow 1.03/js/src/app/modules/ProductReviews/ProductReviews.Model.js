// ProductReviews.Model.js
// -----------------------
// It returns a new instance of a Backbone CachedModel
// (file: Backbone.cachedSync.js)
// initializes writer and rating per attribute if null or undefined
define('ProductReviews.Model', function ()
{
	'use strict';
	
	return Backbone.CachedModel.extend({
		
		urlRoot: 'services/product-reviews.ss'
		// conditions for each of the fields to be valid
		// [Backbone.Validation](https://github.com/thedersen/backbone.validation)
	,	validation: {
			rating: {required: true, msg: _('Rating is required').translate()}
		,	title: {
				fn: function(val)
				{
					if (!val)
					{
						return _('Title is required').translate(); 
					} 
					else if (val.length>=199)
					{
						return _('The field name cannot contain more than the maximum number ( 199 ) of characters allowed.').translate(); 
					}
				}
			}
		,	'writer.name': {required: true, msg: _('Writer is required').translate()}
		}

	,	initialize: function ()
		{
			// We need to set this attributes to the model
			// so they get validated
			this.get('rating_per_attribute') || this.set('rating_per_attribute', {});
			this.get('rating') || this.set('rating', null);
			this.get('writer') || this.set('writer', {});
			this.get('title') || this.set('title', '');
		}

	,	parse: function (response)
		{
			response.rated = JSON.parse(jQuery.cookie('votedReviewsId') || '{}')[response.internalid];
			return response;
		}
	});
});