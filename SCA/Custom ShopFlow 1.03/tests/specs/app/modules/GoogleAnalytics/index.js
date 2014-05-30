SC = {
	ENVIRONMENT: {}
};

specs = [
	'tests/specs/app/modules/GoogleAnalytics/module'
];

require.config({
	paths: {
		GoogleAnalytics: 'js/src/app/modules/GoogleAnalytics/GoogleAnalytics'
	}
});

require(['underscore', 'jQuery', 'Main', 'ApplicationSkeleton']);