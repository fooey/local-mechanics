'use strict';

//var /*global*/require = require('../../../lib//*global*/require');
var _ = require('lodash');
var async = /*global*/require('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroute = require('../errors');


module.exports = function(render, requestProps, fnCallback){
	// console.log('place:home:export', requestProps);
	// console.log('placeId', requestProps.params.placeId);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		place: getPlace.bind(null, requestProps.params.placeId, requestProps.ipAddress),
	}, function(err, results) {
		var place = (
				_.has(results, 'place')
				&& _.has(results.place, 'locations')
				&& _.isArray(results.place.locations)
				&& results.place.locations.length
			)
			? results.place.locations[0]
			: null;

		// var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		// var cities = (_.isArray(results.cities) && results.cities.length) ? results.cities : null;

		// console.log('place:home', place);

		var hasResults = !!place;

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroute(err, render, requestProps, fnCallback);
		}
		else {

			var metaTitle = place.name;
			var metaDescription = place.name;
			
			if (place.teaser && !_.isEmpty(place.teaser)) {
				metaDescription = place.teaser + ' ' + metaDescription;
			}


			var props = {
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
			};

			var crumbs =  [
				{label: 'Home', href: '/', title: 'Local-Mechanics.com'},
			];

			if (place.geo && place.geo.state) {
				crumbs.push({label: place.geo.state.name, href: place.geo.state.getLink(), title: place.geo.state.name + ' Mechanics'});

				if (place.geo.city) {
					crumbs.push({label: place.geo.city.name, href: place.geo.city.getLink(), title: place.geo.city.name + ' Mechanics'});
				}

			}

			crumbs.push({label: place.name, href: place.getLink(), title: place.name, active: true});

			props.contentHtml = render('/place/home', {
				crumbs: crumbs,

				place: place,
				requestProps: requestProps,
			});

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