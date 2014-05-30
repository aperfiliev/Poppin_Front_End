// ApplicationSkeleton.Layout.showInModal.js
// -----------------------------------------
// Shows a view inside of a modal
// Uses Bootstrap's Modals http://twitter.github.com/bootstrap/javascript.html#modals
// All of the ids are added the prefix 'in-modal-' to avoid duplicated ids in the DOM
(function ()
{
	'use strict';
	
	// the last opened modal will be hold in this var
	var current_modal;

	_.extend(SC.ApplicationSkeleton.prototype.Layout.prototype, {

		wrapModalView: function (view)
		{
			// If the view doesn't has a div with the class modal-body
			// we need to wrap it inside of a div that does for propper styling
			var $modal_body = view.$containerModal.find('.modal-body');

			// The view has it's own body so the template is probably doing some fancy stuff, so lets remove the other body
			if (view.$('.modal-body').length && $modal_body.length)
			{
				$modal_body.remove();
				$modal_body = [];
			}
			// if there is no body anywere lets wrap it with one
			else if (!$modal_body.length)
			{
				view.$el = view.$el.wrap('<div class="modal-body"/>').parent();
			}

			if ($modal_body.length)
			{
				$modal_body.append(view.$el);
			}
			else
			{
				view.$containerModal.find('.modal-content').append(view.$el);
			}

			return this;
		}

	,	prefixViewIds: function (view, prefix)
		{
			if (typeof view === 'string')
			{
				prefix = view;
				view = this.currentView;
			}

			if (view instanceof Backbone.View)
			{
				prefix = prefix || '';
				// Adding the prefix to all ids
				view.$('[id]').each(function ()
				{
					jQuery(this).attr('id', function (i, old_id)
					{
						return prefix + old_id;
					});
				});

				// Adding the prefix to all fors, so labels still work
				view.$('[for]').each(function ()
				{
					jQuery(this).attr('for', function (i, old_id)
					{
						return prefix + old_id;
					});
				});
			}
		}

	,	addModalListeners: function (view)
		{
			var self = this;

			// hidden is an even triggered by the bootstrap modal plugin
			// we obliterate anything related to the view once the modal is closed
			view.$containerModal.on('hidden.bs.modal', function ()
			{
				// TODO: Review this code
				view.$containerModal.closest('.modal-container').remove();
				view.$containerModal = null;
				self.$containerModal = null;
				self.modalCurrentView = null;
				current_modal = false;					
				view.destroy();

				//After closing te modal, impose the underlying view's title
				document.title = self.currentView && self.currentView.getTitle() || '';				
			});

			//Only trigger afterAppendView when finished showing the modal (has animation which causes a delay)
			view.$containerModal.on('shown.bs.modal',function ()
			{
				// 271487 set properties in media tag for browsers not supporting them.
				// Important: Keep in sync with modals.less
				if (!(window.matchMedia || window.msMatchMedia))
				{					
					if (jQuery(window).width() >= 768)
					{
						var props = {
							left: '50%',
							right: 'auto',
							width: '600px',
							paddingTop: '30px',
							paddingBottom: '30px'
						};
						view.$containerModal.find('.modal-dialog').first().css(props);
					}
				}

				self.trigger('afterAppendView', view);
			});
		}

	,	showInModal: function (view, options)
		{
			options = jQuery.extend({ modalOptions: {} }, options);

			// we tell the view its beeing shown in a Modal
			view.inModal = true;

			// we need a different variable to know if the view has already been rendered in a modal
			// this is to add the Modal container only once to the DOM
			if (!view.hasRenderedInModal)
			{
				var element_id = view.$el.attr('id');
				
				this.$containerModal = view.$containerModal = jQuery(
					SC.macros.modal(view.page_header || view.title || '')
				).closest('div');

				this.$containerModal
					.addClass(view.modalClass || element_id ? ('modal-'+ element_id) : '')
					.attr('id', view.modalId || element_id ? ('modal-'+ element_id) : '');
				
				this.modalCurrentView = view;
				view.options.layout = this;
			}

			this.trigger('beforeAppendView', view);
			// Generates the html for the view based on its template
			// http://backbonejs.org/#View-render
			view.render();

			this.wrapModalView(view).prefixViewIds(view, 'in-modal-');
			
			if (!view.hasRenderedInModal)
			{
				// if there was a modal opened we close it
				current_modal && current_modal.modal('hide');
				// Stores the modal dom reference
				current_modal = view.$containerModal;
				
				this.addModalListeners(view);
				// So, now we add the wrapper modal with the view in it to the dom - we append it to the Layout view instead of body, so modal links are managed by NavigationHelper. 
				view.$containerModal.appendTo(this.el).wrap('<div class="modal-container"/>');

				// We trigger the plugin, it can be passed custom options
				// http://twitter.github.com/bootstrap/javascript.html#modals
				view.$containerModal.modal(options.modalOptions);
			}

			if (options.className)
			{
				view.$containerModal.addClass(options.className);
			}
			
			// the view has now been rendered in a modal
			view.hasRenderedInModal = true;

			return jQuery.Deferred().resolveWith(this, [view]);
		}
	});
})();
