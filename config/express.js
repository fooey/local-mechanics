'use strict';

module.exports = function(app, express) {
	var isDev = (process.env.NODE_ENV === 'development');
	var isProd = !isDev;


	/*
	*
	* config
	*
	*/

	app.set('env', isDev ? 'development' : 'production');
	app.set('port', process.env.PORT || 3003);
	app.enable('case sensitive');
	app.enable('strict routing');


	/*
	*
	* Middleware
	*
	*/

	const compression = require('compression');
	const errorHandler = require('errorhandler');
	const favicon = require('serve-favicon');
	const morgan = require('morgan');
	const slashes = require('connect-slashes');

	if (isDev) {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
		app.use(morgan('dev'));
	}
	else {
		app.use(errorHandler());
		app.use(morgan('combined'));
	}

	app.use(compression());
	app.use(slashes(false)); // no trailing slashes




	/*
	*
	* Static Resources
	*
	*/
	// app.use(favicon(GLOBAL.paths.getPublic('img/favicon.ico')));


	var staticOptions = {maxAge: 1000 * 60 * 60 * 24 * 7 };// 7 days
	express.static.mime.define({
		'text/plain': [
			'jade',
			'map',
		]
	});
	express.static.mime.define({
		'text/css': [
			'less',
		]
	});

	app.use('/views', express.static(process.cwd() + '/views', staticOptions));
	app.use('/src/js/lib', express.static(process.cwd() + '/lib', staticOptions));
	app.use(express.static(GLOBAL.paths.getPublic(), staticOptions));
	app.use(express.static(GLOBAL.paths.getBower(), staticOptions));



	/*
	*
	* View Config
	*
	*/

	// app.set('views', GLOBAL.paths.getView());
	// app.set('view engine', 'jade');

	// app.locals.pretty = isDev;
	// app.locals.isDev = isDev;
	// app.locals.isProd = isProd;

};

