'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var _ = require('lodash');
var async = require('async');

var net = require('./net');
var libGeo = require('./geo');

var defaultBrowseOptions = {
	page: 1,
	radius: 5,
	rpp: 10,
	sort: 'alpha',
	has_offers: false,
	first: null,
};



/*
*	EXPORT
*/

module.exports = {
	getPlace: getPlace,
	getPlaces: getPlaces,
	defaultBrowseOptions: defaultBrowseOptions
};

function ListingPlace(props) {
	if (!(this instanceof ListingPlace)) return new ListingPlace(props);
	_.assign(this, props);


	return this;
}

ListingPlace.prototype.getLink = function(page) {
	var link = [
		'', //leading slash
		// 'mechanics',
		this.public_id
	];

	page && link.push(page);

	return link.join('/') + '.html';
};

ListingPlace.prototype.getMapSrc = function(size) {
	return 'http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBNnbO28EWaCd8l0sV68PX8OnFlgsjE9z0&size=' + size + '&zoom=13&markers=' + this.latitude + ',' + this.longitude;
};



/*
*	PUBLIC
*/

function getPlace(publicId, ipAddress, fnCallback) {
	// console.log('cg::getPlace()', arguments);

	var headers = (ipAddress)
		? {client_ip: ipAddress}
		: {};

	net.getJson(
		getUrlPlace(publicId),
		headers,
		function(err, data) {
			// console.log('cg::getPlace():data', data);

			if (err) {
				fnCallback(err, data);
			}
			else if (!data) {
				fnCallback('NotFound', data);
			}
			else {
				var results = data || {};
				var locations = results.locations = _.map(results.locations, ListingPlace) || [];


				// console.log('cg::getPlace():locations', locations);

				attachZips(results, fnCallback);
			}
		}
	);
}

function getPlaces(lat, lon, query, fnCallback) {
	// console.log('cg::getPlaces()', arguments);
	net.getJson(
		getUrlPlaces(lat, lon, query),
		{},
		function(err, data) {
			if (err) {
				fnCallback(err, data);
			}
			else if (!data) {
				fnCallback('NotFound', data);
			}
			else {
				var results = data.results || {};
				var locations = results.locations = _.map(results.locations, ListingPlace) || [];

				attachZips(results, fnCallback);
			}
		}
	);
}

function attachZips(results, fnCallback) {
	var locations = results.locations;
	getPlacesZips(locations, function(err, zipObjs) {
		_.map(locations, function(place) {
			place.geo = (place.address && place.address.postal_code)
				? zipObjs[place.address.postal_code]
				: null;
			return place;
		});

		fnCallback(err, results);
	});
}


function getPlacesZips(places, fnCallback) {
	var zips = _.map(places, function(place) {

		var zip = (place.address && place.address.postal_code)
			? place.address.postal_code
			: null;

		if (zip && zip.length > 5) {
			zip = zip.substring(0, 5);
		}

		return zip;
	});

	zips = _.uniq(zips);

	async.map(
		zips,
		function(zip, next) {
			libGeo.getZip(zip, function(err, zipObj) {
				if (err) {
					next(null, null);
				}
				else if (!zipObj || !Array.isArray(zipObj)) {
					fnCallback('NotFound', zipObj);
				}
				else {
					next(err, zipObj[0]);
				}
			});
		},
		function(err, results) {
			if (_.isArray(results) && results.length) {
				results = _.chain(results)
					.filter(function(o) {return _.has(o, 'zip')})
					.indexBy('zip')
					.value();

				fnCallback(err, results);
			}
			else {
				fnCallback(err, {});
			}
		}
	);
}




/*
*	PRIVATE
*/

function getUrl(endpoint, query) {
	query = query || {};

	var requestUrl = url.format({
		protocol: 'http:',
		host: 'cg.api.the-ln.com',
		// host: 'localhost:3006',
		pathname: endpoint,
		query: query
	});

	return requestUrl;
}



function getUrlPlaces(lat, lon, query) {
	var endpoint = '/lm/places/' + lat + ',' + lon;

	query.sort = query.sort || 'alpha';
	query.rpp = query.rpp || defaultBrowseOptions.rpp;

	if (query.rpp === defaultBrowseOptions.rpp) {
		delete query.rpp;
	}

	return getUrl(endpoint, query);
}



function getUrlPlace(publicId, query) {
	var endpoint = '/lm/place/' + publicId;

	return getUrl(endpoint);
}
