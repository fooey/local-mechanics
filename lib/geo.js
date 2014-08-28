'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var globalRequire = require('./globalRequire');
var _ = require('lodash');
var async = globalRequire('async');

var net = require('./net');



/*
*	EXPORT
*/

module.exports = {
	getStates: getStates,
	getState: getState,
	getCities: getCities,
	getCity: getCity,
	getZips: getZips,
	getZip: getZip,
};



/*
*	INSTANCE
*/

var INSTANCE = {
	api: {
		protocol: 'http',
		host: 'geo.api.the-ln.com',
	}
}




/*
*	CLASSES
*/

function State(props) {
	if(!(this instanceof State)) return new State(props);
	
	this.name = props.stateName;
	this.abbr = props.stateAbbr;
	this.slug = props.stateSlug;
	this.link = this.getLink();
	
	this.avgLatitude = props.avgLatitude;
	this.avgLongitude = props.avgLongitude;

	return this;
}

State.prototype.getLink = function() {
	return '/' + this.slug;
};


function City(props) {
	if(!(this instanceof City)) return new City(props);
	
	this.state = new State(props);
	this.name = props.cityName;
	this.slug = props.citySlug;
	this.link = this.getLink();
	
	this.avgLatitude = props.avgLatitude;
	this.avgLongitude = props.avgLongitude;

	return this;
}

City.prototype.getLink = function() {
	return this.state.getLink() + '/' + this.slug;
};


function Zip(props) {
	if(!(this instanceof Zip)) return new Zip(props);
	
	this.state = new State(props);
	this.city = new City(props);
	this.zip = props.zip;
	this.link = this.getLink();
	
	this.avgLatitude = props.latitude;
	this.avgLongitude = props.longitude;

	// console.log('thiszip', this, props);

	return this;
}

Zip.prototype.getLink = function() {
	return this.city.getLink();
};




/*
*	PUBLIC
*/

function getGeo(requestUrl, objType, fnCallback) {
	async.waterfall([
		getJson.bind(null, requestUrl),
		notFound,
		objectify.bind(null, objType)
	], function(err, results) {
		if (err) console.log('getGeo()', err);
		fnCallback(err, results);
	});
}



function getStates(fnCallback) {
	getState(null, fnCallback);
}

function getState(stateSlug, fnCallback) {
	var requestUrl = getUrlStates(stateSlug);
	getGeo(requestUrl, State, fnCallback);
	// getJson(
	// 	getUrlStates(stateSlug),
	// 	objectify.bind(null, State, notFound.bind(null, fnCallback))
	// );
}



function getCities(stateSlug, fnCallback) {
	getCity(stateSlug, null, fnCallback);
}

function getCity(stateSlug, citySlug, fnCallback) {
	var requestUrl = getUrlCities(stateSlug, citySlug);
	getGeo(requestUrl, City, fnCallback);
	// getJson(
	// 	getUrlCities(stateSlug, citySlug),
	// 	objectify.bind(null, City, notFoundMany.bind(null, fnCallback))
	// );
}





function getZip(zip, fnCallback) {
	getZips(zip, fnCallback);
}

function getZips(partial, fnCallback) {
	var requestUrl = getUrlZips(partial);
	getGeo(requestUrl, Zip, fnCallback);
	// getJson(
	// 	getUrlZips(partial),
	// 	objectify.bind(null, Zip, notFoundMany.bind(null, fnCallback))
	// );
}




/*
*	PRIVATE
*/

function getJson(requestUrl, fnCallback) {
	net.getJson(requestUrl, fnCallback);
}

function notFound(results, fnCallback) {
	var err = (_.isEmpty(results)) ? new Error('404') : null;
	fnCallback(err, results);
}


function objectify(objType, results, fnCallback) {
	// console.log('objectify()');
	if (!_.isArray(results)) {
		results = [results];
	}

	async.map(
		results,
		function(result, cb) {
			cb(null, new objType(result));
		},
		fnCallback
	);
}



function notFoundMany(fnCallback, err, results) {
	// if (!_.isPlainObject(results)) {
	// 	console.log('NotFound', err, results);
	// 	err = 'NotFound';
	// }
	fnCallback(err, results);
}



function getUrl(endpoint) {
	var requestUrl = url.format({
		protocol: INSTANCE.api.protocol,
		host: INSTANCE.api.host,
		pathname: endpoint
	});

	return requestUrl;
}


function getUrlStates(stateSlug) {
	var endpoint = '/states';
	if (stateSlug) {
		endpoint += '/' + stateSlug;
	}
	return getUrl(endpoint);
}


function getUrlCities(stateSlug, citySlug) {
	var endpoint = '/cities';
	if (stateSlug) {
		endpoint += '/' + stateSlug;
		if (citySlug) {
			endpoint += '/' + citySlug;
		}
	}
	return getUrl(endpoint);
}


function getUrlZips(partial) {
	return getUrl(['/zips', partial].join('/'));
}
