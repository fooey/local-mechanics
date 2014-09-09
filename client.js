'use strict';


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


	var responsiveTabs = require('./lib/client/responsiveTabs.js');
	
	
	$(window)
		.on('hashchange', function(){console.log('window::hashchange')})
		.on('hashchange', responsiveTabs)
		.trigger('hashchange');



	console.log('App Ready');
});
