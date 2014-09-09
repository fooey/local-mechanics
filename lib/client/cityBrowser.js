'use strict';

var url = require('url');

//var /*global*/require = require('..//*global*/require');
var $ = /*global*/require('jquery');
var _ = require('lodash');
var async = /*global*/require('async');
var Backbone = /*global*/require('backbone');
console.log('Backbone', Backbone)

var libCG = require('../citygrid');


var templates = require('../../views/dist');
var libTemplates = require('../templates');
var templateRenderer = libTemplates(templates);


var BrowserModel = Backbone.Model.extend({
	defaults: libCG.defaultBrowseOptions,
	initialize: function(){
		console.log('model initialized', this);;
		this.on("change:page", function(model){
			var page = model.get("page");
			console.log("Changed my page to " + page );
		});
	}
});
var BrowserView = Backbone.View.extend({
	initialize: function() {
		console.log('view initialized', this);
	},
	render: function(places) {
		console.log('view rendering', this);

		var html = templateRenderer('/browse/places', {
			places: places,
			renderPlace: templateRenderer('/browse/place'),
		});

		this.$el.html(html);
		return this;
	}

});

console.log('BrowserModel', BrowserModel)
console.log('BrowserView', BrowserView)




/*
*	Module Globals
*/

var $places, $loading, $cityBrowser;

var pager;

var bModel, bView;


module.exports = init;



function init() {
	appState = window.appState;
	$cityBrowser = $('#browse.city');


	if($cityBrowser.length) {
		console.log('lib:client:cityBrowser', appState);

		bModel = new BrowserModel(appState);
		bView = new BrowserView({el: $cityBrowser});

		$places = $('#places');
		$loading = $('#loading');


		pager = require('./pager.js')(bModel);


		writeMeta('.meta');

		// $(window)
		// 	.on('appStateUpdated', onAppStateUpdate)

			
	}

	// writeOffers('.offers');
	// writeSorts('.sorts');
	// writeRadius('.radius');
	// writeRpp('.rpp');
}

function writeMeta(selector){
	$cityBrowser.find(selector)
		.html($('<div>', {text: 'Results: '+ appState.totalHits}))

}

function onAppStateUpdate(){
	console.log('cityBrowser::onAppStateUpdate');

	var query = getQuery(libCG.defaultBrowseOptions);
	prepareUpdate(query);

	libCG.getPlaces(
		appState.city.avgLatitude,
		appState.city.avgLongitude,
		query,
		onPlacesData
	);
}



function prepareUpdate(query) {
	$loading.stop().fadeIn();
	$places.fadeOut();

	var newUrl = url.format({pathname: appState.baseLink, query: query});
	history && history.pushState && history.pushState(null, null, newUrl);

	if (appState.callId) {
		// don't want this in the url
		query.call_id = appState.callId;
	}
}



function onPlacesData(err, results) {
	updateHtml(results);
	updateComplete(results);
}



function updateHtml(results) {
	var places = (_.isArray(results.locations) && results.locations.length) ? results.locations : [];

	bView.render(places);

	// var $update = $(templateRenderer('/browse/places', {
	// 	places: places,
	// 	renderPlace: templateRenderer('/browse/place'),
	// }));

	// $places.replaceWith($update).fadeIn();
	// $places = $update;
}



function updateComplete(results){
	updateState(results);

	$loading.stop().fadeOut();

	// $(window).trigger('hashchange');
}



function updateState(results){
	_.assign(appState, {
		totalHits: (results.total_hits) ? results.total_hits : 0,
		callId: results.call_id
	});
}



function getQuery(defaults){
	var query = [];

	_.each(defaults, function(defaultVal, key) {
		if(defaultVal !== appState[key]){
			query.push([key, appState[key]]);
		}
	});

	return _.object(query);
}


// function writeOffers(selector){
// 	var offerOptions = [false, true];
// 	offerOptions = _.map(offerOptions, function(val) {
// 		return {text: val, data: {has_offers: val}};
// 	});


// 	$cityBrowser.find(selector)
// 		.html(_.map(offerOptions, function(props) {
// 			return $('<li>').append($('<a>', props));
// 		}))
// 		.off()
// 		.on('click', 'a', function(e){
// 			appState.page = 1;
// 			appState.callId = null;
// 			appState.has_offers = $(this).data('has_offers');

// 			updateResults();
// 		});
// }


// function writeRadius(selector){
// 	var radiusOptions = [1,2,3,4,5,10,15,20,30,40,50];
// 	radiusOptions = _.map(radiusOptions, function(val) {
// 		return {text: val, data: {radius: val}};
// 	});


// 	$cityBrowser.find(selector)
// 		.html(_.map(radiusOptions, function(props) {
// 			return $('<li>').append($('<a>', props));
// 		}))
// 		.off()
// 		.on('click', 'a', function(e){
// 			appState.page = 1;
// 			appState.callId = null;
// 			appState.radius = $(this).data('radius');

// 			updateResults();
// 		});
// }


// function writeRpp(selector){
// 	var rppOptions = [5,10,15,20,30,40,50];
// 	rppOptions = _.map(rppOptions, function(val) {
// 		return {text: val, data: {rpp: val}};
// 	});


// 	$cityBrowser.find(selector)
// 		.html(_.map(rppOptions, function(props) {
// 			return $('<li>').append($('<a>', props));
// 		}))
// 		.off()
// 		.on('click', 'a', function(e){
// 			appState.page = 1;
// 			appState.rpp = $(this).data('rpp');

// 			updateResults();
// 		});
// }


// function writeSorts(selector){
// 	var sortOptions = 'dist,alpha,highestrated,mostreviewed,topmatches,offers'.split(',');

// 	sortOptions = _.map(sortOptions, function(val) {
// 		return {text: val, data: {sort: val}};
// 	});


// 	$cityBrowser.find(selector)
// 		.html(_.map(sortOptions, function(props) {
// 			return $('<li>').append($('<a>', props));
// 		}))
// 		.off()
// 		.on('click', 'a', function(e){
// 			appState.page = 1;
// 			appState.callId = null;
// 			appState.sort = $(this).data('sort');

// 			updateResults();
// 		});
// }
