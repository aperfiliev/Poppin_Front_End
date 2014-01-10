// Wizard.Step.js
// --------------
// Step View, Renders all the components of the Step
define('Wizard.Step', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'wizard_step'

	,	events: {
			'click [data-action="previous-step"]': 'previousStep'
		,	'click [data-action="submit-step"]': 'submit'
		}
	
		// default label for the "continue" button, this is overridden in the configuration file
	,	continueButtonLabel: _('Continue').translate() 

		// by defaul the back button is shown, this is overridden in the configuration file
	,	hideBackButton: false 

	,	bottomMessage: null
	
		// Will be extended with the modules to be instanciated
	,	modules: []

		// step.initialize
		// initializes some variables and Instanciates all the modules
	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.stepGroup = options.stepGroup;
			this.moduleInstances = [];

			// This is used to know when to execute the eventns
			this.renderPromise = jQuery.Deferred().resolve();

			var self = this;

			_.each(this.modules, function (module)
			{
				var module_options = {};

				if (_.isArray(module))
				{
					module_options = module[1];
					module = module[0];
				}
				// Requires the module
				var ModuleClass = require(module);

				var module_instance = new ModuleClass(_.extend({
					wizard: self.wizard
				,	step: self
				,	stepGroup: self.stepGroup
				//	set the classname of the module to the module's name
				,	className: 'orderwizard-module ' + module.replace(/\./g,'-').toLowerCase()
				}, module_options));

				// add listeners to some events available to the modules
				module_instance.on({
					ready: function (is_ready)
					{
						self.moduleReady(this, is_ready);
					}
				,	navbar_toggle: function (toggle)
					{
						self.moduleNavbarToggle(this, toggle);
					}
				,	change_label_continue: function (label)
					{
						self.changeLabelContinue(label);
					}
				,	error: function (error)
					{
						self.moduleError(this, error);
					}
				});

				// attach wizard events to error handling
				_.each(module_instance.errors, function (errorId)
				{
					self.wizard.handledErrors.push(errorId);

					self.wizard.on(errorId, function (error)
					{
						module_instance.manageError(error);
					});
				});

				if (module_instance.modules)
				{
					_.each(module_instance.modules, function (submodule)
					{
						_.each(submodule.instance.errors, function (errorId)
						{
							self.wizard.handledErrors.push(errorId);

							self.wizard.on(errorId, function (error)
							{
								submodule.instance.manageError(error);
							});
						});
					});
				}
			
				// ModuleClass is expected to be a View
				self.moduleInstances.push(module_instance);
			});
		}
		// when a module is ready triggers this
		// if all the modules in the step are ready, and the advance conditions are met, the step submits itself
	,	moduleReady: function(module, ready)
		{
			var self = this;
			// submit the step if changed the state of isReady and step is in the present.
			if (module.isReady !== ready)
			{	
				module.isReady = ready;

				this.renderPromise.done(function() 
				{
					if (self.stepAdvance() && self.state === 'present')
					{
						self.submit();
					}
				});
			}	
		}
		
	,	moduleError: function (module, error)
		{
			// if the error doesnt come from a module, and this step is being shown, display the error
			if (!module && this.state !== 'future')
			{
				this.error = error;
				if (this === this.wizard.getCurrentStep())
				{
					this.showError();
				}
			}
		}

	,	hasErrors: function ()
		{
			return this.error || _.some(this.moduleInstances, function (module)
			{
				return module.error;
			});
		}

	,	showError: function ()
		{
			if (this.error)
			{
				this.$('[data-type="alert-placeholder-step"]').html( 
					SC.macros.message(this.error.errorMessage, 'error', true ) 
				);
				this.error = null;
			}	
		}

		// auxiliar function to determine if we have to advante to the next step, see below
	,	stepAdvance: function ()
		{
			var ready_state_array = _(this.moduleInstances).chain().pluck('isReady').uniq().value()
			,	url_options = _.parseUrlOptions(Backbone.history.location.hash);
			
			return !url_options.force && ready_state_array.length === 1 && ready_state_array[0] === true;
		}

		// when a module doesn't need the navigation bar triggers this
		// if no modules in the step needs it, the step hide the navigation buttons
	,	moduleNavbarToggle: function (module, toggle)
		{
			var self = this;
			this.renderPromise.done(function () 
			{
				module.navigationToggle = toggle;

				var toggle_state_array = _(self.moduleInstances).chain().pluck('navigationToggle').uniq().value();

				if (toggle_state_array.length === 1 && toggle_state_array[0] === false)
				{
					self.$('.step-navigation-buttons').hide();
				}
				else
				{
					self.$('.step-navigation-buttons').show();
				}
			});
		}

		// communicate the status of the step to it's modules (past, present, future)
	,	tellModules: function (what)
		{
			_.each(this.moduleInstances, function (module_instance)
			{
				_.isFunction(module_instance[what]) && module_instance[what]();
				module_instance.state = what;
			});
		}

		// step.past
		// ---------
		// Will be called ever time a step is going to be renderd 
		// and this step is previous in the step order
	,	past: function () 
		{
			this.validate();
		}

		// step.present
		// ------------
		// Will be called ever time a step is going to be renderd 
		// and this is the step
	,	present: jQuery.noop

		// step.future
		// -----------
		// Will be called ever time a step is going to be renderd 
		// and this step is next in the step order
	,	future: function ()
		{
			// cleanup future errors
			this.error = null;
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.error = null;
			});
		}

		// step.render
		// -----------
		// overrides the render function to not only render itself 
		// but also call the render function of its modules
	,	render: function ()
		{
			var self = this
			,	position = this.wizard.getStepPosition();

			this.renderPromise = jQuery.Deferred();

			this.currentModelState = JSON.stringify(this.wizard.model);

			// ***** WARNING *****
			// Please do NOT take this as a reference
			// we are using it only as a last resort
			// to show/hide some elements on the last
			// page of the checkout process
			this.$el.attr({
				'data-from-begining': position.fromBegining
			,	'data-to-last': position.toLast
			});

			// Renders itself
			this._render();
			var content_element = this.$('#wizard-step-content');
			
			// Empties the modules container
			content_element.empty();

			// Then Renders the all the modules and append them into the container
			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.isReady = false;
				module_instance.render();
				content_element.append(module_instance.$el);
			});

			this.wizard.application.getLayout().once('afterAppendView', function ()
			{
				self.renderPromise.resolve();
			});

			this.showError();

			return this;
		}

		// step.previousStep
		// -----------------
		// Goes to the previous step.
		// Calls the cancel of each module 
		// and asks the wizard to go to the previous step
	,	previousStep: function (e)
		{
			// Disables the navigation Buttons
			e && this.disableNavButtons();
			
			// Calls the submite method of the modules and collects errors they may have
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.cancel()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).then(
				// Success Callback
				function ()
				{
					// Makes the wizard gon to the previous step
					self.wizard.goToPreviousStep();
				}
				// Error Callback
			,	function (error)
				{
					if (error)
					{
						self.wizard.manageError(error, self);
						e && self.enableNavButtons();
					}
				}
			);
		}

		// step.submit
		// -----------
		// Calls the submit method of each module 
		// cals our save function 
		// and asks the wizard to go to the next step
	,	submit: function (e)
		{
			// Disables the navigation Buttons
			e && this.disableNavButtons();
	
			// Calls the submite method of the modules and collects errors they may have
			var promises = [];
			
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.submit(e)
				);
			});

			var self = this;
			setTimeout(function(){
				
				
				jQuery.when.apply(jQuery, promises).then(
					// Success Callback
					function ()
					{
						self.save().then(
							// if everything goes well we go to the next step
							function ()
							{
								self.wizard.goToNextStep();
							}
							// Other ways we re render showing errors
						,	function (error)
							{
							//console.log("2222 "+error);
								self.wizard.manageError(error,self);
								e && self.enableNavButtons();
							}
						).always(function ()
						{
							self.enableNavButtons();
						});
					}
					// Error Callback
				,	function (error)
					{
					//if(error.errorMessage.indexOf('address is invalid')>-1 /**|| error.errorMessage.indexOf('address is incomplete')>-1*/){self.wizard.goToNextStep();}else{
						console.log(error.errorMessage);
						self.wizard.manageError(error,self);
						e && self.enableNavButtons();}
					//}
				);
			},2000);
		}

		// Change the label of the 'continue' button
	,	changeLabelContinue: function (label)
		{	
			var self = this;

			if (this.renderPromise.state() !== 'resolved')
			{
				this.renderPromise.done(function ()
				{
					self.wizard.application.getLayout().$('[data-action="submit-step"]').html(label || self.continueButtonLabel);
				});
			}
			else
			{
				this.wizard.application.getLayout().$('[data-action="submit-step"]').html(label || this.continueButtonLabel);
			}

			this.changedContinueButtonLabel = label || this.continueButtonLabel;
		}

		// step.save
		// ---------
		// If there is a model calls the save function of it.
		// other ways it returns a resolved promise, to return something standard
	,	_save: function ()
		{console.log('wizard step save');
			if (this.wizard.model && this.currentModelState !== JSON.stringify(this.wizard.model))
			{
				return this.wizard.model.save().error(function (jqXhr)
				{
					jqXhr.preventDefault = true;
				});
			}
			else
			{
				return jQuery.Deferred().resolveWith(this);
			}
		}

	,	save: function ()
		{
			return this._save();
		}	

		// calls validation on all modules and call the error manager
	,	validate: function () 
		{
			var promises = [];
			_.each(this.moduleInstances, function (module_instance)
			{
				promises.push(
					module_instance.isValid()
				);
			});

			var self = this;
			jQuery.when.apply(jQuery, promises).fail(
				// Error Callback
				function (error)
				{
					self.wizard.manageError(error,self);
				}
			);
		}

		// step.disableNavButtons
		// ----------------------
		// Disables the navigation buttons
		// TODO: implement overlay to block navigation.
	,	disableNavButtons: function ()
		{
			this.wizard.application.getLayout().$('[data-action="previous-step"], [data-action="submit-step"], [data-touchpoint]').attr('disabled', true);	

			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.setEnable(false);
			});	
		}

	,	enableNavButtons: function ()
		{
			this.wizard.application.getLayout().$('[data-action="previous-step"], [data-action="submit-step"], [data-touchpoint]').attr('disabled', false);

			_.each(this.moduleInstances, function (module_instance)
			{
				module_instance.setEnable(true);
			});
		}

	,	getName: function ()
		{
			return this.name;
		}
	});
});