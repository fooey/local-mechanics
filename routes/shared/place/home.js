'use strict';

//var /*global*/require = require('../../../lib//*global*/require');
var _ = require('lodash');
var async = /*global*/require('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroute = require('../errors');


module.exports = function(render, requestProps, fnCallback){
	console.log('place:home:export', requestProps);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		place: getPlace.bind(null, requestProps.params.placeId, requestProps.ipAddress),
		// state: getState.bind(null, requestProps.params.stateSlug),
		// cities: getCities.bind(null, requestProps.params.stateSlug),
	}, function(err, results) {
		console.log('place:home:export', results);
		var place = results.place.locations[0];
		// var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		// var cities = (_.isArray(results.cities) && results.cities.length) ? results.cities : null;

		var hasResults = true;//(!!state && !!cities && !!cities.length);

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroute(err, render, requestProps, fnCallback);
		}
		else {
			var pageTitle = 'FIXME';
			var description = 'FIXME';

			var metaTitle = pageTitle;
			var metaDescription = description;


			var contentHtml = '<pre>' + JSON.stringify(requestProps, null, '\t') + '</pre>';
			contentHtml += '<pre>' + JSON.stringify(place, null, '\t') + '</pre>';

			var props = {
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				contentHtml: contentHtml,
			};

			fnCallback(null, props);
		}

	});
};


function getPlace(publicId, ipAddress, fnCallback) {
	libCG.getPlace(publicId, ipAddress, function(err, results) {
		fnCallback(err, results);
	});
}


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