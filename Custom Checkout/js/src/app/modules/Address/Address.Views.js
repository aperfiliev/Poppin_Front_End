// CreditCard.Views.js
// -----------------------
// Views for handling addresses (CRUD)
define('Address.Views', function ()
{
	'use strict';

	var Views = {};
	
	// Address details view/edit
	Views.Details = Backbone.View.extend({
		
		template: 'address'
		
	,	attributes: {'class': 'AddressDetailsView'}
		
	,	events: {
			'submit form': 'saveForm'

		,	'change form:has([data-action="reset"])': 'toggleReset'
		,	'click [data-action="reset"]': 'resetForm'

		,	'change select[data-type="country"]': 'updateStates'
		,	'blur input[data-type="phone"]': 'formatPhone'
//		,	'blur #ext': 'formatPhone'
		,	'blur input[name="firstfullname"]': 'verifyFirstName'
		,	'blur input[name="lastfullname"]': 'verifyLastName'
		,	'blur input[name="company"]': 'verifyCompany'
		,	'blur input[name="addr1"]': 'verifyAddress'
		,	'blur input[name="city"]': 'verifyCity'
		,	'blur input[name="zip"]': 'verifyZip'	
		
		}
	,	verifyFirstName: function (e){
			var firstname = this.$("input[name='firstfullname']");
			var result = firstname.val();
			firstname.val( result.trim() );
		}
	,	verifyLastName: function (e){
		var name = this.$("input[name='lastfullname']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	verifyCompany: function (e){
			var name = this.$("input[name='company']");
			var result = name.val();
			name.val( result.trim() );
	}
	,	verifyAddress: function (e){
		var name = this.$("input[name='addr1']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	verifyCity: function(e){
		var name = this.$("input[name='city']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	verifyZip: function(e){
		var name = this.$("input[name='zip']");
		var result = name.val();
		name.val( result.trim() );
	}
	,	initialize: function ()
		{
		console.log("Addres views init. Model = " + this.model);
			var self = this;
			this.title = this.model.isNew() ? _('Add New Address').translate() : _('Update Address').translate();
			this.page_header = this.title;
			this.model.on('error',function(err){self.showError(err.errorMessage);});
		}

	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
			this.$('[rel="tooltip"]').tooltip({
				placement: 'right'
			}).on('hide', function(e) {
				e.preventDefault(); 
				jQuery(e.target).next('.tooltip').hide(); 
			});
		}

	,	resetForm: function (e)
		{
			e.preventDefault();
			this.showContent('addressbook');
		}
	

	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	,	formatPhone: function (e)
		{
			var $target = jQuery(e.target);
//			var $target = this.$("input[name='phone1']");
//			this.model.set("phone1",$target.val(),{validate: true});
//			var resultPhone = this.$("input[name='phone1']").val().concat(this.$("input[name='ext']").val());
			$target.val( _( $target.val() ).formatPhone() );
//			this.model.set("phone",(_(resultPhone).formatPhone()),{validate: true});
		}
		
	// initialize states dropdown
	,	updateStates: function (e)
		{
		console.log('update states');
			this.$('[data-type="state"]').closest('.control-group').empty().append(
				SC.macros.statesDropdown({
					countries: this.options.application.getConfig('siteSettings.countries')
				,	selectedCountry: this.$(e.target).val()
				,	manage: this.options.manage ? this.options.manage + '-' : ''
				})
			);
		}
	});
	
	// List profile's addresses
	Views.List = Backbone.View.extend({
	
		template: 'address_book'
	,	page_header: _('Address Book').translate() 
	,	title: _('Address Book').translate() 
	,	attributes: { 'class': 'AddressListView' }
	,	events: { 'click [data-action="remove"]': 'remove' 	
	}

	,	showContent: function ( path, label )
		{
			label = label || path;
			this.options.application.getLayout().showContent(this, label, { text: this.title, href: '/' + path });
		}
		
	// remove address
	,	remove: function(e) {
		
			e.preventDefault();
			
			if ( confirm( _('Are you sure you want to delete this address?').translate() ) )
			{
				console.log("REMOVE ADDRESSS");
				this.collection.get( jQuery(e.target).data('id') ).destroy({ wait: true });
			}
		}
	});

	return Views;
});