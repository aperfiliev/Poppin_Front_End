SC = {
	ENVIRONMENT: {}
};

specs = [
	'tests/specs/app/modules/GoogleUniversalAnalytics/module'
];

require.config({
	paths: {
		GoogleUniversalAnalytics: 'js/src/app/modules/GoogleUniversalAnalytics/GoogleUniversalAnalytics'
	}
});

require(['underscore', 'jQuery', 'Main', 'ApplicationSkeleton']);