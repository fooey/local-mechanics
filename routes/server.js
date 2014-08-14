'use strict';


var globalRequire = require('../lib/globalRequire');
var _ = globalRequire('lodash');

var sharedRoutes = require('./shared');


module.exports = function(app, express) {
	
	const cacheTime = 60 * 15; // 15 minutes
	const statusFound = 302;



	/*
	*	system
	*/

	app.get('/robots.txt', require('./server/robots.js').bind(null, app));
	app.get('/favicon.ico', function(req, res){
		res.redirect(301, '/img/car.png');
	});
	// css maps
	app.get('/:remap(public|bower_components)/:path(*)', function(req, res) {
		res.redirect(statusFound, '/' + req.params.path);
	});



	/*
	*	mount shared routes
	*/

	_.forEach(sharedRoutes, function(route) {
		app.get(
			route.path,
			render.bind(null, route.render)
			// route.render.bind(null, renderLayout)
		);
	});





	




	/*
	*	utility methods
	*/

	function dumpRoute(req, res) {
		res.send(req.params);
	}


	function render(routeRenderer, req, res) {
		var renderParams = {
			query: req.query,
			params: req.params,
			templates: req.app.locals.templates,
		};

		routeRenderer(renderParams, renderLayout.bind(null, req, res));
	}


	function renderLayout(req, res, err, props) {
		var statusCode = props.statusCode || 200;

		res.set({
			'Cache-Control': 'public, max-age=' + (cacheTime),
			'Expires': new Date(Date.now() + (cacheTime * 1000)).toUTCString(),
		});

		res.status(statusCode).send(app.locals.templates['/layout'](props));
	}
};
