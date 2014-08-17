'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var globalRequire = require('./globalRequire');
var _ = globalRequire('lodash');

var net = require('./net');



/*
*	EXPORT
*/

module.exports = {
	getPlaces: getPlaces,
};

function ListingPlace(props){
	if(!(this instanceof ListingPlace)) return new ListingPlace(props);
	_.assign(this, props);

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
				data.results = data.results || {};
				var places = data.results.locations || [];

				places = _.map(places, ListingPlace);

				fnCallback(err, places);
			}
		}
	);
}




/*
*	PRIVATE
*/

function getUrl(endpoint, query) {
	query.sort = query.sort || 'alpha';
	query.rpp = query.rpp || '20';

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