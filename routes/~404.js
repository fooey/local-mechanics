'use strict';
var view = require('../views/compiled/errors/404.jsx');


module.exports = {
	getProps: getProps,
	view: view,
};



function getProps(params, query, fnCallback) {
	console.log('NOT FOUND!', params, query);

	fnCallback(null, {
		meta: {
			title: 'Not Found!',
			description: 'Not Found!',
		},
		pageTitle: 'Not Found!',
		params: params,
		query: query,
		statusCode: 404,
	});
}



function getComponent(fnCallback, results) {
	// console.log('getComponent()', arguments);

	fnCallback(null, view(results.options));
}
