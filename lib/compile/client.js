'use strict';
var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var async = require('async');
var dir = require('node-dir');
var jade = require('jade');
var mkdirp = require('mkdirp');


// var baseDir = path.normalize('views');
var srcDir = path.normalize('views');
var outDir = path.normalize('public/dist/views/compiled');

var initFile = path.normalize('public/dist/views/compiled/init.js');


var compileOptions = {
	'pretty': false,
	'self': false,
	'debug': false,
	'compileDebug': false,
};

// console.log('srcDir', srcDir);
// console.log('outDir', outDir);

async.auto({
	'mkdir': mkdirp.bind(null, path.dirname(initFile)),
	'init': ['mkdir', writeInit],
	'compile': compileDirectory,
}, function(err) {
	if (err) throw err;
	console.log('jade compilation complete');
});



function writeInit(fnCallback) {
	// console.log('writeInit()');

	fs.writeFile(
		initFile,
		'var templates = {};',
		fnCallback
	);
}


function compileDirectory(fnCallback) {
	dir.files(srcDir, function(err, files) {
		async.each(
			files, 
			compileToDisk,
			fnCallback
		);
	});
}


function compileToDisk(file, fnCallback) {
	// console.log('compileToDisk()');

	var srcFile = path.normalize(file);
	var outFile = srcFile.replace(srcDir, outDir).replace('.jade', '.js');

	var srcPath = path.resolve(srcFile);
	var outPath = path.resolve(outFile);

	// console.log('rel file: ', relFile);
	// console.log('src file: ', srcFile);

	async.auto({
		'mkdir': [mkdirp.bind(null, path.dirname(outPath))],
		'content': [read.bind(null, srcPath)],
		'compiled': ['content', compile.bind(null, srcFile)],
		'write': ['mkdir', 'compiled', write.bind(null, outPath)],
	}, function(err, results) {
		console.log('compiled template: ', outFile);
		fnCallback(err);
	});
}

function read(srcPath, fnCallback) {
	// console.log('read()', srcPath);
	
	fs.readFile(srcPath, fnCallback)
}


function compile(srcFile, fnCallback, results) {
	var relFile = srcFile.replace(srcDir, '').split(path.sep).join('/').replace('.jade', '');
	// console.log('compile()', relFile);
	var thisOptions = _.defaults({
		filename: srcFile
	}, compileOptions);

	// console.log(thisOptions);

	var compiled = jade.compileClient(results.content, thisOptions);
	compiled = 'templates[\'' + relFile + '\'] = ' + compiled;

	fnCallback(null, compiled);
}

function write(outPath, fnCallback, results) {
	// console.log('write()', outPath);

	fs.writeFile(
		outPath,
		results.compiled,
		fnCallback
	);
}
