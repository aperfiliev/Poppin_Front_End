// Wizard.Router.js
// ----------------
// Main component of the wizard, controls routes, the step flow, and to show each step
define('Wizard.Router', ['Wizard.View', 'Wizard.Step', 'Wizard.StepGroup'], function (View, Step, StepGroup)
{
	'use strict';

	return Backbone.Router.extend({

		step: Step

	,	view: View

	,	stepGroup: StepGroup

		// router.initialize
		// -----------------
		// Initializes internals and loads configuration
	,	initialize: function(application, options)
		{
			this.application = application;
			this.steps = {};
			this.stepsOrder = [];
			this.stepGroups = {};
			this.handledErrors = [];

			this.options = options;
			

			if (options && options.model)
			{
				this.model = options.model;
			}

			if (options && options.steps)
			{
				this.compileConfiguration(options.steps);
			}

			// remove duplicates from the handledErrors array
			this.handledErrors = _.uniq(this.handledErrors);
		}

		// router.compileConfiguration
		// ---------------------------
		// Instanciates all the Steps and StepGroups based on the configuration
		// The Expected configuration is as follows
		/* jsHint :(
		[
			{
				name: "Step Group"
			,	steps: [
					{
						name: "Step"
					,	url: "step-url"
					,	modules: [
							'Module.Name'
						]
					}
				]
			}
		]
		*/
		// This is an Array of Step Groups (Name nad Steps), 
		// where Steps is an Array of Steps (Name, Url, Modules), 
		// where Modules is an Array of Strings that will be required()
	,	compileConfiguration: function(step_groups)
		{
			var self = this;
			// Iterates all the steos
			_.each(step_groups, function(step_group)
			{
				if (step_group.steps)
				{
					// Instaciates the StepGroup
					var step_group_instance = new self.stepGroup(step_group.name, step_group.steps[0].url);
					self.stepGroups[step_group.name] = step_group_instance;

					// Iterates the step of the step group
					_.each(step_group.steps, function(step)
					{
						// Extends the base class with your configuration
						var StepClass = self.step.extend(step);

						// Initializes it 
						self.steps[step.url] = new StepClass({
							wizard: self
						,	stepGroup: step_group_instance

						});

						// add the step to the stepgroup
						step_group_instance.steps.push(self.steps[step.url]);

						// sets it in an orderled group 
						self.stepsOrder.push(step.url);

						// Routes it
						self.route(step.url, 'runStep');
						self.route(step.url + '?:options', 'runStep');
					});
				}
			});
		}

		// route.getCurrentStep
		// ------------------
		// return the current step object
	,	getCurrentStep: function()
		{
			return this.steps[this.currentStep]; 
		}
		
		// route.goToNextStep
		// ------------------
		// Well... finds the next steps and navigates to it 
	,	goToNextStep: function()
		{
			var next_step_url = this.getNextStepUrl();
			if (next_step_url)
			{
				this.navigate(next_step_url, {trigger: true});	
			}
		}

	,	getNextStepUrl: function()
		{
			var index = _.indexOf(this.stepsOrder, this.currentStep);
			if (~index && index + 1 < this.stepsOrder.length)
			{
				return this.stepsOrder[index + 1];
			}
		}

		// route.goToPreviousStep
		// ----------------------
		// Same as before but goes the other way
	,	goToPreviousStep: function()
		{
			var previous_step_url = _.addParamsToUrl(this.getPreviousStepUrl(), {force: true});
			if (previous_step_url)
			{
				this.navigate(previous_step_url, {trigger: true});	
			}
		}

	,	getPreviousStepUrl: function()
		{
			var index = _.indexOf(this.stepsOrder, this.currentStep);
			if (index > 0)
			{
				return this.stepsOrder[index - 1];
			}
			var next_step_url = this.navigate(next_step_url, {trigger: true});
		}

		// route.getStepPosition
		// ---------------------
		// Retuns the distance of the current step from the start and to the end
		// If you are in the 2nd step of a 5 steps wizard it will return:
		// { fromBegining: 1, toLast: 3 }
	,	getStepPosition: function(url)
		{
			var index = _.indexOf(this.stepsOrder, url || this.currentStep);
			return {
				fromBegining: index
			,	toLast: this.stepsOrder.length - index - 1
			};
		}


		// route.runStep
		// -------------
		// Executes the current step:
		// Calls the status methods of the steps (past, present, future)
		// Ands Render the Frame view.
	,	runStep: function()
		{
			var url = Backbone.history.fragment
			,	self = this;

			// We allow urls to have options but they are still identified by the original string, 
			// so we need to thake them out if present 
			url = url.split('?')[0];
			

			if (this.steps[url])
			{
				// We keep a reference to the current step url here
				this.currentStep = url;

				// Iterates all the steps and calls the status methods
				var method_to_call = 'past'
				,	current_group;
				_.each(this.stepsOrder, function(step)
				{
					if (step === url)
					{
						self.steps[step].present();
						self.steps[step].state = 'present';
						self.steps[step].stepGroup.state = 'present';
						self.steps[step].tellModules('present');
						method_to_call = 'future';
						current_group = self.steps[step].stepGroup;
					}
					else
					{
						self.steps[step].tellModules(method_to_call);
						self.steps[step][method_to_call]();
						self.steps[step].state = method_to_call;

						// if the step is contained in the current_group we don't change the group state
						if (self.steps[step].stepGroup !== current_group)
						{
							self.steps[step].stepGroup.state = method_to_call;	
						} 
					}
				});

				// Creates an instance of the frame view and pass the current step
				var view = new this.view({
					model: this.model
				,	wizard: this
				,	currentStep: this.steps[url]
				,	application: this.application
				});

				view.showContent();
			}
		}

	// central hub for managing errors, the errors should be in the format:
	// {errorCode:'ERR_WS_SOME_ERROR', errorMessage:'Some message'}
	// the method also receives the step in case that the error is not handled by any module
	,	manageError: function(error,step)
		{
			if (_.isObject(error) && error.responseText)
			{
				error = JSON.parse(error.responseText);
			}
			else if (_.isString(error) || _.isNumber(error))
			{
				error = {errorCode:'ERR_WS_UNHANDLED_ERROR', errorMessage: error};
			}
			else if (!_.isObject(error))
			{
				error = {errorCode:'ERR_WS_UNHANDLED_ERROR', errorMessage:_('An error has ocurred').translate()};
			}
			
			if (~_.indexOf(this.handledErrors, error.errorCode))
			{
				this.trigger(error.errorCode, error);
			}
			else
			{
				// if the error is not handled but we receive a step we delegate the error to it
				if (step )
				{
					step.moduleError(null, error);
				}
				else
				{
					// if no one is listening for this error, we show the message on the current step
					this.getCurrentStep().$('[data-type="alert-placeholder-step"]').html( 
						SC.macros.message( error.errorMessage, 'error', true ) 
					);
				}
			}
		}
	});
});
