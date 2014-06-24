// Wizard.StepGroup.js
// --------------
// Utility Class to represent a Step Group 
define('Wizard.StepGroup', function ()
{
	'use strict';

	function StepGroup(name, url)
	{
		this.name = name;
		this.url = '/' + url;

		// collection of steps
		this.steps = [];

		this.hasErrors = function ()
		{
			return _.some(this.steps, function (step)
			{
				return step.hasErrors();
			});
		};
	}

	return StepGroup;
});