'use strict';

var url = require('url');

var globalRequire = require('../globalRequire');
var $ = globalRequire('jquery');
var _ = globalRequire('lodash');
var async = globalRequire('async');

var libCG = require('../citygrid');


var templates = require('../../views/dist');
var libTemplates = require('../templates');
var templateRenderer = libTemplates(templates);


module.exports = function(){

	/*
	*	Module 'Globals'
	*/

	var $cityBrowser = $('#browse.city');


	if($cityBrowser.length) {
		console.log('lib:client:cityBrowser', browseConfig);


		writeMeta('.meta');
		writeOffers('.offers');
		writeSorts('.sorts');
		writePagination('.paging');
		writeRadius('.radius');
		writeRpp('.rpp');


		/*
		*	Behaviors
		*/

	}

	function writeMeta(selector){
		$cityBrowser.find(selector)
			.empty()
			.append($('<div>', {text: 'Results: '+ browseConfig.totalHits}))

	}


	function writeOffers(selector){
		var offerOptions = [false, true];
		offerOptions = _.map(offerOptions, function(val) {
			return {text: val, data: {has_offers: val}};
		});


		$cityBrowser.find(selector)
			.append(_.map(offerOptions, function(props) {
				return $('<li>').append($('<a>', props));
			}))
			.off()
			.on('click', 'a', function(e){
				browseConfig.page = 1;
				browseConfig.callId = null;
				browseConfig.has_offers = $(this).data('has_offers');

				updateResults();
			});
	}


	function writeRadius(selector){
		var radiusOptions = [1,2,3,4,5,10,15,20,30,40,50];
		radiusOptions = _.map(radiusOptions, function(val) {
			return {text: val, data: {radius: val}};
		});


		$cityBrowser.find(selector)
			.append(_.map(radiusOptions, function(props) {
				return $('<li>').append($('<a>', props));
			}))
			.off()
			.on('click', 'a', function(e){
				browseConfig.page = 1;
				browseConfig.callId = null;
				browseConfig.radius = $(this).data('radius');

				updateResults();
			});
	}


	function writeRpp(selector){
		var rppOptions = [5,10,15,20,30,40,50];
		rppOptions = _.map(rppOptions, function(val) {
			return {text: val, data: {rpp: val}};
		});


		$cityBrowser.find(selector)
			.append(_.map(rppOptions, function(props) {
				return $('<li>').append($('<a>', props));
			}))
			.off()
			.on('click', 'a', function(e){
				browseConfig.page = 1;
				browseConfig.rpp = $(this).data('rpp');

				updateResults();
			});
	}


	function writeSorts(selector){
		var sortOptions = 'dist,alpha,highestrated,mostreviewed,topmatches,offers'.split(',');

		sortOptions = _.map(sortOptions, function(val) {
			return {text: val, data: {sort: val}};
		});


		$cityBrowser.find(selector)
			.append(_.map(sortOptions, function(props) {
				return $('<li>').append($('<a>', props));
			}))
			.off()
			.on('click', 'a', function(e){
				browseConfig.page = 1;
				browseConfig.callId = null;
				browseConfig.sort = $(this).data('sort');

				updateResults();
			});
	}

	function writePagination(selector){
		var $pagination = $cityBrowser.find(selector);

		var numPages = Math.ceil(browseConfig.totalHits / browseConfig.rpp);
		var urlBase = url.parse(browseConfig.baseLink);

		var links = [];
		for(var ixPage = 1; ixPage <= numPages; ixPage++){
			var thisUrl = _.clone(urlBase);
			thisUrl.query = _.defaults({page: ixPage}, thisUrl.query);

			if (thisUrl.query.page === 1) {
				delete thisUrl.query.page;
			}

			links.push({
				data: {page: ixPage},
				text: ixPage,
				// href: url.format(thisUrl),
			});
		}

		var pageHtml = templateRenderer('/browse/options/pagination', {
			page: browseConfig.page,
			numPages: numPages,
		});


		$pagination
			.empty()
			.append(pageHtml)
			.off()
			.on('click', 'a', function(e){
				browseConfig.page = $(this).data('page');

				updateResults();
			});

	}



	/*
	*	Private Methods
	*/

	function updateResults(){
		$('#loading').stop().fadeIn();

		var query = []
		_.each(libCG.defaultBrowseOptions, function(defaultVal, key) {
			if(defaultVal !== browseConfig[key]){
				query.push([key, browseConfig[key]]);
			}
		});

		query = _.object(query);

		var newUrl = url.format({pathname: browseConfig.baseLink, query: query});
		history && history.pushState && history.pushState(null, null, newUrl);

		browseConfig.callId && (query.call_id = browseConfig.callId);

		libCG.getPlaces(
			browseConfig.city.avgLatitude,
			browseConfig.city.avgLongitude,
			query,
			function(err, results) {
				var places = (_.isArray(results.locations) && results.locations.length) ? results.locations : [];
				
				var newPlaces = templateRenderer('/browse/places', {
					places: places,
					renderPlace: templateRenderer('/browse/place'),
				});

				browseConfig.totalHits = results.total_hits;
				browseConfig.callId = results.call_id;

				$('#loading').stop().fadeOut();
				$('#places').replaceWith(newPlaces);

				writeMeta('.meta');
				writePagination('.paging');
			}
		);
	}
};
