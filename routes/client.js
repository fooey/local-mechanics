'use strict';

var qs = require('querystring');
var page = require('page');


//var /*global*/require = require('../lib//*global*/require');
var _ = require('lodash');
var $ = /*global*/require('jquery');

/*
*	Templates
*/
var templates = require('../views/dist');
console.log('templates!', templates);
var sharedRoutes = require('./shared');
var libTemplates = require('../lib/templates');
var templateRenderer = libTemplates(templates);


var transitionTime = 600;


module.exports = function(rootNode, prerendered) {
	window.wasPrerendered = prerendered;

	_.forEach(
		sharedRoutes,
		attachRoute.bind(null, rootNode)
	);


	$('#loading').hide().removeClass('hidden');


 	page.start({click: true});
};




function attachRoute(rootNode, route) {
	console.log('attachRoute()', route);

	page(route.path, function(context) {
		if (window.wasPrerendered) {
			window.wasPrerendered = false;
			return;
		}



		var $oldContent = ($('.contentWrapper').length)
			? $('.contentWrapper')
			: $('#content').wrap('<div class="contentWrapper"></div>').closest('.contentWrapper');

		$('#loading').velocity('stop').velocity('transition.fadeIn', {duration: transitionTime/2});

		// provide immediate user feedback via fadeout
		$oldContent.velocity('transition.fadeOut', {duration: transitionTime, complete: function(){
			$(this).remove()
		}});

		var requestProps = {
			query: qs.parse(context.querystring),
			params: context.params,
			originalUrl: context.canonicalPath,
		};


		var loadStart = Date.now();
		route.getView(templateRenderer, requestProps, function(err, results) {
			// console.log('requestProps', requestProps);
			// console.log('results', results);

			var $newContent = $($.parseHTML(results.contentHtml)).wrap('<div class="contentWrapper"><div id="content" class="container"></div></div>').closest('.contentWrapper').hide();
			var loadComplete = Date.now();
			var loadingTime = (loadComplete - loadStart);

			// try to match the timing of the fadeout, but require least 50% of the transition time
			var transitionRemaining = transitionTime - loadingTime;
			var fadeInTime = Math.max(transitionRemaining, transitionTime / 2);


			$('#loading').velocity('stop').velocity('transition.fadeOut', {duration: fadeInTime});

			window.scrollTo(0, 0);
			$newContent
				.appendTo('body')
				.velocity('transition.fadeIn', {duration: fadeInTime});


			if (results.exports) {
				_.assign(window, results.exports);
			}
			
			$('title').text(results.meta.title);
			$('meta[name="description"]').attr('content', results.meta.description);

			$(window).trigger('hashchange');



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
