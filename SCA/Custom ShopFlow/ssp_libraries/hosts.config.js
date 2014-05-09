// This is an example of how to setup the host mapping to differnte languanges, currencies, regions.
// Please replace "site.dev" with your own domain name, ensure that the languages:{host:""} value is unique in this file.
var HOSTS = [
	{
		title:'United States'
	,	currencies:[
			{
				title:'American Dolars'
			,	code:'USD'
			}
		]
	,	languages:[
			{
				title:'English'
			,	host:'site.dev'
			,	locale:'en_US'
			}
		]
	}
,	{
		title:'Canada'
	,	currencies:[
			{
				title:'American Dolars'
			,	code:'USD'
			}
		,	{
				title:'Canadian Dolars'
			,	code:'CAD'
			}
		]
	,	languages:[
			{
				title:'English'
			,	host:'ca.site.dev'
			,	locale:'en'
			}
		,	{
				title:'French'
			,	host:'fr.ca.site.dev'
			,	locale:'fr_CA'
			}
		]
	},
	{
		title:'South America'
	,	currencies:[
			{
				title:'American Dolars'
			,	code:'USD'
			}
		,	{
				title:'Peso Argentino'
			,	code:'ARS'
			}
		,	{
				title:'Peso Uruguayo'
			,	code:'UYU'
			}
		]
	,	languages:[
			{
				title:'Spanish'
			,	host:'sa.site.dev'
			,	locale:'es_ES'
			}
		,	{
				title:'Portuguese'
			,	host:'pt.sa.site.dev'
			,	locale:'pt_BR'
			}
		,	{
				title:'English'
			,	host:'en.sa.site.dev'
			,	locale:'en'
			}
		]
	},
	{
		title:'French'
	,	currencies:[
			{
				title:'Euro'
			,	code:'EUR'
			}
		,	{
				title:'American Dolars'
			,	code:'USD'
			}
		]
	,	languages:[
			{
				title:'French'
			,	host:'fr.site.dev'
			,	locale:'fr_FR'
			}
		]
	}
,	{
		title:'Germany'
	,	currencies:[
			{
				title:'Euro'
			,	code:'EUR'
			}
		]
	,	languages:[
			{
				title:'English'
			,	host:'en.de.site.dev'
			,	locale:'en'
			}
		,	{
				title:'German'
			,	host:'de.site.dev'
			,	locale:'de_DE'
			}
		]
	}
];