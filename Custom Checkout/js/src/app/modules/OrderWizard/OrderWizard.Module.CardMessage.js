// OrderWizard.Module.CardMessage.js
// --------------------------------
// 
define('OrderWizard.Module.CardMessage', ['Wizard.Module'], function (WizardModule)
{
	'use strict';

	return WizardModule.extend(
	{
		template: 'order_wizard_cardmessage_module',
		initialize: function() {
			this.enabled = false;
			this.cardmessages = [];
			
			var self = this;
			$j.getJSON('https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss' + '?action=get', function(data) {
				$j.each(data, function(entryIndex, entry) {
					
					if (entry.columns.custrecord_cardmessage_occasion !== undefined) {
						self.cardmessages.push({
							id		 : entry.columns.custrecord_cardmessage_occasion.internalid,
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
			
			this._render();
			$j.ajax({
				type : 'GET',
				url : 'https://checkout.sandbox.netsuite.com/c.3363929/CardMessage/cardmessage.ss' + '?action=getordermessage',
				cache : false
			}).always(function(data){
				console.log(data);
				if(data.ocation != '' || data.message != ''){
					jQuery('#cardmessagetoggle').prop('checked',true);
					jQuery('#cardmessageocation').val(data.ocation);
					jQuery('#cardmessagetext').val(data.message);
					jQuery('#cardmessageblock').show();
					this.enabled = true;
					
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
				$j.ajax({
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
        	var message_total = 500;
        	var longitud = jQuery('#cardmessagetext').val().length;
        	var resto = message_total - longitud;
        	jQuery('#textcounter').html(resto);
        }
	});
});