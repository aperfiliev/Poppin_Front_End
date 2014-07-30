// Address.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Address.Model', function ()
{
	'use strict';
	
	return Backbone.Model.extend(
	{
		urlRoot: 'services/address.ss'
	,	events:{
		'error': 'showError'
	}
	,	validation: {
			lastfullname: { /*required: true, msg: _('Last Name is required').translate()*/ 
				fn: function(value){

					var reg = /^[a-zA-Z- ]{2,}$/;
					if(value.length == 0 || !reg.test(value)){
						return _('Hey, Professor Imistypedmyname, want to try again?').translate();
					}
					
//					if(value.indexOf(',')>-1||value.indexOf('.')>-1){
//						return 'Last name can not contain comma or period symbols';
//					}
					
				}
			}
		,	firstfullname: { /*required: true, msg: _('First Name is required').translate(),*/
				fn: function(value){

					var reg = /^[a-zA-Z- ]{2,}$/;
					if(value.length == 0 || !reg.test(value)){
						return _('Is that really your firstname? Try again').translate();
					}
					
//					if(value.indexOf(',')>-1||value.indexOf('.')>-1||value.indexOf(' ')>-1){
//						return 'First name can not contain space, comma or period symbols';
//					}
				}

			}
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T', msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { required: true, msg: _('Zip Code is required').translate() }
		,	phone: { required:true,fn:_.validatePhone}
		}
	
	,	getFormattedAddress: function ()
		{
			var address_formatted = this.get('firstfullname') + '<br>'+
									this.get('fullname') + '<br>' +
									(this.get('company') === null ? '' : this.get('company')+ '<br>')  +
									this.get('addr1') + '<br>' +
									(this.get('addr2') === null ? '' :  this.get('addr2') + '<br>')  +
									this.get('city') + ' ' + (this.get('state') === null ? '' :  this.get('state')) + this.get('zip') + ' ' + this.get('country');

			return address_formatted;
		}
		// render the error message
	,	showError: function (error)
	{
		console.log('address model show error');
		// Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder. 
//		this.$('[data-type="alert-placeholder-module"]:first').html( 
//			SC.macros.message('dsd', 'error', true) 
//		);
	}
	});
});
