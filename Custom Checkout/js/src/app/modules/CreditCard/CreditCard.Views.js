// CreditCard.Views.js
// -----------------------
// Views for handling credit cards (CRUD)
define('CreditCard.Views', function ()
{
	'use strict';

	var Views = {};
	
	// Credit card details view/edit
	Views.Details = Backbone.View.extend({
		
		template: 'creditcard'
	,	attributes: { 'class': 'CreditCardDetailsView' }
	,	events: {
			'submit form': 'saveForm'
		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'
		,	'change form [name="ccnumber"]': 'setPaymethodId'
		,	'click [name="whatisthis"]': 'showCVCInfo'
		}
	,	showCVCInfo: function (){
		jQuery('#whatisthisinfo').show();
	}
		
	,	initialize: function ()
		{
			this.title = this.model.isNew() ? _('Add Credit Card').translate() : _('Edit Credit Card').translate() ;
			this.page_header = this.title;
			
			// initialize date selector
			var currentExpYear = this.model.get('expyear'), newExpYear = new Date().getFullYear(), range = _.range(new Date().getFullYear(), new Date().getFullYear() + 25 );
			if(currentExpYear && currentExpYear < newExpYear)
			{
				range = _.union([parseInt(currentExpYear, 10)], range);
				this.options.expyear = currentExpYear;
			}
			if (!this.model.get('expmonth'))
			{
				this.options.currentMonth = new Date().getMonth() + 1;
			}									
			this.options.months = _.range( 1, 13 );
			this.options.years = range;
			this.options.showDefaults = false;
		}
	,	setPaymethodId: function(e)
		{
			var cc_number = jQuery(e.target).val()
			,	form = jQuery(e.target).closest('form')
			,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

			if (paymenthod_id)
			{	
				form.find('[name="paymentmethod"]').val(paymenthod_id);
				form.find('[data-image="creditcard-icon"]').each(function(index, img){
					var $img = jQuery(img);
					if ($img.data('value').toString() === paymenthod_id)
					{
						$img.show();
					}
					else
					{
						$img.hide();
					}
				});
			}
		}
	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('creditcards');
		}

	});
	
	// Credit cards list
	Views.List = Backbone.View.extend({
	
		template: 'creditcards'
	,	title: _('Credit Cards').translate() 
	,	page_header: _('Credit Cards').translate() 
	,	attributes: { 'class': 'CreditCardListView' }
	,	events: { 'click [data-action="remove"]': 'remove' }

	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	,	remove: function (e)
		{
			e.preventDefault();

			if ( confirm( _('Are you sure you want to delete this Credit Card?').translate() ) )
			{
				this.collection.get( jQuery(e.target).data('id') ).destroy({ wait: true });
			}
		}
	});

	return Views;
});