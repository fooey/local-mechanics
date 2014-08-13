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


module.exports = function(err, options, fnCallback){
	options.progressBar && options.progressBar.addTask();
	var errorHandler = errorMappings[err.message] || errorMappings['unhandled'];

	errorHandler(options, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
};



function getProps(options, props, fnCallback) {
	options.progressBar && options.progressBar.addTask();

	options.progressBar && options.progressBar.addTask();
	var html = options.templates['/errors/generic'](_.defaults({
		pageTitle: props.pageTitle,
		description: props.description,
	}, options.templates.props));
	options.progressBar && options.progressBar.taskComplete();

	options.progressBar && options.progressBar.addTask();
	var props = _.defaults({
		statusCode: props.statusCode,
		meta: {
			title: props.metaTitle,
			description: props.metaDescription,
		},
		content: html,
	}, options.templates.props);
	options.progressBar && options.progressBar.taskComplete();

	fnCallback(null, props);
	options.progressBar && options.progressBar.taskComplete();
}



function unhandled(options, fnCallback) {
	options.progressBar && options.progressBar.addTask();
	console.log("ERROR:unhandled", options.params, options.query);
	
	options.progressBar && options.progressBar.addTask();
	var customProps = {
		statusCode: 500,
		metaTitle: 'Error',
		metaDescription: 'The server has encountered an error.',
		pageTitle: 'Error!',
		description: 'The server has encountered an error.'
	};
	options.progressBar && options.progressBar.taskComplete();

	getProps(options, customProps, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
}



function notFound(options, fnCallback) {
	options.progressBar && options.progressBar.addTask();
	console.log("ERROR:notFound", options.params, options.query);
	
	options.progressBar && options.progressBar.addTask();
	var customProps = {
		statusCode: 404,
		metaTitle: 'Not Found!',
		metaDescription: 'The server could not find the requested resource.',
		pageTitle: 'Not Found!',
		description: 'The server could not find the requested resource.'
	};
	options.progressBar && options.progressBar.taskComplete();

	getProps(options, customProps, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
}