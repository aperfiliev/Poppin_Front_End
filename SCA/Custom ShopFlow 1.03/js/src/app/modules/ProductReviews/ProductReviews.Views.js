// ProductReviews.Views.js
// -----------------------
// Returns an object with Backbone Views as attributes
// http://backbonejs.org/#View
// * Views.ItemReviewCenter: used when listing all of the reviews of an item
// * Views.Form: to create a new ProductReview
// * Views.FormPreview: to show the user how the review is going to look
define('ProductReviews.Views', function ()
{
	'use strict';
	
	var Views = {};

	// Based on the item's breadcrumb, we suffix '/reviews'
	function getReviewsBaseBreadcrumb (item)
	{
		var result = item.get('_breadcrumb').slice(0);
		
		// we add the new element to the breadcrumb array
		result.push({
			href: item.get('_url') +'/reviews'
		,	text: _('Reviews').translate()
		});
		
		return result;
	}
	
	// Views.ItemReviewCenter:
	// This view is shown when listing the reviews of an item
	// contains event handlers for voting helpfulness and flaging a review
	Views.ItemReviewCenter = Backbone.View.extend({
		
		template: 'reviews_center_for_item'
		
	,	attributes: {
			'id': 'item-product-reviews'
		,	'class': 'item-product-reviews'
		}
	
	,	events: {
			'click [data-type="vote"]': 'markReview'
		,	'click [data-action="flag"]': 'markReview'
		}
		
	,	initialize: function (options)
		{
			this.item = options.item;
			this.baseUrl = options.baseUrl;
			this.application = options.application;
		}
		
	,	showContent: function ()
		{
			// we set up both title and page_header for the view
			this.title = this.page_header = _('$(0) reviews').translate(this.item.get('_name'));

			this.application.getLayout().showContent(this);
		}
		
		// creates a new url based on a new filter or sorting options
	,	getUrlForOption: function (option)
		{
			var options = {}
			,	sort = option.sort || this.options.queryOptions.sort
			,	filter = option.filter || this.options.queryOptions.filter;
			
			if (filter)
			{
				options.filter = filter;
			}

			if (sort)
			{
				options.sort = sort;
			}

			return this.baseUrl +'?'+ jQuery.param(options);
		}

	,	handleMarkSuccess: function (review_id, action, review, $container)
		{
			var productReviews = this.application.getConfig('productReviews')
			,	currentReviewedItems = JSON.parse(jQuery.cookie('votedReviewsId') || '{}');

			// this should be always false because you cannot mark an already marked review
			if (!currentReviewedItems[review_id])
			{
				currentReviewedItems[review_id] = {};
				currentReviewedItems[review_id][action] = true;
				jQuery.cookie('votedReviewsId', JSON.stringify(currentReviewedItems));
				
				var rated = {};
				rated[action] = true;
				rated.voted = true;
				review.set('rated', rated);
			}

			$container
				// we re-render the macro with the new data
				.html(
					// we use the reviewMacro from the config file
					// we pass the review that was just edited
					// and the configuration options for Product Reviews
					SC.macros[productReviews.reviewMacro](review, _.extend({showActionButtons: true}, productReviews))
				)
				// and we let the user know it all went ok
				.find('[data-type="alert-placeholder"]').html(
					SC.macros.message('<b>Thank You!</b> We love your feedback.', 'success', true)
				);
		}

	,	handleMarkError: function ($container)
		{
			// otherwise we show an error message
			$container
				.find('[data-type="vote"]').removeClass('disabled').end()
				.find('[data-type="alert-placeholder"]').html(
					SC.macros.message('<b>We are sorry!</b> There has been an error, please try again later.', 'error', true )
				);
		}
		
		// handles the ajax call to vote or flag a review
	,	markReview: function (e)
		{
			var $element = jQuery(e.target);

			if (!$element.hasClass('disabled'))
			{
				var	rated = {}
				,	proxy = jQuery.proxy

				,	action = $element.data('action')
				,	$container = $element.closest('.review-container')

					// we get the review from the collection
				,	review_id = $element.data('review-id')
				,	review = this.collection.get(review_id);

				$element.addClass('disabled');
				
				rated[action] = true;

				// we set the action that we are going to call
				review.set({
					action: action
				,	rated: rated
				});

				// and then we do the save the review
				review.save().then(
					proxy(this.handleMarkSuccess, this, review_id, action, review, $container)
				,	proxy(this.handleMarkError, this, $container)
				);
			}
		}
		
	,	getBreadcrumb: function ()
		{
			return getReviewsBaseBreadcrumb(this.item);
		}
	});
	
	// Views.Form:
	// This view is used to render the Product Review form
	// It handles the rating and submission of the review
	Views.Form = Backbone.View.extend({
		
		template: 'review_form'
		
	,	attributes: {
			'id': 'product-review-form'
		,	'class': 'product-review-form'
		}
		
	,	title: _('Write your Review').translate()
		
	,	page_header: _('Write your Review').translate()
	
	,	events: {
			'rate [data-toggle="rater"]': 'rate'
		,	'submit form#new-product-review': 'preview'
		}
	
	,	initialize: function (options)
		{
			this.item = options.item;
			this.tmpRatingPerAtribute = {};
			this.application = options.application;
			// we let the view know if the customer is logged in
			// as this might be required to add a review
			this.isLoggedIn = options.application.getUser().get('isLoggedIn') === 'T';
			
			
			// if the user is logged in and this is the first time we're initializing the view we preload the nickname
			if (this.isLoggedIn && !(this.model.get('writer') && this.model.get('writer').name))
			{
				this.model.set('writer',{'name':  options.application.getUser().get('firstname') });
			}
		}

	,	showContent: function ()
		{
			if (this.model.get('text'))
			{
				// if the model contains text (if comming from a Preview View)
				// we need to parse all html line breaks into regular ones
				this.model.set('text', this.model.get('text').replace(/<br>/g, '\n'));
			}

			var self = this;

			this.application.getLayout().showContent(this).done(function ()
			{
				// we initialize our custom plugin for rating
				// (file: Bootstrap.Rate.js)
				self.$('[data-toggle="rater"]').rater();
			});
		}
		
		// sets the rating of an attribute in the model
	,	rate: function (e, rater)
		{

			var attributes_to_rate_on = this.item.get('_attributesToRateOn');
			
			// if the name is not in attributes_to_rate_on
			if (~_.indexOf(attributes_to_rate_on, rater.name))
			{
				this.tmpRatingPerAtribute[rater.name] = rater.value;
			}
			else if (rater.name === '__overall__')
			{
				this.tmpRating = rater.value;
				// rate touched is a flag to prevent auto computing the overall rating
				this.rateTouched = true;
			}
			
			if (!this.rateTouched && this.application.getConfig('productReviews.computeOverall'))
			{
				// auto compute the overall rating
				var average = Math.round(_.reduce(_.values(this.tmpRatingPerAtribute), function(memo, num){return memo+num; }, 0) / attributes_to_rate_on.length);
				this.$('[data-toggle="rater"][data-name="__overall__"]').data('rater').setValue(average, true);
				this.model.set('rating', average);
			}
		}

		// method to parse html tags into text
	,	sanitize: function (text)
		{
			return jQuery.trim(text).replace(/</g, '&lt;').replace(/\>/g, '&gt;');
		}
		
		// When the Preview button is clicked
	,	preview: function (e)
		{
			e && e.preventDefault();

			// it sets the Model's text, title and writer
			this.model.set({
				title: this.sanitize(this.$('#title').val())
			,	rating: this.tmpRating || this.model.get('rating')
			,	rating_per_attribute: this.tmpRatingPerAtribute ||  this.model.get('rating_per_attribute')
			,	writer: {name: this.sanitize(this.$('#writer').val())}
			,	text: this.sanitize(this.$('#text').val()).replace(/\n/g, '<br>')
			});

			// Then we show the FormPreview using the same Model
			// Notice: the Model contains the selected rate for the different attributes
			// plus the text, title and writer that were set up right above this comment						
			this.$savingForm = jQuery(e.target).closest('form');
			if (this.model.isValid(true)) {
				new Views.FormPreview(this.options).showContent();
			}
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Write New').translate()
			});
			
			return result;
		}
	});
	
	// Views.FormPreview:
	// This view is shown prior to the form's submission
	// Handles both edit and save events
	// * edit renders the form view
	// * save submits the form and renders the confirmation view
	Views.FormPreview = Backbone.View.extend({
		
		template: 'review_form_preview'
		
	,	attributes: {
			'id': 'product-review-form-preview'
		,	'class': 'product-review-form-preview'
		}
		
	,	title: _('Submit your Review').translate()
		
	,	page_header: _('Submit your Review').translate()
	
	,	events: {
			'click [data-action="edit-review"]': 'edit'
		,	'submit form': 'save'
		}
		
	,	initialize: function (options)
		{
			this.item = options.item;
		}
		
		// when the edit button is clicked, we show the Form view
	,	edit: function ()
		{
			new Views.Form(this.options).showContent();
		}
		
	,	save: function (e)
		{
			e && e.preventDefault();
			
			var self = this;
			
			this.model
				.set('itemid', this.item.get('internalid'))
				.save(null, {
					
					success: function ()
					{
						// Once the review is submited, we show the Confirmation View
						var preview_review = new Views.FormConfirmation(self.options);
						preview_review.showContent();
					}
					
				,	statusCode: {
						'401': function ()
						{
							// If login is required from the server side
							// we need to handle it here
						}
					}
				});
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Preview').translate()
			});
			
			return result;
		}
	});
	
	Views.FormConfirmation = Backbone.View.extend({ 
		
		template: 'review_form_confirmation'
		
	,	attributes: {
			'id': 'product-review-form-confirmation'
		,	'class': 'product-review-form-confirmation'
		}
		
	,	title: _('Thank You! Your review has been submitted.').translate()
		
	,	page_header: _('<b>Thank You!</b> Your review has been submitted.').translate()
	
	,	events: {}
		
	,	initialize: function (options)
		{
			this.item = options.item;
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Thank you').translate()
			});
			
			return result;
		}
	});
	
	return Views;
});
