'use strict';

var globalRequire = require('./lib/globalRequire');
var $ = globalRequire('jquery');
var page = globalRequire('page');

/* Routes */
var routes = require('./routes/client.js');


var responsiveTabs = require('./lib/responsiveTabs.js');

$(function() {
	'use strict';
	console.log('App Started');

	window.templates.props = {
		isServer: false,
		isClient: true,
		// isDev: (app.get('env') === 'development') ? true : false,
		// isProd: (app.get('env') !== 'development') ? true : false,
	};

	/* Routes */
	var routes = require('./routes/client.js');

	var rootNode = 'content';
	var prerendered = true;
	routes(rootNode, prerendered);

	// console.log(templates["/fragments/states"]({numCols: 4, states: []}));
	// console.log(templates["/home"]({}));

	// init page
	page.start({
		click: true,
	});


	$(window)
		.bind('hashchange', function() {
			responsiveTabs();
		})
		.trigger('hashchange');


	console.log('App Ready');
});



// function pushAds() {
// 	$.each($('.adsbygoogle'), function() {
// 		if (adsEnabled) {
// 			(adsbygoogle = window.adsbygoogle || []).push({});
// 		}
// 		else {
// 			$(this).addClass('placeholder');
// 		}
// 	});
// }
