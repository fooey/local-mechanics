'use strict';

var qs = require('querystring');


var globalRequire = require('../lib/globalRequire');
var _ = globalRequire('lodash');
var $ = globalRequire('jQuery');
var page = globalRequire('page');

var sharedRoutes = require('./shared');
var libTemplates = require('../lib/templates');
var templateRenderer = libTemplates(window.templates);




window.wasPrerendered;
var transitionTime = 300;


module.exports = function(rootNode, prerendered) {
	// var rootNode = document.getElementById(rootElement);

	window.wasPrerendered = prerendered;

	console.log('routes', rootNode);

	_.forEach(
		sharedRoutes,
		attachRoute.bind(null, rootNode)
	);
};




function attachRoute(rootNode, route) {
	console.log('attachRoute()', route);
	// var progressBar = globalRequire('progressBar');

	page(route.path, function(context) {
		if (window.wasPrerendered) {
			window.wasPrerendered = false;
			return;
		}
		// progressBar.addTask();



		var $oldContent = ($('.contentWrapper').length)
			? $('.contentWrapper')
			: $('#content').wrap('<div class="contentWrapper"></div>').closest('.contentWrapper');

		// provide immediate user feedback via fadeout
		// progressBar.addTask();
		$oldContent.fadeOut(transitionTime, function(){
			// progressBar.taskComplete();
			$(this).remove()
		});

		var requestProps = {
			query: qs.parse(context.querystring),
			params: context.params,
		};


		var loadStart = Date.now();
		// progressBar.addTask();
		route.getView(templateRenderer, requestProps, function(err, results) {
			// progressBar.taskComplete();
			// console.log('results', results);

			var $newContent = $(results.content).wrap('<div class="contentWrapper"><div id="content" class="container"></div></div>').closest('.contentWrapper').hide();
			var loadComplete = Date.now();
			var loadingTime = (loadComplete - loadStart);

			// try to match the timing of the fadeout, but require least 50% of the transition time
			var transitionRemaining = transitionTime - loadingTime;
			var fadeInTime = Math.max(transitionRemaining, transitionTime / 2);
			// console.log(fadeInTime, transitionRemaining, loadingTime)

			window.scrollTo(0, 0);
			$newContent
				.appendTo('body')
				.fadeIn(fadeInTime, function(){
					// progressBar.taskComplete();
					// progressBar.done();
					
					$(window).trigger('hashchange');
				});

			$('title').text(results.meta.title);
			$('meta[name="description"]').attr('content', results.meta.description);


		});

	});
}



function initRender(route, context, rootNode, fnCallback) {
	console.log('initRender()', route);

	route.render(
		context,
		fnCallback
	);
}

function render(rootNode, fnCallback, results) {
	console.log('render()', results);

	var view = results.initRender.view;
	var props = results.initRender.props;

	// console.log('render client start', arguments);

	React.renderComponent(
		view(props),
		rootNode,
		fnCallback.bind(null, null)
	);
}

function postRender(rootNode, fnCallback, results) {
	console.log('postRender()', results);

	console.log('postRender', arguments);
	var meta = results.initRender.meta;

	console.log('render client complete', meta);
	$('title').html(meta.title);

	window.scrollTo(0, 0);
	$(rootNode).fadeIn(transitionTime);
}
