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
		,	company: { required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { required: true, msg: _('Zip Code is required').translate() }
		,	phone: { required:true, fn: _.validatePhone }
		}
	
	,	getFormattedAddress: function ()
		{
			var address_formatted = this.get('fullname') + '<br>' +
									(this.get('company') === null ? '' : this.get('company')+ '<br>')  +
									this.get('addr1') + '<br>' +
									(this.get('addr2') === null ? '' :  this.get('addr2') + '<br>')  +
									this.get('city') + ' ' + (this.get('state') === null ? '' :  this.get('state')) + this.get('zip') + ' ' + this.get('country');

			return address_formatted;
		}

	});
});
