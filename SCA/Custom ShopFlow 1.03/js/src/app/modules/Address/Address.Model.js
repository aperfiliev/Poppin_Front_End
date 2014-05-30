// Address.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Address.Model', function ()
{
	'use strict';
	
	return Backbone.Model.extend(
	{
		urlRoot: 'services/address.ss'
	
	,	validation: {
			fullname: { required: true, msg: _('Full Name is required').translate() }
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: SC.ENVIRONMENT.siteSettings && SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { required: true, msg: _('Zip Code is required').translate() }
		,	phone: { required:true, fn: _.validatePhone }
		}
	
	,	getFormattedAddress: function ()
		{
			var address_formatted = '<span class="fullname">' + this.get('fullname') + '</span><br>' +
									(this.get('company') === null ? '' : '<span class="company">' + this.get('company')+ '</span><br>')  +
									'<span class="addr1">' + this.get('addr1') + '</span><br>' +
									(this.get('addr2') === null ? '' :  '<span class="addr2">' + this.get('addr2') + '</span><br>')  +
									'<span class="city">' + this.get('city') + '</span> ' + (this.get('state') === null ? '' :  ('<span class="state">' + this.get('state')) + '</span>&nbsp;<span class="zip">' + this.get('zip') + '</span>&nbsp;<span class="country"> ' + this.get('country') + '</span>');

			return address_formatted;
		}

	});
});
