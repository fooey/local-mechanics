'use strict';

module.exports = {
	dev: getOptions('dev'),
	prod: getOptions('prod'),
}


function getOptions(mode) {
	var NODE_ENV, CACHE_SIZE;
	if (mode === 'prod') {
		NODE_ENV = 'production';
		CACHE_SIZE = 32;
	}
	else {
		NODE_ENV = 'development';
		CACHE_SIZE = 32;
	}

	return  {
		script: './server.js',
		options: {
			nodeArgs: ['--harmony'],
			ext: 'js,jade',
			ignore: [
				'.git/**',
				'.rebooted',

				'node_modules/**',
				'bower_components/**',

				'gruntfile.js',
				'grunt/**',
				
				// 'public/dist/**',
				// 'client.js',
				// 'lib/client/**',
			],

			delay: 3000,
			env: {
				PORT: '3003',
				NODE_ENV: NODE_ENV,
				CACHE_SIZE: CACHE_SIZE,
			},

			callback: function(nodemon) {
				nodemon.on('start', writeReboot);
				nodemon.on('restart', writeReboot);
			}
		},
	};
}




var rebootFile = process.cwd() + '/.rebooted';
var fs = require('fs');

function writeReboot() {
	var timestamp = Date.now();
	process.nextTick(
		fs.writeFileSync.bind(null, rebootFile, timestamp)
	);
}