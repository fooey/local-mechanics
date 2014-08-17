'use strict';
var globalRequire = require('../../../lib/globalRequire');
var _ = globalRequire('lodash');
var jade = globalRequire('jade');


var errorMappings = {
	'unhandled': unhandled,
	'notFound': notFound,

	'404': notFound,
	'500': unhandled,
};


module.exports = function(err, render, requestProps, fnCallback){
	var errorHandler = errorMappings[err.message] || errorMappings['unhandled'];

	errorHandler(
		requestProps, 
		renderHtml.bind(null, render, fnCallback)
	);
};



function renderHtml(render, fnCallback, props) {
	var html = render('/errors/generic', {
		pageTitle: props.pageTitle,
		description: props.description,
	});

	var props = {
		statusCode: props.statusCode,
		meta: {
			title: props.metaTitle,
			description: props.metaDescription,
		},
		content: html,
	};

	fnCallback(null, props);
}



function unhandled(requestProps, fnCallback) {
	console.log("ERROR:unhandled", requestProps.params, requestProps.query);
	
	var customProps = {
		statusCode: 500,
		metaTitle: 'Error',
		metaDescription: 'The server has encountered an error.',
		pageTitle: 'Error!',
		description: 'The server has encountered an error.',
	};

	fnCallback(customProps);
}



function notFound(requestProps, fnCallback) {
	console.log("ERROR:notFound", requestProps.params, requestProps.query);
	
	var customProps = {
		statusCode: 404,
		metaTitle: 'Not Found!',
		metaDescription: 'The server could not find the requested resource.',
		pageTitle: 'Not Found!',
		description: 'The server could not find the requested resource.',
	};

	fnCallback(customProps);
}