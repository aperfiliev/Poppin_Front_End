// Backbone.View.saveForm.js
// -------------------------
// Extends native Backbone.View with a custom saveForm function to be called when forms are submited
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		
		// view.saveForm
		// Event halders added to all views
		saveFormToModel: function (e, model, props){
			var self = this;
			console.log('object');
			console.log(self.$savingForm.serializeObject());
			return self.model.save(props || self.$savingForm.serializeObject(), {

				wait: true
			//,	events: { 'click #setsuggestion': 'setSuggestedAddress' }
//			,	setSuggestedAddress: function (e){
//					this.$savingForm = jQuery(e.target).closest('form');
//					console.log(this.$savingForm.find('input[name="city"]').val());
//			}
				// Hides error messages, re enables buttons and triggers the save event 
				// if we are in a modal this also closes it 
			,	success: function (model, response)
				{
					console.log('success');
					console.log(self);
					if (self.inModal && self.$containerModal)
					{
						self.$containerModal.modal('hide');
					}
					
					if (self.$savingForm.length)
					{
						self.hideError( self.$savingForm );
						self.$savingForm.find('[type="submit"], [type="reset"]').attr('disabled', false);
						model.trigger('save', model, response);
					}
					
				}

				// Re enables all button and shows an error message
			,	error: function (model, response)
				{
				
					self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

					if (response.responseText)
					{
						//console.log(jQuery.parseJSON(response.responseText));
						model.trigger('error', jQuery.parseJSON(response.responseText));
					}
				}
			}
		);
		},
		saveForm: function (e, model, props, validation_promise)
		{
		
			e.preventDefault();

			model = model || this.model;
			
			
			this.$savingForm = jQuery(e.target).closest('form');
			
			if (this.$savingForm.length)
			{
				// Disables all for submit buttons, to prevent double submitions
				this.$savingForm.find('input[type="submit"], button[type="submit"]').attr('disabled', true);
				// and hides reset buttons 
				this.$savingForm.find('input[type="reset"], button[type="reset"]').hide();
			}
			
			this.hideError();

			var self = this;
			
			if(self.$savingForm.serializeObject().addr1!=undefined && self.$savingForm.serializeObject().addr1!=null){
			//LiveView address validation
			var addr = {
					street: self.$savingForm.serializeObject().addr1,
					city: self.$savingForm.serializeObject().city,
					state:  self.$savingForm.serializeObject().state,
					zipcode: self.$savingForm.serializeObject().zip
				};
				
			
		      // Do not persist invalid models.
			var options = {
					wait:true,
					success:function(){console.log('success');},
					error:function(){console.log('error');}
					};
			options = _.extend({validate: true}, options);
			console.log('before');
		    if (!self.model._validate(self.$savingForm.serializeObject(), options)) return false;
			console.log('after');
			// Returns the promise of the save acction of the model
			LiveAddress.verify(addr, 
					function(response){
						if(response.length==0){
							self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);
							self.model.trigger('error',{
								errorCode: 'ERR_CHK_INVALID_ADDRESS'
								,	errorMessage: _('The selected address is invalid').translate()
								});
						}
						else{
							//check if address matches the one from liveaddress service
							//if matches - submit to model, if not - show suggestion message
							if(response[0].delivery_line_1 != self.$savingForm.serializeObject().addr1 
									|| response[0].components.city_name != self.$savingForm.serializeObject().city
									|| response[0].components.state_abbreviation != self.$savingForm.serializeObject().state
									|| (response[0].components.zipcode + '-' + response[0].components.plus4_code) != self.$savingForm.serializeObject().zip
							){
								self.model.trigger('error',{
									errorCode: 'ERR_CHK_INVALID_ADDRESS'
									,	errorMessage: _('<div style="display: table-cell;">You typed:<br/>' + self.$savingForm.serializeObject().addr1 + '<br/>'+
											self.$savingForm.serializeObject().city + ' ' + self.$savingForm.serializeObject().state + ' ' + self.$savingForm.serializeObject().zip
											+'</div><div style="display: table-cell;padding-left: 50px;">We found the following:<br/>' + response[0].delivery_line_1 + '<br/>' + response[0].last_line).translate() + '</div>'
									});
							}
							else{
								console.log('save to form');
								var result = self.saveFormToModel(e, model, props);
								if(validation_promise!=undefined){
									validation_promise.resolve(self.model);
								}
							}
						}
				});
			}
			else{
				self.saveFormToModel(e, model, props);
			}
		}
	});
})();