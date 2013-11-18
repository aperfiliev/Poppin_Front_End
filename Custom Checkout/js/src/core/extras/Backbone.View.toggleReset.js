// Backbone.View.toggleReset.js
// -----------------------
// Backbones' view extension for showing/hiding a "reset" button that restore all form's fields that have changed 
// You have to assign the change event of the inputs of a form to call this function
// For example in the "events" array of a view: 
// 
// 'change form' : 'toggleReset'
//
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		
		// the "debounce" add a small delay between the eventr and the function triggering
		// it's useful when the user is writting so we don't trigger the event after every keypress
		toggleReset: _.debounce(function (e)
		{
			var $form = jQuery(e.target).closest('form')
			,	model = this.model
			,	attribute, value

			// look for the changed fields
			,	fields_changed = _.filter( $form.serializeObject(), function ( item, key )
				{
					attribute = model.get( key );
					value = jQuery.trim( item );

					return attribute ? attribute !== value : !!value;
				});

			// if some field changed, the reset button is shown
			$form.find('[data-action="reset"]')[ fields_changed.length ? 'removeClass' : 'addClass' ]('hide');

			return this;
		},300)
	});
})();