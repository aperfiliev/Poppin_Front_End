/*
 * Copyright 1998 - 2012 NetSuite Inc.
 */
BTQ = (function (settings) {
	var _settings = settings || { isDev: false },
		_baseProdServerUrl = 'services/',
		_siteCtx = null,

		_konst = {
			divContainer: '#checkoutContainer',
			formContainer: '__ajax_checkout_form__',
			sideMiniCart: 'sideMiniCart',
			targetDiv: 'checkoutStepDiv',
			ccvClass: 'ccv-section',
			lvBox: {
				title: '',
				options: {
					autosize: true,
					topclose: false,
					closeButton: false,
					border: 1,
					radius: 1
				}

			},
			progress: 'progress',
			services: {
				address: 'address.ss',
				shipping: 'shipping.ss',
				creditcard: 'creditcard.ss',
				payment: 'payment.ss',
				order: 'order.ss',
				cart: 'cart.ss',
				country: 'country.ss',
				user: 'user.ss'
			},
			codes : { SUCCESS_CODE : "SUCCESS", ERROR : "ERR_UNEXPECTED", ERROR_NO_METHOD_FOUND : "ERR_NO_METHOD_FOUND", ERROR_LOGIN_FAILED : "ERR_LOGIN_FAILED", ERROR_CUSTOMER_LOGIN: "ERR_WS_CUSTOMER_LOGIN", ERROR_USER_NOT_LOGGED_IN : "ERR_USER_NOT_LOGGED_IN"},
			userStatus : { NOT_LOGGED_IN : "NOT_LOGGED_IN", LOGGED_IN_GUEST : "LOGGED_IN_GUEST", LOGGED_IN_CUSTOMER : "LOGGED_IN_CUSTOMER", LOGGED_IN_REGISTER : "LOGGED_IN_REGISTER" }
		};
	
	/*
	 * Used for pre and post ajax calls. Implement UI changes.
	 */
	var _ajaxUI = {
		_calls: 0,
		// track how many simultaneous ajax calls are out there.
		/*
		 * Pre Ajax Call
		 */
		pre: function () {
			this.toggleButtons(true);

			if (this._calls === 0) {
				Element.show(_konst.progress);
			}

			this._calls++;
		},
		/*
		 * Post Ajax Call
		 */
		post: function () {
			this._calls--;

			if (this._calls === 0) {
				Element.hide(_konst.progress);
			}

			this.toggleButtons(false);
		},

		error: function () {
			Lightview.hide();

		},

		/*
		 * Disable or enable buttons during and after Ajax calls
		 */
		toggleButtons: function (show) {
			$$(_konst.divContainer + " div.button.next").each(function (button) {
				button.disabled = show;
			});
		}
	};

	/*
	 * Wraps core Ajax library functionality. 
	 */
	var _ajax = {
		talkToServer: function (service, serviceParams, callbacks) {
			_ajaxUI.pre();
			var data = Object.toJSON(serviceParams);
			BDK.ajax.talk(new BDK.ajax.Request(this.talkToServerCallback.bind(_siteCtx, callbacks), data, _siteCtx.getBaseServiceUrl(true) + service, false, true));
		},
		talkToServerCallback: function (callbacks, transport) {
			_ajaxUI.post();

			var response = transport.responseJSON;

			if (response.header.status.code === _konst.codes.SUCCESS_CODE) {
				callbacks.success(response.result);
			} else {
				// for any error make sure we don't have a modal lightview handing around
				_ajaxUI.error();

				switch (response.header.status.code) {
				case _konst.codes.ERROR_USER_NOT_LOGGED_IN:
					if (_settings.isDev) {
						BDK.fire("showLogin");
					} else {
						var settings = BDK.siteSettings.getSiteSettings();
						if (settings) {
							// navigate to login touchpoint if the user is not logged in.
							global.location = settings.touchpoints.login;
						}
					}

					break;
				case _konst.codes.ERROR_LOGIN_FAILED:
				case _konst.codes.ERROR_CUSTOMER_LOGIN:
					if (_settings.isDev) {
						BDK.fire("showLogin");
					}
					// Do nothing. We want to stay on the login page, when login fails.
					
					break;
				default:
					// reportError(response.header.status.message + " : " + response.header.status.code);
					if(response.header.status.message !== "error"){
						reportError(response.header.status.message);
					}
					break;
				}

				if (callbacks.failure) {
					callbacks.failure(response);
				}
			}
		}
	};

	/*
	 * All Models
	 * Models talk to services and cache data.
	 * 
	 * http://api.prototypejs.org/language/Class/create/
	 */
	var NSDataModel = Class.create({
		initialize: function (service, ajax) {
			this._service = service;
		},
		refresh: function (xParams) {
			if (!BDK.undef(xParams) && !BDK.undef(xParams.refresh) && xParams.refresh === true) {
				return true;
			}

			return false;
		},
		/*
		 * Loop through all the callbacks and invoke
		 * Useful for a data update requiring to update numerous places on the page.
		 */
		invokeCallbacks: function (callbacks, result, args) {
			if (callbacks) {
				var cbArray = Object.isArray(callbacks) ? callbacks : [callbacks];
				for (var i = 0; i < cbArray.length; i++) {
					cbArray[i](result, args);
				}
			}
		},
		/*
		 * All subclasses call this method to do service calls.
		 */
		comm: function (serviceParams, mp, modelCallbacks) {
			var model = this;

			_ajax.talkToServer(this._service, serviceParams, {
				success: function (result) {
					if (modelCallbacks && modelCallbacks.success) { // callback the model
						modelCallbacks.success(result);
					}

					if(mp.callbacks) {
						model.invokeCallbacks(mp.callbacks.success, result, mp.args);   // callback the caller(UI)
					}
				},
				failure: function (result) {
					if (modelCallbacks && modelCallbacks.failure) { // callback the model
						modelCallbacks.failure(result);
					}
					
					if(mp.callbacks) {
						model.invokeCallbacks(mp.callbacks.failure, result, mp.args);   // callback the caller(UI)
					}
				}
			});
		},
		/*
		 * Generic Remove method
		 */
		remove: function (mp) {
			var model = this;
			var serviceParams = {
				method: "remove",
				params: { id: mp.args.id }
			};

			this.comm(serviceParams, mp);
		}
	});


	/* Address Model */

	var NSAddressModel = Class.create(NSDataModel, {
		initialize: function( $super, service ){
			$super( service );

			this.addresses = null;
		},
		find: function( id ){
			var result = this.addresses.find(function( address ){
				return address.internalid === id;
			});
			return result;
		},
		isEqual: function( address1, address2 ){
			for ( field in address1 ) {
				if ( field != 'defaultshipping' && field != 'defaultbilling' ) {
					if (address1[field] !== address2[field] ) {
						return false;
					}
				}
			}
			return true;


		},
		refresh: function( $super, xParams ){
			if ( this.addresses === null || $super( xParams ) ) {
				this.addresses = null;
				return true;
			}

			return false;
		},
		isEmpty: function(){
			return this.addresses === null || this.addresses.length === 0;
		},
		load: function( mp ){
			var model = this,
				serviceParams = {
					method: 'getAll'
				};


			model.comm(serviceParams, mp, {
				success: function( result ){
					model.addresses = result.addresses;
					model.selectedshippingaddressid = result.selectedshippingaddressid;
					model.selectedbillingaddressid = result.selectedbillingaddressid;
				}
			});
		},
		save: function( mp ){
			var model = this,
				serviceParams = {
					method: BDK.undef( mp.args.input.internalid ) ? 'add' : 'update',
					params: {
						address: mp.args.input
					}
				};

			model.comm(serviceParams, mp, {
				success: function( result ){

				}
			});





		},
		remove: function( mp ){
			var model = this,
				serviceParams = {
					method: 'remove',
					params: { id: mp.args.id }
				};


			model.comm(serviceParams, mp, {
				success: function( result ){
					model.addresses = model.addresses.findAll(function(item){
						return item.internalid != mp.args.id;
					});
				}
			});
		},
		set: function( mp ){
			var model = this,
				serviceParams = {
					method: mp.args.type === 'shipping' ? 'setShipping' : 'setBilling',
					params: {
						id: mp.args.id
					}
				};





			model.comm(serviceParams, mp, {
				success: function( result ){
					// update our model with the appropriate selected id.
					model[model.getField(mp.args.type, 'selected')] = mp.args.id;
				}
			});
		},
		getSelected: function( type ){
			var selectedId = this[this.getField(type, 'selected')];

			if ( selectedId ) {
				return this.find( selectedId );
			} else {
				return null;
			}
		},
		isSelected: function( address, type ){
			var defaultField = this.getField( type, 'default' ),
				selected = this.getSelected( type );

			if ( selected === null && address[ defaultField ] === 'T' ) {
				// nothing has been selected so far and this is default address
				return true;
			}

			if ( selected && ( address.internalid === selected.internalid ) ) {
				return true;
			}

			return false;
		},
		getDefault: function( type ){
			var field = this.getField( type, 'default' ),
				address = this.addresses.find(function( address ){
					return address[field] === 'T';
				});

			return address;

		},
		getNoneDefaults: function( type ){
			var field = this.getField( type, 'default' ),
				noneDefaults = this.addresses.findAll(function( address ){
					return BDK.undef( address[field] ) || address[field] === 'F';
				});

			return noneDefaults ? noneDefaults : null;
		},
		getField: function( type, identifier ){
			if ( identifier === 'selected' ) {
				return type === 'shipping' ? 'selectedshippingaddressid' : 'selectedbillingaddressid';
			}
			else if ( identifier === 'default' ) {
				return type === 'shipping' ? 'defaultshipping' : 'defaultbilling';
			}
			else {
				reportError( BDK.translate('error getField unknown identifier: $(0)', identifier) );
			}
		},
		setAddresses: function( result ){
			this.addresses = result.addresses;
			this.selectedshippingaddressid = result.selectedshippingaddressid;
			this.selectedbillingaddressid = result.selectedbillingaddressid;
		},
		selectedshippingaddressIsValied: function(){
			var selected = this.getSelected('shipping');

			return selected && selected.isvalid == 'T';





		}
	});

	/*
	 * Shipping Model
	 */
	var NSShippingModel = Class.create(NSDataModel, {
		initialize: function ($super, service) {
			$super(service);

			this.shippingMethods = null; // a hash of carriers with an array of methods
		},
		refresh: function ($super, xParams) {
			if (this.shippingMethods === null || $super(xParams)) {
				this.shippingMethods = null;
				return true;
			}

			return false;
		},
		isEmpty: function () {
			return this.shippingMethods === null;
		},
		load: function (mp) {
			var model = this;
			var serviceParams = {
				method: "getAll"
			};
			
			if (mp.args && (mp.args.zip || mp.args.country))
				serviceParams = {
					method: "getEstimates",
					params: {
						zip: mp.args.zip,
						country: mp.args.country
					}
				};

			this.comm(serviceParams, mp, {
				success: function (result) {
					// implement UPS and other code
					var methods = {};
					if (result.shipmethods !== null) {
						for (var i = 0; i < result.shipmethods.length; i++) {
							var method = result.shipmethods[i];

							if (BDK.undef(methods[method.shipcarrier])) {
								methods[method.shipcarrier] = [];
							}

							methods[method.shipcarrier].push(method);
						}
					}

					model.shippingMethods = methods;
					if(result.selectedshipmethod){
						model.selectedshipmethod = result.selectedshipmethod;
					}else{
						model.selectedshipmethod = {shipmethod:0, shipcarrier:"nonups"};
					}
					
				}
			});
		},
		set: function (mp) {
			var model = this;
			var serviceParams = {
				method: "set",
				params: {
					shipmethod: mp.args.shipMethod,
					shipcarrier: mp.args.shipCarrier
				}
			};

			this.comm(serviceParams, mp);
		},
		getSelected: function () {
			if (BDK.undef(this.selectedshipmethod) || this.selectedshipmethod === null) {
				return null;
			}

			var func = (function (s) {
				return s.shipmethod === this.selectedshipmethod.shipmethod;
			}).bind(this);

			var selected = this.shippingMethods[this.selectedshipmethod.shipcarrier].find(func);

			return selected ? selected : null;
		},
		isCarrierSelected: function (shipcarrier) {
			var selected = this.getSelected();
			if (selected) {
				return shipcarrier === selected.shipcarrier;
			}

			return false;
		},
		isShippingMethodSelected: function (shipMethod) {
			var selected = this.getSelected();
			if (selected) {
				return shipMethod.shipmethod === selected.shipmethod && shipMethod.shipcarrier === selected.shipcarrier;
			}
			return false;
		}
	});

	/*
	 * Credit Card Model
	 */
	var NSCreditCardModel = Class.create(NSDataModel, {
		initialize: function( $super, service ){
			$super(service);

			this.creditCards = null;
		},
		refresh: function( $super, xParams ) {
			if ( this.creditCards === null || $super( xParams ) ) {
				this.creditCards = null;
				return true;
			}

			return false;
		},
		isEmpty: function(){
			return !( this.creditCards && this.creditCards.length );
		},
		find: function( id ){
			return this.creditCards.find(function( creditCard ){
				return creditCard.internalid === id;
			});
		},
		load: function( mp ) {
			var model = this,
				serviceParams = {
					method: 'getAll'
				};

			model.comm(serviceParams, mp, {
				success: function(result) {
					model.creditCards = result.creditcards;
				}
			});
		},
		save: function( mp ) {
			var model = this,
				serviceParams = {
					method: BDK.undef(mp.args.input.internalid) ? 'add' : 'update',
					params: mp.args.input
				};

			if ( serviceParams.method === 'update' ) {
				var creditCard = model.find(mp.args.input.internalid);

				// copy over all the fields that we not shown in the form
				var keys = $H(creditCard).keys();
				for ( var i = 0; i < keys.length; i++ ) {
					var key = keys[i];
					if ( BDK.undef( mp.args.input[key] ) ) {
						mp.args.input[key] = creditCard[key];
					}
				}
			}

			model.comm(serviceParams, mp);
		},
		getDefault: function(){
			return this.creditCards.find(function( creditCard ){
				return creditCard.ccdefault == 'T';
			});
		},
		getNotSelected: function(){
			return this.creditCards.findAll(function( creditCard ) {
				return !( _nsPaymentModel.selectedPayment && _nsPaymentModel.selectedPayment.creditcard && _nsPaymentModel.selectedPayment.creditcard.internalid == creditCard.internalid );
			});
		}
	});

	/*
	 * Payment Model
	 */
	var NSPaymentModel = Class.create(NSDataModel, {
		initialize: function($super, service) {
			$super(service);

			this.paymentTypes = null;
			this.ccvs = {};
		},
		refresh: function( $super, xParams ) {
			if ( this.paymentTypes === null || $super(xParams) ) {
				this.paymentTypes = null;
				return true;
			}

			return false;
		},
		load: function( mp ) {
			var model = this,
				serviceParams = {
					method: 'getAll'
				};

			model.comm(serviceParams, mp, {
				success: function(result) {
					model.paymentTypes = result.paymenttypes;
					model.selectedPayment = result.selectedpayment;
					if ( model.selectedPayment && model.selectedPayment.creditcard && model.selectedPayment.creditcard.ccsecuritycode ) {
						model.ccvs[ model.selectedPayment.creditcard.internalid ] = model.selectedPayment.creditcard.ccsecuritycode;
					}

				}
			});
		},
		clear: function(){
			this.selectedPayment = null;
		},
		set: function( mp ) {
			var model = this,
				serviceParams = {
					method: 'set',
					params: mp.args
				};

			model.comm(serviceParams, mp, {
				success: function( result ){
					model.selectedPayment = result;
					
					if ( mp.args.id && mp.args.ccsecuritycode ) {
						model.ccvs[mp.args.id] = mp.args.ccsecuritycode;
					}
				},
				failure: function() {
					model.selectedPayment = null;
					
					if ( mp.args.id && mp.args.ccsecuritycode ) {
						delete model.ccvs[mp.args.id];
					}
				}
			});
		},
		getSelected: function () {
			return this.selectedPayment;
		},
		isCreditCardSelected: function(creditCard) {
			var selected = this.getSelected();
			return creditCard && selected && creditCard === selected.creditcard;
		},
		isPaymentSelected: function( payment ) {
			return this.getSelected() === payment;
		},
		isCCVRequired : function() {
			return N.search.config.requireCCV;
		}
	});

	var NSOrderModel = Class.create(NSDataModel, {
		initialize: function ($super, service) {
			$super(service);
			this.order = null;
		},
		refresh: function($super, xParams){
			if ( this.order === null || $super(xParams) ) {
				this.order = null;
				return true;
			}
			
			return false;
		},
		load: function(mp){
			var model = this,
				serviceParams = {
					method: 'getAll'
				};

			model.comm(serviceParams, mp, {
				success: function( result ) {
					model.order = result;
				}
			})
		},
		setTermsAndConditions: function( bool ){
			var model = this;
			
			model.comm({
				method: 'setTermsAndConditions',
				params: {
					termsAgreed: bool
				}
			}, null, {
				success: function( result ) {
					model.order = result;
				}
			});
		},
		placeOrder: function (mp) {
			var model = this;
			var serviceParams = {
				method: "placeOrder"
			};

			this.comm(serviceParams, mp, {
				success: function (result) {
					model.order = result;
				}
			});
		}
	});

	/*
	 * NSCartModel
	 * Handle all cart operations
	 */
	var NSCartModel = Class.create(NSDataModel, {
		initialize: function ($super, service) {
			$super(service);
			this.cart = null;
			this.touchpoints = null;
		},
		refresh: function ($super, xParams) {
			if (this.cart === null || $super(xParams)) {
				this.cart = null;
				return true;
			}

			return false;
		},
		/*
		 * Utility method since every communication with the cart service will return a new cart
		 */
		updateCart : function(serviceParams, mp) {
			var model = this;
			
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.cart = result; // replace the cart
					BDK.fire("cartChanged");
					model.touchpoints = result.touchpoints;
				},
				failure: function (result) {
					model.cart = result.result; // replace the cart
					BDK.fire("cartChanged");
				}
			});
		},
		load: function (mp) {
			var serviceParams = {
				method: "get"
			};
			
			this.updateCart(serviceParams, mp);
		},
		addItem: function(mp) {
			var serviceParams = {
				method: "add",
				params: {
					items: mp.args.items,
					netsuiteid: mp.args.netsuiteid
				}
			};

			this.updateCart(serviceParams, mp);
		},
		removeItem: function(mp) {
			var serviceParams = {
				method: "remove",
				params: {
					orderitemid: mp.args.orderitemid
				}
			};
			
			this.updateCart(serviceParams, mp);
		},  
		updateItem: function(mp) {
			var serviceParams = {
				method: "update",
				params: {
					orderitemid: mp.args.orderitemid,
					quantity: mp.args.quantity
				}
			};

			this.updateCart(serviceParams, mp);
		},
		applyPromo: function (mp) {
			var serviceParams = {
					method: this.cart.promocode.isvalid === "T" ? "removePromo" : "applyPromo",   // toggle the promo code if it exists
					params: {
						promocode: mp.args.promocode
					}
			};

			this.updateCart(serviceParams, mp);
		}, 
		applyGiftCertificate: function (mp) {
			var serviceParams = {
				method: "applyGiftCertificate",
				params: {
					certificate: mp.args.certificate
				}
			};

			this.updateCart(serviceParams, mp);
		},
		removeAllGiftCertificates: function (mp) {
			var serviceParams = {
				method: "removeAllGiftCertificates"
			};

			this.updateCart(serviceParams, mp);
		},
		estimateShipping: function (mp) {
		   var serviceParams = {
				method: "estimateShipping",
				params:  mp.args
			};

		   this.updateCart(serviceParams, mp);
		},
		emailCartToCustomer: function(mp) {
			var serviceParams = {
				method: "emailCartToCustomer"
			};
			
			this.updateCart(serviceParams, mp);
		}
	}); // END NSCartModel

	var NSCountryModel = Class.create(NSDataModel, {
		initialize: function ($super, service) {
			$super(service);
			this.countries = null;
			this.defaultCountryCode = null;
			this.defaultStates = null;
		},
		refresh: function ($super, xParams) {
			if (this.countries === null || $super(xParams)) {
				this.countries = null;
				return true;
			}

			return false;
		},
		/*
		 * Find a country by it's code
		 */
		findByCode: function (code) {
			return this.countries.find(function (c) {
				return c.code === code;
			});
		},
		load: function (mp) {
			var model = this;
			var serviceParams = {
				method: "getAll"
			};

			this.comm(serviceParams, mp, {
				success: function (result) {
					model.countries = result.countries;
					model.defaultShipCountry = result.defaultshipcountry ? result.countries.find(function (c) {
						if (c.code === result.defaultshipcountry) {
							return true;
						}
					}) : null;

					if (model.defaultShipCountry) {
						model.defaultCountryCode = model.defaultShipCountry.code;
						model.defaultStates = model.defaultShipCountry.states ? model.defaultShipCountry.states : null;
					}
				}
			});
		}
	});
	
	var NSUserModel = Class.create(NSDataModel, {
		initialize: function ($super, service) {
			$super(service);
			this.user = {};
			this.status = _konst.userStatus.NOT_LOGGED_IN; 
		},
		refresh: function ($super, xParams) {
			if (this.status === _konst.userStatus.NOT_LOGGED_IN || $super(xParams)) {
				this.user = {};
				return true;
			}

			return false;
		},
		// load the user
		load: function (mp) {
			var model = this;
			var serviceParams = {
				method: "get"
			};
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user = result;
					model.status = result.status;
				}
			});
		},
		login: function (mp) {
			var model = this;
			var serviceParams = {
				method: "login",
				params: mp.args
			};
			
			model.user.email = mp.args.email;

			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user = {};
					model.user.name = result.name;
					model.status = _konst.userStatus.LOGGED_IN_CUSTOMER; 
				}
			});
		},
		logout: function (mp) {
			var model = this;
			var serviceParams = {
				method: "logout"
			};

			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user = {};
					model.status = _konst.userStatus.NOT_LOGGED_IN; 
				}
			});
		},
		registerUser : function(mp) {
			var model = this;
			var serviceParams = {
				method: "registerCustomer",
				params: mp.args
			};
			
			model.user.email = mp.args.email;
			
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user = {};
					model.user.name = result.name;
					model.status = _konst.userStatus.LOGGED_IN_REGISTER; 
				}
			});
		},
		registerGuest : function(mp) {
			var model = this;
			var serviceParams = {
				method: "registerGuest",
				params: mp.args
			};
			
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user.name = result.name;
					model.status = _konst.userStatus.LOGGED_IN_GUEST; 
				}
			});
		},
		setGuestLoginCredentials : function(mp) {
			var model = this;
			var serviceParams = {
				method: "setLoginCredentials",
				params: mp.args
			};
			
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user.name = result.name;
					model.user.email = result.email;
				}
			});
		},
		updateProfile : function(mp) {
			var model = this;
			var serviceParams = {
				method: "updateProfile",
				params: mp.args
			};
			
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user.name = result.name;
					model.user.email = result.email;
				}
			});
		},
		isLoggedIn : function() {
			return (this.status != _konst.userStatus.NOT_LOGGED_IN); 
		},
		isGuest : function() {
			return (N.search.config.isGuest || this.status == _konst.userStatus.LOGGED_IN_GUEST);
		},
		getUserStatus : function() {
			return this.status;
		},
		getPasswordHint : function(mp) {
			var model = this;
			var serviceParams = {
				method: "getPasswordHint",
				params: mp.args
			};
			
			model.user.email = mp.args.email;
				
			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user.hint = result.hint;
				}
			});
		},
		sendPasswordRetrievalEmail : function(mp) {
			var model = this;
			var serviceParams = {
				method: "sendPasswordRetrievalEmail",
				params: mp.args
			};
			
			model.user.email = mp.args.email;

			this.comm(serviceParams, mp, {
				success: function (result) {
					model.user.passwordRetrievalSent = true;
				}
			});
		}
	}); // End of User Model

	/*
	 * One page reference checkout
	 * 
	 * Checkout steps are defined here
	 */
	var _checkoutController = (function () {
		var _templates, _ctx = null;
		// order of steps here dictates the order of steps of the checkout
		var _steps = [{
			id: "shipping",
			template: "checkout_tmpl_shipping"
		}, {
			id: "billing",
			template: "checkout_tmpl_billing"
		}, {
			id: "review",
			template: "checkout_tmpl_review"
		}, {
			id: "confirmation",
			template: "checkout_tmpl_confirmation"
		}];
		/*
		 * Load the appropriate data for each step
		 * Everything is asynchronous so specify the function to call once the Ajax is request is completed.
		 */
		var _dataLoadingFuncs = {
			// renderFunc represents the function to call when the data has been load.
			shipping: function (renderFuncObj) {
				// implement chaining here, countries first and then addresses.
				load(_nsCountryModel, {
					callback: load.bind(_ctx, _nsAddressModel, {    // load addresses on a successful call for retrieving countries
						//renderFunc: renderFuncObj.addresses
						callback: function (result){

							renderFuncObj.addresses(result);
							
							load(_nsShippingModel, {
								renderFunc: renderFuncObj.shippingMethods,
								callback: function(result){
									load(_nsCartModel, {
										renderFunc: function(){
											updateCart();
											_cartController.updateLinks();
										}
									});
								}
							});
							

							
						},failure: function(result){
							if (result.result.addresses[0]){
								_nsAddressModel.setAddresses(result.result);
								renderFuncObj.addresses(result);
								load(_nsShippingModel, {
									renderFunc: renderFuncObj.shippingMethods
								});
								for ( var i = 0; i < result.result.addresses.length; i++ ) {
									if(result.result.addresses[i].isvalid === "F"){
										var id = result.result.addresses[i].internalid;
										notValidAddress(id,false);
										break;
									}
								}
							}
						}
					})
				});
			},
			billing: function (renderFuncObj) {
				load(_nsAddressModel, {
					renderFunc: renderFuncObj.addresses
				});
				
				load(_nsPaymentModel, {
					callback: load.bind(_ctx, _nsCreditCardModel, { // load addresses on a successful call for retrieving countries
						renderFunc: renderFuncObj.paymentTypes
					})
				});
				
				load(_nsOrderModel, {
					renderFunc: renderFuncObj.termsAndConditions
				});
								
				// we need the cart for rendering gift certificates and promocodes
				load(_nsCartModel, {
					renderFunc: renderFuncObj.giftPromo
				});
				
				if (_nsUserModel.isGuest()) {
					load(_nsUserModel, {
						renderFunc: renderFuncObj.guestEmail
					});
				}
			},
			review: function (renderFuncObj) {
				load(_nsCartModel, {
					renderFunc: renderFuncObj.cart
				});
			},
			confirmation: function (renderFuncObj) {
				renderFuncObj.all();
			}
		};

		/*
		 * Define render functions by step for each data point
		 */
		var _renderFuncs = {
			shipping: {
				step: {
					init: function(){
						$(_konst.sideMiniCart).show();
					},
					addresses: function(){
						_templates.addressesTmpl.render({
							hasAddresses: !_nsAddressModel.isEmpty(),
							defaultAddress: _nsAddressModel.getDefault('shipping'),
							noneDefaults: _nsAddressModel.getNoneDefaults('shipping'),
							type: 'shipping',
							countries: _nsCountryModel.countries,
							selectedCountryCode: _nsCountryModel.defaultCountryCode,
							states: _nsCountryModel.defaultStates
						});
					},
					shippingMethods: function (result, args) {
						// render carriers
						_templates.shippingMethodsTmpl.render({
							methods: _nsShippingModel.shippingMethods,
							selected: _nsShippingModel.selectedshipmethod
						});                            
							
						// render rates only for this carrier if the selectedshipmethod exists.
						if (!$("shipCarriers") && _nsShippingModel.selectedshipmethod) {
							_templates.shippingRatesTmpl.render({
								methods: _nsShippingModel.shippingMethods[_nsShippingModel.selectedshipmethod.shipcarrier],
								selected: _nsShippingModel.selectedshipmethod
							});
						} else if ($("shipCarriers")) {
							// Otherwise, render the value from shipCarriers dropdown.
							_templates.shippingRatesTmpl.render({
								methods: _nsShippingModel.shippingMethods[$("shipCarriers").value],
								selected: _nsShippingModel.selectedshipmethod
							});
							
							$("shipCarriers").observe("change", function () {
								// handle UI changes and update only the rates
								_templates.shippingRatesTmpl.render({
									methods: _nsShippingModel.shippingMethods[$("shipCarriers").value],
									selected: _nsShippingModel.selectedshipmethod
								});
							});
						}
						if (_nsAddressModel.isEmpty() && !($("zip").value.length)) {						
							$("shippingRates").update(BDK.translate("To see shipping methods, please enter a valid address"));
						}
						else if (_nsShippingModel.isEmpty()){
							$("shippingRates").update(BDK.translate("No available shipping methods for your address"));
						}
					}
				},
				summary: {
					addresses: function () {
						$("shippingAddressSummary").update(_templates["addressSummaryTmpl"].render({
							selected: _nsAddressModel.getSelected("shipping")
						}));
					},
					shippingMethods: function () {
						$("shipmethodSummary").update(_templates["shippingMethodsSummaryTmpl"].render({
							selected: _nsShippingModel.getSelected()
						}));
					}
				}
			},
			billing: {
				step: {
					init: function () {
						$(_konst.sideMiniCart).show();
					},
					addresses: function () {
						_templates.addressesTmpl.render({
							hasAddresses: !_nsAddressModel.isEmpty(),
							defaultAddress: _nsAddressModel.getDefault("billing"),
							noneDefaults: _nsAddressModel.getNoneDefaults("billing"),
							type: "billing",
							countries: _nsCountryModel.countries,
							selectedCountryCode: _nsCountryModel.defaultCountryCode,
							states: _nsCountryModel.defaultStates
						});
					},
					paymentTypes: function(){
						_templates.creditCardsTmpl.render({
							hasCreditCards: !_nsCreditCardModel.isEmpty(),
							selectedPayment: _nsPaymentModel.selectedPayment,
							notSelected: _nsCreditCardModel.getNotSelected(),
							paymentTypes: _nsPaymentModel.paymentTypes
						});
					},
					termsAndConditions: function(){
						var terms = _nsOrderModel.order.terms;
						if ( terms.required ) {
							_templates.termsAndConditionsForm.render( terms );

							$('showTermsConditions').on('click', function(e){
								e.preventDefault();
								showFormInLightView({
									content: _templates.termsAndConditionsTmpl.render( terms ),
									title: 'Terms and Conditions'
								});
							});

							$('agreeTermsConditions').on('click', function(e){
								toggleValidationTip(false);
								_nsOrderModel.setTermsAndConditions( this.checked );
							});
						}
					},
					giftPromo: function () {
						_templates.giftPromoTmpl.render({
							cart: _nsCartModel.cart,
							checkout : true // view
						});

						$('applyPromoCodeCheckout').on('click', function(e){
							e.preventDefault();
							var span = this.down('span');
							span.update(span.innerHTML == '+' ? '-' : '+');
							this.next().toggleClassName('hidden');

						});
						
						$('applyGiftCardCheckout').on('click', function(e){
							e.preventDefault();
							var span = this.down('span');
							span.update(span.innerHTML == '+' ? '-' : '+');
							this.next().down('p').toggleClassName('hidden');
							this.next().down('p').next().toggleClassName('hidden');
							this.next().down('p').next().next().toggleClassName('hidden');
						});

					},
					guestEmail: function () {
						_templates.guestEmailTmpl.render({
							user: _nsUserModel.user,
							isGuest: _nsUserModel.isGuest()
						});
					}
				},
				summary: {
					addresses: function () {
						$("billingAddressSummary").update(_templates["addressSummaryTmpl"].render({
							selected: _nsAddressModel.getSelected("billing")
						}));
					},
					paymentTypes: function () {
						$("creditCardSummary").update(_templates["creditCardsSummaryTmpl"].render({
							selected: _nsPaymentModel.getSelected().creditcard
						}));
					}
				}
			},
			review: {
				step: {
					init: function () {
						$(_konst.sideMiniCart).hide();
					},
					cart: function () {
						$("reviewInfo").update(_templates["reviewInfoTmpl"].render({cart:_nsCartModel.cart, checkout: true}));
					}
				},
				summary: {
				}
			},
			confirmation: {
				step: {
					init: function () {
						$(_konst.sideMiniCart).hide();
					},
					all: function () {
						$("confirmationInfo").update(_templates["confirmationInfoTmpl"].render({
							selectedShippingAddress: _nsAddressModel.getSelected("shipping"),
							selectedBillingAddress: _nsAddressModel.getSelected("billing"),
							selectedShippingMethod: _nsShippingModel.getSelected(),
							selectedCreditCard: _nsPaymentModel.getSelected().creditcard,
							order: _nsOrderModel.order,
							cart: _nsCartModel.cart,
							user: _nsUserModel.user,
							isGuest: _nsUserModel.isGuest(),
							checkout: true
						}));
						
						goTop();    // move to the top of the page
					}
				},
				summary: {
				}
			}
		};  // END renderFuncs

		function initTemplates() {
			// associate templates managed in the file cabinet
			_templates = {
				// second optional parameter is the ID of the target element in the DOM
				checkoutTmpl: BDK.templates.tmpl("checkout_tmpl", "main"),
				checkoutBodyTmpl: BDK.templates.tmpl("checkout_tmpl_body", "checkoutContainer"),

				// associate a template with a target element
				addressesTmpl: BDK.templates.tmpl("checkout_tmpl_addresses", "addresses"),
				addressFormTmpl: BDK.tmpl("checkout_tmpl_address_form"),
				removeAddressTmpl: BDK.tmpl("checkout_tmpl_remove_address"),
				addressSummaryTmpl: BDK.tmpl("checkout_tmpl_address_summary"),

				shippingMethodsTmpl: BDK.templates.tmpl("checkout_tmpl_shipping_methods", "shippingMethods"),
				shippingMethodsSummaryTmpl: BDK.tmpl("checkout_tmpl_shipping_methods_summary"),
				shippingRatesTmpl: BDK.tmpl("checkout_tmpl_shipping_rates", "shippingRates"),

				creditCardsTmpl: BDK.tmpl("checkout_tmpl_credit_cards", "creditCards"),
				creditCardFormTmpl: BDK.tmpl("checkout_tmpl_creditcard_form"),
				removeCreditCardTmpl: BDK.tmpl("checkout_tmpl_remove_creditcard"),
				creditCardsSummaryTmpl: BDK.tmpl("checkout_tmpl_credit_cards_summary"),

				termsAndConditionsForm: BDK.tmpl("checkout_tmpl_store_terms_form", "storeTerms"),
				termsAndConditionsTmpl: BDK.tmpl("checkout_tmpl_store_terms_popup"),

				giftPromoTmpl: BDK.tmpl("checkout_tmpl_giftpromo", "giftPromoSection"),

				reviewInfoTmpl: BDK.tmpl("checkout_tmpl_review_info"),
				confirmationInfoTmpl: BDK.tmpl("checkout_tmpl_confirmation_info"),

				// summary shells
				shippingStepSummaryTmpl: BDK.tmpl("checkout_tmpl_shipping_summary"),
				billingStepSummaryTmpl: BDK.tmpl("checkout_tmpl_billing_summary"),

				miniCartTmpl: BDK.tmpl("checkout_tmpl_mini_cart"),
				
				// Guest checkout email address form
				guestEmailTmpl: BDK.tmpl("checkout_tmpl_guestemail", "guestCheckoutEmailSection"),
				
				createAccountMessageTmpl: BDK.templates.tmpl("login_tmpl_createAccountMessage", "createAccountStatus")
			};
		}

		/*
		 * Manages all the steps, the current step and other step related logic
		 */
		var _nsStepMgr = (function () {
			var _steps, _currentStep = null;
			
			function init(steps, stepTarget) {
				_steps = steps.clone();
				for (var i = 0; i < _steps.length; i++) {
					_steps[i].tmpl = BDK.templates.tmpl(_steps[i].template, stepTarget);
					_steps[i].idx = i; // idx is 0 based
					_steps[i].pos = i + 1; // pos is 1 based
				}
			}

			return {
				initialize: function (steps, stepTarget) {
					init(steps, stepTarget);
				},
				start: function () {
					if (_currentStep) {
						this.draw(); // step has been passed in from the URL so we just want to draw it.
					} else {
						this.stepTo(_steps[0]); // initial step
					}
				},
				stepTo: function (newStep) {
					if (this.isValidStep(newStep)) {
						this.setCurrentStep(newStep);
						this.draw();
					}
				},
				stepToNextStep: function () {
					if (!this.isLastStep(_currentStep)) {
						this.stepTo(_steps[_currentStep.idx + 1]);
					}
				},
				stepToPrevStep: function () {
					if (_currentStep.idx !== 0) {
						this.stepTo(_steps[_currentStep.idx - 1]);
					}
				},
				/*
				 * Returns true if the current step has been updated
				 */
				setCurrentStep: function (step) {
					if (step && step !== _currentStep) {
						if (_currentStep) {
							_currentStep.isActive = false; // we are leaving this step
						}

						// handle the case when hits refresh on a later step, make the previous ones as completed.
						for (var i = 0; i < _steps.length; i++) {
							_steps[i].isComplete = _steps[i].pos < step.pos ? true : false;
						}

						_currentStep = step;
						_currentStep.isComplete = false;
						_currentStep.isActive = true;

						return true;
					}

					return false;
				},
				getCurrent: function () {
					return _currentStep;
				},
				getSteps: function () {
					return _steps;
				},
				getCompletedSteps: function () {
					return _steps.findAll(function (s) {
						return s.isComplete === true
					});
				},
				isLastStep: function (step) {
					return step && step.id === _steps[_steps.length - 1].id;
				},
				onLastStep: function () {
					return this.isLastStep(_currentStep);
				},
				getStepById: function (id) {
					if (id === null || id.length === 0) {
						return null;
					}

					var step = _steps.find(function (s) {
						return s.id === id;
					});

					return step ? step : null;
				},
				isValidStep: function (step) {
					return step && step !== _currentStep;
				},
				/*
				 * Does the drawing of the checkout frame, each step and summary
				 */
				draw: function () {
					var data = {
						current: this.getCurrent(),
						steps: this.getSteps()
					};

					_templates["checkoutBodyTmpl"].render(data); // now render the area of the steps (left side of the checkout).
					_nsStepMgr.getCurrent().tmpl.render(data); // now render the frame of step
					if (!this.onLastStep()) {
						// only do summaries if we are not on the final step.
						var completedSteps = this.getCompletedSteps();

						for (var i = 0; i < completedSteps.length; i++) {
							var step = completedSteps[i];

							// summary frame which has placeholders for dynamic data
							var frameTmpl = step.id + "StepSummaryTmpl";
							if (!BDK.undef(_templates[frameTmpl])) {
								if ($(step.id + "Summary") !== null) {
									$(step.id + "Summary").update(_templates[frameTmpl].render());
								}
							}

							// load data for the summary - which will eventually put injected into right target
							if (!BDK.undef(_renderFuncs[step.id].summary)) {
								_dataLoadingFuncs[step.id](_renderFuncs[step.id].summary);
							}
						}
					}

					if (!BDK.undef(_renderFuncs[_currentStep.id].step.init)) {
						_renderFuncs[_currentStep.id].step.init();
					}

					// now load the active step
					_dataLoadingFuncs[_currentStep.id](_renderFuncs[_currentStep.id].step);

					_analytics.trackUrl('/checkout/' + _currentStep.id);
					
					BDK.fire(BDK.konst.Events.AFTER_DRAW_STEP, _currentStep); // notify history (# url params)

				}
			};
		})();

		function stepToBridge(evt) {
			var step = _nsStepMgr.getStepById(evt.memo);
			_nsStepMgr.stepTo(step);
		}

		function drawCheckout() {
			_templates["checkoutTmpl"].render(); // update the frame of the checkout
			// check to see if the server is telling us that we should actually fast forward to another flow.
			_nsStepMgr.start();

			BDK.fire(BDK.konst.Events.AFTER_DRAW_CHECKOUT);

		}

		function updateCart() {
			var cartSummaryContent = BDK.templates.macros.orderSummary({cart:_nsCartModel.cart, checkout:true});
			$("checkoutViewCartSummary").update(cartSummaryContent);
			var miniCartContent = _templates["miniCartTmpl"].render({cart:_nsCartModel.cart});
			$("sideMiniCart").update(miniCartContent);
			
			var cartList = $$("div.main-wrapper .cart-list-aside li");
			var heigthDIV = 0;
			for(var i=0; (i < cartList.length && i < 3); i++){
				heigthDIV += cartList[i].getDimensions().height;
			}
			$$("div.main-wrapper .cart-list-aside")[0].style.height= heigthDIV + "px";
			
		}

		/*
		 * Shipping Step
		 */
		var checkoutShippingAddressSettedObserved = false;
		function saveShippingStepBridge(evt) {
			if(_nsAddressModel.isEmpty()){
				if ($('addressForm')) {
					if (!checkoutShippingAddressSettedObserved)
					{
						BDK.observe("checkoutShippingAddressSetted", function ()
						{
							realSaveShippingStepBridge(evt);
							delete BDK.events.evts["btq:checkoutShippingAddressSetted"];
							checkoutShippingAddressSettedObserved = false;
						}, this, false, "checkoutShippingAddressSetted");
					}
					checkoutShippingAddressSettedObserved = true;
					saveAddressBridge(evt)
				}
				firstAddr = false;
			}
			else {
				realSaveShippingStepBridge(evt)
			}
				
		}		 
		 
		function realSaveShippingStepBridge(evt) {
			try {
				var isValid = true,
					errorMessage = '';

				if ( !_nsShippingModel.isEmpty() && !_nsAddressModel.selectedshippingaddressIsValied() ) {
					errorMessage = BDK.translate('Please edit selected address. The address is invalid.');
					isValid = false;
				}
				if ( !_nsAddressModel.selectedshippingaddressid ) {
					errorMessage = _nsAddressModel.isEmpty() ? BDK.translate('Please add a shipping address') : BDK.translate('Please select a shipping address');
					isValid = false;
				}

				if ( !_nsShippingModel.isEmpty() && !_nsShippingModel.selectedshipmethod.shipmethod ) {
					errorMessage = BDK.translate('Please select a shipping method');
					isValid = false;
				}

				if ( isValid ) {
					proceedToNextStep();
				}
				else {
					toggleValidationTip( true, errorMessage );
				}
			} catch (e) {
				handleException(e);
			}
		}

		/*
		 * Billing Step
		 */      
		 var checkoutCreditCardSettedObserved = false;  
		 function saveBillingStepBridge(evt) {
			if ( $('creditCardForm') ) {
				if ( !checkoutCreditCardSettedObserved ) {
					BDK.observe('checkoutCreditCardSetted', function(){
						delete BDK.events.evts['btq:checkoutCreditCardSetted'];
						saveBillingStep(evt);
						checkoutCreditCardSettedObserved = false;

					}, this, false, 'checkoutCreditCardSetted');
				}
				checkoutCreditCardSettedObserved = true;
				saveCreditCardBridge(evt)
			}
			else {
				saveBillingStep(evt);
			}
		}
		 
		function saveBillingStep(evt) {
			try {
				var isValid = true,
					errorMessage = '',
					bWaitForGuestEmailBeforeProceed = false,
					selectedPayment = _nsPaymentModel.getSelected();

				if ( !_nsAddressModel.selectedbillingaddressid ) {
					errorMessage = BDK.translate('Please select a billing address');
					isValid = false;
				}

				if ( !selectedPayment || ( _nsPaymentModel.isCCVRequired() && !selectedPayment.creditcard.ccsecuritycode ) ) {
					errorMessage = _nsCreditCardModel.isEmpty() ? BDK.translate('Please add a credit card') : BDK.translate('Please select a credit card');
					isValid = false;
				}

				if ( _nsCartModel.cart.promocode.isvalid == 'F' ) {
					errorMessage = BDK.translate('Please remove the invalid coupon code');
					isValid = false;
				}

				if ( isValid && _nsOrderModel.order.terms.required && !_nsOrderModel.order.terms.agreed ) {
					errorMessage = BDK.translate('You need to agree to the Terms and Conditions.');
					isValid = false;
				}

				if ( _nsUserModel.isGuest() ) {
					if ( isValid )  {
						if ( updateGuestEmail() ) {
							bWaitForGuestEmailBeforeProceed = true;
						}
						else {
							errorMessage = BDK.translate('Please fill in your email address');
							isValid = false;
						}
					}
					else if ( !validateForm('guestCheckoutEmailForm') ){
						errorMessage = BDK.translate('Please fill in your email address');
						isValid = false;
					}
				}
				else{
					updateEmailSubscribe();
				}

				if ( isValid ) {
					if ( !bWaitForGuestEmailBeforeProceed ) {
						proceedToNextStep();
					}
				}
				else {
					toggleValidationTip( true, errorMessage );
				}
			} catch (e) {
				handleException(e);
			}
		}
		
		/*
		 * Goto the next step in checkout.
		 */
		function proceedToNextStep() {
			toggleValidationTip(false);
			_nsStepMgr.stepToNextStep();
		}

		/*
		 * Goto the next step in checkout (Credit Card Validation).
		 */




		
		/*
         * update email subscribe address.
         */ 
        function updateEmailSubscribe() {
            return validateForm("news", _ctx, saveEmailSubscribe);    
        }
        
        function saveEmailSubscribe(input) {
        	if(input.emailsubscribe == "on"){
        		input.emailsubscribe = "T";
        	}else{
        		input.emailsubscribe = "F";
        	}
        	_nsUserModel.updateProfile({args: input});
        	
        }

        /*
		 * update guest email address.
		 */ 
		function updateGuestEmail() {
			return validateForm("guestCheckoutEmailForm", _ctx, saveGuestEmail);    
		}
		
		function saveGuestEmail(input) {
			var checkEmailSubs = $("emailsubscribecheck");
        	var emailSubsHidden = $("emailsubscribe");
        	if(checkEmailSubs.checked === true){
        		input.emailsubscribe = "T";
        		emailSubsHidden.checked = true;
        	}else{
        		input.emailsubscribe = "F";
        		emailSubsHidden.checked = false;
        	}
			// get guest's name from billing address name field.
			if (_nsAddressModel.addresses && _nsAddressModel.addresses.length > 0) {
				var billing = _nsAddressModel.getSelected("billing");
				if (billing) {
					input.name = billing.addressee;
				}
				else {
					// If none is selected, pick the first billing.
					input.name = _nsAddressModel.addresses[0].addressee;
				}
			}
			
			_nsUserModel.updateProfile({args: input, callbacks: {success: saveGuestEmailCallback.bind(_ctx)} });
		}

		function saveGuestEmailCallback(result) {
			proceedToNextStep();
		}

		/*
		 * Generic/Common functions
		 * model must implement a load method.
		 */
		function load(model, options) {
			if (model.refresh(options)) {
				model.load({
					callbacks: {
						success: defaultCallback.bind(_ctx, options),
						failure: options.failure
					}
				});
			} else {
				render(options);
			}
		}

		function render(options) {
			if (!BDK.undef(options)) {
				if (!BDK.undef(options.renderFunc)) {
					options.renderFunc();
					return true;
				}

				if (!BDK.undef(options.callback)) {
					options.callback();
				}
			}

			return false;
		}

		function defaultCallback(options, result, args) {
			if (!BDK.undef(options)) {

				if (options.msg) {
					console.log(options.msg);
				}

				if (!BDK.undef(options.renderFunc)) {
					options.renderFunc();
				}

				if (!BDK.undef(options.callback)) {
					options.callback(result);
				}
			}
		}

		/*
		 * Address related code
		 */
		function addressSelectedBridge(evt) {
			setAddress(evt.memo.type, evt.memo.id, evt.memo.zip, evt.memo.country);
		}

		/*
		 * Type: shipping or billing
		 */
		var idNotValidAddress = 0;
		function notValidAddress(id,edit){
			if(edit){
				idNotValidAddress = id;
			}
			var evt = {memo:id};
			showEditAddressBridge(evt);
			validateForm("addressForm", _ctx, saveAddress);
		}		
		 
		function setAddress(type, id, zip, country){
			if (_nsAddressModel.find(id).isvalid === "F"){
				notValidAddress(id,true);
			}else{
				if (type === "shipping") {
					// fetch ship methods for this selected address
					var memo = {
						zip: zip,
						country: country
					};

					_nsShippingModel.load({
						args: memo,
						callbacks:{
							success:function(){
									_renderFuncs["shipping"].step.shippingMethods();
									// reload cart, specifically to get new tax information
									load(_nsCartModel, {
										refresh: true,
										renderFunc: updateCart
									});
									setAddressInModel(type,id);
							}
						}
					});
				}else{
					setAddressInModel(type,id);
				}
				
			}
		}
		
		function setAddressInModel(type,id){
			var callbacks = {
				success: setAddressCallback,
				failure: function (results) {
					$$(".address-" + type + "-item").each(function (i) {
						i.checked = false;
					$$("li." + type + "-address-list-item").each(function (i) { i.removeClassName("active");});
					});
				}
			};
			_nsAddressModel.set({
				args: {
					type: type,
					id: id
				},
				callbacks: callbacks
			});

		}
		function setAddressCallback(result, args) {
			$$("li." + args.type + "-address-list-item").each(function (i) { i.removeClassName("active");});
			$(args.type + "-address-list-item-" + args.id).addClassName("active");
			$('address-' + args.id).checked = true;

			clearError();
			toggleValidationTip(false);


		}

		function saveAddressBridge(evt) {
			validateForm("addressForm", _ctx, saveAddress);
		}

		function saveAddress( input, successCallback ) {
			var address = null;




			_nsAddressModel.addresses.each(function(item, index){
				if ( _nsAddressModel.isEqual( input, item ) ) {
					address = item;
					return;






				}
			});

			if ( address ) {
				var defaultAddress = input['default'+ input.type] ? 'T' : 'F';
				if ( address['default'+ input.type] != defaultAddress ) {
					input.action = 'update';
					input.internalid = address.internalid;
					address = null;
				}
			}

			if ( !address ) {
				var defaultField = _nsAddressModel.getField( _nsStepMgr.getCurrent().id, 'default' ),
					callback = BDK.undef( successCallback ) ? saveAddressCallback : successCallback;

				input[defaultField] = !BDK.undef( input[defaultField] ) && input[defaultField] === 'on' ? 'T' : 'F';

				_nsAddressModel.save({
					args: {
						input: input
					},
					callbacks: {
						success: callback
					}
				});
			}
			else {
				toggleValidationTip(false);
				clearError();
				hideFormInModal();
			}
		}
		function saveAddressCallback(result, args) {
			toggleValidationTip(false);
			clearError();
			hideFormInModal();
			// reload the addresses
			load(_nsAddressModel, {
				refresh: true,
				renderFunc: function ()
				{
					_renderFuncs[_nsStepMgr.getCurrent().id].step.addresses();
					BDK.fire("checkoutShippingAddressSetted");
				},
				callback: function(results){
					if(result.addresses){
					// add addreess
						setAddress(result.addresses[0].type, result.addresses[0].internalid, result.addresses[0].zip, result.addresses[0].country);
					}else{
					// edit addresss
						if(idNotValidAddress !== 0){
							var address = _nsAddressModel.find(idNotValidAddress);
							setAddress(_nsStepMgr.getCurrent().id, address.internalid, address.zip, address.country);
							idNotValidAddress = 0;
						}
						if (_nsStepMgr.getCurrent().id === "shipping"){
							// reload shipping methods
							var shippingAddress = _nsAddressModel.getSelected("shipping");
							_nsShippingModel.load({
								args: shippingAddress,
								callbacks:{success:_renderFuncs[_nsStepMgr.getCurrent().id].step.shippingMethods}
							});
						}
					}
				}
			});
			
			// make sure we have the right order summary, etc from the cart for this address.
			load(_nsCartModel, {
				refresh: true,
				renderFunc: updateCart
			});
			
		}

		function showAddAddressBridge(evt) {
			var content = _templates.addressFormTmpl.render({
				address: {},
				type: _nsStepMgr.getCurrent().id,
				countries: _nsCountryModel.countries,
				selectedCountryCode: _nsCountryModel.defaultCountryCode,
				states: _nsCountryModel.defaultStates
			});

			showFormInModal({
				content: content
			});
		}

		function showEditAddressBridge( evt ){
			var id = evt.memo,
				address = _nsAddressModel.find( id ),
				selectedCountry = null;

			if ( address.country ) {
				selectedCountry = _nsCountryModel.findByCode( address.country );
			}

			var content = _templates.addressFormTmpl.render({
				address: address,
				type: _nsStepMgr.getCurrent().id,
				countries: _nsCountryModel.countries,
				selectedCountryCode: selectedCountry !== null ? selectedCountry.code : null,
				selectedStateCode: address.state,
				states: selectedCountry === null || BDK.undef(selectedCountry.states) ? null : selectedCountry.states,
				// validation for edit and delete
				isSelectedShipping: _nsAddressModel.isSelected( address, 'shipping' ),
				isSelectedBilling: _nsAddressModel.isSelected( address, 'billing' )
			});
		 
			showFormInModal({ content: content });


		}

		function showRemoveAddressBridge( evt ){
			var id = evt.memo,
				extraWarning = null,
				type = _nsStepMgr.getCurrent().id,
				address = _nsAddressModel.find( id );

			if ( type == 'billing' && _nsAddressModel.isSelected( address, 'shipping' ) ) {
				extraWarning = BDK.translate('Warning, this address is associated with your current shipping information. If you delete this address, you will be required to re-enter your shipping information.');
			}
			else if ( type == 'shipping' && _nsAddressModel.isSelected( address, 'billing' ) ) {
				extraWarning = BDK.translate('Warning, this address is associated with your current Billing Address. If you delete this address, you will be required to re-enter your information.');




			}

			var content = _templates.removeAddressTmpl.render({
				address: address,
				type: type,
				extraWarning: extraWarning
			});

			showFormInLightView({
				content: content,
				title: BDK.translate('Delete Address')
			});
		}

		function removeAddressBridge(evt) {
			removeAddress(evt.memo);
		}

		function removeAddress( id ){
			_nsAddressModel.remove({
				args: {
					id: id
				},
				callbacks: {
					success: removeAddressCallback.bind(_ctx)
				}
			});
		}

		function removeAddressCallback(result, args) {
			var stepID = _nsStepMgr.getCurrent().id,
				selectedShipping = _nsAddressModel.getSelected('shipping');


			load(_nsAddressModel, {
				refresh: true,
				renderFunc: _renderFuncs[ stepID ].step.addresses,
				callback: function( results ){
					if ( stepID == 'billing' && !selectedShipping ) {
						var step = _nsStepMgr.getStepById('shipping');
						_nsStepMgr.stepTo( step );
					}
					else if ( stepID === 'shipping' ){

						var shippingAddress = _nsAddressModel.getSelected("shipping");
						_nsShippingModel.load({
							args: shippingAddress,
							callbacks:{success:_renderFuncs[_nsStepMgr.getCurrent().id].step.shippingMethods}
						});
						// reload cart, specifically to get new tax information
						load(_nsCartModel, {
								refresh: true,
								renderFunc: updateCart
						});	
					}
				}
			});

			hideFormInModal();
		}


		/*
		 * Shipping Methods
		 */

		function shippingMethodSelectedBridge(evt) {
			setShippingMethod(evt.memo.shipmethod, evt.memo.shipcarrier);
		}

		function setShippingMethod(shipMethod, shipCarrier) {
			_nsShippingModel.set({
				args: {
					shipMethod: shipMethod,
					shipCarrier: shipCarrier
				},
				callbacks: {
					success: setShippingMethodCallback.bind(_ctx)
				}
			});
		}

		function setShippingMethodCallback(result, args) {
			toggleValidationTip(false);
			clearError();
			
			load(_nsShippingModel, {
				refresh: true,
				renderFunc: _renderFuncs[_nsStepMgr.getCurrent().id].step.shippingMethods
			});			
			
			load(_nsCartModel, {
				refresh: true,
				renderFunc: updateCart
			});
			
		}

		/*
		 * Credit Cards
		 */
		function saveCreditCardBridge(evt) {
			validateForm("creditCardForm", _ctx, saveCreditCard);
		}

		function saveCreditCard( input ) {
			if ( input.savecard && input.savecard == 'on' ) {
				_nsCreditCardModel.save({
					args: {
						input: input
					},
					callbacks: {
						success: saveCreditCardCallback.bind(_ctx)
					}
				});
			}
			else {
				hideFormInModal();
				toggleValidationTip(false);
				setPayment( input );
			}
		}

		function saveCreditCardCallback( result, args ) {
			hideFormInModal();
			toggleValidationTip(false);

			if ( args.input.ccsecuritycode ) {
				_nsPaymentModel.ccvs[result.id] = args.input.ccsecuritycode;
			}
			
			// auto select the newly added credit card.
			if ( result.id ) {
				setCreditCard( result.id, _nsPaymentModel.ccvs[ result.id ] );
			}
			
			load(_nsCreditCardModel, {
				refresh: true,
				renderFunc: function(){
					_renderFuncs[ _nsStepMgr.getCurrent().id ].step.paymentTypes();

				}
			});



		}

		function removeCreditCardBridge(evt) {
			removeCreditCard(evt.memo);
		}

		function removeCreditCard( id ) {
			if ( !!parseInt( id ) ) {
				_nsCreditCardModel.remove({
					args: {
						id: id
					},
					callbacks: {
						success: removeCreditCardCallback.bind(_ctx)
					}
				});
			}
			else {
				var selectedPayment = _nsPaymentModel.getSelected();
				if ( selectedPayment && selectedPayment.creditcard && !selectedPayment.creditcard.internalid ) {
					_nsPaymentModel.clear();
				}

				_renderFuncs[_nsStepMgr.getCurrent().id].step.paymentTypes();
				
				hideFormInModal();
			}
		}

		function removeCreditCardCallback(result, args) {
			hideFormInModal();
			var selectedPayment = _nsPaymentModel.getSelected();
			
			if ( selectedPayment && selectedPayment.creditcard && selectedPayment.creditcard.internalid == args.id ) {
				_nsPaymentModel.clear();
			}
			
			load(_nsCreditCardModel, {
				refresh: true,
				renderFunc: _renderFuncs[_nsStepMgr.getCurrent().id].step.paymentTypes
			});
		}

		function creditCardSelectedBridge(evt) {
			var id = evt.memo;
			if ( !!parseInt( id ) ) {
				if ( _nsPaymentModel.isCCVRequired() ) {
					if ( _nsPaymentModel.ccvs[id] ) {
						setCreditCard(id, _nsPaymentModel.ccvs[id]);    
					}
					else {
						var sectionId = _konst.ccvClass + "-" + id,
							ccvField = $$("#" + sectionId + " input#ccsecuritycode")[0],
							applyButton = $$("#" + sectionId + " input#applyccv")[0];
		
						// hide any other ccv-section   
						$$("." + _konst.ccvClass).each(function(s) { s.hide(); });
						var removeTip = function (button) {
							if (button.prototip) {
								button.prototip.remove();
							}
						};
						
						$$("#" + sectionId + " .btn-help").each(removeTip);

						var message = BDK.templates.macros.ccvTip(),
							code = function (button) {
								var tip = new Tip(button, message, {
									 style: "storefront",
									 hideAfter: 0.3,
									 border: 0,
									 radius: 0,
									 stem: "topLeft",
									 hideOn: false,
									 offset: {
									 	x: -20,
									 	y: 8
									 }
								});
							};
			
						$$("#" + sectionId + " .btn-help").each(code);  // attach the tip for the help icon
						
						$(sectionId).show();
						
						if(ccvField && applyButton) {
							var handler = (function(evt) {
								var ccv = null;
								if(evt.type === "keypress") {   //  this handler gets called with every keystroke 
									if(evt.keyCode === 13) {
										ccv = ccvField.value;   
										ccvField.stopObserving();   // avoid re-attaching events.
									}
								}
								else {
									// apply button was clicked.
									ccv = ccvField.value;
									applyButton.stopObserving();    // avoid re-attaching events.
								}
								
								if(ccv) {
									ccvField.clear();   // don't leave the CCV in the UI
									$$("#" + sectionId + " .btn-help").each(removeTip);
									setCreditCard(id, ccv); 
								}
							}).bind(_ctx);
							
							ccvField.observe("keypress", handler);
							applyButton.observe("click", handler);
						}
					}
				}
				else {
					setCreditCard(id);
				}
			}
			else {
				$('creditCard-').checked = true;
				$$('li.card-list-item').each(function(i){
					i.removeClassName('active');
				});
				$('card-list-item-').addClassName('active');
				clearError();
				toggleValidationTip(false);
			}
		}
		
		function setCreditCard(id, ccv) {
			var args = {id: id};
			if ( ccv ) {
				args.ccsecuritycode = ccv;
				$$("." + _konst.ccvClass).each(function(s) { s.hide(); });
			}

			var unSavedCreditCard = $('card-list-item-');
		
			_nsPaymentModel.set({
				args: args,
				callbacks: {
					success: function (result, args) {
						$("creditCard-" + args.id).checked = true;
						$$("li.card-list-item").each(function (i) { i.removeClassName("active");});
						$("card-list-item-" + args.id).addClassName("active");
						clearError();
						toggleValidationTip(false);
						unSavedCreditCard && unSavedCreditCard.remove();
						if(checkoutCreditCardSettedObserved){
							checkoutCreditCardSettedObserved = false;
							BDK.fire('checkoutCreditCardSetted');
						}
					},
					failure: function () {
						$$("li.card-list-item").each(function (i) { i.removeClassName("active");});
						$$(".credit-card-item").each(function (i) {
							i.checked = false;
						});
					}
				}
			});
		}

		function setPayment( payment ){
			_nsPaymentModel.set({
				args: payment,
				callbacks: {
					success: function(result, args) {
						hideFormInModal();
						toggleValidationTip( false );
						_renderFuncs[ _nsStepMgr.getCurrent().id ].step.paymentTypes();
						BDK.fire('checkoutCreditCardSetted');
					}
				}
			});
		}

		function showEditCreditCardBridge(evt) {
			var id = evt.memo,
				content = _templates.creditCardFormTmpl.render({
					creditCard: !!parseInt( id ) ? _nsCreditCardModel.find( id ) : _nsPaymentModel.getSelected().creditcard,
					paymentTypes: _nsPaymentModel.paymentTypes
				});

			showFormInModal({
				content: content
			});
		}

		function showRemoveCreditCardBridge(evt) {
			var id = evt.memo,
				content = _templates.removeCreditCardTmpl.render({
					creditCard: !!parseInt( id ) ? _nsCreditCardModel.find( id ) : _nsPaymentModel.getSelected().creditcard
				});

			showFormInLightView({
				content: content,
				title: BDK.translate('Delete Credit Card')
			});
		}

		function showAddCreditCardBridge(evt) {
			var content = _templates.creditCardFormTmpl.render({
					creditCard: {},
					paymentTypes: _nsPaymentModel.paymentTypes
				});

			showFormInModal({
				content: content
			});
		}

		/*
		 * Apply or remove promocodes
		 */
		function applyPromoBridge(evt) {
			applyPromo(evt.memo);
		}
		
		function applyPromo(promocode) {
			_nsCartModel.applyPromo({args:{promocode:promocode},callbacks:{success: [applyGiftPromoCallback, loadShippingMethod], failure: applyPromoFailedCallback}});
		}
		
		function applyGiftPromoCallback(result, args) {
			_renderFuncs[_nsStepMgr.getCurrent().id].step.giftPromo();
			clearError();
			toggleValidationTip(false);
			updateCart();
			var applyGiftBox = $('applyGiftCardCheckout');
			var span = applyGiftBox.down('span');
			span.update('+');
			_cartController.updateLinks();

		}
		
		function loadShippingMethod(result, args) {
			load(_nsShippingModel, {
				refresh: true,
				renderFunc: _renderFuncs.shipping.summary.shippingMethods
			});
		}
		
		function reportCustomError(errorMsg, cnt){
        	if(errorMsg=="Gift Certificate Invalid"){
        		errorMsg = "Gift Certificate is invalid or unrecognized";
        	}
			document.getElementById("checkoutError").hide();
        	document.getElementById(cnt).insert(errorMsg);
        }
		
		function applyPromoFailedCallback(result, args) {
			_renderFuncs[_nsStepMgr.getCurrent().id].step.giftPromo();
			var applyPromoBox = $('applyPromoCodeCheckout');
			applyPromoBox.next().removeClassName('hidden');
			var span = applyPromoBox.down('span');
			span.update('-');
			reportCustomError(result.header.status.message, "promoError");
		}
		
		/*
		 * Gift cards
		 */
		function applyGiftCertificateBridge(evt) {
			applyGiftCertificate(evt.memo);
		}   
		
		function applyGiftCertificate(certificate) {
			_nsCartModel.applyGiftCertificate({args:{certificate:certificate},callbacks:{success: applyGiftPromoCallback, failure: applyGiftCertificateFailedCallback}});
		}
		
		function applyGiftCertificateFailedCallback(result, args) {
			_renderFuncs[_nsStepMgr.getCurrent().id].step.giftPromo();
			var applyGiftBox = $('applyGiftCardCheckout');
			applyGiftBox.next().removeClassName('hidden');
			var span = applyGiftBox.down('span');
			span.update('-');
			applyGiftBox.next().down('p').toggleClassName('hidden');
			applyGiftBox.next().down('p').next().toggleClassName('hidden');
			applyGiftBox.next().down('p').next().next().toggleClassName('hidden');
			reportCustomError(result.header.status.message, "giftError");
		}
		
		function removeAllGiftCertificatesBridge(evt) {
			removeAllGiftCertificates();
		}   
		
		function removeAllGiftCertificates() {
			_nsCartModel.removeAllGiftCertificates({callbacks:{success: applyGiftPromoCallback}});
			var applyPromoBox = $('applyGiftCardCheckout');
			var span = applyPromoBox.down('span');
			span.update('-');
		}
		
		/*
		 * Placing Order
		 */
		function placeOrderBridge(evt) {
			placeOrder();
		}

		function placeOrder() {
			_nsOrderModel.placeOrder({
				callbacks: {
					success: placeOrderCallback
				}
			});
		}

		function placeOrderCallback( result, args ){
			_analytics.trackOrder( result );


			_nsStepMgr.stepToNextStep();
			load(_nsCartModel, { refresh: true }); // get the new empty cart -- no need to draw it.
			

			


			BDK.fire('checkoutComplete');
		}
		
		
		/*
		 * Guest checkout -- ability to create a new account
		 */
		function createAccountBridge(evt) { 
			validateForm("newCustomerLoginForm", _ctx, createAccount);  
		}

		function createAccount(input) {
			_nsUserModel.setGuestLoginCredentials({args:input, callbacks:{success:createAccountCallback, failure:createAccountFailedCallback}});
		}
		
		function createAccountCallback(result, args) {
			_templates.createAccountMessageTmpl.render({user : _nsUserModel.user});

			var fields = $("createAccountFields");
			if(fields) {
				fields.hide();
			}

			BDK.fire("accountCreated");
			$("message-create-account").removeClassName('hidden');
		}

		function createAccountFailedCallback(result, args) {
			var statusArea = $('createAccountStatus');
			if ( statusArea ) {
				statusArea.update( BDK.translate('create account failed: $(0)', result.header.status.message) );
				statusArea.removeClassName('hidden');
			}
		}
		
		function countryChangeBridge(evt) {
			reloadStatesDropdown(evt.memo.value);
		}

		function reloadStatesDropdown(countryCode) {
			var selectedCountry = _nsCountryModel.findByCode(countryCode);

			$("stateSection").update(
			BDK.templates.macros.stateSection({
				states: BDK.undef(selectedCountry.states) ? null : selectedCountry.states
			}));
						
		}

		
		/*
		 * Will reload the shipping methods with the zipcode or country changes
		 */
		function checkEstimateShippingBridge(e){

			var memo = {
				zip: $("zip").value,
				country: $("country").value
			};
			_nsShippingModel.load({
				args: memo,
				callbacks:{success:_renderFuncs[_nsStepMgr.getCurrent().id].step.shippingMethods}
			});
			load(_nsCartModel, {
				refresh: true,
				renderFunc: updateCart
			});
		}
		
		/*
		 * Attach or remove a summary message from a button
		 */
		function toggleValidationTip(show, message) {
			var code = null;
			if (show === true) {
				code = function (button) {
					var tip = new Tip(button, message, {
						 style: "storefront",
						 hideAfter: 3.0,
						 border: 0,
						 radius: 0,
						 hideOn: false
					});
					button.prototip.show();
				};
			} else {
				code = function (button) {
					if (button.prototip) {
						button.prototip.remove();
					}
				};
			}

			// run the necessary code for each button
			$$(_konst.divContainer + " div.button.next").each(code);
		}

		function getLightViewOptions() {
			return Object.clone(_konst.lvBox); // we clone to avoid resetting the default values
		}

		function showFormInLightView(options) {
			$(_konst.formContainer).update(options.content);
			showFormInModal({
				content: options.content
			});
		}

		// custom Modal View, solution to LightView scrollbars
		function getModalTop( viewportHeight, modalHeight, modalTop ) {
			var top = 0,
				viewportTop = document.viewport.getScrollOffsets()[1];

			if ( viewportHeight > modalHeight + 10 ) {
				top = ( ( viewportHeight - modalHeight ) / 2 ) + viewportTop;
			}
			else if ( modalTop < 0 ) {
				top = viewportHeight - modalHeight + viewportTop - 10;
			}
			else {
				top = 10 + viewportTop;
			}

			return top;
		}

		function centerModal( modal, animated ) {
			var dimensions = modal.getDimensions(),
				modalTop = modal.viewportOffset().top,
				viewportHeight = document.viewport.getHeight();

			if ( animated ) {
				if ( modalTop > 10 || dimensions.height + modalTop + 10 < viewportHeight ) {
					new Effect.Move(modal, {
						x: ( document.viewport.getWidth() - dimensions.width ) / 2,
						y: getModalTop( viewportHeight, dimensions.height, modalTop ),
						mode: 'absolute',
						duration: .4
					});
				}
			}
			else {
				modal.setStyle({
					left: ( document.viewport.getWidth() - dimensions.width ) / 2 +'px',
					top: getModalTop( document.viewport.getHeight(), dimensions.height ) +'px'
				});
			}
		}

		function showFormInModal( options ) {
			var popup = $(_konst.formContainer).update(options.content).show(),
				overlay = $('lv_overlay'),
				delayCentering = null;

			popup.setStyle({
				position: 'absolute',
				zIndex: 5000
			});

			overlay.appear({
				duration: .4,
				to: .75
			}).on('click', hideFormInModal);

			centerModal( popup );

			popup.on('click', '.close-popup', function(e){
				e.preventDefault();
				hideFormInModal();
			});

			document.on('scroll', function(e){
				clearTimeout( delayCentering );
				delayCentering = setTimeout(function(){
					centerModal( popup, true );
				}, 400 );
			});
		}

		function hideFormInModal() {
			$('lv_overlay').fade({
				duration: .4
			});

			$(_konst.formContainer).hide().setStyle({
				position: 'static'
			});
		}
		// end custom modal

		// function which are accessible from the templates. Example _m.getDefaultAddress(address, type)
		var _templateHelpers = {
			isAddressSelected: function (address, type) {
				return _nsAddressModel.isSelected(address, type);
			},
			isCarrierSelected: function (shipcarrier, selectedshipmethod) {
				return _nsShippingModel.isCarrierSelected(shipcarrier, selectedshipmethod);
			},
			isShippingMethodSelected: function (shipMethod) {
				return _nsShippingModel.isShippingMethodSelected(shipMethod);
			},
			isCreditCardSelected: function (creditCard) {
				return _nsPaymentModel.isCreditCardSelected( creditCard ) && ( !_nsPaymentModel.isCCVRequired() || !creditCard.internalid || _nsPaymentModel.ccvs[creditCard.internalid] );
			},
			isCCVRequired: function (creditCard) {
				if(creditCard) {
					return _nsPaymentModel.isCCVRequired() && !_nsPaymentModel.ccvs[creditCard.internalid];
				}
				
				return _nsPaymentModel.isCCVRequired();
			}
		};

		// PUBLIC API
		return {
			urlChange: function (stepId) {
				var step = _nsStepMgr.getStepById(stepId);
				_nsStepMgr.stepTo(step);
			},
			setState: function (stepId) {
				var step = _nsStepMgr.getStepById(stepId);
				return _nsStepMgr.setCurrentStep(step) || (N.search.config && "checkout" === N.search.config.view);
			},
			initState: function (obj) {
				obj["step"] = _nsStepMgr.getCurrent() === null ? "" : _nsStepMgr.getCurrent().id;
			},
			startup: function () {
				_ctx = this;
				_nsStepMgr.initialize(_steps, _konst.targetDiv);

				BDK.observe("showCheckout", drawCheckout, this, false, this.name + ": showCheckout");
				BDK.observe(BDK.konst.Events.CHECKOUT_STEP, stepToBridge, this, false, this.name + ": step");

				/* Shipping Step */
				BDK.observe("customSaveShippingStep", saveShippingStepBridge, this, false, "customSaveShippingStep");

				/* Billing Step */
				BDK.observe("customSaveBillingStep", saveBillingStepBridge, this, false, "customSaveBillingStep");

				/* Address */
				BDK.observe("customSaveAddress", saveAddressBridge, this, false, "customSaveNewAddress");
				BDK.observe("customRemoveAddress", removeAddressBridge, this, false, "customRemoveAddress");
				BDK.observe("customAddressSelected", addressSelectedBridge, this, false, "customAddressSelected");

				BDK.observe("customShowAddAddress", showAddAddressBridge, this, false, "customShowAddAddress");
				BDK.observe("customShowEditAddress", showEditAddressBridge, this, false, "customShowEditAddress");
				BDK.observe("customShowRemoveAddress", showRemoveAddressBridge, this, false, "customShowRemoveAddress");
				
				BDK.observe("checkEstimateShipping", checkEstimateShippingBridge, this, false, "checkEstimateShipping");
				

				/* Credit Card */
				BDK.observe("customSaveCreditCard", saveCreditCardBridge, this, false, "customSaveCreditCard");
				BDK.observe("customRemoveCreditCard", removeCreditCardBridge, this, false, "customRemoveCreditCard");
				BDK.observe("customCreditCardSelected", creditCardSelectedBridge, this, false, "customCreditCardSelected");

				BDK.observe("customShowAddCreditCard", showAddCreditCardBridge, this, false, "customShowAddCreditCard");
				BDK.observe("customShowEditCreditCard", showEditCreditCardBridge, this, false, "customShowEditCreditCard");
				BDK.observe("customShowRemoveCreditCard", showRemoveCreditCardBridge, this, false, "customShowRemoveCreditCard");

				/* Shipping Methods */
				BDK.observe("customShippingMethodSelected", shippingMethodSelectedBridge, this, false, "customShippingMethodSelected");

				BDK.observe("customApplyGiftCertificate", applyGiftCertificateBridge, this, false, "customCheckoutApplyPromo");
				BDK.observe("customRemoveAllGiftCertificates", removeAllGiftCertificatesBridge, this, false, "customCheckoutApplyPromo");

				BDK.observe("customCheckoutApplyPromo", applyPromoBridge, this, false, "customCheckoutApplyPromo");

				/* Placing the order */
				BDK.observe("customPlaceOrder", placeOrderBridge, this, false, "customPlaceOrder");
				
				BDK.observe("createAccount", createAccountBridge, this, false, this.name + ": create account");

				BDK.observe("customCountryChange", countryChangeBridge, this, false, "customCountryChange");

				$(document.body).insert(div = new Element("div", {
					id: _konst.formContainer
				}).hide());


				
				

				initTemplates();

				BDK.fire("lx:funcs", _templateHelpers); // make these functions accessible to the templates.
			}
		}; // END PUBLIC API
	})(); // END OF CHECKOUT
	
	/*
	 * User Login
	 */
	var _loginController = (function() {
		var _loginTmpl, _loginReturningCustomerTmpl, _loginForgotPasswordTmpl, _nextView, _loginCtx = null;

		function setNextView (evt) {
			if(evt && evt.memo && evt.memo.length > 0) {
				_nextView = evt.memo;
			}
		}
		
		function drawLogin( evt ){
			setNextView(evt);
			
			_loginTmpl.render({ user: _nsUserModel.user });
			_loginReturningCustomerTmpl.render({ user: _nsUserModel.user });

			N.origin == 'checkout' ? _analytics.trackUrl('/checkout/login-register') : _analytics.trackUrl('/login');
			
			BDK.fire('afterDrawLogin');
		}
		
		function redirectUserAfterLoginRegister(result) {
			if (result.redirecturl) {
				global.location = result.redirecturl;
			}
			else {
				global.location = BDK.siteSettings.getSiteSettings().touchpoints.checkout;
			}
		}
		
		function loginUserBridge (evt) {
			validateForm("returningCustomerLoginForm", _loginCtx, loginUser);   
		}
		
		function loginUser(input) {
			// get origin parameter. It indicates where we came from and will redirect accordingly.[checkout|customercenter].  
			// empty origin means it's from shopping.
			if (N.cartItems.items && N.origin=='checkout'){
				input.redirect = 'checkout';
			}else{
				input.redirect = N.touchpoints.customercenter;
			}
			_nsUserModel.login({args:input, callbacks:{success:loginUserCallback, failure:loginUserFailedCallback}});
		}
		
		function loginUserCallback(result, args) {
			redirectUserAfterLoginRegister(result);
			BDK.fire("userLoggedIn");
		}
			
		function loginUserFailedCallback(result, args) {
			var statusArea = $('loginStatus');
			if ( statusArea ) {
				statusArea.update( result.header.status.message );
				statusArea.parentNode.removeClassName('hidden');
			}
		}

		function registerUserBridge (evt) {
			validateForm("newCustomerLoginForm", _loginCtx, registerUser);  
		}

		function registerUser(input) {
			if (N.cartItems.items && N.origin=='checkout'){
				input.redirect = 'checkout';
			}else{
				input.redirect = N.touchpoints.customercenter;
			}
			_nsUserModel.registerUser({args:input, callbacks:{success:registerUserCallback, failure:registerUserFailedCallback}});
		}
		
		function registerUserCallback(result, args) {
			redirectUserAfterLoginRegister(result);
			BDK.fire("userRegistered");
		}

		function registerUserFailedCallback(result, args) {
			var statusArea = $("registerUserStatus");
			if(statusArea) {
				statusArea.update(result.header.status.message);
			}
		}
				
		function registerGuestBridge (evt) {
			_nsUserModel.registerGuest({args:{redirect:'checkout'}, callbacks:{success:registerGuestCallback, failure:registerGuestFailedCallback}});
		}
		
		function registerGuestCallback(result, args) {
			redirectUserAfterLoginRegister(result);
			BDK.fire("userRegistered");
		}

		function registerGuestFailedCallback(result, args) {
			var statusArea = $('registerGuestStatus');
			if ( statusArea ) {
				statusArea.update( BDK.translate('Guest Checkout failed: $(0)', result.header.status.message) );
				statusArea.parentNode.removeClassName('hidden');
			}
		}

		function logoutUserBridge (evt) {
			logoutUser();
		}
		
		function logoutUser (input) {
			_nsUserModel.logout({callbacks:{success:logoutUserCallback}});
		}
		
		function logoutUserCallback(results, args) {
			drawLogin();
			BDK.fire("userLoggedOut");
		}
		
		function forgotPasswordBridge(evt) {
			
			if (evt.memo.email)
				_nsUserModel.user.email = evt.memo.email;
				
			_loginForgotPasswordTmpl.render({user : _nsUserModel.user});
		}
		
		function getPasswordHintBridge(evt) {
			_nsUserModel.getPasswordHint({args:{"email":evt.memo.email}, callbacks:{success:forgotPasswordCallback, failure:forgotPasswordFailedCallback}});
		}
		
		function forgotPasswordCallback(results, args) {
			_loginReturningCustomerTmpl.render({user : _nsUserModel.user});
		}
		
		function forgotPasswordFailedCallback(results, args) {
			var statusArea = $("passwordHintStatus");
			if(statusArea) {
				statusArea.update(BDK.translate("Retrieving password hint failed: $(0)", results.header.status.message));
			}
		}

		function cancelPasswordHintBridge(evt) {
			_loginReturningCustomerTmpl.render({user : _nsUserModel.user});
		}
		
		function sendPasswordRetrievalEmailBridge(evt) {
			_nsUserModel.sendPasswordRetrievalEmail({args:{"email": _nsUserModel.user.email}, callbacks:{success:sendPasswordRetrievalEmailCallback, failure:sendPasswordRetrievalEmailFailedCallback}});
		}
		
		function sendPasswordRetrievalEmailCallback(results, args) {
			var statusArea = $("passwordStatus");
			if(statusArea) {
				statusArea.update(BDK.translate("Instructions for changing your password have been sent to your email address."));
			}
		}

		function sendPasswordRetrievalEmailFailedCallback(results, args) {
			var statusArea = $("passwordStatus");
			if(statusArea) {
				statusArea.update(BDK.translate("Sending password retrieval email failed: $(0)", results.header.status.message));
			}
		}

		// return public API
		return {
			startup : function(){
				try{
					_loginCtx = this;
					_loginTmpl = BDK.templates.tmpl("login_tmpl", "main");
					_loginReturningCustomerTmpl = BDK.templates.tmpl("login_tmpl_returningCustomer", "returningCustomer");
					_loginForgotPasswordTmpl = BDK.templates.tmpl("login_tmpl_passwordHint", "returningCustomer");
					
					BDK.observe("loginUser", loginUserBridge, this, false, this.name + ": login user");
					BDK.observe("registerUser", registerUserBridge, this, false, this.name + ": register Customer");
					BDK.observe("registerGuest", registerGuestBridge, this, false, this.name + ": guest checkout");

					BDK.observe("logoutUser", logoutUserBridge, this, false, this.name + ": logoutUser user");

					BDK.observe("forgotPassword", forgotPasswordBridge, this, false, this.name + ": forgot password");
					BDK.observe("getPasswordHint", getPasswordHintBridge, this, false, this.name + ": get password hint");
					BDK.observe("cancelGetPasswordHint", cancelPasswordHintBridge, this, false, this.name + ": cancel get password hint");
					BDK.observe("sendPasswordRetrievalEmail", sendPasswordRetrievalEmailBridge, this, false, this.name + ": cancel get password hint");
					
					BDK.observe("showLogin", drawLogin, this, false, this.name + ": draw login view");
				}
				catch(e) {
					BDK.fire("lx:debug","loginController: " + Object.toJSON(e));
				}    
			}
		}; 
	})();
	
	/*
	 * Main cart view including the mini cart for Ignite customers
	 */
	var _cartController = (function() {
		var _fullCartTmpl, _miniCartTmpl, _emailCartConfirmationTmpl, _cart, _cartCtx = null;
		
		// bridge methods for handling from the front-end.
		function addItemBridge(evt) {
			addItem(evt.memo);
		}

		function addItemWithQuantityBridge(evt) {
			addItem(evt.memo);
		}

		function removeItemBridge(evt) {
			removeItem(evt.memo);
		}
		
		function updateItemBridge(evt) {
			updateItem(evt.memo);
		}
		
		function applyPromoBridge(evt) {
			applyPromo(evt.memo);
		}

		function estimateShippingBridge(evt) {
			estimateShipping(evt.memo);
		}
		
		function addItem(sku) {
			_nsCartModel.addItem({args:{items:[sku],netsuiteid:BDK.schMgr.getSku(sku).netsuite_id},callbacks:{success:updateUI}});
		}

		function removeItem(orderitemid) {
			_nsCartModel.removeItem({args:{orderitemid:orderitemid},callbacks:{success:updateUI}});
		}
		
		function updateItem(obj) {
			_nsCartModel.updateItem({args:{orderitemid:obj.orderitemid, quantity:obj.quantity},callbacks:{success:updateUI}});
		}

		function applyPromo(promocode) {
			_nsCartModel.applyPromo({args:{promocode:promocode},callbacks:{success:applyPromoSuccessCallback, failure: applyPromoFailedCallback}});
		}

		function applyPromoSuccessCallback(){
			updateUI();
			_cartController.updateLinks();

		}



		function reportCustomErrorCart(errorMsg, cnt){
			document.getElementById(cnt).insert(errorMsg);
        	document.getElementById(cnt).removeClassName("hidden");
        }
		
		function applyPromoFailedCallback(result, args) {
			updateUI();
			reportCustomErrorCart(result.header.status.message, "promoError");
		}

		function estimateShipping(obj) {
			_nsCartModel.estimateShipping({args:{zip:obj.zip, country:obj.country},callbacks:{success:updateUI}});
		}
		
		function fetchCart() {

			// If I am on the cart view, draw the cart, otherwise, don't draw it.
			if(BDK.resultsArea.state === "cart") {
				_nsCartModel.load({callbacks:{success:updateUI}});
			}
			else {
				_nsCartModel.load({});
			}
		}
		
		function drawCart() {
			_nsCountryModel.load({callbacks:{success:_nsCartModel.load.bind(_nsCartModel, {callbacks:{success:updateUI.bind(_cartCtx)}})}});
		}
		
		function updateUI() {
			_fullCartTmpl.render({cart:_nsCartModel.cart,
								  countries: _nsCountryModel.countries,
								  selectedCountryCode: _nsCountryModel.defaultCountryCode});
			
			
			if(_nsCartModel.cart.items.length === 0) {
				var code = function (button) {
					var tip = new Tip(button, BDK.translate("Please add items to your cart."), {
						 style: "storefront",
						 hideAfter: 1.5,
						 border: 0,
						 radius: 0,
						 hideOn: false
					});
				};
					
				// run the necessary code for each button
				$$(".proceed-to-checkout").each(code);
			}
			else {
				_analytics.attachCrossDomain();
				_analytics.trackUrl('/cart');
			}
			_cartController.updateLinks();

			BDK.fire(BDK.konst.Events.AFTER_DRAW_CART);
		}

		function showDisabledEmailMessageBridge() {
			var code = null;
			var message =  BDK.translate("You will be able to email your cart once you log in.");
			var email = $("cart-email");
			
			var tip = new Tip(email, message, {
				stem: "topMiddle",
				hideAfter: 2.0,
				border: 0,
				radius: 0,
				hideOn: false,
				hook: {
					target: "bottomMiddle",
					tip: "topMiddle"
				}
			});

			// display a warning message on the cart email link.
			email.prototip.show();
		}
		
		function showEmailCartBridge() {
			var content = _emailCartConfirmationTmpl.render({cart:_nsCartModel.cart});
			$(_konst.formContainer).update(content);
			showFormInModal({
				content: content
			});
		}
		
		function emailCartToCustomerBridge() {
			hideFormInModal();
			_nsCartModel.emailCartToCustomer();
		}

		// return public API
		return {
			updateLinks : function(){
				for ( touch in N.touchpoints ) {
					$$("a").each(function(a){
						if(a.href){
							if(a.href.replace("dontcookiepromocode=T","dontcookiepromocode=F") === N.touchpoints[touch].replace("dontcookiepromocode=T","dontcookiepromocode=F")){
								a.href = _nsCartModel.touchpoints[touch];
							}
							a.href = a.href.replace("dontcookiepromocode=T","dontcookiepromocode=F");
						}
					});
				}
				N.touchpoints = _nsCartModel.touchpoints;
			},
			startup : function(){
				try{
					_cartCtx = this;
					_miniCartTmpl = BDK.templates.tmpl("cartDropDown_tmpl", "cartDetails");
					_fullCartTmpl =  BDK.templates.tmpl("cart_tmpl", "main");
					_cartStatusTmpl = BDK.templates.tmpl("cartStatus_tmpl", "cart");
					_emailCartConfirmationTmpl = BDK.templates.tmpl("cartEmailConfirmation_tmpl");

					var loadCartFunction = ("cart" === N.search.config.view)? drawCart : fetchCart; 
					
					BDK.observe("historyReady", loadCartFunction, this, false, this.name + ": get the latest cart from the server");
					BDK.observe("showCart", drawCart, this, false, this.name + ": get the latest cart from the server");
					BDK.observe("addItemToCart", addItemBridge, this, false, this.name + ": add");
					BDK.observe("removeItemFromCart", removeItemBridge, this, false, this.name + ": remove");
					BDK.observe("updateItemInCart", updateItemBridge, this, false, this.name + ": update");
					BDK.observe("customCartApplyPromo", applyPromoBridge, this, false, this.name + ": customCartApplyPromo");
					BDK.observe("showDisabledEmailMessage", showDisabledEmailMessageBridge, this, false, this.name + ":showDisabledEmailMessage");
					BDK.observe("emailCart", showEmailCartBridge, this, false, this.name + ":emailCartBridge");
					BDK.observe("emailCartToCustomer", emailCartToCustomerBridge, this, false, this.name + ":sendEmailToCustomer");

					BDK.observe("estimateShipping", estimateShippingBridge, this, false, this.name + ": estimateShipping");

					$(document.body).insert(div = new Element("div", {
						id: _konst.formContainer
					}).hide());

					document.observe('lightview:hidden', function (event) {
						$(_konst.formContainer).scrollTop = 0;
					});
				}
				catch(e) {
					BDK.fire("lx:debug","cartController: " + Object.toJSON(e));
				}    
			}
		};       
	})();
	
	/* 
	 * Common code used by all the controllers
	 */
	
	/*
	 * A utility function for fetching the form fields only if the form validation is successful
	 */
	function validateForm(formId, context, successCallback) {
		try {
			var validation = null;
			
			if(typeof context !== "undefined") {
				validation = new Validation(formId, {
					immediate: true, 
					onFormValidate:formCallback.bind(context, {
						formId: formId,
						validCallback: successCallback
					})
				});
			}
			else {
				validation = new Validation(formId, {immediate: true});
			}
			
			return validation.validate();
		} catch (e) {
			handleException(e);
		}
		
		return false;
	}
	
	function formCallback(options, isValid) {
		if (isValid === true) {
			var input = BDK.util.getFormFields(options.formId);
			options.validCallback(input);
		}
	}
	
	function handleException(e, customMessage) {
		var msg = BDK.undef(customMessage) ? "" : customMessage;
		reportError(e.message + "[" + msg + "]");
	}

	function clearError() {
		reportError("");
	}
	
	function reportError(msg) {
		var errorArea = $("checkoutError");
		if(errorArea) {
			errorArea.update(msg);
		}
	}
	
	function printBridge(evt) {
		global.print();
	}

	function goTop() {
		global.scrollTo(0,0);   
	}
	
	/*
	 * This function is called everytime the cart is changed.
	 * You can use DOM manipulation to update other places on the page where the cart total, summary is shown.
	 */
	function updateCartTextBridge(evt) {
		//  if the checkout is done, the summary total will be 0
		//  console.log("cart changed:" + _nsCartModel.cart.summary.total);
	}
	
	/*
	 * Control data passed to Google Analytics
	 */
	var _analytics = {
		trackUrl: function( url ){
			if ( typeof _gaq != 'undefined' ) {
				_gaq.push(['_trackPageview', url]);
			}
		},
		trackOrder: function( order ) {
			if ( typeof _gaq != 'undefined' ) {
				var shippingAddress = _nsAddressModel.getSelected('shipping');
				
				_gaq.push([
					'_addTrans',
					order.internalid,
					'',
					_nsCartModel.cart.summary.total,
					_nsCartModel.cart.summary.tax,
					_nsCartModel.cart.summary.shippingcost,
					shippingAddress.city,
					shippingAddress.state,
					shippingAddress.country
				]);

				
				// now add items in the cart
				_nsCartModel.cart.items.each(function(item, index){


					_gaq.push([
						'_addItem',
						order.internalid,
						item.id,
						item.name,
						item.options ? item.options.pluck('displayvalue').join(' ') : '',
						item.price,
						item.quantity
					]);
				});



				_gaq.push(['_trackTrans']);
			}
		},
		/*
		 * Make sure we don't lose the shopper as they go from http to https for checkout.
		 */
		attachCrossDomain : function() {
			if ( typeof _gaq != 'undefined' ) {
				$$(".cross-domain").each(function(a) { 

					a.observe('click', function( evt ){
						evt.stop();
						_gaq.push(['_link', this.href]); 
					});
				});



			}
		}
	};
	
	var _nsAddressModel = new NSAddressModel(_konst.services.address),
		_nsShippingModel = new NSShippingModel(_konst.services.shipping),
		_nsCreditCardModel = new NSCreditCardModel(_konst.services.creditcard),
		_nsPaymentModel = new NSPaymentModel(_konst.services.payment),
		_nsOrderModel = new NSOrderModel(_konst.services.order),
		_nsCartModel = new NSCartModel(_konst.services.cart),
		_nsCountryModel = new NSCountryModel(_konst.services.country),
		_nsUserModel = new NSUserModel(_konst.services.user);

	// PUBLIC API
	return {
		name: "BTQ",
		config: {
			defaults: {},
			siteTitle: "Checkout", // edit the ajax title
			layoutTypes: {
				wide: {
					mainbox: {
						visibility: "visible",
						"float": "none",
						width: "100%"
					}
				}
			},
			layoutStyles: {
				login: {
					type: "wide"
				},
				cart: {
					type: "wide"
				},
				checkout: {
					type: "wide"
				}
			},
			historyItems: {
				view: true,
				step: true
			},
			// which # parameters to include in the URL.
			number: {
				currencySymbol: "$"
			},
			tipOptions: {
				fileBox: {
					href: null,
					rel: 'ajax',
					options: {
						width: 745,
						// make it the width of the page
						topclose: true,
						ajax: {
							method: 'get'
						}
					}
				}
			}
		},
		getBaseServiceUrl: function (bIncludeProxy) {
			var url = (_settings.isDev) ? _settings.baseDevServerUrl : _baseProdServerUrl;

			// Include proxy if needed. Only applies when used in dev enviornment;
			if (_settings.isDev && bIncludeProxy) {
				url = _settings.proxyUrl + url;
			}
			return url;
		},
		isDevEnvironment: function () {
			return _settings.isDev;
		},
		/*
		 * Ignite Use
		 */
		getHistoryItems: function () {
			var checkoutStepHistory = new BDK.historyMgr.HistoryItem("step", "", _checkoutController.urlChange, _checkoutController.setState, _checkoutController.initState);
			return [checkoutStepHistory];
		},
		startup: function () {
			_siteCtx = this;

			
			var view = N.search.config.view;    // passed from the SSP.
			switch (view) {
				case "login":
					_loginController.startup();
					break;
				case "cart":
					_cartController.startup();
					break;
				case "checkout":
					_checkoutController.startup();
					break;
			}

			BDK.observe("print", printBridge, this, false, "print");
			BDK.observe("cartChanged", updateCartTextBridge, this, false, "update cart text");
			
			BDK.fire("appReady");

		}
	};
})();

BTQ.config = Object.extend(BTQ.config, N.search.config);


/* CUSTOM VALIDATION */
Validation.add("validate-password", "Passwords do not match", function(v) {
		if(v && arguments && arguments.length === 2) {
			// it takes the id of the second password field, assumes the first password field has the same name without the last character
			// example: login-password1, would look at the value of login-password to make sure they match
			var confirmPasswordField = arguments[1].id.substring(0, arguments[1].id.length - 1);
			return v === $(confirmPasswordField).value;
		}
	
		return false;
	}
);

// required and min length
Validation.add("min-length-3", "At least 3 characters", {
	minLength : 3
});

Validation.add("min-length-7", "Phone number is invalid", {
	 minLength : 10,
	 pattern: /^[\d\s\(\)-.]+$/
});

/* Credit Card CCV date validation */
Validation.add('validate-ccv', 'Invalid Code', function(){
	var value = $('ccsecuritycode').value;
	return Validation.get('IsEmpty').test(value) || (!isNaN(value) && !/^\s+$/.test(value));
});
Validation.add('ccv-length-3', '3 characters min', function( value, element ){
	return element.parentNode.childElements()[0].value.length >= 3;
});

/* Credit Card expiration date validation */
function isCardExpired() {
	var today = new Date();
	return !( parseInt( $('expyear').value ) > today.getFullYear() || parseInt( $('expmonth').value ) > today.getMonth() );
}

Validation.add('validate-expiration', 'Your credit card has expired', function(){
	return !isCardExpired();
});
