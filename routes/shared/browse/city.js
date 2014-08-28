'use strict';

var globalRequire = require('../../../lib/globalRequire');
var _ = require('lodash');
var async = globalRequire('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroute = require('../errors');


module.exports = function(render, requestProps, fnCallback){
	// console.log('getProps()', arguments);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		state: getState.bind(null, requestProps.params.stateSlug),
		city: getCity.bind(null, requestProps.params.stateSlug, requestProps.params.citySlug),
		places: ['city', getPlaces.bind(null, requestProps.query)],
		// placesCities: ['places', getPlacesCities]
	}, function(err, results) {
		var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		var city = (_.isArray(results.city) && results.city.length) ? results.city[0] : null;
		var places = (_.isArray(results.places.locations) && results.places.locations.length) ? results.places.locations : [];

		var hasResults = (!!state && !!city && !!places && !!places.length);

		if (err) {
			err = err || new Error(404);
			errorReroute(err, render, requestProps, fnCallback);
		}
		else {
			var pageTitle = city.name + ', ' + state.name + ' Mechanics';
			var description = 'Finding the right mechanic in ' + city.name + ', ' + state.name + ' just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!';

			var metaTitle = pageTitle;
			var metaDescription = description;

			var appState = {
				city: city,

				first: null,
				page: 1,
				radius: 5,
				rpp: 20,
				sort: 'alpha',
				has_offers: false,

				totalHits: results.places.total_hits,
				baseLink: city.getLink(),
				callId: results.places.call_id,
				urlLib: require('url'),
			};


			var placesHtml = render('/browse/places', {
				places: places,
				renderPlace: render('/browse/place'),
			});

			var optionsHtml = render('/browse/options', {
				renderPagination: render('/util/pagination'),
			});


			var contentHtml = render('/browse/city', {
				pageTitle: pageTitle,
				description: description,

				appState: appState,
				placesHtml: placesHtml,
				optionsHtml: optionsHtml,
			});

			var props = {
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				contentHtml: contentHtml,
				exports: {appState: appState},
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


function getCity(stateSlug, citySlug, fnCallback) {
	libGeo.getCity(stateSlug, citySlug, function(err, results) {
		fnCallback(err, results);
	});
}



function getPlaces(query, fnCallback, results) {
	var city = results.city[0];

	libCG.getPlaces(
		city.avgLatitude,
		city.avgLongitude,
		query,
		fnCallback
	);
}