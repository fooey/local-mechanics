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
		city: getCity.bind(null, requestProps.params.stateSlug, requestProps.params.citySlug),
		places: ['city', 'state', getPlaces.bind(null, requestProps.query)],
		placesCities: ['places', getPlacesCities]
	}, function(err, results) {
		var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		var city = (_.isArray(results.city) && results.city.length) ? results.city[0] : null;
		var places = (_.isArray(results.placesCities) && results.placesCities.length) ? results.placesCities : null;

		var hasResults = (!!state && !!city && !!places && !!places.length);

		console.log('hasResults', hasResults);
		console.log('state', state);
		console.log('city', city);
		console.log('places', places.length);

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroutes(err, render, requestProps, fnCallback);
		}
		else {
			var pageTitle = city.name + ', ' + state.name + ' Mechanics';
			var description = 'Finding the right mechanic in ' + city.name + ', ' + state.name + ' just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!';

			var metaTitle = pageTitle;
			var metaDescription = description;

			

			var html = render('/browse/city', {
				pageTitle: pageTitle,
				description: description,
				places: places,
				renderPlace: render('/browse/place')
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


function getCity(stateSlug, citySlug, fnCallback) {
	libGeo.getCity(stateSlug, citySlug, function(err, results) {
		fnCallback(err, results);
	});
}



function getPlaces(query, fnCallback, results) {

	var city = results.city[0];
	var state = results.state[0];

	libCG.getPlaces(
		city.avgLatitude,
		city.avgLongitude,
		query,
		function(err, results) {
			fnCallback(err, results);
		}
	);
}



function getPlacesCities(fnCallback, results) {
	
	var _places = results.places;
	var zips = _.map(_places, function(place) {
		return place.address.postal_code;
	});

	var geoZips = {};

	zips = _.uniq(zips);
	// console.log('browse::getPlacesCities()', zips);

	async.each(
		zips,
		getZip.bind(null, geoZips),
		function(err) {
			geoZips = _.map(_places, function(place) {
				place.geo = geoZips[place.address.postal_code];
				return place;
			});
			// console.log(_places);

			fnCallback(null, _places);
		}
	);
}

function getZip(geoZips, zip, fnCallback) {
	libGeo.getZip(zip, function(err, result){
		geoZips[zip] = result[0];
		fnCallback();
	})
}