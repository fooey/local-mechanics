
/*
*
*	GLOBAL path helpers
*
*/

GLOBAL.paths = require('./config/paths');



/*
*
* Express
*
*/

const express = require('express');
const app = express();


/*
*
* Configuration
*
*/

require(GLOBAL.paths.getConfig('express'))(app, express);
console.log('App Environment', app.get('env'));

if (app.get('env') === 'development') {
	require('longjohn');

	['log', 'warn'].forEach(function(method) {
		var old = console[method];
		console[method] = function() {
		var stack = (new Error()).stack.split(/\n/);
		// Chrome includes a single "Error" line, FF doesn't.
		if (stack[0].indexOf('Error') === 0) {
			stack = stack.slice(1);
		}
		var args = [].slice.apply(arguments).concat(['\n', stack[1].trim(), '\n']);
		return old.apply(console, args);
		};
	});
}







// app.locals.cache = require('lru-cache')({
// 	max: process.env.CACHE_SIZE,
// 	// length: function (n) { return n * 2 },
// 	// dispose: function (key, n) { n.close() },
// 	maxAge: 1000 * 60 * 60,
// });



/*
*
* Routes
*
*/


// var precompileTemplates = require(GLOBAL.paths.getLib('compile/server.js'));

// precompileTemplates(GLOBAL.paths.getView(), function(err, templates) {

// 	console.log(Date.now(), 'Jade templates pre-compiled: ', Object.keys(templates));

// 	app.locals.templates = templates;
// 	app.locals.templates.props = {
// 		isServer: true,
// 		isClient: false,
// 		isDev: (app.get('env') === 'development') ? true : false,
// 		isProd: (app.get('env') !== 'development') ? true : false,
// 	};
// });


require(GLOBAL.paths.getRoute('server'))(app, express);

console.log(Date.now(), 'Running Node.js ' + process.version + ' with flags "' + process.execArgv.join(' ') + '"');
app.listen(app.get('port'), function() {
	console.log(Date.now(), 'Express server listening on port ' + app.get('port') + ' in mode: ' + process.env.NODE_ENV);
});
