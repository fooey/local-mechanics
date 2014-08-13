'use strict';

module.exports = function globalRequire(name) {
	name = name.toLowerCase();

	if (name === 'async') {
		return isWindowVar('async')
			? window.async
			: require('async');
	}
	else if (name === 'jade') {
		return isWindowVar('jade')
			? window.jade
			: require('jade');
	}
	else if (name === 'jquery' || name === '$') {
		return isWindowVar('jQuery')
			? window.jQuery
			: require('jquery');
	}
	else if (name === 'lodash') {
		return isWindowVar('_')
			? window._
			: require('lodash');
	}
	else if (name === 'page') {
		return isWindowVar('page')
			? window.page
			: require('page');
	}


	// else if (name === 'bootstrap') {
	// 	return (typeof window !== 'undefined' && typeof window.bootstrap !== 'undefined')
	// 		? window.bootstrap
	// 		: require('bootstrap');
	// }
	// else if (name === 'react') {
	// 	return (typeof window !== 'undefined' && typeof window.React !== 'undefined')
	// 		? window.React
	// 		: require('react');
	// }

	function isWindowVar(varName) {
		return typeof window !== 'undefined' && typeof window[varName] !== 'undefined';
	}
};
