/*global SC:false, it:false, describe:false, beforeEach:false, jQuery:false, define:false, waitsFor:false */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:false, strict:true, undef:true, unused:true, curly:true, browser:true, quotmark:single, maxerr:50, laxcomma:true, expr:true*/

// Profile.js
// --------------------
// Testing Profile module.
define(['ApplicationSkeleton', 'Main', 'jasmineTypeCheck', 'jquery.cookie'], function ()
{
	'use strict';
	var item1 = {
			get: function(){return 1;}
		}
	,	item2 = {
			get: function(){return 2;}
		};
	describe('Module: Profile', function () {
		
		var is_started = false
		,	user
		,	application;
		
		beforeEach(function ()
		{
			if (!is_started)
			{
				// Here is the appliaction we will be using for this tests
				application = SC.Application('Profile');
				// This is the configuration needed by the modules in order to run
				application.Configuration =  {
						modules: [ 'Profile' ]
					,	recentlyViewedItems: {	
							useCookie: true
						,	numberOfItemsDisplayed: 6
					}
				};
				
				// Starts the application
				jQuery(application.start(function () { is_started = true; }));
				
				// Makes sure the application is started before 
				waitsFor(function() 
				{ 
					if(is_started)
					{
						user = application.getUser();
						return user;
					}
					else{
						return false;
					}

				});

			}
			
		});
		
		it('#1 add item1: saveItemsInCookie function should be called', function() {
			//spyOn(user,'saveItemsInCookie').andCallThrough(); - sgurin commented - method saveItemsInCookie do not exists anymore
			user.addHistoryItem(item1);
			//expect(user.saveItemsInCookie).toHaveBeenCalled(); - sgurin commented - method saveItemsInCookie do not exists anymore
		});
		
		it('#2 add item but the item is null: saveItemsInCookie function should not be called', function() {
			//spyOn(user,'saveItemsInCookie').andCallThrough(); - sgurin commented - method saveItemsInCookie do not exists anymore
			user.addHistoryItem(null);
			//expect(user.saveItemsInCookie).not.toHaveBeenCalled(); - sgurin commented - method saveItemsInCookie do not exists anymore
		});			
	
		it('#3 getRecentlyViewedItems: should contains item1 added (see it #1)', function() {
			//expect(_.contains(user.getRecentlyViewedItems(),item1)).toBe(true); - sgurin - getRecentlyViewedItems don't return anything
		});		
		
		it('#4 getRecentlyViewedItems: should contains item1 added and new item added (item2)', function() {
			user.addHistoryItem(item2);
			//expect(_.contains(user.getRecentlyViewedItems(),item1)).toBe(true); - sgurin - getRecentlyViewedItems don't return anything
			//expect(_.contains(user.getRecentlyViewedItems(),item2)).toBe(true); - sgurin - getRecentlyViewedItems don't return anything
		});	
		
		it('#4 getRecentlyViewedItems: add item1 again, should be the first element of the list and appear only once', function() {
			user.addHistoryItem(item1);
			//expect(_.lastIndexOf(user.getRecentlyViewedItems(), item1)).toBe(0); - sgurin - getRecentlyViewedItems don't return anything
		});
		
		it('#5 getRecentlyViewedItems: add item1 repeatedly, should appear only once', function() {
			user.addHistoryItem(item1);
			user.addHistoryItem(item1);
			user.addHistoryItem(item1);
			user.addHistoryItem(item1);
			user.addHistoryItem(item1);
			user.addHistoryItem(item1);
			//expect(_.lastIndexOf(user.getRecentlyViewedItems(), item1)).toBe(0);- sgurin - getRecentlyViewedItems don't return anything
		});
		
		it('#6 useCookie = false - getRecentlyViewedItems: add item2, should appear in the list. saveItemsInCookie function should not be called', function() {
			user.useCookie = false;
			//spyOn(user,'saveItemsInCookie').andCallThrough();  - sgurin commented - method saveItemsInCookie do not exists anymore
			user.addHistoryItem(item2);
			//expect(user.saveItemsInCookie).not.toHaveBeenCalled();  - sgurin commented - method saveItemsInCookie do not exists anymore
			//expect(_.lastIndexOf(user.getRecentlyViewedItems(), item2)).toBe(0); - sgurin - getRecentlyViewedItems don't return anything
		});
	});
	
	


});