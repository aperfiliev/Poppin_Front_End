// CreditCard.Router.js
// -----------------------
// Router for handling credit cards (CRUD)
define('CreditCard.Router', ['CreditCard.Views','CreditCard.Model'], function (Views,Model)
{
	'use strict';
	
	return Backbone.Router.extend({

		routes: {
			'creditcards': 'creditCards'
		,	'creditcards/new': 'newCreditCard'
		,	'creditcards/:id': 'creditCardDetailed'
		}
		
	,	initialize: function (application)
		{
			this.application = application;
		}
	
	// creditcards list	
	,	creditCards: function ()
		{
			var collection = this.application.getUser().get('creditcards');

			if (collection.length)
			{
					var view = new Views.List({
						application: this.application
					,	collection: collection
					});

				collection.on('reset destroy change add', function () {
					this.creditCards();
				}, this);

				view.showContent('creditcards');
			}
			else
			{
				Backbone.history.navigate('#creditcards/new', { trigger: true });
			}
		}

	// view credit card details	
	,	creditCardDetailed: function (id)
		{
			var collection = this.application.getUser().get('creditcards')
			,	model = collection.get(id)
			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				,	model: model
				});
			
			model.on('reset destroy change add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#creditcards', {trigger: true});
				}
			}, view);
			
			view.showContent('creditcards');
		}

	// add new credit card 
	,	newCreditCard: function ()
		{
			var name = "cvc",
			value = "",
			days = -1;

            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + value + expires + "; path=/";
        
			var collection = this.application.getUser().get('creditcards')

			,	view = new Views.Details({
					application: this.application
				,	collection: collection
				// the paymentmethods are use for credit card number validation
				,	model: new Model({}, {paymentMethdos: this.application.getConfig('siteSettings.paymentmethods')})
				});
			
			collection
				.on('add', function ()
				{
					if (view.inModal && view.$containerModal)
					{
						view.$containerModal.modal('hide');
						view.destroy();
					}
					else
					{
						Backbone.history.navigate('#creditcards', { trigger: true });
					}

				}, view);

			view.model.on('change', function  (model) {
				collection.add(model, {merge: true});
			}, this);
			
			view.showContent('creditcards');
		}

	});
});
