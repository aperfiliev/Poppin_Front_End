/*global SC:false, it:false, runs: false, require: false, Backbone: false, describe:false, expect:false, define: false, beforeEach:false, jQuery:false, waitsFor:false */
/*jshint evil:true, forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Content.EnhancedViews test
// --------------------
define(['Content', 'Application'], function ()
{
	'use strict';

	var setFragment = function(fragment) 
	{
		Backbone.history.fragment = fragment;
	}; 

	// The Content 'directives' data. 
	SC.ENVIRONMENT.CONTENT = [
		{
			'id': '1'
		,	'pageid': '1'
		,	'query': '/foo/bar'
		,	'type': '2'
		}
	,	{
			'id': '2'
		,	'pageid': '2'
		,	'query': '/chapter/9'
		,	'type': '2'
		}		
	,	{
			'id': '3'
		,	'pageid': '4'
		,	'query': '/chapter/6'
		,	'type': '2'
		}

	//TODO: * doesn't work
	/*,	{
			'id': '3'
		,	'pageid': '3'
		,	'query': '*'
		,	'type': '2'
		}*/
	];

	//  The content pages data. 
	SC.ENVIRONMENT.CONTENT_PAGES = [
		{
			'pagecontent': [
				{
					'id': '1'
				,	'target': '#test1'
				,	'contenttype': 'html'
				,	'content': 'Chapter 1: Down the Rabbit-Hole...'
				}
			]
		,	'internalid': '1'
		,	'id': '1' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title'
		,	'metadescription': 'alice in wonderland description'
		,	'metakeywords': 'alice, wonderland, carroll, chapter 1'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}

		// this page content is special because it contains a script in the content (should work)
	,	{
			'pagecontent': [
				{
					'id': '2'
				,	'target': '#test2'
				,	'contenttype': 'html'
				,	'content': '<h1 class="chapter-9" id="#chapter-9">Chapter 9: The Mock Turtle\'s Story...</h1>' + 
						'<script>window.alicestring="The Mock Turtle is very sad, even though he has no sorrow.";</script>'
				}
			]
		,	'internalid': '2'
		,	'id': '2' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title - chapter 9'
		,	'metadescription': 'alice in wonderland description - chapter 9'
		,	'metakeywords': 'alice, wonderland, carroll - chapter 9'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}

		//this page targets url * TODO: * doesn't work
	/*,	{
			'pagecontent': [{
				'id': '3'
			,	'target': '#propaganda'
			,	'contenttype': 'html'
			,	'content': 'everywhere'
			}]
		,	'internalid': '3'
		,	'id': '3' //for the backbone model
		,	'tags': []
		,	'title': 'propaganda'
		,	'metadescription': 'propaganda'
		,	'metakeywords': 'propaganda'
		,	'metaextra': '<meta name=\'propaganda\' content=\'propaganda\'>'
		}*/

		//content in a modal it will match #testmodal1 when the view is showed in a modal. Notice that we prefixed with "in-modal"
	,	{
			'pagecontent': [
				{
					'id': '4'
				,	'target': '#in-modal-testmodal1'
				,	'contenttype': 'html'
				,	'content': 'Chapter 6: Pig and Pepper'
				}
			]
		,	'internalid': '4'
		,	'id': '4' //for the backbone model
		,	'tags': []
		,	'title': 'alice in wonderland title chapter 6'
		,	'metadescription': 'alice in wonderland description chapter 6'
		,	'metakeywords': 'alice, wonderland, carroll, chapter 6'
		,	'metaextra': '<meta name=\'author\' content=\'Caroll\'>'
		}
	];
	
	
	describe('Content Enhanced pages', function () 
	{		
		var is_started = false
		,	application
		,	view = null; 
		
		// initial setup required for this test: we will be working with views.
		// some of these tests require that some macros are loaded, so we load them all:
		jQuery.ajax({url: '../../../../../templates/Templates.php', async: false}).done(function(data){
			eval(data); 
			SC.compileMacros(SC.templates.macros);
		}); 
		// jQuery('<link>').appendTo(jQuery('head')).attr({type : 'text/css', rel : 'stylesheet'}).attr('href', '../../../../../skins/standard/styles.css');

		beforeEach(function ()
		{

			is_started = false;
			SC.templates.layout_tmpl = '<div id="content"></div></div>';
			jQuery('body').append('<div id="main"></div>'); 

			// setFragment('foo/bar'); //Backbone.history.fragment = 'foo/bar';
			// Backbone.history.fragment = 'chapter/9';
			application = SC.Application('Content.EnhancedViews');
			application.Configuration =  {
				modules: [ 'Content' ]
			};
			jQuery(application.start(function () 
			{ 
				application.getLayout().appendToDom();

				//mock pages and urls
				var contentDataModels = require('Content.DataModels');				
				var urlsCollection = contentDataModels.Urls.Collection.getInstance();
				var pagesCollection = contentDataModels.Pages.Collection.getInstance();		

				urlsCollection.reset(SC.ENVIRONMENT.CONTENT);
				pagesCollection.reset(SC.ENVIRONMENT.CONTENT_PAGES);

				is_started = true; 
			}));
			waitsFor(function() 
			{
				return is_started; 
			});
		});

		it('should enrich content only after showContent()', function ()
		{	
			setFragment('foo/bar'); 


			view = new Backbone.View({
				application: application
			});

			SC.templates.test1_tmpl = 
				'<div>'+
					'<div id="test1">test1</div>'+
					'<div id="test2">test2</div>'+
					'<div id="propaganda" class="propaganda">original</div>'+
				'</div>';
			view.template = 'test1';
			view.render(); 

			//notice that view is rendered but until we call layout.showContent() or layout.updateUI the content will not be injected on it. 
			expect(view.$('#test1').text()).toBe('test1'); 
			expect(view.$('#test2').text()).toBe('test2'); 
		});

		// if a subscribe for afterAppendView the content should be already rendered: This is why Layout.showContent is wrap and not class-overriten
		it('let subscribe to renderEnhancedPageContent event', function () 
		{	
			var content_zone_after = null
			,	view_after = null; 
			application.getLayout().on('renderEnhancedPageContent', function(view, content_zone)
			{
				content_zone_after = content_zone; 
				view_after = view; 
			}); 

			application.getLayout().showContent(view);

			expect(content_zone_after.target).toBe('#test1'); 
			expect(view_after).toBe(view); 
		});

		it('more specific rule /foo/bar should win over less specific rule *', function ()
		{
			expect(view.$('#test1').text()).toBe('Chapter 1: Down the Rabbit-Hole...'); 
			expect(view.$('#test2').text()).toBe('test2');
		});

		it('should change the document\'s title if any', function ()
		{
			expect(document.title).toBe('alice in wonderland title');
		});

		it('should add a meta[name="description"] in head if any', function ()
		{
			expect(jQuery('head meta[name="description"]').size()).toBe(1);
			expect(jQuery('head meta[name="description"]').attr('content')).toBe('alice in wonderland description');
		});

		it('should add a meta[name="keywords"] in head if any', function ()
		{
			expect(jQuery('head meta[name="keywords"]').size()).toBe(1);
			expect(jQuery('head meta[name="keywords"]').attr('content')).toBe('alice, wonderland, carroll, chapter 1');
		});

		it('change the url and call layout.showContent() again should trigger the enhanced pages again', function ()
		{
			setFragment('chapter/9');
			application.getLayout().showContent(view);

			expect(document.title).toBe('alice in wonderland title - chapter 9');
			expect(view.$('#test2').html().indexOf('Chapter 9: The Mock Turtle\'s Story..') !== -1).toBe(true);
		});

		it('scripts including in the content should be executed', function ()
		{
			expect(window.alicestring).toBe('The Mock Turtle is very sad, even though he has no sorrow.');
		});

		it('call Layout.updateUI() should render the enhanced pages', function ()
		{
			setFragment('foo/bar');
			application.getLayout().updateUI(); //shouold trigger the enhanced views.
			expect(document.title).toBe('alice in wonderland title');
		});

		//TODO: * doesn't work
		/*
		it('call Layout.updateUI() should render the enhanced pages - useful parts that change dynamically.', function ()
		{
			setFragment('non/existent'); //this should match only '*' rule
			application.getLayout().updateUI(); //should trigger the enhanced views.
			// application.getLayout().showContent(view);

			expect(document.title).toBe('alice in wonderland title - chapter 9');
			expect(view.$('.propaganda').text()).toBe('propaganda'); 
		});*/

		describe('modals', function()
		{
			it('can render in modals prefixing class & ids with in-modal-', function ()
			{
				setFragment('chapter/6');

				SC.templates.testmodals_tmpl = 
					'<div>'+
						'<div id="testmodal1">original</div>'+
					'</div>';
				var view2 = new Backbone.View({
					application: application
				});
				view2.template = 'testmodals';
				view2.render(); 

				var waitToModal = false;
				application.getLayout().on('renderEnhancedPageContent', function(targetView, content_zone)
				{
					if (targetView === view2)
					{
						waitToModal = true;
					}					
				});
				application.getLayout().showInModal(view2); 

				waitsFor(function() 
				{
					return waitToModal; 
				}, 'Modal should be shown', 1000); //we need to wait here because of the modal's animation
				
				runs(function()
				{
					expect(view2.$('#testmodal1').size()).toBe(0);
					expect(view2.$('#in-modal-testmodal1').size()).toBe(1);
					expect(view2.$('#in-modal-testmodal1').text()).toBe('Chapter 6: Pig and Pepper');
				});
			});
		});

	});	

});