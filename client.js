'use strict';

// var globalRequire = require('./lib/globalRequire');
// var $ = globalRequire('jquery');




$(function() {
	'use strict';
	console.log('App Started');


	/*
	*	Routing
	*/

	var routes = require('./routes/client.js');

	var rootNode = 'content';
	var prerendered = true;
	routes(rootNode, prerendered);




	/*
	*	Behaviors
	*/
	
	$(window)
		.on('hashchange', require('./lib/client/responsiveTabs.js'))
		.on('hashchange', function(){console.log('on hashchange')})
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
