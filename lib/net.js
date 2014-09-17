"use strict";

var _ = require('lodash');

var cache = require('lru-cache')({
	max: 256,
	maxAge: 1000 * 60 * 15,
	stale: true,
	// length: function(s) {return s.toString().length},
	// dispose: function(key,val){console.log('cache diposed', key);}
});


module.exports = {
	getJson: getJson,

	getClient: getClient,
	getServer: getServer,

	parseJson: parseJson,
};



function getJson(requestUrl, headers, fnCallback) {
	// setTimeout(function(){

	// }, 500);
		console.log('getJson', requestUrl, headers);

		var results = cache.get(requestUrl);
		if (results) {
			fnCallback(null, results);
		}
		else {
			var fn = (typeof window === 'undefined')
				? getServerJson
				: getClient;


			fn(requestUrl, {}, function(err, results) {
				if(err) console.log('getJson()', err, requestUrl);
				cache.set(requestUrl, results);
				fnCallback(err, results);
			});
		}
}



function getClient(requestUrl, headers, fnCallback) {
	var $ = require('jquery');

	$.getJSON(requestUrl)
		.done(function(data, textStatus, jqXHR) {
			fnCallback(null, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('XHR ERROR', jqXHR, textStatus, errorThrown);
			fnCallback(errorThrown.toString(), null);
		});
}



function getServerJson(requestUrl, headers, fnCallback) {
	getServer(requestUrl, headers, function(err, data) {
		fnCallback(err, parseJson(data));
	});
}



function getServer(requestUrl, headers, fnCallback) {
	var zlib = require('zlib');
	var request = require('request');

	headers =  _.assign(headers, {
		'accept-encoding': 'gzip,deflate',
	});

	var requestOptions = {
		uri: requestUrl,
		headers: headers,
	};

	var req = request.get(requestOptions);

	req.on('response', function(res) {
		// console.log(requestUrl, res.statusCode);
		var statusCode = res.statusCode.toString();

		if (statusCode === '200') {
			var chunks = [];
			res.on('data', function(chunk) {
				chunks.push(chunk);
			});

			res.on('end', function() {
				var buffer = Buffer.concat(chunks);
				var encoding = res.headers['content-encoding'];
				if (encoding == 'gzip') {
					zlib.gunzip(buffer, function(err, decoded) {
						fnCallback(err, decoded && decoded.toString());
					});
				}
				else if (encoding == 'deflate') {
					zlib.inflate(buffer, function(err, decoded) {
						fnCallback(err, decoded && decoded.toString());
					});
				}
				else {
					fnCallback(null, buffer.toString());
				}
			});
		}
		else {
			fnCallback(new Error(statusCode), null);
		}

	});

	req.on('error', function(err) {
		fnCallback(err, null);
	});
}



function parseJson(data) {
	var results;

	try {
		results = JSON.parse(data);
	}
	catch (e) {}

	return results;
}