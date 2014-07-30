// Wizard.View.js
// --------------
// Frame component, Renders the steps
define('Wizard.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'wizard'

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.currentStep = options.currentStep;
		}

	,	render: function ()
		{
			// Renders itself
			this._render();

			// Then Renders the current Step 
			this.currentStep.render();
			
			// Then adds the step in the #wizard-content element of self 
			this.$('#wizard-content').empty().append(this.currentStep.$el);

			// initializes tooltips.
			// TODO: NOT NECESARY WITH LATEST VERSION OF BOOTSTRAP
			this.$('[data-toggle="tooltip"]').tooltip({html: true});
		}
		
		// we're handling error messages on each step so we disable the global ErrorManagment
	,	showError: function(message)
		{
			this.wizard.manageError(message);
		}

	});
});


