'use strict';

module.exports = [{
	path: '/',
	render: require('./shared/home')
}, {
	path: '/:stateSlug([a-z-]+)',
	render: require('./shared/browse/state')
}, {
	path: '/:stateSlug([a-z-]+)/:citySlug([a-z-]+)',
	render: require('./shared/browse/city')
}, {
	path: '*',
	render: require('./shared/errors').bind(null, new Error(404)),
}];