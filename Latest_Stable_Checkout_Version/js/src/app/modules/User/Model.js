define('User.Model',['Address.Collection','CreditCard.Collection'], function (AddressCollection, CreditCardsCollection)
{
	'use strict';
	return Backbone.Model.extend({
	
		validation: {
			firstname: { required: true, msg: _('First Name is required').translate() }
			
			// This code is commented temporally, because of the inconsistences between Checkout and My Account regarding the require data from profile information (Checkout can miss last name)
		,	lastname: { required: true, msg: _('Last Name is required').translate() }
			
		,	email: { required: true, pattern: 'email', msg: _('Valid Email is required').translate() }
		,	phone: { required: true, fn: _.validatePhone }

		,	companyname:  { required: true, msg: _('Company Name is required').translate() }

			// if the user wants to change its email we need ask for confirmation and current password.
			// We leave this validation in this model, instead of creating a new one like UpdatePassword, because
			// the email is updated in the same window than the rest of the attributes
		,	confirm_email: function (confirm_email, attr, form)
			{
				if (jQuery.trim(form.email) !== this.attributes.email && jQuery.trim(confirm_email) !== jQuery.trim(form.email))
				{
					return _('Emails do not match match').translate();
				}
			}
		,	current_password: function (current_password, attr, form)
			{
				if (jQuery.trim(form.email) !== this.attributes.email &&
					(_.isNull(current_password) || _.isUndefined(current_password) || (_.isString(current_password) && jQuery.trim(current_password) === '')))
				{
					return _('Current password is required').translate();
				}
			}
		}

	,	initialize: function (attributes)
		{
			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressCollection(addresses), {silent: true});
				this.get('addresses').on('change:defaultshipping change:defaultbilling add destroy reset', this.checkDefaultsAddresses, this);
			});

			this.on('change:creditcards', function (model, creditcards)
			{
				model.set('creditcards', new CreditCardsCollection(creditcards), {silent: true});
				this.get('creditcards').on('change:ccdefault add destroy reset', this.checkDefaultsCreditCard, this);
			});
			this.on('change:lastname', function (model)
			{
				model.validation.lastname = { required: true, msg: _('Last Name is required').translate() };
			});			
			this.on('change:phone', function (model)
			{
				model.validation.phone = { required: true, fn: _.validatePhone };
			});

			this.set('addresses', attributes && attributes.addresses || new AddressCollection());
			this.set('creditcards', attributes && attributes.creditcards || new CreditCardsCollection());
		}

	,	checkDefaultsAddresses: function(model) 
		{
			//TODO: improve this algorithm
			var	addresses = this.get('addresses')
			,	Model = addresses.model;
			
			if (model instanceof Model)
			{
				// if the created/modified address is set as default for shipping we set every other one as not default
				if (model.get('defaultshipping') === 'T')
				{
					_.each(addresses.where({defaultshipping: 'T'}), function (address)
					{
						if (model !== address) {
							address.set({defaultshipping: 'F'}, {silent: true});
						}
					});
				}

				// if the created/modified address is set as default for billing we set every other one as not default
				if (model.get('defaultbilling') === 'T')
				{
					_.each(addresses.where({defaultbilling: 'T'}), function (address)
					{
						if ( model !== address)
						{
							address.set({ defaultbilling: 'F' }, { silent: true });
						}
					});
				}
			}

			// set the default addresses in the collection as the profile's default cards
			var default_shipping = addresses.find(function (model)
				{
					return model.get('defaultshipping') === 'T';
				})

			,	default_billing = addresses.find(function (model)
				{
					return model.get('defaultbilling') === 'T';
				});

			this.set('defaultBillingAddress', default_billing || new Model({ defaultshipping: 'T' }) )
				.set('defaultShippingAddress', default_shipping || new Model({ defaultbilling: 'T' }) );
		}

	,	checkDefaultsCreditCard: function (model)
		{
			
			//TODO: improve this algorithm
			var	creditcards = this.get('creditcards')
			,	Model = creditcards.model;

			// if the created/modified card is set as default we set every other card as not default
			if (model.get('ccdefault') === 'T')
			{
				_.each(creditcards.where({ccdefault: 'T'}), function (creditCard)
				{
					if (creditCard && model !== creditCard)
					{
						creditCard.set({ccdefault: 'F'}, {silent: true});
					}
				});
			}

			var default_creditcard = creditcards.find(function (model) {
				return model.get('ccdefault') === 'T';
			});

			// set the default card in the collection as the profile's default card
			this.set('defaultCreditCard', default_creditcard || new Model({ccdefault: 'T'}));
		}
	});
});