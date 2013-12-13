// Backbone.View.saveForm.js
// -------------------------
// Extends native Backbone.View with a custom saveForm function to be called when forms are submited
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		
		// view.saveForm
		// Event halders added to all views
		saveForm: function (e, model, props)
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
			//LiveView address validation
			var addr = {
					//street: model.attributes.addr1,
					city: this.$savingForm.find('input[name="city"]').val()
					//state: model.attributes.state,
					//zipcode: model.attributes.zip
				};
//			LiveAddress.verify(addr, 
//					function(response){
//						if(response.length==10){
//							console.log(model);
//							self.$savingForm.find('[data-type="alert-placeholder"]').html( 
//									SC.macros.message('Address error', 'error', true) 
//								);
//							self.model.trigger('error',{
//								errorCode: 'ERR_CHK_INVALID_ADDRESS'
//							,	errorMessage: _('The selected address is invalid').translate()
//							});
//						}
//						else{
							//End liveview validation
							// Returns the promise of the save acction of the model
							return self.model.save(props || self.$savingForm.serializeObject(), {

									wait: true

									// Hides error messages, re enables buttons and triggers the save event 
									// if we are in a modal this also closes it 
								,	success: function (model, response)
									{
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
								//}
							//);
						//}
						
						//model.trigger('error', 'some error');
				});
			
		}
	});
})();