/*jshint laxcomma:true*/
specs = [
	// 'tests/specs/app/modules/Merchandising/module'
	'tests/specs/app/modules/Merchandising/Zone'
,	'tests/specs/app/modules/Merchandising/jQueryPlugin'
// ,	'tests/specs/app/modules/Merchandising/Context'
];

require.config({
	paths: {
		'Merchandising': 'js/src/app/modules/Merchandising/Merchandising'
	,	'Merchandising.Zone': 'js/src/app/modules/Merchandising/Merchandising.Zone'
	,	'Merchandising.jQueryPlugin': 'js/src/app/modules/Merchandising/Merchandising.jQueryPlugin'
	,	'Merchandising.Context': 'js/src/app/modules/Merchandising/Merchandising.Context'
	,	'Merchandising.Rule': 'js/src/app/modules/Merchandising/Merchandising.Rule'
	,	'Merchandising.ItemCollection': 'js/src/app/modules/Merchandising/Merchandising.ItemCollection'
	}
,	shim: {
		'Merchandising.Rule': {
			deps: ['ExtrasBackbone.cachedSync', 'Main', 'ApplicationSkeleton']
		,	exports: 'Merchandising.Rule'
		}
	,	'Merchandising.Zone': {
			deps: ['Main', 'ApplicationSkeleton']
		,	exports: 'Merchandising.Zone'
		}
	,	'Merchandising.Context': {
			deps: ['underscore']
		,	exports: 'Merchandising.Context'
		}
	,	'Merchandising.jQueryPlugin': {
			deps: ['jQuery']
		,	exports: 'jQuery'
		}
	}
});

var SC = SC || {};

SC.ENVIRONMENT = SC.ENVIRONMENT || {};