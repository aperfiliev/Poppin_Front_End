// OrderWizard.Module.Address.js
// -----------------------------
define('OrderWizard.Module.Address', ['Wizard.Module', 'Address.Views', 'Address.Model'], function (WizardModule, AddressViews, AddressModel)
{
	'use strict';

	return WizardModule.extend({
 
		template: 'order_wizard_address_module'

	,	changeLinkText: SC.ENVIRONMENT.PROFILE.isGuest !== 'T' ? _('Change address').translate() : _('Edit Address').translate()

	,	selectMessage: _('Use this address').translate()
	,	sameAsMessage: _('Same as address').translate()
	,	selectAddressErrorMessage: _('Please select an address').translate()

	,	invalidAddressErrorMessage: {
			errorCode: 'ERR_CHK_INVALID_ADDRESS'
		,	errorMessage: _('The selected address is invalid').translate()
		}

	,	events: {
			'click [data-action="submit"]': 'submit'
		,	'click [data-action="select"]': 'selectAddress'
		,	'click [data-action="change-address"]': 'changeAddress'
		,	'change [data-action="same-as"]': 'markSameAs'
		,	'change form': 'changeForm'
		,	'click #copyshipping' : 'setSameAsShipping'	
		}

	,	errors: ['ERR_CHK_INCOMPLETE_ADDRESS', 'ERR_CHK_INVALID_ADDRESS']

//	,	initialize: function(){
//		console.log(this.getAddressesToShow());
//		if(this.addressId==null && this.getAddressesToShow().length>0){
////			this.manualSelectAddress(this.getAddressesToShow().models[0].id);
////			console.log(address_book.models[0].id);
//		}
//	}
		// module.render
		// -------------
	,	render: function (not_trigger_ready)
		{
			var profile = this.wizard.options.profile;


			this.addresses = profile.get('addresses');
			this.isGuest = profile.get('isGuest') === 'T';
			this.isSameAsEnabled = this.options.enable_same_as;

			this.addressId = this.model.get(this.manage);

			// if the selected manage address is the fake one
			if (this.addressId && ~this.addressId.indexOf('null'))
			{
				// we silently remove it
				this.setAddress(null, {
					silent: true
				});
			}

			this.evaluateSameAs();
			this.address = this.getSelectedAddress();
			
			this.address.set("payPalUrl",profile.get("paypalUrl"));
			if(this.address.isNew()){
				this.address.set("firstfullname",profile.get("firstname"));
				this.address.set("lastfullname",profile.get("lastname"));
				this.address.set("company",profile.get("companyname"));
//				this.address.set("label",this.wizard.currentStep);
			}

			// Add event listeners to allow special flows
			this.eventHandlersOn();

			// Calls the render function
			this._render();

			this.addressView = null;
			this.addressListView = null;

			var is_address_new = this.address.isNew()
			,	show_address_form = is_address_new || (this.isGuest && !this.addressId);

			// The following is used to match the logic on file order_wizard_address_module.txt
			// when the conditions apply, only the address details are shown
			// that means there are no form or list views required
	/**		if ((this.isSameAsEnabled && this.sameAs) || this.addressId && !is_address_new)
			{
				null;
			}
			else*/ 
			if(this.address.isNew()){
				this.addressView = new AddressViews.Details({
					application: this.wizard.application
				,	collection: this.addresses
				,	model: this.address
				,	manage: this.manage
				});

				// as the form was already renderd within the template of this, we just grab a reference to it 
				this.addressView.$el = this.$('#address-module-form-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressView);
				this.addressView.delegateEvents();

				// if the user is a guest, and its editing the already submited address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}
			else if (this.getAddressesToShow().length && !this.isGuest)
			{
				this.addressListView = new AddressViews.List({
					application: this.wizard.application
				,	collection: this.addresses
				});

				// as the list was already renderd within the template of this, we just grab a reference to it 
				this.addressListView.$el = this.$('#address-module-list-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressListView);
				this.addressListView.delegateEvents();
			}
			else
			{
				this.addressView = new AddressViews.Details({
					application: this.wizard.application
				,	collection: this.addresses
				,	model: this.address
				,	manage: this.manage
				});

				// as the form was already renderd within the template of this, we just grab a reference to it 
				this.addressView.$el = this.$('#address-module-form-placeholder');

				// then we bind the events and validation
				Backbone.Validation.bind(this.addressView);
				this.addressView.delegateEvents();

				// if the user is a guest, and its editing the already submited address
				// we set that address as the current one so we don't create a new address
				// in the guest's address book.
				if (this.isGuest && !is_address_new)
				{
					this.setAddress(this.address.id, {
						silent: true
					});
				}
			}

			// TODO: Add comments
			if (!show_address_form && !this.addressId)
			{
				this.trigger('navbar_toggle', false);
			}
			else
			{
				this.trigger('navbar_toggle', true);
			}

			// TODO: Add comments
			if ((!_.isBoolean(not_trigger_ready) || !not_trigger_ready) && this.address && this.addressId)
			{
				this.trigger('ready', true);
			}

			// when you remove the address the macro is re-rendered but not the view.
			this.$('[data-toggle="tooltip"]').tooltip({
				html: true
			});
		}

	,	evaluateSameAs: function ()
		{
			var manage_address_id = this.addressId
			,	other_address = this.getTheOtherAddress()
			,	other_address_id = other_address && other_address.get('internalid') || null;

			if (manage_address_id && manage_address_id === other_address_id)
			{
				this.sameAs = true;
			}
			else if (!this.tempAddress && manage_address_id !== other_address_id)
			{
				this.sameAs = false;
			}
			else
			{	
				// We need a default sameAs value so is no longer undefined
				// if the sameAs was checked, and we have an address id set or there is a temporary address
				this.sameAs = this.sameAs && (manage_address_id || this.tempAddress || (this.isGuest && this.addresses.length));
			}
		}

	,	eventHandlersOn: function ()
		{
			var self = this
			,	other_address = this.sameAsManage;

			this.eventHandlersOff();

			this.addresses
				// Adds events to the collection
				.on('reset destroy change add', jQuery.proxy(this, 'render', true), this)
				.on('destroy', function (deleted_address)
				{
					// if the destroyed address was used as the sameAs
					if (self.model.get(other_address) === deleted_address.id)
					{
						// we need to remove it, as it doesn't exists
						self.model.set(other_address, null);
					}
				}, this);

			// when the value for the other address changes
			this.model
				.on('change:' + other_address, function (model, value)
				{
					console.log('change event');
					// If same as is enabled
					// and its selected, and the other address changes to a "truthy" value
					if (self.isSameAsEnabled && self.sameAs)
					{
						// we change this manage to the value
						self.setAddress(value);
						// and re-render
						self.render();
					}
				}, this);

			if (this.isSameAsEnabled && this.sameAs)
			{
				this.model.on('change:temp' + other_address, function (model, temp_address)
				{
					self.tempAddress = temp_address;
					self.render();
				}, this);
			}
		}

	,	eventHandlersOff: function ()
		{
			// Removes prevously added events on the address collection
			this.addresses && this.addresses.off(null, null, this);
			this.model
				.off('change:' + this.sameAsManage, null, this)
				.off('change:temp' + this.sameAsManage, null, this);
		}

	,	past: function () 
		{
			this.eventHandlersOff();
		}

	,	future: function ()
		{
			this.eventHandlersOff();
		}

		// module.selectAddress
		// --------------------
		// Captures the click on the select button of the addresses list 
	,	selectAddress: function (e)
		{
			jQuery('.wizard-content .alert-error').hide(); 

			// Grabs the address id and sets it to the model
			// on the position in which our sub class is manageing (billaddress or shipaddress)
			this.setAddress(jQuery(e.target).data('id').toString());

			// re render so if there is changes to be shown they are represented in the view
			this.render();              

			// As we already set the address, we let the step know that we are ready
			this.trigger('ready', true);
		}
	,	manualSelectAddress: function (addressid)
	{
		jQuery('.wizard-content .alert-error').hide(); 

		// Grabs the address id and sets it to the model
		// on the position in which our sub class is manageing (billaddress or shipaddress)
		this.setAddress(addressid);

		// re render so if there is changes to be shown they are represented in the view
		this.render();              

		// As we already set the address, we let the step know that we are ready
		this.trigger('ready', true);
	}

	,	setAddress: function (address_id, options)
		{
			this.model.set(this.manage, address_id, options);
			this.addressId = address_id;

			return this;
		}

	,	unsetAddress: function (norender, options)
		{
			this.setAddress(null, options);
			this.tempAddress = null;

			if (!norender)
			{
				this.render();
			}
		}

	,	changeAddress: function (e)
		{
			e.preventDefault();
			e.stopPropagation();
			
			if (this.options.edit_url)
			{
				this.unsetAddress(true);
				
				Backbone.history.navigate(this.options.edit_url + '?force=true', {
					trigger: true
				});
			}
			else
			{
				this.unsetAddress();
			}
		}
	,	parsePhoneNumber: function(phone_number){
			var s2 = (""+phone_number).replace(/\D/g, '');
			var m = s2.match(/^(\d{6})(\d{4})$/);
			return (!m) ? null : [m[1], m[2]];
		}
	,	setSameAsShipping: function(e)
		{
			var addressmodels = this.getAddressesToShow();
			var defaultshippingresult = null;
			if(addressmodels.models.length==1){
				defaultshippingresult =  addressmodels.models[0];
			}
			else{
				for(var i=0;i< addressmodels.models.length;i++){
					if(addressmodels.models[i].attributes.defaultshipping=='T'){
						defaultshippingresult = addressmodels.models[i];
					}
				}
				if(defaultshippingresult==null){
					defaultshippingresult =  addressmodels.models[0];
				}
			}
			
			//var defaultshippingresult = _.filter(addressmodels.models,function(model){ return model.attributes.defaultshipping=='T';});
//			var defaultshippingresult = _.filter(addressmodels.models,function(model){ return model.attributes.defaultshipping=='T';});
//			if(defaultshippingresult.length==0){
//				defaultshippingresult = addressmodels.models[0];
//			}
			
			var shipping_source = defaultshippingresult;
			if(jQuery(e.target).prop('checked')){
				var formPhoneNumber = this.$('input[name="phone"]').val()+this.$('input[name="ext"]').val();
				if(this.$('input[name="addr1"]').val()!=''
				|| this.$('input[name="addr2"]').val()!=''
				|| this.$('select[name="namePrefix"]').val()!=''
				|| this.$('input[name="city"]').val()!=''
				|| this.$('select[name="state"]').val()!='' 
				|| this.$('input[name="zip"]').val()!=''
				|| formPhoneNumber!=''
				){
					if(confirm('You have entered another address, by checking this box we will use your shipping address as your billing address')){
						this.$('input[name="addr1"]').val(shipping_source.attributes.addr1);
						this.$('input[name="addr2"]').val(shipping_source.attributes.addr2);
						this.$('select[name="namePrefix"]').val(shipping_source.attributes.namePrefix);
						this.$('input[name="city"]').val(shipping_source.attributes.city);
						this.$('select[name="state"]').val(shipping_source.attributes.state);
						this.$('input[name="zip"]').val(shipping_source.attributes.zip);
						this.$('input[name="phone"]').val(shipping_source.attributes.phone);
						this.$('input[name="ext"]').val(shipping_source.attributes.ext);
					}
			}
			else{
				this.$('input[name="addr1"]').val(shipping_source.attributes.addr1);
				this.$('input[name="addr2"]').val(shipping_source.attributes.addr2);
				this.$('select[name="namePrefix"]').val(shipping_source.attributes.namePrefix);
				this.$('input[name="city"]').val(shipping_source.attributes.city);
				this.$('select[name="state"]').val(shipping_source.attributes.state);
				this.$('input[name="phone"]').val(shipping_source.attributes.phone);
				this.$('input[name="ext"]').val(shipping_source.attributes.ext);
				this.$('input[name="zip"]').val(shipping_source.attributes.zip);
				
			}
			}
			else{
				this.$('input[name="addr1"]').val('');
				this.$('input[name="addr2"]').val('');
				this.$('select[name="namePrefix"]').val('');
				this.$('input[name="city"]').val('');
				this.$('select[name="state"]').val('');
				this.$('input[name="phone"]').val('');
				this.$('input[name="ext"]').val('');
				this.$('input[name="zip"]').val('');
			}
			
		}

		// module.submit
		// -------------
		// The step will call this function when the user clicks next or all the modules are ready
		// Will take care of saving the address if its a new one. Other way it will just 
		// return a resolved promise to comply with the api
	,	submit: function ()
		{
			console.log('submit form address');
			var self = this;
			// its a new address
			if (this.addressView)
			{
				// The saveForm function expects the event to be in an element of the form or the form itself, 
				// But in this case it may be in a button outside of the form (as the bav buttosn live in the step)
				//  or tiggered by a module ready event, so we need to create a fake event which the target is the form itself
				console.log('form0')
				console.log(this.addressView.$('form').get(0));
				var fake_event = jQuery.Event('submit', {
						target: this.addressView.$('form').get(0)
					})
					// Calls the saveForm, this may kick the backbone.validation, and it may return false if there were errors, 
					// other ways it will return an ajax promise
				,	result = this.addressView.saveForm(fake_event);
				// Went well, so there is a promise we can return, before returning we will set the address in the model 
				// and add the model to the profile collection
				if (result)
				{
					
					return result.always(function (model)
					{

						// Address id to the order model. This has to go after before the following model.add() as it triggers the render
						self.setAddress(model.internalid);

						// we only want to trigger an event on add() when the user has some address and is not guest because if not, 
						// in OPC case (two instances of this module in the same page), the triggered re-render erase the module errors. 
						var add_options = (self.isGuest || self.addresses.length === 0) ? {silent: true} : null; 
						self.addresses.add(model, add_options);
						
						self.model.set('temp' + self.manage, null);
						
						self.render();
					});
				}
				else 
				{
					// There were errors so we return a rejected promise
					return jQuery.Deferred().reject({
						errorCode: 'ERR_CHK_INCOMPLETE_ADDRESS'
					,	errorMessage: _('The address is incomplete').translate()
					});
				}
			}
			else
			{
				return this.isValid();              
			}
		}

	,	isValid: function () 
		{console.log('isvalid');
			if (this.tempAddress)
			{
				return jQuery.Deferred().resolve();
			}

			var addresses = this.wizard.options.profile.get('addresses')
			,	selected_address = addresses && addresses.get(this.model.get(this.manage));

			if (selected_address)
			{
				if (selected_address.get('isvalid') === 'T')
				{
					console.log(selected_address);
					return jQuery.Deferred().resolve();
				}

				return jQuery.Deferred().reject(this.invalidAddressErrorMessage);
			}

			return jQuery.Deferred().reject(this.selectAddressErrorMessage);
		}

	,	changeForm: function (e)
		{
			this.model.set('temp' +  this.manage, jQuery(e.target).closest('form').serializeObject());
		}

	,	markSameAs: function (e)
		{
			var is_checked = jQuery(e.target).prop('checked');

			this.sameAs = is_checked;

			this.setAddress(is_checked ? this.model.get(this.sameAsManage) : null);

			this.tempAddress = is_checked ? this.model.get('temp' + this.sameAsManage) : null;

			this.render();
		}
	
		// returns the selected address
	,	getSelectedAddress: function ()
		{
			if (!this.addressId)
			{
				if (this.sameAs && this.tempAddress)
				{
					return new AddressModel(this.tempAddress);
				}
	
				// if the user is guest it only has 1 address for this module so we return that address or a new one
				if (this.isGuest)
				{
					return this.getFixedAddress();
				}
			}

			return this.addresses.get(this.addressId) || this.getEmptyAddress();
		}

	,	getEmptyAddress: function ()
		{
			// If the same as checkbox is not checked
			// we return a new model with any attributes that were already typed into the address form
			// that's what the temp + this.manage is, the temporary address for this manage.
			return new AddressModel(this.isSameAsEnabled && this.sameAs ? null : this.model.get('temp' + this.manage));
		}

	,	getTheOtherAddress: function ()
		{
			return this.addresses.get(this.model.get(this.sameAsManage));
		}

		// returns the list of addresses available for this module, if the module has enable_same_as then it removes the sameAsManage address
	,	getAddressesToShow: function ()
		{
			if(this.isGuest)
			{
				var is_same_as_enabled = this.isSameAsEnabled
				,	same_as_address_id = this.model.get(this.sameAsManage);

				return new Backbone.Collection(this.addresses.reject(function (address)
				{
					return is_same_as_enabled && address.id === same_as_address_id;
				}));
			}
			else 
			{				
				return new Backbone.Collection(this.addresses.models);
			}
		}

		// return the fixed address for this module. This is used only when user=guest
	,	getFixedAddress: function ()
		{			
			var addresses = this.getAddressesToShow();
			return addresses.length ? addresses.at(0) : this.getEmptyAddress();
		}

	,	manageError: function (error)
		{
			if (error && error.errorCode !== 'ERR_CHK_INCOMPLETE_ADDRESS')
			{
				WizardModule.prototype.manageError.apply(this, arguments);
			}
		}
	});
});