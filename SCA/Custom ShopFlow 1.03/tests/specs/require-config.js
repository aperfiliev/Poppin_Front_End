/*jshint laxcomma:true*/
require.config({
	baseUrl: '../../../../../'
,	urlArgs: '_=' + Math.random()
,	waitSeconds: 200 //for correctly running the tests on the real website
,	paths: {
		'jasmine': 'tests/jasmine/jasmine'
	,	'jasmineHtml': 'tests/jasmine/jasmine-html'
	,	'jasmineTypeCheck': 'tests/jasmine/typechecking-matchers'
	,	'jasmineAjax': 'tests/jasmine/mock-ajax'
	,	'blanket': 'tests/blanket/blanket_custom'
	,	'underscore': 'js/libs/underscore'
	,	'Backbone': 'js/libs/backbone'
	,	'BackboneValidation': 'js/libs/backbone.validation'
	,	'jQuery': 'js/libs/jquery'
	,	'jquery.cookie': 'js/libs/jquery.cookie'
	,	'jquery.bxslider': 'js/libs/bxslider/jquery.bxslider'
	,	'jquery.keyboard': 'js/libs/jquery.keyboard'
	,	'jquery.ui.position': 'js/libs/jquery.ui.position'
	,	'Bootstrap': 'js/libs/bootstrap'
		// Application Core
	,	'Main': 'js/src/core/Main'
	,	'ApplicationSkeleton': 'js/src/core/ApplicationSkeleton'
	}
,	shim: {
		'jasmine': {
			exports: 'jasmine'
		}
	,	'jasmineHtml': {
			deps: ['jasmine', 'jQuery'] //jQuery is not a real dependency but we want jquery to always be present in our specs. 
		,	exports: 'jasmine'
		}
	,	'jasmineTypeCheck': {
			deps: ['jasmine']
		,	exports: 'jasmine'
		}
	,	'jasmineAjax': {
			deps: ['jasmine']
		,	exports: 'jasmine'
		}
	,	'blanket': {
			deps: ['jasmine']
		,	exports: 'blanket'
		}
	,	'underscore': {
			exports: 'underscore'
		}
	,	'jQuery': {
			exports: 'jQuery'
		}
	,	'Backbone': {
			deps: ['underscore', 'jQuery']
		,	exports: 'Backbone'
		}
	,	'BackboneValidation': {
			deps: ['Backbone']
		}
	,	'jquery.cookie': {
			deps: ['jQuery']
		}
	,	'jquery.bxslider': {
			deps: ['jQuery']
		}
	,	'jquery.keyboard': {
			deps: ['jQuery', 'jquery.ui.position']
		}
	,	'jquery.ui.position': {
			deps: ['jQuery']
		}
	,	'Bootstrap':{
			deps: ['jQuery']
		}
		// Application Core
	,	'Main': {
			deps: ['Backbone']
		,	exports: 'SC'
		}
	,	'ApplicationSkeleton': {
			deps: ['Main']
		,	exports: 'ApplicationSkeleton'
		}
	}
});