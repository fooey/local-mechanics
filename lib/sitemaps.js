"use strict";

/*
*
*	Export
*
*/

var me = module.exports = {};



/*
*
*	Dependencies
*
*/

const util = require('util');

const _ = require('lodash');



/*
*
*	Public Methods
*
*/

me.send = function send(res, xmlString) {
	res.set('Content-Type', 'text/xml');
	res.send(xmlString);
};



me.getLastMod = function getLastMod(fnCallback) {
	const fs = require('fs');
	const dbPath = GLOBAL.paths.getData('sqlite.bin');

	fs.stat(dbPath, function(err, stats) {
		fnCallback(err, stats.mtime);
	});
};



me.generateIndex = function urlsToIndex(lastMod, urls) {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			me.urlsToIndexNodes(lastMod, urls),
		'</sitemapindex>'
	].join('\n');
};


me.urlsToIndexNodes = function urlsToIndexNodes(lastMod, urls) {
	//var xmlTemplate = '<sitemap><loc>http://local-dialysis.com/sitemaps/geo.xml?state=virginia</loc><lastmod>2013-04-20T19:41:12+06:00</lastmod></sitemap>';
	var xmlOpen = '<sitemap><loc>';
	var xmlClose = util.format('</loc><lastmod>%s</lastmod></sitemap>\n', lastMod.toISOString());


	return (
		xmlOpen
		+ urls.join(xmlClose + xmlOpen)
		+ xmlClose
	);
};




me.generate = function urlsToIndex(lastMod, urls) {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
			me.urlsToNodes(lastMod, urls),
		'</urlset>'
	].join('\n');
};


me.urlsToNodes = function urlsToIndexNodes(lastMod, urls) {
	var xmlTemplate = '<url><loc>http://local-dialysis.com%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>%s</priority></url>';
	// var xmlOpen = '<url><loc>';
	// var xmlClose = util.format('</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq></url>\n', lastMod.toISOString());

	var xmlNode = _.map(urls, function(url) {
		return util.format(xmlTemplate, url.loc, lastMod.toISOString(), url.priority);
	})

	return xmlNode.join('\n');
};




me.getPlaceUrls = function getPlaceUrls(place) {
	const sections = [
		{priority: '0.8', key: null},
		{priority: '0.7', key: 'statistics'},
		{priority: '0.7', key: 'jobs'},
	];

	var urls = [];

	_.each(sections, function(section) {
		urls.push({
			loc: place.getLink(section.key),
			priority: section.priority
		});
	});

	return urls;
};



me.getProviderUrls = function getProviderUrls(place) {
	const sections = [
		{priority: '1.0', key: null},
		{priority: '0.9', key: 'statistics'},
		{priority: '0.9', key: 'jobs'},
		{priority: '0.6', key: 'hotels'},
		{priority: '0.5', key: 'area'},
	];

	var urls = [];

	_.each(sections, function(section) {
		urls.push({
			loc: place.getLink(section.key),
			priority: section.priority
		});
	});

	return urls;
};