/**
 * @jsx React.DOM
 */
'use strict';

var views = {
	generic: require('../views/compiled/errors/generic.jsx')
};


module.exports = function(errorToHandle, params, query, fnCallback) {
	var getErrorData;

	if (errorToHandle.message === '404') {
		getErrorData = notFound;
	}
	else {
		getErrorData = unhandled
	}


	getErrorData(
		errorToHandle, 
		errorHandler.bind(null, fnCallback, query, params)
	);
}





function unhandled(errorToHandle, fnCallback) {
	console.log("ERROR:unhandled", errorToHandle);
	
	var statusCode = 500;
	var customProps = {
		metaTitle: 'Error',
		metaDescription: 'The server has encountered an error.',
		pageTitle: 'Error!',
		description: 'The server has encountered an error.'
	};

	fnCallback({
		view: views.generic,
		statusCode: statusCode,
		customProps: customProps,
	});
}



function notFound(errorToHandle, fnCallback) {
	console.log("ERROR:notFound", errorToHandle);

	var statusCode = 404;
	var customProps = {
		metaTitle: 'Not Found!',
		metaDescription: 'The server could not find the requested resource.',
		pageTitle: 'Not Found!',
		description: 'The server could not find the requested resource.'
	};

	fnCallback({
		view: views.generic,
		statusCode: statusCode,
		customProps: customProps,
	});
}



function errorHandler(fnCallback, query, params, errorData) {
	fnCallback(null, {
		view: errorData.view,
		statusCode: errorData.statusCode,
		props: {
			pageTitle: errorData.customProps.pageTitle,
			description: errorData.customProps.description,
			params: params,
			query: query,
		},
		meta: {
			title: errorData.customProps.metaTitle,
			description: errorData.customProps.metaDescription,
		},
	});
}
