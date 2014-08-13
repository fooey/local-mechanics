'use strict';
var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var async = require('async');
var dir = require('node-dir');
var jade = require('jade');


// var srcDir = path.normalize('views/src');

var compileOptions = {
	'pretty': false,
	'self': false,
	'debug': false,
	'compileDebug': true,
};




module.exports = function(srcDir, fnCallback){
	srcDir = path.normalize(srcDir);
	var templates = {};


	dir.files(srcDir, function(err, files) {
		async.map(
			files, 
			compileTemplate.bind(null, srcDir),
			function(err, results) {
				if (err) throw err;

				_.forEach(results, function(t) {
					templates[t.key] = t.fn;
				});
				results = null;

				fnCallback(err, templates);
			}
		);
	});
};




function compileTemplate(srcDir, file, fnCallback) {
	var key = file.replace(srcDir, '').split(path.sep).join('/').replace('.jade', '');

	fnCallback(null, {
		key: key,
		fn: jade.compileFile(file, compileOptions),
	});
}