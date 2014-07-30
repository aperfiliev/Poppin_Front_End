// Wizard.js
// ---------
// Index of the wizard module, provides access to all of its components
define('Wizard', ['Wizard.Module', 'Wizard.Router', 'Wizard.Step', 'Wizard.StepGroup', 'Wizard.View'], function (Module, Router, Step, StepGroup, View)
{
	'use strict';
	
	return {
		Module: Module
	,	Router: Router
	,	Step: Step
	,	StepGroup: StepGroup
	,	View: View
	};
});