'use strict';

module.exports = function globalRequire(name) {
	name = name.toLowerCase();

	if (name === 'async') {
		return isWindowVar('async')
			? window.async
			: require('async');
	}
	// else if (name === 'jade') {
	// 	return isWindowVar('jade')
	// 		? window.jade
	// 		: require('jade');
	// }
	else if (name === 'jquery' || name === '$') {
		return isWindowVar('jQuery')
			? window.jQuery
			: require('jquery');
	}
	// else if (name === 'lodash') {
	// 	// return isWindowVar('_')
	// 	// 	? window._
	// 	// 	: require('lodash');
	// 	return require('lodash');
	// }
	else {
		console.log('Undefined library: ', name);
	}


	// else if (name === 'bootstrap') {
	// 	return (typeof window !== 'undefined' && typeof window.bootstrap !== 'undefined')
	// 		? window.bootstrap
	// 		: require('bootstrap');
	// }
	// else if (name === 'page') {
	// 	return isWindowVar('page')
	// 		? window.page
	// 		: require('page');
	// }

	function isWindowVar(varName) {
		return typeof window !== 'undefined' && typeof window[varName] !== 'undefined';
	}
};
