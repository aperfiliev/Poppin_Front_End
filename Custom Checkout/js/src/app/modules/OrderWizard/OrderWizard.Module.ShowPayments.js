// OrderWizard.Module.ShowPayments.js
// --------------------------------
// 
define('OrderWizard.Module.ShowPayments', ['Wizard.Module','OrderWizard.Module.CardMessage'], function (WizardModule, OrderWizardModuleCardMessage)
{
	'use strict';

	return WizardModule.extend(
	{
		
			template: 'order_wizard_showpayments_module'
		
		,	events: {
				'click input[name="delivery-options"]': 'changeDeliveryOptions'
, 'click input[name="review-delivery-options"]': 'changeChecked'
,'click [name="submit-shipping-method"]': 'submit_shipping_method'
			}

, changeChecked: function(e){
console.log(e.target);
var names = document.getElementsByName("review-delivery-options");
console.log(names[0].getAttribute("checked"));
_.each(names,function(name){
if(name.getAttribute("checked")=="checked"){
name.setAttribute("checked","");
}
e.target.setAttribute("checked","checked");
});

}

, submit_shipping_method: function(){
var names = document.getElementsByName("review-delivery-options");
var value;
self = this;
_.each(names,function(name){
if(name.getAttribute("checked")=="checked"){
value = name.getAttribute("value");
}
});
this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.render();
				self.step.enableNavButtons();
			});
}
		,	initialize: function(options)
			{
				WizardModule.prototype.initialize.apply(this, arguments);
				var self = this;
				this.cardMessageModule =        {
				                   					classModule: 'OrderWizard.Module.CardMessage'
				                   				,	options: {}
				                   				};
				var ModuleClass = require(this.cardMessageModule.classModule);

				this.cardMessageModule.instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self.step
				,	stepGroup: self.stepGroup
				}, this.cardMessageModule.options));

				this.cardMessageModule.instance.on('ready', function(is_ready)
				{	
					self.moduleReady(is_ready);
				});
			}
		,	moduleReady: function(is_ready)
			{
				this.trigger('ready', is_ready);
			}
		,	render: function()
			{
				this.application = this.wizard.application;
				this.profile = this.wizard.options.profile;
				this.options.application = this.wizard.application;
				this.eventHandlersOn();
				var wasChecked = false;
				if (this.$('#cardmessageblock').length != 0) {
					     wasChecked = this.$('#cardmessagetoggle')[0].checked;
					 var selIndex   = this.$('#cardmessage-options')[0].selectedIndex,
						 text       = this.$('#cardmessagetext')[0].value,
						 remChars   = this.$('#textcounter')[0].innerHTML;
				}
				this._render();
				this.cardMessageModule.instance.render();
				this.$('#cardmessage-container').empty().append(this.cardMessageModule.instance.$el);
				if (wasChecked) {
					this.$('#cardmessagetoggle')[0].checked = true;
					this.$('#cardmessageblock').show();
					this.$('#cardmessagetext')[0].value = text;
					if (selIndex) {this.$('#cardmessage-options')[0].selectedIndex = selIndex;}
					this.$('#textcounter')[0].innerHTML = remChars;
				}
			}
		,	eventHandlersOn: function(){
				this.eventHandlersOff();
				var self = this;
				Backbone.on('refresh', function ()
						{
							var wasChecked = this.$('#cardmessagetoggle')[0].checked,
								selIndex   = this.$('#cardmessage-options')[0].selectedIndex,
								text       = this.$('#cardmessagetext')[0].value,
								remChars   = this.$('#textcounter')[0].innerHTML;
							self._render();
							this.cardMessageModule.instance.render();
							this.$('#cardmessage-container').empty().append(this.cardMessageModule.instance.$el);
							if (wasChecked) {
								this.$('#cardmessagetoggle')[0].checked = true;
								this.$('#cardmessageblock').show();
								this.$('#cardmessagetext')[0].value = text;
								if (selIndex) {this.$('#cardmessage-options')[0].selectedIndex = selIndex;}
								this.$('#textcounter')[0].innerHTML = remChars;
							}
							
							console.log('refreshed');
						}, this);
		}
		,	eventHandlersOff: function(){
				this.model && this.model.off(null, null, this);
				
		}	
		,	getPaymentmethods: function()
			{
				return _.reject(this.model.get('paymentmethods').models, function (paymentmethod)
				{
					return paymentmethod.get('type') === 'giftcertificate';
				});
			}
		,	getGiftCertificates: function()
			{
				return this.model.get('paymentmethods').where({type: 'giftcertificate'});
			}
		,	past: function()
			{
				this.model.off('change', this.totalChange, this);
			}
		,	present: function()
			{
				this.model.off('change', this.totalChange, this);
				this.model.on('change', this.totalChange, this);
			}

		,	future: function()
			{
				this.model.off('change', this.totalChange, this);
			}

		,	totalChange: function()
			{
				var was = this.model.previous('summary').total
				,	was_confirmation = this.model.previous('confirmation')
				,	is = this.model.get('summary').total;

				// Changed from or to 0
				if ( ((was === 0 && is !== 0) || (was !== 0 && is === 0)) && !was_confirmation )
				{
					this.render();
				}
			}
		,	changeDeliveryOptions: function(e) 
		{
			var value = this.$(e.target).val()
			,	self = this;

			this.model.set('shipmethod', value);
			this.step.disableNavButtons();
			this.model.save().always(function()
			{
				self.render();
				self.step.enableNavButtons();
			});
		}
		,	submit: function(e, additional_validation)
			{
				if(additional_validation!=undefined){additional_validation.resolve();}
				if (!this.$('#ccsecuritycode').val()) {
					debugger;
					var $group = this.$('#ccsecuritycode').parents('.control-group').addClass('error');
					$group.find('.controls').append('<div style="position:relative"><div style="position:absolute; display:block;bottom: 0px; left: 101%;" id="powerTipError" class="help-block backbone-validation"></div></div>');
					$group.find('.help-block').text(_('Security Number is required').translate());
					return jQuery.Deferred().reject(_('Security Number is required').translate());
				}
				var credit_card_pm = this.model.get('paymentmethods').where({type: 'creditcard'});
				console.log(credit_card_pm);
			
				credit_card_pm[0].attributes.creditcard.ccsecuritycode =  this.$('#ccsecuritycode').val();
				this.cardMessageModule.instance.submit();
			}
	});
});