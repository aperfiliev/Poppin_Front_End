// NavigationHelper.js
// -------------------
// This file intersect all clicks on a elements and computes what to do, if navigate useing backbone or navigate away
// support data-touchpoint for indicating a target touchpoint by name and data-keep-options for keeping current url options in the link.
define('NavigationHelper', ['UrlHelper'], function ()
{
	'use strict';

	var NavigationHelper = {

		mountToApp: function (application)
		{
			// there is a soft dependency with Content.EnhancedViews
			// we only want it to disable the function that sets the title of the page,
			// we don't want to do that pages that open in modals
			try
			{
				ContentEnhancedViews = require('Content.EnhancedViews');
			}
			catch (e)
			{
				console.log('Couldn\'t load ContentEnhancedViews');
			}

			// Layout
			var Layout = application.getLayout()
			,	ContentEnhancedViews;

			// Touchpoints navigation
			_.extend(Layout, {

				oldIE: function()
				{
					var	isExplorer = /msie [\w.]+/
					,	docMode = document.documentMode;

					return (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

				}

			,	getUrl: function($element)
				{

					if (this.oldIE())
					{
						return $element.data('href');
					}
					else
					{
						return $element.attr('href');
					}
				}

			,	setUrl: function($element, url)
				{
					$element.attr('href', url);

					if (this.oldIE())
					{
						$element.data('href', url);
					}

				}


				// layout.showInternalLinkInModal
				// for links that has the data-toggle=show-in-modal we will open them in a modal,
				// we do this by overriding the showContent function of the layout
				// and by disabeling the overrideViewSettings of the Content.EnhancedViews package
				// Then we just navigate to that url to call the router and execute the logic as normal
			,	showInternalLinkInModal: function (e, href, target)
				{
					var self = this
					,	current_fragment = Backbone.history.fragment || '/'
					,	original_view;

					this.isRewrited = true;
					this.originalShowContent = this.showContent;

					if (ContentEnhancedViews)
					{
						this.originalOverrideViewSettings = ContentEnhancedViews.overrideViewSettings;
						// TODO: review the relationship between ContentEnhancedViews and NavigationHelper. Are the hacks in undoNavigationHelperFunctionRewrite() really necessary? For minimizing risks I only commented the following line that explicity don't allow Content Delivery in modals.
						// ContentEnhancedViews.overrideViewSettings = function (view) { return view; };
					}

					// Here we override the showContent function
					this.showContent = function (view)
					{
						var promise = jQuery.Deferred();
						/// If you ever try to set a view that is not the original one
						// this code will cathc it an do an undo
						if (!original_view)
						{
							original_view = view;
						}
						else if (original_view !== view)
						{
							promise = self.originalShowContent.apply(self.application.getLayout(), arguments);
							original_view.$containerModal.modal('hide');
							return promise;
						}

						if (view && _.isFunction(view.showInModal))
						{
							// Then we just call the show in modal of the same view that we were passed in.
							promise = view.showInModal({className: target.data('modal-class-name')});

							// once this model closes we undo the override of the function
							view.$containerModal.on('hide.bs.modal', function ()
							{
								self.undoNavigationHelperFunctionRewrite();
							});
						}
						else
						{
							self.undoNavigationHelperFunctionRewrite();
							Backbone.history.navigate(href, {trigger: false, replace: true});
						}

						return promise;
					};

					// Here we navigate to the url and we then change the url to what it was originaly set in page that opened the modal
					Backbone.history.navigate(href, {trigger: true, replace: true});
					Backbone.history.navigate(current_fragment, {trigger: false, replace: true});
				}

				// layout.undoNavigationHelperFunctionRewrite
				// helper method to undo the override performed by layout.showInternalLinkInModal
			,	undoNavigationHelperFunctionRewrite: function ()
				{
					if (this.isRewrited)
					{
						this.showContent = this.originalShowContent;

						if (ContentEnhancedViews)
						{
							ContentEnhancedViews.overrideViewSettings = this.originalOverrideViewSettings;
						}

						this.isRewrited = false;
					}
				}

				// layout.showExternalLinkInModal
				// Opens an external page in a modal, by rendering an iframe in it
			,	showExternalLinkInModal: function (e, href, target)
				{
					var view = new Backbone.View({
						application: this.application
					});

					view.src = href;
					view.template = 'iframe';
					view.page_header = target.data('page-header') || '';

					view.showInModal({
						className: (target.data('modal-class-name') || '') +' iframe-modal'
					});
				}

				// layout.clickEventListener
				// Handles the unatended link event
			,	clickEventListener: function (e)
				{
					// Grabs info from the event element
					var $this = jQuery(e.currentTarget)
					,	href = this.getUrl($this) || ''
					,	target_is_blank = e.button === 1 || e.ctrlKey || e.metaKey || $this.attr('target') === '_blank'
					,	target_is_modal = $this.data('toggle') === 'show-in-modal'
					,	is_disabled = $this.attr('disabled')
					,	is_dropdown = $this.data('toggle') === 'dropdown'

					// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
					// in data-href (only if we are in IE7)
					// IE7 detection courtesy of Backbone
					// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
					,	isExplorer = /msie [\w.]+/
					,	docMode = document.documentMode
					,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
					
					if (is_disabled)
					{
						e.stopPropagation();
						return;
					}

					if (oldIE)
					{
						href = $this.data('href');
					}

					if ($this.data('original-href') && !target_is_blank)
					{
						href = $this.data('original-href');
					}

					var is_external = ~href.indexOf('http:') || ~href.indexOf('https:'),
						is_mailto 	= ~href.indexOf('mailto:');

					// use href=# or href=""
					if (href === '#' || href === '' || is_dropdown || is_mailto)
					{
						return;
					}
					
					e.preventDefault();

					// The navigation is within the same browser window
					if (!target_is_blank)
					{
						// There is a modal open
						if (this.$containerModal)
						{
							this.$containerModal.modal('hide');
						}

						// Wants to open this link in a modal
						if (target_is_modal)
						{
							if (is_external)
							{
								this.showExternalLinkInModal(e, href, $this);
							}
							else
							{
								this.showInternalLinkInModal(e, href, $this);
							}
						}
						else
						{
							if (is_external)
							{
								document.location.href = href;
							}
							else
							{
								Backbone.history.navigate(href, {trigger: true});
							}
						}
					}
					else
					{
						window.open(href, _.uniqueId('window'));
					}
				}

				// intercepts mousedown events on all anchors with no data-touchpoint attribute and fix its href attribute to work when opening in a new tab
			,	fixNoPushStateLink: function (e)
				{
					var anchor = jQuery(e.target)
					,	href = this.getUrl(anchor) || '#';

					if (Backbone.history.options.pushState || href === '#' ||
						href.indexOf('http://') === 0 || href.indexOf('https://') === 0)
					{
						return;
					}
					else if (anchor.data('toggle') === 'show-in-modal')
					{
						anchor.data('original-href', href);
						this.setUrl(anchor, window.location.href);
						return;
					}

					var fixedHref;

					if (window.location.hash)
					{
						fixedHref = window.location.href.replace(window.location.hash, '#' + href);
					}
					else if (window.location.href.lastIndexOf('#')  ===  window.location.href.length - 1)
					{
						fixedHref = window.location.href +  href;
					}
					else
					{
						fixedHref = window.location.href + '#' + href;
					}

					this.setUrl(anchor, fixedHref);
				}

			,	getTargetTouchpoint: function ($target)
				{
					var application = this.application
					,	touchpoints = application.getConfig('siteSettings.touchpoints')
					,	target_data = $target.data()
					,	target_touchpoint = (touchpoints ? touchpoints[target_data.touchpoint] : '') || ''
					,	hashtag = target_data.hashtag
					,	new_url = ''
					,	clean_hashtag = hashtag && hashtag.replace('#', '');

					// If we already are in the target touchpoint then we return the hashtag or the original href.
					// We don't want to absolutize this url so we just return it.
					if (target_data.touchpoint === application.getConfig('currentTouchpoint'))
					{
						new_url = clean_hashtag ? ('#' + clean_hashtag) : this.getUrl($target);
						new_url = target_data.keepOptions ? this.getKeepOptionsUrl($target) : new_url;
					}

					if (target_data.parameters)
					{
						target_touchpoint += (~target_touchpoint.indexOf('?') ? '&' : '?') + target_data.parameters;
					}

					if (hashtag && hashtag !== '#' && hashtag !== '#/')
					{
						new_url = _.fixUrl(target_touchpoint + (~target_touchpoint.indexOf('?') ? '&' : '?') + 'fragment=' + clean_hashtag);
					}
					else
					{
						new_url = _.fixUrl(target_touchpoint);
					}

					// We need to make this url absolute in order for this to navigate
					// instead of being triggered as a hash
					if (!(~new_url.indexOf('http:') || ~new_url.indexOf('https:')))
					{
						new_url = location.protocol + '//' + location.host + new_url;
					}

					// Cross Domain Cookie Tracking:
					// Trackers like Google Analytics require us to send special parameters in the url
					// to keep tracking the user as one entity even when moving to a different domain
					if (application.addCrossDomainParameters)
					{
						new_url = application.addCrossDomainParameters(new_url);
					}

					return new_url;
				}

				// layout.touchpointMousedown
				// On mousedown we will set the href of the the link, passing google analitics if needed
			,	touchpointMousedown: function (e)
				{
					this.isTouchMoveEvent = false;

					if (e.type === 'touchstart')
					{
						e.stopPropagation();
					}

					var $target = jQuery(e.currentTarget)
					,	new_url = this.getTargetTouchpoint($target);

					this.setUrl($target, new_url);
				}

				// layout.touchpointClick
				// This detects if you are tring to access a different hashtag within the same touchpoint
			,	touchpointMouseup: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	target_data = $target.data()
					,	target_is_blank = e.button !== 0 || e.ctrlKey || e.metaKey || $target.attr('target') === '_blank';

					if (!target_is_blank && this.application.getConfig('currentTouchpoint') && this.application.getConfig('currentTouchpoint') === target_data.touchpoint && target_data.hashtag)
					{
						var new_url = target_data.hashtag;
						// Removes the hastag if it's there remove it
						new_url = new_url[0] === '#' ? new_url.substring(1) : new_url;
						// if it doesnot has a slash add it
						new_url = new_url[0] === '/' ? new_url : '/' + new_url;
						// we just set the hastag as a relative href and the app should take care of itself

						this.setUrl($target, new_url);
					}

					if (e.type === 'touchend' && !this.isTouchMoveEvent)
					{
						e.stopPropagation();
						e.preventDefault();

						$target.trigger('click');
					}
				}

			,	touchpointTouchMove: function ()
				{
					this.isTouchMoveEvent = true;
				}

				// layout.getDomain()
				// helper to extract the domain of a url
			,	getDomain: function (url)
				{
					return url.split('/')[2] || null;
				}

				// layout.getProtocol()
				// helper to extract the protocol of a url
			,	getProtocol: function (url)
				{
					return url.split('/')[0] || null;
				}

				// getKeepOptionsUrl. Implement logic of HTML attribute 'data-keep-options'.
				// Return a new link poblating given anchor's href with options (http parameters) from window.location.href.
				// Value of data-keep-options can be '*' (all options from window.location are taken) or a comma separated (only given parameters are taken)
			,	getKeepOptionsUrl: function ($target)
				{
					if (_.getWindow().location.href.indexOf('?') > 0 && $target.data('keep-options'))
					{
						var current_options = _.parseUrlOptions(_.getWindow().location.href);
						//remove options not defined in the target's data-key-options attr
						if ($target.data('keep-options') !== '*')
						{
							var valid_option_names = $target.data('keep-options').split(',')
							,	keys = _(current_options).keys();

							_(keys).each(function (key)
							{
								if (!_(valid_option_names).contains(key))
								{
									delete current_options[key];
								}
							});
						}
						var anchor_options = (this.getUrl($target) && this.getUrl($target).indexOf('?') > 0) ? _.parseUrlOptions(this.getUrl($target)) : {}
						,	new_params = ''
						,	href_to_fix = this.getUrl($target) || '';

						//override with global
						anchor_options = _.extend(anchor_options, current_options);

						// remove query string from url
						href_to_fix = href_to_fix.indexOf('?') > 0 ? (href_to_fix.substring(0, href_to_fix.indexOf('?'))) : href_to_fix;

						var options = _(anchor_options).keys();

						for (var i = 0; i < options.length; i++)
						{
							var key = options[i];
							new_params += key + '=' + anchor_options[key] + (i < options.length - 1 ? '&' : '');
						}

						return href_to_fix + (new_params ? ('?' + new_params) : '');
					}
					else
					{
						return this.getUrl($target);
					}
				}

			,	keepOptionsMousedown: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	new_url = this.getKeepOptionsUrl($target);

					this.setUrl($target, new_url);
				}
			});

			// Adds event listeners to the layout
			_.extend(Layout.events, {

				// touchpoints, this needs to be before the other click event, so they are computed early
				'touchstart a[data-touchpoint]': 'touchpointMousedown'
			,	'touchmove a[data-touchpoint]': 'touchpointTouchMove'
			,	'mousedown a[data-touchpoint]': 'touchpointMousedown'
			,	'touchend a[data-touchpoint]': 'touchpointMouseup'
			,	'mouseup a[data-touchpoint]': 'touchpointMouseup'

			,	'mousedown a[data-keep-options]:not([data-touchpoint])': 'keepOptionsMousedown'
				//intercept clicks on anchor without touchpoint for fixing its href when user try to open it on new tabs / windows.
			,	'mousedown a:not([data-touchpoint])': 'fixNoPushStateLink'
			,	'touchstart a:not([data-touchpoint])': 'fixNoPushStateLink'
				// Listen to the click event of all a elements of the layout
			,	'click a': 'clickEventListener'
			});
		}
	};

	return NavigationHelper;
});
