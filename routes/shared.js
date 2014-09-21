'use strict';

module.exports = [{
	path: '/',
	getView: require('./shared/home')
}, {
	path: '/:stateSlug([a-z-]+)',
	getView: require('./shared/browse/state')
}, {
	path: '/:stateSlug([a-z-]+)/:citySlug([a-z-]+)',
	getView: require('./shared/browse/city')
}, {
	path: '/:placeId([0-9a-z-]+).html',
	getView: require('./shared/place/home')
// }, {
// 	path: '/:placeId([0-9a-z-]+)/:subPage(reviews|jobs).html',
// 	getView: dump
}, {
	path: '*',
	getView: require('./shared/errors').bind(null, new Error(404)),
}];


function dump(render, requestProps, fnCallback){
	console.log('requestProps', requestProps)
	fnCallback(null, {
		meta: {title: 'FIXME', description: 'FIXME',},
		contentHtml: '<pre>' + JSON.stringify(requestProps, null, '\t') + '</pre>'
	});
};