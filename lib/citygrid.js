'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var globalRequire = require('./globalRequire');
var _ = require('lodash');
var async = globalRequire('async');

var net = require('./net');
var libGeo = require('./geo');



/*
*	EXPORT
*/

module.exports = {
	getPlaces: getPlaces,
	defaultBrowseOptions: {
		page: 1,
		radius: 5,
		rpp: 20,
		sort: 'alpha',
		has_offers: false,
	}
};

function ListingPlace(props){
	if(!(this instanceof ListingPlace)) return new ListingPlace(props);
	_.assign(this, props);
	

	this.mapSrc = this.getMapSrc('300x200');
	this.mapHref = 'http://google.com/maps?q=' + this.latitude + ',' + this.longitude;


	return this;
}

ListingPlace.prototype.getLink = function(page){
	var link = [
		'', //leading slash
		// 'mechanics', 
		this.public_id
	];

	page && link.push(page);

	return link.join('/') + '.html';
}

ListingPlace.prototype.getMapSrc = function(size){
	return 'http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBNnbO28EWaCd8l0sV68PX8OnFlgsjE9z0&size=' + size + '&zoom=13&markers=' + this.latitude + ',' + this.longitude;
}



/*
*	PUBLIC
*/

function getPlaces(lat, lon, query, fnCallback) {
	// console.log('cg::getPlaces()', arguments);
	net.getJson(
		getUrlPlaces(lat, lon, query),
		function(err, data) {
			if(err) {
				fnCallback(err, data);
			}
			else {
				var results = data.results  || {};
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
			place.geo = zipObjs[place.address.postal_code];
			return place;
		});

		fnCallback(err, results);
	});
}


function getPlacesZips(places, fnCallback){
	var zips = _.map(places, function(place) {
		return place.address.postal_code;
	});

	zips = _.uniq(zips);

	async.map(
		zips,
		function(zip, next) {
			libGeo.getZip(zip, function(err, zipObj) {
				next(err, zipObj[0]);
			});
		},
		function(err, results) {
			results = _.indexBy(results, 'zip');
			fnCallback(err, results);
		}
	);
}




/*
*	PRIVATE
*/

function getUrl(endpoint, query) {
	query.sort = query.sort || 'alpha';
	query.rpp = query.rpp || 20;

	if (query.rpp === 20) {
		delete query.rpp;
	}
	if (query.sort === 'dist') {
		delete query.sort;
	}

	var requestUrl = url.format({
		protocol: 'http:',
		host: 'cg.api.the-ln.com',
		pathname: endpoint,
		query: query
	});

	return requestUrl;
}



function getUrlPlaces(lat, lon, query) {
	var endpoint = '/lm/places/' + lat + ',' + lon;
	return getUrl(endpoint, query);
}