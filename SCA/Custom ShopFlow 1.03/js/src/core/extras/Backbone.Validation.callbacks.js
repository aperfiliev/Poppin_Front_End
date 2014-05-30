// Backbone.Validation.callbacks.js
// --------------------------------
// Extends the callbacks of the Backbone Validation plugin
// https://github.com/thedersen/backbone.validation
(function ()
{
	'use strict';

	//
	//	Usage: 
	//		First the view must have a model or collection attribute in order to activate the validation
	//		callbacks
	// 
	//		MyView = Backbone.View.extend({
	//			template: 'my_template'
	//		,	model: MyModel	
	//		});
	//
	//		The view template must have for each control group (or field) a '.controls' element
	//		where the error message is shown.
	//
	//		Example:
	//
	//		<div class="form-group">
	//			<label class="control-label" for="city">City:</label>
	//			<span  class="controls pull-right"></span>
	//			<input class="form-control" id="city" name="city" value="">
	//		</div>
	//
	//		If you are using bootstrap3, be sure that you call Backbone.Validation.callbacks.setSelectorStyle('bootstrap3')
	//		or your error messages will not be shown.
	//	
	_.extend(Backbone.Validation.callbacks, {
		//	control-group is used for Bootstrap2 and form-group is used for Bootstrap3
		control_group_selector: '.control-group, .form-group'
		//	error is used for Bootstrap2 and has-error is used for Bootstrap3
	,	error_state_class: 'error has-error'

	,	valid: function (view, attr, selector)
		{
			var $control = view.$el.find('['+ selector +'="'+ attr +'"]')
				// if its valid we remove the error classnames
			,	$group = $control.parents(this.control_group_selector).removeClass(this.error_state_class);

			// we also need to remove all of the error messages
			return $group.find('.backbone-validation').remove().end();
		}

	,	invalid: function (view, attr, error, selector)
		{
			var $target
			,	$control = view.$el.find('['+ selector +'="'+ attr +'"]')
			,	$group = $control.parents(this.control_group_selector).addClass(this.error_state_class);


			view.$('[data-type="alert-placeholder"]').html(
				SC.macros.message(_(' Sorry, the information below is either incomplete or needs to be corrected.').translate(), 'error', true)
			);

			//This case happens when calling validation on attribute setting with { validate: true; }
			if (!view.$savingForm)
			{
				view.$savingForm = $control.closest('form');
			}

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