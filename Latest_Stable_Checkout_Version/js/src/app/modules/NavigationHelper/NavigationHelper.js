// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
// This variable has to be already defined when our module loads
var _gaq = _gaq || [];

// NavigationHelper.js
// -------------------
// This file intersect all clicks on a elements and computes what to do, if navigate useing backbone or navigate away

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

				// layout.showInternalLinkInModal
				// for links that has the data-toggle=show-in-modal we will open them in a modal, 
				// we do this by overriding the showContent function of the layout 
				// and by disabeling the overrideViewSettings of the Content.EnhancedViews package
				// Then we just navigate to that url to call the router and execute the logic as normal 
				showInternalLinkInModal: function (e, href, target)
				{
					var self = this
					,	current_fragment = Backbone.history.fragment;
					
					this.isRewrited = true;
					this.originalShowContent = this.showContent;
					
					if (ContentEnhancedViews)
					{
						this.originalOverrideViewSettings = ContentEnhancedViews.overrideViewSettings;
						ContentEnhancedViews.overrideViewSettings = function (view) { return view; };
					}
					
					var original_view;
					
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
					e.preventDefault();
					
					// Grabs info from the event element
					var $this = jQuery(e.currentTarget)
					,	href = $this.attr('href') || ''
					,	target_is_blank = e.button === 1 || e.ctrlKey || e.metaKey || $this.attr('target') === '_blank'
					,	target_is_modal = $this.data('toggle') === 'show-in-modal'
					,	is_disabled = $this.attr('disabled')


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

					if ($this.data('original-href'))
					{
						href = $this.data('original-href');
					}

					var is_external = ~href.indexOf('http:') || ~href.indexOf('https:');

					// use href=# or href=""
					if (href === '#' || href === '')
					{
						return;
					}

					// if the href contains a # and this is not a touchpoint, it will let you know in the console
					if (~href.indexOf('#') && !$this.data('touchpoint') && !$this.data('fixed-href'))
					{
						console.error('This link has a # take it off');
					}

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
			,	fixNoPushStateLink: function(e)
				{
					var anchor = jQuery(e.target)
					,	href = anchor.attr('href') || '#'; 

					if (Backbone.history.options.pushState || href === '#' || 
						href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || //external links
						anchor.data('fixed-href'))
					{
						return;
					}
					else if (anchor.data('toggle') === 'show-in-modal')
					{
						anchor.data('original-href', href);
						anchor.attr('href', window.location.href); 
						return;
					}

					anchor.data('fixed-href', 'true');
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

					anchor.attr('href', fixedHref); 
				}

			,	getTargetTouchpoint: function ($target)
				{
					var touchpoints = this.application.getConfig('siteSettings.touchpoints')
					,	target_data = $target.data()
					,	target_touchpoint = touchpoints[target_data.touchpoint] || ''
					,	hashtag = target_data.hashtag
					,	new_url = ''
					,	url = window.location.href;

					//if we already are in the target touchpoint then we return the hashtag or the original href. 
					if (target_data.touchpoint === this.application.getConfig('currentTouchpoint'))
					{
						return hashtag || $target.attr('href');					
					}

					if (target_data.parameters)
					{
						target_touchpoint += (~target_touchpoint.indexOf('?') ? '&' : '?') + target_data.parameters;
					}

					if (hashtag && hashtag !== '#' && hashtag !== '#/')
					{
						var hashtag_no_numeral = hashtag.replace('#/', '').replace('#', ''); 
						new_url = _.fixUrl(target_touchpoint + (~target_touchpoint.indexOf('?') ? '&' : '?') + 'fragment=' + hashtag_no_numeral + '#' + hashtag_no_numeral);
					}
					else
					{
						new_url = _.fixUrl(target_touchpoint);
					}

					// [Tracking Multiple Domains](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite)
					if (this.application.getConfig('tracking.trackPageview') && (
						this.getProtocol(url) !== this.getProtocol(new_url) || 
						this.getDomain(url) !== this.getDomain(new_url)
					))
					{
						_gaq.push(function ()
						{
							var track_url = _gat._getTrackerByName()._getLinkerUrl(new_url);
							// This validation is due to Tracking Blockers overriding the default anlaytics methods
							if (typeof track_url === 'string')
							{
								new_url = track_url;
							}
						});
					}

					// We need to make this url absolute in order for this to navigate
					// instead of being triggered as a hash
					if (!(~new_url.indexOf('http:') || ~new_url.indexOf('https:')))
					{
						new_url = location.protocol + '//' + location.host + new_url;
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

					if ( ! $target.data('fixed-href'))
					{
						$target.attr('href', new_url);
						$target.data('fixed-href', 'true');
					}
				}

				// layout.touchpointClick
				// This detects if you are tring to access a different hashtag within the same touchpoint
			,	touchpointMouseup: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	target_data = $target.data();

					if (!$target.data('fixed-href') && this.application.getConfig('currentTouchpoint') && this.application.getConfig('currentTouchpoint') === target_data.touchpoint && target_data.hashtag)
					{
						var new_url = target_data.hashtag;
						// Removes the hastag if it's there remove it  
						new_url = new_url[0] === '#' ? new_url.substring(1) : new_url;
						// if it doesnot has a slash add it
						new_url = new_url[0] === '/' ? new_url : '/' + new_url;
						// we just set the hastag as a relative href and the app should take care of itself

						$target.attr('href', new_url);
					}

					if (e.type === 'touchend' && !this.isTouchMoveEvent)
					{
						e.stopPropagation();
						e.preventDefault();

						$target.trigger('click');
					}
				}

			,	touchpointTouchMove: function()
				{
					this.isTouchMoveEvent = true;
				}

				// layout.getDomain()
				// helper to extract the domain of a url
			,	getDomain: function(url)
				{
					return url.split('/')[2] || null;
				}

				// layout.getProtocol()
				// helper to extract the protocol of a url
			,	getProtocol: function(url)
				{
					return url.split('/')[0] || null;
				}

				// layout.collapseNav
				// collapsed the contextual menues once one of the links are cliked
			,	openMenus: {}
			,	toggleCollapseListener: function (e)
				{
					// e might be a jQuery btn
					var $btn = e instanceof jQuery ? e : jQuery(e.target).closest('a')
					,	target = $btn.data('target')
					,	$menu = jQuery(target)
					,	touchStart = null
					,	self = this;

					// if the menue is open
					if (target in this.openMenus)
					{
						delete this.openMenus[target];
						// stop listening the dom, as this is beeing closed
						jQuery('body')
							.off('mousedown'+ target +' touchstart'+ target +' touchend'+ target);
					}
					else
					{
						// else we add it the the open menus collection
						this.openMenus[target] = $menu;
						// and start listening the dom to close menu when "outofocused"
						jQuery('body')
							// we save the time when the touchstart happened
							.on('touchstart'+ target, function ()
							{
								touchStart = new Date().getTime();
							})
							// code for touchend and mousdown is the same
							.on('touchend'+ target +' mousedown'+ target, function ()
							{
								// if there wasn't a touch event, or the time difference between
								// touch start and touch end is less that 200 miliseconds
								// (this is to allow scrolling without closing the facet navigation area)
								if (!touchStart || new Date().getTime() - touchStart < 200)
								{
									$menu.collapse('toggle');
									self.toggleCollapseListener($btn);
								}
							});
					}
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
		
				//intercept clicks on anchor without touchpoint for fixing its href when user try to open it on new tabs / windows. 
			,	'mousedown a:not([data-touchpoint])': 'fixNoPushStateLink'
				// Listen to the click event of all a elements of the layout
			,	'click a': 'clickEventListener'
				// Collapses nav 
			//,	'click .btn-navbar': 'toggleCollapseListener'
			});
		}
	};
	
	return NavigationHelper;
});
