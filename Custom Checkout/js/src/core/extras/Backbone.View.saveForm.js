// Backbone.View.saveForm.js
// -------------------------
// Extends native Backbone.View with a custom saveForm function to be called when forms are submited
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		liveAddressValidated: null,
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
			return self.saveFormToModel(e, model, props);
		}
	});
})();