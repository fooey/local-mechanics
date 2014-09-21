'use strict';


//var /*global*/require = require('../lib//*global*/require');
var _ = require('lodash');

var sharedRoutes = require('./shared');

var templates = require('../views/dist/index.js');
var libTemplates = require('../lib/templates');


module.exports = function(app, express) {
	templates.props = {
		isServer: true,
		isClient: false,
		isDev: (app.get('env') === 'development') ? true : false,
		isProd: (app.get('env') !== 'development') ? true : false,
	};
	var templateRenderer = libTemplates(templates);
	
	var cacheTime = 60 * 15; // 15 minutes
	var statusFound = 302;



	/*
	*	system
	*/

	app.get('/robots.txt', require('./server/robots.js').bind(null, app));
	app.get('/favicon.ico', function(req, res){
		res.redirect(301, '/img/car.svg');
	});
	// css maps
	app.get('/:remap(public|bower_components)/:path(*)', function(req, res) {
		res.redirect(statusFound, '/' + req.params.path);
	});

	//localhost:3003/dist/js/D:/inet/heroku/local-mechanics/client.js
	app.get('/:stuff(*):/inet/heroku/local-mechanics:moreStuff(*)', function(req, res) {
		var toUrl = req.originalUrl.replace('/D:/inet/heroku/local-mechanics', '');
		res.redirect(statusFound, toUrl);
	});



	/*
	*	mount shared routes
	*/

	_.forEach(sharedRoutes, function(route) {
		app.get(
			route.path,
			render.bind(null, route.getView)
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
		var requestProps = {
			query: req.query,
			params: req.params,
			originalUrl: req.originalUrl,
			ipAddress: req.ip,
		};

		routeRenderer(
			templateRenderer, 
			requestProps, 
			function(err, props) {
				var statusCode = props.statusCode || 200;

				if (statusCode === 301 || statusCode === 302) {
					res.redirect(statusCode, props.location);
				}
				else {

					res.set({
						'Cache-Control': 'public, max-age=' + (cacheTime),
						'Expires': new Date(Date.now() + (cacheTime * 1000)).toUTCString(),
					});

					res.status(statusCode).send(
						templateRenderer('/layout', props)
					);
					
				}
			}
		);
	}
};
