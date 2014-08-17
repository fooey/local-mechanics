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
	path: '*',
	getView: require('./shared/errors').bind(null, new Error(404)),
}];