'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var net = require('./net');



/*
*	EXPORT
*/

module.exports = {
	getPlaces: getPlaces,
};




/*
*	PUBLIC
*/

function getPlaces(state, city, query, fnCallback) {
	// console.log('cg::getPlaces()', arguments);
	net.getJson(
		getUrlPlaces(state, city, query),
		function(err, data) {
			data.results = data.results || {};
			var places = data.results.locations || [];

			// console.log(data);

			fnCallback(err, places);
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



function getUrlPlaces(state, city, query) {
	var endpoint = '/lm/places/' + state + '/' + city;
	return getUrl(endpoint, query);
}