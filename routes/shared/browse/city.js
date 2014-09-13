'use strict';

var url = require('url');

var _ = require('lodash');
var async = require('async');

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


			var urlObj = url.parse(requestProps.originalUrl, true);

			var appState = _.defaults(requestProps.query, libCG.defaultBrowseOptions);
			// console.log('params', requestProps.query);
			// console.log('appState', appState);

			var appState = _.defaults({
				// city: city,

				totalHits: results.places.total_hits,
				numPages: Math.ceil(results.places.total_hits / appState.rpp),
				// baseLink: city.getLink(),
				call_id: results.places.call_id,

				getLink: urlSetParams.bind(null, urlObj),
			}, appState);

			appState.page = _.parseInt(appState.page);
			appState.rpp = _.parseInt(appState.rpp);
			appState.radius = _.parseInt(appState.radius);

			console.log('appState', appState);


			var contentHtml = render('/browse/city', {
				pageTitle: pageTitle,
				description: description,

				appState: appState,
				places: places,
			});

			var appendToHead = ['<link rel="canonical" href="' + city.getLink() + '" />'];
			if (requestProps.originalUrl !== city.getLink()) {
				appendToHead.push('<meta name="robots" content="noindex" />');
			}
			if (appState.numPages > 1) {
				if (appState.page > 1) {
					appendToHead.push('<link rel="prev" href="' + urlSetParams(urlObj, {page: appState.page - 1}) + '" />');
				}
				if (appState.page < appState.numPages) {
					appendToHead.push('<link rel="next" href="' + urlSetParams(urlObj, {page: appState.page + 1}) + '" />');
				}
			}

			var props = {
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				contentHtml: contentHtml,
				appendToHead: appendToHead,
				// appState: appState,
			};

			fnCallback(null, props);
		}

	});
};


function urlSetParams(urlObj, newParams) {
	var paramDefaults = libCG.defaultBrowseOptions;

	var newQuery = _.assign(_.cloneDeep(urlObj.query), newParams);

	_.each(newQuery, function(val, key) {
		var isBlank = (val == '' || val == null);
		var isDefaultValue = (val == paramDefaults[key]);
		var isInvalidParam = !_.has(paramDefaults, key);
		// console.log(key, val, isBlank, isDefaultValue, isInvalidParam);

		if (isBlank || isDefaultValue || isInvalidParam) {
			delete newQuery[key];
		}
	});
	
	// console.log('urlSetParams:newParams', newParams);
	// console.log('urlSetParams:newQuery', newQuery);

	return url.format({
		pathname: urlObj.pathname, 
		query: newQuery
	});
}



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