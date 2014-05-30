/*global SC:false, require:false, it:false, describe:false, expect:false, define:false, beforeEach:false, waitsFor:false, jQuery:false*/
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Content.js
// --------------------
// Testing Content.DataModels module.
define(['Content.DataModels', 'ApplicationSkeleton', 'Main'], function ()
{

	'use strict';
	
	describe('Content', function ()
	{

		var is_started = false
		,	content
		,	application
		,	urlsCollection;
		
		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('Content.DataModels');
				// This is the configuration needed by the modules in order to run
				application.Configuration =  {
					modules: [ 'Content.DataModels' ]
				};
				
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				
				// Makes sure the application is started before 
				waitsFor(function() { 
				
					if(is_started)
					{
						content = require('Content.DataModels');
						urlsCollection = content.Urls.Collection.getInstance();
						var urls = [
								{'id':'2','query':'/about-us','pageid':'2','type':'1'}
							,	{'id':'3','query':'/color/Blue,Red/size/Large','pageid':'3','type':'1'}
							,	{'id':'4','query':'/color/Blue*','pageid':'4','type':'2'}
							,	{'id':'5','query':'*Red*','pageid':'5','type':'2'}
							,	{'id':'6','query':'/color/Blue*Red*','pageid':'6','type':'2'}
							,	{'id':'7','query':'/color/Blue*Red*/size/*','pageid':'7','type':'2'}
							,	{'id':'1','query':'*','pageid':'1','type':'2'}
						];
						urlsCollection.reset(urls);
						return true;
					}
					else
					{
						return false;
					}
				
				});

			}
			
		});
					
		it('#1 should match the most apropiate url if no exact match is provided', function ()
		{
			expect(urlsCollection.findUrl('/color/Blue').get('query')).toBe('/color/Blue*');
			expect(urlsCollection.findUrl('/color/Blue,Red').get('query')).toBe('/color/Blue*Red*');
			expect(urlsCollection.findUrl('/color/Blue,Red/brand/Nike').get('query')).toBe('/color/Blue*Red*');
			expect(urlsCollection.findUrl('/color/Blue,Red/size/m').get('query')).toBe('/color/Blue*Red*/size/*');
		});

		it('#2 should match the exact url if it is provided', function ()
		{
			expect(urlsCollection.findUrl('/about-us').get('query')).toBe('/about-us');
			expect(urlsCollection.findUrl('/color/Blue,Red/size/Large').get('query')).toBe('/color/Blue,Red/size/Large');
		});
		
		it('#3 should populate the default url, *', function ()
		{
			expect(content.Urls.Collection.defaultModel.get('query')).toBe('*');
		});

	});
	
});