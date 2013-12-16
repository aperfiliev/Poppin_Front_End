// Backbone.Validation.callbacks.js
// --------------------------------
// Extends the callbacks of the Backbone Validation plugin
// https://github.com/thedersen/backbone.validation
(function ()
{
	'use strict';

	_.extend(Backbone.Validation.callbacks, {

		valid: function (view, attr, selector)
		{
			var $control = view.$el.find('['+ selector +'="'+ attr +'"]')
				// if its valid we remove the error classnames
			,	$group = $control.parents('.control-group').removeClass('error');
			
			// we also need to remove all of the error messages
			return $group.find('.backbone-validation').remove().end();
		}

	,	invalid: function (view, attr, error, selector)
		{
			console.log(error);
			var $target
			,	$control = view.$el.find('['+ selector +'="'+ attr +'"]')
			,	$group = $control.parents('.control-group').addClass('error');


			view.$('[data-type="alert-placeholder"]').html(
				//SC.macros.message(_(' Sorry, the information below is either incomplete or needs to be corrected.').translate(), 'error', true )
				SC.macros.message(_(error).translate(), 'error', true )
			);

			view.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

			view.$savingForm.find('input[type="reset"], button[type="reset"]').show();

			if ($control.data('error-style') === 'inline')
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-inline').length)
				{
					$group.find('.controls').append('<span class="help-inline backbone-validation"></span>');
				}

				$target = $group.find('.help-inline');
			}
			else
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-block').length)
				{
					$group.find('.controls').append('<p class="help-block backbone-validation"></p>');
				}

				$target = $group.find('.help-block');
			}

			return $target.text(error);
		}
	});

})();