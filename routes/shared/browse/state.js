'use strict';

var globalRequire = require('../../../lib/globalRequire');
var _ = globalRequire('lodash');
var async = globalRequire('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroutes = require('../errors');


module.exports = function(render, requestProps, fnCallback){
	// console.log('getProps()', arguments);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		state: getState.bind(null, requestProps.params.stateSlug),
		cities: getCities.bind(null, requestProps.params.stateSlug),
	}, function(err, results) {
		var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		var cities = (_.isArray(results.cities) && results.cities.length) ? results.cities : null;

		var hasResults = (!!state && !!cities && !!cities.length);

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroutes(err, render, requestProps, fnCallback);
		}
		else {
			var pageTitle = state.name + ' Mechanics';
			var description = 'Finding the right mechanic in ' + state.name + ' just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!';

			var metaTitle = pageTitle;
			var metaDescription = description;
			

			var citiesHtml = render('/fragments/geo-list', {
				places: cities
			});


			var html = render('/browse/state', {
				pageTitle: pageTitle,
				description: description,
				cities: cities,
				citiesHtml: citiesHtml,
			});

			var props = {
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				content: html,
			};

			fnCallback(null, props);
		}

	});
};


function getState(stateSlug, fnCallback) {
	libGeo.getState(stateSlug, function(err, results) {
		fnCallback(err, results);
	});
}


function getCities(stateSlug, fnCallback) {
	libGeo.getCities(stateSlug, function(err, results) {
		fnCallback(err, results);
	});
}