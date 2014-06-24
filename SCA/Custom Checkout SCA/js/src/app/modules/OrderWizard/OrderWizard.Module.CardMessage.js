// OrderWizard.Module.CardMessage.js
// --------------------------------
// 
define('OrderWizard.Module.CardMessage', ['Wizard.Module', 'CardMessage.Model'], function (WizardModule, CardMessageModel)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_cardmessage_module',
				initialize: function() {
			WizardModule.prototype.initialize.apply(this, arguments);
			var profile = this.wizard.options.profile;
			
			this.model = new CardMessageModel();
			this.enabled = false;
			this.cardmessages = [];

			var self = this;
			jQuery.ajax({
				type : 'GET',
				url : 'https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss' + '?action=get',
				cache : false
			}).done(function(data){ 
				_.each(data, function(entry){
					if (entry.columns.custrecord_cardmessage_occasion !== undefined) {
							self.cardmessages.push({
								id		 : entry.columns.custrecord_cardmessage_occasion.name,
								occasion : entry.columns.custrecord_cardmessage_occasion.name,
								message	 : entry.columns.custrecord_cardmessage_message
								});
								}
				});
				self.render();
			});
		},
		events: {
			'change #cardmessage-options': 'changeCardMessage',
			'change #cardmessagetoggle'  : 'cardMessageToggle',
			'keyup #cardmessagetext': 'countmessage'
		},
		render: function(){
			var self = this;
			this._render();

			jQuery.ajax({
				type : 'GET',
				url : 'https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss' + '?action=getordermessage',
				cache : false
			}).always(function(data){
				
				console.log("Card message data = " + data);
				if(data.ocation != '' || data.message != ''){
					jQuery('#cardmessagetoggle').prop('checked',true);
					jQuery('#cardmessage-options').val(data.ocation);
					jQuery('#cardmessagetext').val(data.message);
					jQuery('#cardmessageblock').show();
					self.enabled = true;
					
					//self.render();
				}
			});
		},
		submit: function(){
			if(this.enabled){
				var messagelink = {
						msg: jQuery('#cardmessagetext').val(),
						occassion: jQuery('#cardmessage-options option:selected').text().trim()
				};
				jQuery.ajax({
					type : 'POST',
					data : messagelink,
					url : 'https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss' + '?action=set',
					cache : false
				});
			}
		},
		isValid: function(){
			//promises
		},
		getCardMessageList: function(){
			
		},
		changeCardMessage: function(e){
			 var value = jQuery(e.currentTarget).val();
		        var result = this.getValueByKey(value);
		        if(result){
		        	jQuery('#cardmessagetext').val(result);
		        	this.countmessage();
		        }
		        
		},
		cardMessageToggle: function(e){
			if(jQuery(e.currentTarget).prop('checked')){
				jQuery('#cardmessageblock').show();
				this.enabled = true;
			}
			else{
				this.enabled = false;
				jQuery('#cardmessageblock').hide();
			}
		},
		getValueByKey: function(key) {
            for (var i=0; i< this.cardmessages.length; i++){
                    if (this.cardmessages[i].id == key) {                    
                        return this.cardmessages[i].message;
                    }
                }
           return false;
        },
        countmessage: function(e) {
        	//jQuery(e.currentTarget).parent().show();
        	var message_total = 250;
        	var longitud = jQuery('#cardmessagetext').val().length;
        	var resto = message_total - longitud;
        	jQuery('#textcounter').html(resto);
        }
	});
});