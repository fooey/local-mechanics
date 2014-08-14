(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var globalRequire = require('./lib/globalRequire');
var $ = globalRequire('jquery');
var page = globalRequire('page');

/* Routes */
var routes = require('./routes/client.js');


var responsiveTabs = require('./lib/responsiveTabs.js');

$(function() {
	'use strict';
	console.log('App Started');

	window.templates.props = {
		isServer: false,
		isClient: true,
		// isDev: (app.get('env') === 'development') ? true : false,
		// isProd: (app.get('env') !== 'development') ? true : false,
	};

	/* Routes */
	var routes = require('./routes/client.js');

	var rootNode = 'content';
	var prerendered = true;
	routes(rootNode, prerendered);

	// console.log(templates["/fragments/states"]({numCols: 4, states: []}));
	// console.log(templates["/home"]({}));

	// init page
	page.start({
		click: true,
	});


	$(window)
		.bind('hashchange', function() {
			responsiveTabs();
		})
		.trigger('hashchange');


	console.log('App Ready');
});



// function pushAds() {
// 	$.each($('.adsbygoogle'), function() {
// 		if (adsEnabled) {
// 			(adsbygoogle = window.adsbygoogle || []).push({});
// 		}
// 		else {
// 			$(this).addClass('placeholder');
// 		}
// 	});
// }

},{"./lib/globalRequire":4,"./lib/responsiveTabs.js":7,"./routes/client.js":16}],2:[function(require,module,exports){
'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var net = require('./net');



/*
*	EXPORT
*/

module.exports = {
	getPlaces: getPlaces,
};




/*
*	PUBLIC
*/

function getPlaces(state, city, query, fnCallback) {
	// console.log('cg::getPlaces()', arguments);
	net.getJson(
		getUrlPlaces(state, city, query),
		function(err, data) {
			data.results = data.results || {};
			var places = data.results.locations || [];

			// console.log(data);

			fnCallback(err, places);
		}
	);
}




/*
*	PRIVATE
*/

function getUrl(endpoint, query) {
	query.sort = query.sort || 'alpha';
	query.rpp = query.rpp || '20';

	var requestUrl = url.format({
		protocol: 'http:',
		host: 'cg.api.the-ln.com',
		pathname: endpoint,
		query: query
	});

	return requestUrl;
}



function getUrlPlaces(state, city, query) {
	var endpoint = '/lm/places/' + state + '/' + city;
	return getUrl(endpoint, query);
}
},{"./net":5,"url":14}],3:[function(require,module,exports){
'use strict';


/*
*	DEPENDENCIES
*/

var url = require('url');

var globalRequire = require('./globalRequire');
var _ = globalRequire('lodash');
var async = globalRequire('async');

var net = require('./net');



/*
*	EXPORT
*/

module.exports = {
	getStates: getStates,
	getState: getState,
	getCities: getCities,
	getCity: getCity,
	getZips: getZips,
	getZip: getZip,
};



/*
*	INSTANCE
*/

var INSTANCE = {
	api: {
		protocol: 'http',
		host: 'geo.api.the-ln.com',
	}
}




/*
*	CLASSES
*/

function State(props) {
	this.name = props.stateName;
	this.abbr = props.stateAbbr;
	this.slug = props.stateSlug;

	return this;
}

State.prototype.getLink = function() {
	return '/' + this.slug;
};


function City(props) {
	this.state = new State(props);
	this.name = props.cityName;
	this.slug = props.citySlug;

	return this;
}

City.prototype.getLink = function() {
	return this.state.getLink() + '/' + this.slug;
};


function Zip(props) {
	this.state = new State(props);
	this.city = new City(props);
	this.zip = props.zip;

	// console.log('thiszip', this, props);

	return this;
}

Zip.prototype.getLink = function() {
	return this.city.getLink();
};




/*
*	PUBLIC
*/

function getGeo(requestUrl, objType, fnCallback) {
	async.waterfall([
		getJson.bind(null, requestUrl),
		notFound,
		objectify.bind(null, objType)
	], function(err, results) {
		if (err) console.log('getGeo()', err);
		fnCallback(err, results);
	});
}



function getStates(fnCallback) {
	getState(null, fnCallback);
}

function getState(stateSlug, fnCallback) {
	var requestUrl = getUrlStates(stateSlug);
	getGeo(requestUrl, State, fnCallback);
	// getJson(
	// 	getUrlStates(stateSlug),
	// 	objectify.bind(null, State, notFound.bind(null, fnCallback))
	// );
}



function getCities(stateSlug, fnCallback) {
	getCity(stateSlug, null, fnCallback);
}

function getCity(stateSlug, citySlug, fnCallback) {
	var requestUrl = getUrlCities(stateSlug, citySlug);
	getGeo(requestUrl, City, fnCallback);
	// getJson(
	// 	getUrlCities(stateSlug, citySlug),
	// 	objectify.bind(null, City, notFoundMany.bind(null, fnCallback))
	// );
}





function getZip(zip, fnCallback) {
	getZips(zip, fnCallback);
}

function getZips(partial, fnCallback) {
	var requestUrl = getUrlZips(partial);
	getGeo(requestUrl, Zip, fnCallback);
	// getJson(
	// 	getUrlZips(partial),
	// 	objectify.bind(null, Zip, notFoundMany.bind(null, fnCallback))
	// );
}




/*
*	PRIVATE
*/

function getJson(requestUrl, fnCallback) {
	net.getJson(requestUrl, fnCallback);
}

function notFound(results, fnCallback) {
	var err = (_.isEmpty(results)) ? new Error('404') : null;
	fnCallback(err, results);
}


function objectify(objType, results, fnCallback) {
	// console.log('objectify()');
	if (!_.isArray(results)) {
		results = [results];
	}

	async.map(
		results,
		function(result, cb) {
			cb(null, new objType(result));
		},
		fnCallback
	);
}



function notFoundMany(fnCallback, err, results) {
	// if (!_.isPlainObject(results)) {
	// 	console.log('NotFound', err, results);
	// 	err = 'NotFound';
	// }
	fnCallback(err, results);
}



function getUrl(endpoint) {
	var requestUrl = url.format({
		protocol: INSTANCE.api.protocol,
		host: INSTANCE.api.host,
		pathname: endpoint
	});

	return requestUrl;
}


function getUrlStates(stateSlug) {
	var endpoint = '/states';
	if (stateSlug) {
		endpoint += '/' + stateSlug;
	}
	return getUrl(endpoint);
}


function getUrlCities(stateSlug, citySlug) {
	var endpoint = '/cities';
	if (stateSlug) {
		endpoint += '/' + stateSlug;
		if (citySlug) {
			endpoint += '/' + citySlug;
		}
	}
	return getUrl(endpoint);
}


function getUrlZips(partial) {
	return getUrl(['/zips', partial].join('/'));
}

},{"./globalRequire":4,"./net":5,"url":14}],4:[function(require,module,exports){
'use strict';

module.exports = function globalRequire(name) {
	name = name.toLowerCase();

	if (name === 'async') {
		return isWindowVar('async')
			? window.async
			: require('async');
	}
	else if (name === 'jade') {
		return isWindowVar('jade')
			? window.jade
			: require('jade');
	}
	else if (name === 'jquery' || name === '$') {
		return isWindowVar('jQuery')
			? window.jQuery
			: require('jquery');
	}
	else if (name === 'lodash') {
		return isWindowVar('_')
			? window._
			: require('lodash');
	}
	else if (name === 'page') {
		return isWindowVar('page')
			? window.page
			: require('page');
	}


	// else if (name === 'bootstrap') {
	// 	return (typeof window !== 'undefined' && typeof window.bootstrap !== 'undefined')
	// 		? window.bootstrap
	// 		: require('bootstrap');
	// }
	// else if (name === 'react') {
	// 	return (typeof window !== 'undefined' && typeof window.React !== 'undefined')
	// 		? window.React
	// 		: require('react');
	// }

	function isWindowVar(varName) {
		return typeof window !== 'undefined' && typeof window[varName] !== 'undefined';
	}
};

},{"async":"ANdDVg","jade":"o/907a","lodash":"9TlSmm","page":"hkJvot"}],5:[function(require,module,exports){
(function (Buffer){
"use strict";

var globalRequire = require('./globalRequire');
var _ = globalRequire('lodash');

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



function getJson(requestUrl, fnCallback) {
	// setTimeout(function(){

	// }, 500);

		var results = cache.get(requestUrl);
		if (results) {
			fnCallback(null, results);
		}
		else {
			var fn = (typeof window === 'undefined')
				? getServerJson
				: getClient;


			fn(requestUrl, function(err, results) {
				if(err) console.log('getJson()', err);
				cache.set(requestUrl, results);
				getJson(requestUrl, fnCallback);
			});
		}
}



function getClient(requestUrl, fnCallback) {
	var globalRequire = require('./globalRequire');
	var $ = globalRequire('jquery');

	// var requestOptions = {
	// 	url: requestUrl,
	// 	cache: true,
	// 	// crossDomain: false,
	// 	// jsonpCallback: 'cb',
	// 	// beforeSend: function(jqXHR, settings) {
	// 	// 	console.log('BEFORE SEND', jqXHR, settings);
	// 	// },
	// };
	// console.log('getClient()', requestUrl);
	$.getJSON(requestUrl)
		.done(function(data, textStatus, jqXHR) {
			fnCallback(null, data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log('XHR ERROR', jqXHR, textStatus, errorThrown);
			fnCallback(errorThrown.toString(), null);
		});
}



function getServerJson(requestUrl, fnCallback) {
	getServer(requestUrl, function(err, data) {
		fnCallback(err, parseJson(data));
	});
}



function getServer(requestUrl, fnCallback) {
	var zlib = require('zlib');
	var request = require('request');

	var requestOptions = {
		uri: requestUrl,
		headers: {"accept-encoding" : "gzip,deflate"},
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
}).call(this,require("buffer").Buffer)
},{"./globalRequire":4,"buffer":9,"lru-cache":15,"request":9,"zlib":9}],6:[function(require,module,exports){
'use strict';


var globalRequire = require('./globalRequire');
var $ = globalRequire('jquery');

module.exports = function(){
	var self = this;
	var $container = $('#nav-progress');
	var $bar = $container.find('.progress-bar');


	self.init = function() {
		self.tasksComplete = 0;
		self.numTasks = 0;

		$bar.trigger('init');

		// console.log('progressBar::init()', self.tasksComplete, self.numTasks);
		return self;
	}

	self.done = function() {
 		self.tasksComplete = self.numTasks;

		$bar.trigger('done');
		// console.log('progressBar::done()', self.tasksComplete, self.numTasks);
	}


	self.addTask = function() {
		self.numTasks++;
		$bar.trigger('addTask');
		// console.log('progressBar::addTask()', self.tasksComplete, self.numTasks);
	}

	self.taskComplete = function() {
		self.tasksComplete++;
		$bar.trigger('taskComplete');
		// console.log('progressBar::taskComplete()', self.tasksComplete, self.numTasks);
	}


	self.getCompletion = function() {
		// console.log('getCompletion()', self.tasksComplete, self.numTasks, self.tasksComplete / self.numTasks);
		var completion = self.tasksComplete / self.numTasks;

		completion = (!_.isNaN(completion)) ? completion * 100 : 0;

		return completion;
	}

	self.getCompletionInt = function() {
		return Math.round(self.getCompletion());
	}



	/*
	*	DOM Behavior
	*/

	$bar.on('init', function(){
		// console.log('progressBar::init');

		$container.addClass('notransition');
		$bar.addClass('notransition');

		$bar
			.css({width: 0})
			// .text('')
			.data('pct', 0);

		$container.stop().fadeIn(10, function(){
			$container.removeClass('notransition');
			$bar.removeClass('notransition');
		});
	});

	$bar.on('done', function(){
		// console.log('progressBar::done');

		$bar
			.css({width: '100%'})
			// .text('100%')
			.data('pct', 100);

		setTimeout($container.stop().fadeOut.bind($container, 'fast'), 400);

		$bar.off();
	});


	$bar.on('addTask taskComplete', function(){
		var pct =  self.getCompletionInt(self.pctComplete);
		var curPct = _.parseInt($bar.data('pct'));

		// console.log('progressBar::main trigger', self.tasksComplete, self.numTasks);
		// console.log(pct, curPct);

		// don't allow progress bar to retreat
		pct = Math.max(pct, curPct);

		$bar
			.css({width: pct + '%'})
			// .text(pct + '%')
			.data('pct', pct);
	});


	return self.init();
}
},{"./globalRequire":4}],7:[function(require,module,exports){
'use strict';

var globalRequire = require('./globalRequire');
var $ = globalRequire('jquery');
var async = globalRequire('async');

var responsiveMin = 10;


module.exports = function(){

	/*
	*	Module 'Globals'
	*/

	var $responsiveColTabs = $('ul.responsive-col-tabs');
	var $tabs = $responsiveColTabs.find('li');
	
	var $responsiveCols = $('ul.responsive-cols');
	var $items = $responsiveCols.find('li');
	var $links = $items.find('a');


	if($responsiveCols.length && $responsiveColTabs.length) {

		/*
		*	Init
		*/

		async.series([
			initTabs,
			smartResponsive.bind(null, 'All'),
		]);



		/*
		*	Behaviors
		*/

		$responsiveColTabs.on('click', 'a', function(e){
			e.preventDefault();
			var $tabAnchor = $(this);

			async.series([
				setTab.bind(null, $tabAnchor),
				smartResponsive.bind(null, $tabAnchor.text()),
			]);
		});
	}



	/*
	*	Private Methods
	*/

	function initTabs(fnCallback){
		// default tabs to disabled except the "All" tab
		$tabs.filter(':gt(0)').addClass('disabled');

		// enable tabs for which there is an associated list item
		async.forEach(
			$items,
			function(item, next){
				var initial = $(item).data('initial');
				var tabSelector = '.disabled.tab-' + initial;

				$tabs.filter(tabSelector).removeClass('disabled');
			},
			fnCallback
		);
	}



	function smartResponsive(selectedTab, fnCallback){
		var numVisible = (selectedTab === 'All')
			? $items.length
			: $items.filter('.list-' + selectedTab).length;

		if (numVisible > responsiveMin) {
			$responsiveCols.addClass('responsive-cols');
		}
		else {
			$responsiveCols.removeClass('responsive-cols');
		}


		$responsiveCols.fadeIn(300, fnCallback);
	}



	function setTab($tabAnchor, fnCallback){
		var $tab = $tabAnchor.closest('li');

		$responsiveCols.fadeOut(150, function(){
			var initial = $tabAnchor.text();
			$tab.addClass('active').siblings().removeClass('active');

			if($tab.hasClass('disabled')){
				fnCallback(1);
			}

			if (initial === 'All') {
				$items.show();
			}
			else {
				var selector = '.list-' + initial;

				$items
					.not(selector).hide().end()
					.filter(selector).show().end()
			}


			fnCallback(null);
		});

	}
};





},{"./globalRequire":4}],8:[function(require,module,exports){
'use strict';



/*
*	EXPORT
*/

module.exports = {
	arrayToArrayOfArays: arrayToArrayOfArays,
};




/*
*	PUBLIC
*/

function arrayToArrayOfArays(input, numArrays) {
	var total = input.length;
	var output = [];

	var perArray = Math.ceil(total / numArrays);

	for (var i = 0; i < total; i += perArray) {
		output.push(
			input.slice(i, i + perArray)
		);
	}

	return output;
}

},{}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],13:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":11,"./encode":12}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":10,"querystring":13}],15:[function(require,module,exports){
;(function () { // closure for web browsers

if (typeof module === 'object' && module.exports) {
  module.exports = LRUCache
} else {
  // just set the global for non-node platforms.
  this.LRUCache = LRUCache
}

function hOP (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function naiveLength () { return 1 }

function LRUCache (options) {
  if (!(this instanceof LRUCache))
    return new LRUCache(options)

  if (typeof options === 'number')
    options = { max: options }

  if (!options)
    options = {}

  this._max = options.max
  // Kind of weird to have a default max of Infinity, but oh well.
  if (!this._max || !(typeof this._max === "number") || this._max <= 0 )
    this._max = Infinity

  this._lengthCalculator = options.length || naiveLength
  if (typeof this._lengthCalculator !== "function")
    this._lengthCalculator = naiveLength

  this._allowStale = options.stale || false
  this._maxAge = options.maxAge || null
  this._dispose = options.dispose
  this.reset()
}

// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype, "max",
  { set : function (mL) {
      if (!mL || !(typeof mL === "number") || mL <= 0 ) mL = Infinity
      this._max = mL
      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._max }
  , enumerable : true
  })

// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype, "lengthCalculator",
  { set : function (lC) {
      if (typeof lC !== "function") {
        this._lengthCalculator = naiveLength
        this._length = this._itemCount
        for (var key in this._cache) {
          this._cache[key].length = 1
        }
      } else {
        this._lengthCalculator = lC
        this._length = 0
        for (var key in this._cache) {
          this._cache[key].length = this._lengthCalculator(this._cache[key].value)
          this._length += this._cache[key].length
        }
      }

      if (this._length > this._max) trim(this)
    }
  , get : function () { return this._lengthCalculator }
  , enumerable : true
  })

Object.defineProperty(LRUCache.prototype, "length",
  { get : function () { return this._length }
  , enumerable : true
  })


Object.defineProperty(LRUCache.prototype, "itemCount",
  { get : function () { return this._itemCount }
  , enumerable : true
  })

LRUCache.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  var i = 0;
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    i++
    var hit = this._lruList[k]
    if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
      del(this, hit)
      if (!this._allowStale) hit = undefined
    }
    if (hit) {
      fn.call(thisp, hit.value, hit.key, this)
    }
  }
}

LRUCache.prototype.keys = function () {
  var keys = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    keys[i++] = hit.key
  }
  return keys
}

LRUCache.prototype.values = function () {
  var values = new Array(this._itemCount)
  var i = 0
  for (var k = this._mru - 1; k >= 0 && i < this._itemCount; k--) if (this._lruList[k]) {
    var hit = this._lruList[k]
    values[i++] = hit.value
  }
  return values
}

LRUCache.prototype.reset = function () {
  if (this._dispose && this._cache) {
    for (var k in this._cache) {
      this._dispose(k, this._cache[k].value)
    }
  }

  this._cache = Object.create(null) // hash of items by key
  this._lruList = Object.create(null) // list of items in order of use recency
  this._mru = 0 // most recently used
  this._lru = 0 // least recently used
  this._length = 0 // number of items in the list
  this._itemCount = 0
}

// Provided for debugging/dev purposes only. No promises whatsoever that
// this API stays stable.
LRUCache.prototype.dump = function () {
  return this._cache
}

LRUCache.prototype.dumpLru = function () {
  return this._lruList
}

LRUCache.prototype.set = function (key, value) {
  if (hOP(this._cache, key)) {
    // dispose of the old one before overwriting
    if (this._dispose) this._dispose(key, this._cache[key].value)
    if (this._maxAge) this._cache[key].now = Date.now()
    this._cache[key].value = value
    this.get(key)
    return true
  }

  var len = this._lengthCalculator(value)
  var age = this._maxAge ? Date.now() : 0
  var hit = new Entry(key, value, this._mru++, len, age)

  // oversized objects fall out of cache automatically.
  if (hit.length > this._max) {
    if (this._dispose) this._dispose(key, value)
    return false
  }

  this._length += hit.length
  this._lruList[hit.lu] = this._cache[key] = hit
  this._itemCount ++

  if (this._length > this._max) trim(this)
  return true
}

LRUCache.prototype.has = function (key) {
  if (!hOP(this._cache, key)) return false
  var hit = this._cache[key]
  if (this._maxAge && (Date.now() - hit.now > this._maxAge)) {
    return false
  }
  return true
}

LRUCache.prototype.get = function (key) {
  return get(this, key, true)
}

LRUCache.prototype.peek = function (key) {
  return get(this, key, false)
}

LRUCache.prototype.pop = function () {
  var hit = this._lruList[this._lru]
  del(this, hit)
  return hit || null
}

LRUCache.prototype.del = function (key) {
  del(this, this._cache[key])
}

function get (self, key, doUse) {
  var hit = self._cache[key]
  if (hit) {
    if (self._maxAge && (Date.now() - hit.now > self._maxAge)) {
      del(self, hit)
      if (!self._allowStale) hit = undefined
    } else {
      if (doUse) use(self, hit)
    }
    if (hit) hit = hit.value
  }
  return hit
}

function use (self, hit) {
  shiftLU(self, hit)
  hit.lu = self._mru ++
  self._lruList[hit.lu] = hit
}

function trim (self) {
  while (self._lru < self._mru && self._length > self._max)
    del(self, self._lruList[self._lru])
}

function shiftLU (self, hit) {
  delete self._lruList[ hit.lu ]
  while (self._lru < self._mru && !self._lruList[self._lru]) self._lru ++
}

function del (self, hit) {
  if (hit) {
    if (self._dispose) self._dispose(hit.key, hit.value)
    self._length -= hit.length
    self._itemCount --
    delete self._cache[ hit.key ]
    shiftLU(self, hit)
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, lu, length, now) {
  this.key = key
  this.value = value
  this.lu = lu
  this.length = length
  this.now = now
}

})()

},{}],16:[function(require,module,exports){
'use strict';

var qs = require('querystring');


var globalRequire = require('../lib/globalRequire');
var _ = globalRequire('lodash');
var $ = globalRequire('jQuery');
var page = globalRequire('page');

var sharedRoutes = require('./shared');

var ProgressBar = require('../lib/progressBar.js');



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

	page(route.path, function(context) {
		if (window.wasPrerendered) {
			window.wasPrerendered = false;
			return;
		}
		var progressBar = new ProgressBar();
		progressBar.addTask();



		var $oldContent = ($('.contentWrapper').length)
			? $('.contentWrapper')
			: $('#content').wrap('<div class="contentWrapper"></div>').closest('.contentWrapper');

		// provide immediate user feedback via fadeout
		progressBar.addTask();
		$oldContent.fadeOut(transitionTime, function(){
			progressBar.taskComplete();
			$(this).remove()
		});

		var renderParams = {
			query: qs.parse(context.querystring),
			params: context.params,
			templates: templates,
			progressBar: progressBar,
		};

		var loadStart = Date.now();
		progressBar.addTask();
		route.render(renderParams, function(err, results) {
			progressBar.taskComplete();
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
					progressBar.taskComplete();
					progressBar.done();
					
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

},{"../lib/globalRequire":4,"../lib/progressBar.js":6,"./shared":17,"querystring":13}],17:[function(require,module,exports){
'use strict';

module.exports = [{
	path: '/',
	render: require('./shared/home')
}, {
	path: '/:stateSlug([a-z-]+)',
	render: require('./shared/browse/state')
}, {
	path: '/:stateSlug([a-z-]+)/:citySlug([a-z-]+)',
	render: require('./shared/browse/city')
}, {
	path: '*',
	render: require('./shared/errors').bind(null, new Error(404)),
}];
},{"./shared/browse/city":18,"./shared/browse/state":19,"./shared/errors":20,"./shared/home":21}],18:[function(require,module,exports){
'use strict';

var globalRequire = require('../../../lib/globalRequire');
var _ = globalRequire('lodash');
var async = globalRequire('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroutes = require('../errors');
var progressBar;


module.exports = function(options, fnCallback){
	progressBar = options.progressBar;
	progressBar && progressBar.addTask();
	// console.log('getProps()', arguments);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		state: getState.bind(null, options.params.stateSlug),
		city: getCity.bind(null, options.params.stateSlug, options.params.citySlug),
		places: ['city', 'state', getPlaces.bind(null, options.query)],
		placesCities: ['places', getPlacesCities]
	}, function(err, results) {
		var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		var city = (_.isArray(results.city) && results.city.length) ? results.city[0] : null;
		var places = (_.isArray(results.placesCities) && results.placesCities.length) ? results.placesCities : null;

		var hasResults = (!!state && !!city && !!places && !!places.length);

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroutes(err, options, fnCallback);
		}
		else {
			var pageTitle = city.name + ', ' + state.name + ' Mechanics';
			var description = 'Finding the right mechanic in ' + city.name + ', ' + state.name + ' just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!';

			var metaTitle = pageTitle;
			var metaDescription = description;
			

			var html = options.templates['/browse/city'](_.defaults({
				pageTitle: pageTitle,
				description: description,
				places: places,
				renderPlace: options.templates['/browse/place']
			}, options.templates.props));

			var props = _.defaults({
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				content: html,
			}, options.templates.props);

			progressBar && progressBar.taskComplete();
			fnCallback(null, props);
		}

	});
};


function getState(stateSlug, fnCallback) {
	progressBar && progressBar.addTask();
	libGeo.getState(stateSlug, function(err, results) {
		progressBar && progressBar.taskComplete();
		fnCallback(err, results);
	});
}


function getCity(stateSlug, citySlug, fnCallback) {
	progressBar && progressBar.addTask();
	libGeo.getCity(stateSlug, citySlug, function(err, results) {
		progressBar && progressBar.taskComplete();
		fnCallback(err, results);
	});
}



function getPlaces(query, fnCallback, results) {
	progressBar && progressBar.addTask();

	var city = results.city[0];
	var state = results.state[0];

	libCG.getPlaces(
		state.abbr,
		city.name,
		query,
		function(err, results) {
			progressBar && progressBar.taskComplete();
			fnCallback(err, results);
		}
	);
}



function getPlacesCities(fnCallback, results) {
	progressBar && progressBar.addTask();
	
	var _places = results.places;
	var zips = _.map(_places, function(place) {
		return place.address.postal_code;
	});

	var geoZips = {};

	zips = _.uniq(zips);
	// console.log('browse::getPlacesCities()', zips);

	async.each(
		zips,
		getZip.bind(null, geoZips),
		function(err) {
			geoZips = _.map(_places, function(place) {
				place.geo = geoZips[place.address.postal_code];
				return place;
			});
			// console.log(_places);

			progressBar && progressBar.taskComplete();
			fnCallback(null, _places);
		}
	);
}

function getZip(geoZips, zip, fnCallback) {
	progressBar && progressBar.addTask();
	libGeo.getZip(zip, function(err, result){
		geoZips[zip] = result[0];
		progressBar && progressBar.taskComplete();
		fnCallback();
	})
}
},{"../../../lib/citygrid":2,"../../../lib/geo":3,"../../../lib/globalRequire":4,"../../../lib/util":8,"../errors":20}],19:[function(require,module,exports){
'use strict';

var globalRequire = require('../../../lib/globalRequire');
var _ = globalRequire('lodash');
var async = globalRequire('async');

var libGeo = require('../../../lib/geo');
var libCG = require('../../../lib/citygrid');
var libUtil = require('../../../lib/util');

var errorReroutes = require('../errors');
var progressBar;


module.exports = function(options, fnCallback){
	progressBar = options.progressBar;
	progressBar && progressBar.addTask();
	// console.log('getProps()', arguments);
	// var requestUrl = getRequestUrl(params);

	async.auto({
		state: getState.bind(null, options.params.stateSlug),
		cities: getCities.bind(null, options.params.stateSlug),
	}, function(err, results) {
		var state = (_.isArray(results.state) && results.state.length) ? results.state[0] : null;
		var cities = (_.isArray(results.cities) && results.cities.length) ? results.cities : null;

		var hasResults = (!!state && !!cities && !!cities.length);

		if (err || !hasResults) {
			err = err || new Error(404);
			errorReroutes(err, options, fnCallback);
		}
		else {
			var pageTitle = state.name + ' Mechanics';
			var description = 'Finding the right mechanic in ' + state.name + ' just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!';

			var metaTitle = pageTitle;
			var metaDescription = description;
			

			var citiesHtml = options.templates['/fragments/geo-list'](_.defaults({
				places: cities
			}, options.templates.props));


			var html = options.templates['/browse/state'](_.defaults({
				pageTitle: pageTitle,
				description: description,
				cities: cities,
				citiesHtml: citiesHtml,
			}, options.templates.props));

			var props = _.defaults({
				meta: {
					title: metaTitle,
					description: metaDescription,
				},
				content: html,
			}, options.templates.props);

			progressBar && progressBar.taskComplete();
			fnCallback(null, props);
		}

	});
};


function getState(stateSlug, fnCallback) {
	progressBar && progressBar.addTask();
	libGeo.getState(stateSlug, function(err, results) {
		progressBar && progressBar.taskComplete();
		fnCallback(err, results);
	});
}


function getCities(stateSlug, fnCallback) {
	progressBar && progressBar.addTask();
	libGeo.getCities(stateSlug, function(err, results) {
		progressBar && progressBar.taskComplete();
		fnCallback(err, results);
	});
}
},{"../../../lib/citygrid":2,"../../../lib/geo":3,"../../../lib/globalRequire":4,"../../../lib/util":8,"../errors":20}],20:[function(require,module,exports){
'use strict';
var globalRequire = require('../../../lib/globalRequire');
var _ = globalRequire('lodash');
var jade = globalRequire('jade');


var errorMappings = {
	'unhandled': unhandled,
	'notFound': notFound,

	'404': notFound,
	'500': unhandled,
};


module.exports = function(err, options, fnCallback){
	options.progressBar && options.progressBar.addTask();
	var errorHandler = errorMappings[err.message] || errorMappings['unhandled'];

	errorHandler(options, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
};



function getProps(options, props, fnCallback) {
	options.progressBar && options.progressBar.addTask();

	options.progressBar && options.progressBar.addTask();
	var html = options.templates['/errors/generic'](_.defaults({
		pageTitle: props.pageTitle,
		description: props.description,
	}, options.templates.props));
	options.progressBar && options.progressBar.taskComplete();

	options.progressBar && options.progressBar.addTask();
	var props = _.defaults({
		statusCode: props.statusCode,
		meta: {
			title: props.metaTitle,
			description: props.metaDescription,
		},
		content: html,
	}, options.templates.props);
	options.progressBar && options.progressBar.taskComplete();

	fnCallback(null, props);
	options.progressBar && options.progressBar.taskComplete();
}



function unhandled(options, fnCallback) {
	options.progressBar && options.progressBar.addTask();
	console.log("ERROR:unhandled", options.params, options.query);
	
	options.progressBar && options.progressBar.addTask();
	var customProps = {
		statusCode: 500,
		metaTitle: 'Error',
		metaDescription: 'The server has encountered an error.',
		pageTitle: 'Error!',
		description: 'The server has encountered an error.'
	};
	options.progressBar && options.progressBar.taskComplete();

	getProps(options, customProps, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
}



function notFound(options, fnCallback) {
	options.progressBar && options.progressBar.addTask();
	console.log("ERROR:notFound", options.params, options.query);
	
	options.progressBar && options.progressBar.addTask();
	var customProps = {
		statusCode: 404,
		metaTitle: 'Not Found!',
		metaDescription: 'The server could not find the requested resource.',
		pageTitle: 'Not Found!',
		description: 'The server could not find the requested resource.'
	};
	options.progressBar && options.progressBar.taskComplete();

	getProps(options, customProps, fnCallback);
	options.progressBar && options.progressBar.taskComplete();
}
},{"../../../lib/globalRequire":4}],21:[function(require,module,exports){
'use strict';
var globalRequire = require('../../lib/globalRequire');
var _ = globalRequire('lodash');
var jade = globalRequire('jade');

var libGeo = require('../../lib/geo');
var libUtil = require('../../lib/util');


var whitelist = [
	'Alabama',
	'Alaska',
	'Arizona',
	'Arkansas',
	'California',
	'Colorado',
	'Connecticut',
	'Delaware',
	'District of Columbia',
	'Florida',
	'Georgia',
	'Hawaii',
	'Idaho',
	'Illinois',
	'Indiana',
	'Iowa',
	'Kansas',
	'Kentucky',
	'Louisiana',
	'Maine',
	'Maryland',
	'Massachusetts',
	'Michigan',
	'Minnesota',
	'Mississippi',
	'Missouri',
	'Montana',
	'Nebraska',
	'Nevada',
	'New Hampshire',
	'New Jersey',
	'New Mexico',
	'New York',
	'North Carolina',
	'North Dakota',
	'Ohio',
	'Oklahoma',
	'Oregon',
	'Pennsylvania',
	'Rhode Island',
	'South Carolina',
	'South Dakota',
	'Tennessee',
	'Texas',
	'Utah',
	'Vermont',
	'Virginia',
	'Washington',
	'West Virginia',
	'Wisconsin',
	'Wyoming'
	// 'American Samoa',
	// 'Armed Forces - Americas',
	// 'Armed Forces - Europe/Africa/Canada',
	// 'Armed Forces - Pacific',
	// 'Federated States of Micronesia',
	// 'Guam',
	// 'Marshall Islands',
	// 'Northern Mariana Islands',
	// 'Palau',
	// 'Puerto Rico',
	// 'Virgin Islands',
];



module.exports = function(options, fnCallback){
	options.progressBar && options.progressBar.addTask();

	getStates(function(err, states) {
		options.progressBar && options.progressBar.taskComplete();


		options.progressBar && options.progressBar.addTask();
		var statesHtml = options.templates['/fragments/geo-list'](_.defaults({
			places: states
		}, options.templates.props));
		options.progressBar && options.progressBar.taskComplete();

		options.progressBar && options.progressBar.addTask();
		var html = options.templates['/home'](_.defaults({
			pageTitle: 'Welcome to Local-Mechanics.com!',
			description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			statesHtml: statesHtml,
		}, options.templates.props));
		options.progressBar && options.progressBar.taskComplete();

		var props = _.defaults({
			meta: {
				title: 'Local Mechanics!',
				description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			},
			content: html,
		}, options.templates.props);

		fnCallback(null, props);
	});
};


function getStates(fnCallback) {
	libGeo.getStates(function(err, states) {
		// var _states = [];
		states = _.filter(states, function(state){
			return (_.indexOf(whitelist, state.name) !== -1)
		});

		fnCallback(null, states);
	});
}
},{"../../lib/geo":3,"../../lib/globalRequire":4,"../../lib/util":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxpbmV0XFxoZXJva3VcXGxvY2FsLW1lY2hhbmljc1xcbm9kZV9tb2R1bGVzXFxncnVudC1icm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L2luZXQvaGVyb2t1L2xvY2FsLW1lY2hhbmljcy9jbGllbnQuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3MvbGliL2NpdHlncmlkLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL2xpYi9nZW8uanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3MvbGliL2dsb2JhbFJlcXVpcmUuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3MvbGliL25ldC5qcyIsIkQ6L2luZXQvaGVyb2t1L2xvY2FsLW1lY2hhbmljcy9saWIvcHJvZ3Jlc3NCYXIuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3MvbGliL3Jlc3BvbnNpdmVUYWJzLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL2xpYi91dGlsLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L2xpYi9fZW1wdHkuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3Mvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZGVjb2RlLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvZW5jb2RlLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3Mvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3VybC91cmwuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3Mvbm9kZV9tb2R1bGVzL2xydS1jYWNoZS9saWIvbHJ1LWNhY2hlLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL3JvdXRlcy9jbGllbnQuanMiLCJEOi9pbmV0L2hlcm9rdS9sb2NhbC1tZWNoYW5pY3Mvcm91dGVzL3NoYXJlZC5qcyIsIkQ6L2luZXQvaGVyb2t1L2xvY2FsLW1lY2hhbmljcy9yb3V0ZXMvc2hhcmVkL2Jyb3dzZS9jaXR5LmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL3JvdXRlcy9zaGFyZWQvYnJvd3NlL3N0YXRlLmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL3JvdXRlcy9zaGFyZWQvZXJyb3JzL2luZGV4LmpzIiwiRDovaW5ldC9oZXJva3UvbG9jYWwtbWVjaGFuaWNzL3JvdXRlcy9zaGFyZWQvaG9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9saWIvZ2xvYmFsUmVxdWlyZScpO1xyXG52YXIgJCA9IGdsb2JhbFJlcXVpcmUoJ2pxdWVyeScpO1xyXG52YXIgcGFnZSA9IGdsb2JhbFJlcXVpcmUoJ3BhZ2UnKTtcclxuXHJcbi8qIFJvdXRlcyAqL1xyXG52YXIgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2xpZW50LmpzJyk7XHJcblxyXG5cclxudmFyIHJlc3BvbnNpdmVUYWJzID0gcmVxdWlyZSgnLi9saWIvcmVzcG9uc2l2ZVRhYnMuanMnKTtcclxuXHJcbiQoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cdGNvbnNvbGUubG9nKCdBcHAgU3RhcnRlZCcpO1xyXG5cclxuXHR3aW5kb3cudGVtcGxhdGVzLnByb3BzID0ge1xyXG5cdFx0aXNTZXJ2ZXI6IGZhbHNlLFxyXG5cdFx0aXNDbGllbnQ6IHRydWUsXHJcblx0XHQvLyBpc0RldjogKGFwcC5nZXQoJ2VudicpID09PSAnZGV2ZWxvcG1lbnQnKSA/IHRydWUgOiBmYWxzZSxcclxuXHRcdC8vIGlzUHJvZDogKGFwcC5nZXQoJ2VudicpICE9PSAnZGV2ZWxvcG1lbnQnKSA/IHRydWUgOiBmYWxzZSxcclxuXHR9O1xyXG5cclxuXHQvKiBSb3V0ZXMgKi9cclxuXHR2YXIgcm91dGVzID0gcmVxdWlyZSgnLi9yb3V0ZXMvY2xpZW50LmpzJyk7XHJcblxyXG5cdHZhciByb290Tm9kZSA9ICdjb250ZW50JztcclxuXHR2YXIgcHJlcmVuZGVyZWQgPSB0cnVlO1xyXG5cdHJvdXRlcyhyb290Tm9kZSwgcHJlcmVuZGVyZWQpO1xyXG5cclxuXHQvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZXNbXCIvZnJhZ21lbnRzL3N0YXRlc1wiXSh7bnVtQ29sczogNCwgc3RhdGVzOiBbXX0pKTtcclxuXHQvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZXNbXCIvaG9tZVwiXSh7fSkpO1xyXG5cclxuXHQvLyBpbml0IHBhZ2VcclxuXHRwYWdlLnN0YXJ0KHtcclxuXHRcdGNsaWNrOiB0cnVlLFxyXG5cdH0pO1xyXG5cclxuXHJcblx0JCh3aW5kb3cpXHJcblx0XHQuYmluZCgnaGFzaGNoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXNwb25zaXZlVGFicygpO1xyXG5cdFx0fSlcclxuXHRcdC50cmlnZ2VyKCdoYXNoY2hhbmdlJyk7XHJcblxyXG5cclxuXHRjb25zb2xlLmxvZygnQXBwIFJlYWR5Jyk7XHJcbn0pO1xyXG5cclxuXHJcblxyXG4vLyBmdW5jdGlvbiBwdXNoQWRzKCkge1xyXG4vLyBcdCQuZWFjaCgkKCcuYWRzYnlnb29nbGUnKSwgZnVuY3Rpb24oKSB7XHJcbi8vIFx0XHRpZiAoYWRzRW5hYmxlZCkge1xyXG4vLyBcdFx0XHQoYWRzYnlnb29nbGUgPSB3aW5kb3cuYWRzYnlnb29nbGUgfHwgW10pLnB1c2goe30pO1xyXG4vLyBcdFx0fVxyXG4vLyBcdFx0ZWxzZSB7XHJcbi8vIFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ3BsYWNlaG9sZGVyJyk7XHJcbi8vIFx0XHR9XHJcbi8vIFx0fSk7XHJcbi8vIH1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbi8qXHJcbipcdERFUEVOREVOQ0lFU1xyXG4qL1xyXG5cclxudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xyXG5cclxudmFyIG5ldCA9IHJlcXVpcmUoJy4vbmV0Jyk7XHJcblxyXG5cclxuXHJcbi8qXHJcbipcdEVYUE9SVFxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Z2V0UGxhY2VzOiBnZXRQbGFjZXMsXHJcbn07XHJcblxyXG5cclxuXHJcblxyXG4vKlxyXG4qXHRQVUJMSUNcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGdldFBsYWNlcyhzdGF0ZSwgY2l0eSwgcXVlcnksIGZuQ2FsbGJhY2spIHtcclxuXHQvLyBjb25zb2xlLmxvZygnY2c6OmdldFBsYWNlcygpJywgYXJndW1lbnRzKTtcclxuXHRuZXQuZ2V0SnNvbihcclxuXHRcdGdldFVybFBsYWNlcyhzdGF0ZSwgY2l0eSwgcXVlcnkpLFxyXG5cdFx0ZnVuY3Rpb24oZXJyLCBkYXRhKSB7XHJcblx0XHRcdGRhdGEucmVzdWx0cyA9IGRhdGEucmVzdWx0cyB8fCB7fTtcclxuXHRcdFx0dmFyIHBsYWNlcyA9IGRhdGEucmVzdWx0cy5sb2NhdGlvbnMgfHwgW107XHJcblxyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhkYXRhKTtcclxuXHJcblx0XHRcdGZuQ2FsbGJhY2soZXJyLCBwbGFjZXMpO1xyXG5cdFx0fVxyXG5cdCk7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbipcdFBSSVZBVEVcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGdldFVybChlbmRwb2ludCwgcXVlcnkpIHtcclxuXHRxdWVyeS5zb3J0ID0gcXVlcnkuc29ydCB8fCAnYWxwaGEnO1xyXG5cdHF1ZXJ5LnJwcCA9IHF1ZXJ5LnJwcCB8fCAnMjAnO1xyXG5cclxuXHR2YXIgcmVxdWVzdFVybCA9IHVybC5mb3JtYXQoe1xyXG5cdFx0cHJvdG9jb2w6ICdodHRwOicsXHJcblx0XHRob3N0OiAnY2cuYXBpLnRoZS1sbi5jb20nLFxyXG5cdFx0cGF0aG5hbWU6IGVuZHBvaW50LFxyXG5cdFx0cXVlcnk6IHF1ZXJ5XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiByZXF1ZXN0VXJsO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldFVybFBsYWNlcyhzdGF0ZSwgY2l0eSwgcXVlcnkpIHtcclxuXHR2YXIgZW5kcG9pbnQgPSAnL2xtL3BsYWNlcy8nICsgc3RhdGUgKyAnLycgKyBjaXR5O1xyXG5cdHJldHVybiBnZXRVcmwoZW5kcG9pbnQsIHF1ZXJ5KTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4vKlxyXG4qXHRERVBFTkRFTkNJRVNcclxuKi9cclxuXHJcbnZhciB1cmwgPSByZXF1aXJlKCd1cmwnKTtcclxuXHJcbnZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcbnZhciBhc3luYyA9IGdsb2JhbFJlcXVpcmUoJ2FzeW5jJyk7XHJcblxyXG52YXIgbmV0ID0gcmVxdWlyZSgnLi9uZXQnKTtcclxuXHJcblxyXG5cclxuLypcclxuKlx0RVhQT1JUXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRnZXRTdGF0ZXM6IGdldFN0YXRlcyxcclxuXHRnZXRTdGF0ZTogZ2V0U3RhdGUsXHJcblx0Z2V0Q2l0aWVzOiBnZXRDaXRpZXMsXHJcblx0Z2V0Q2l0eTogZ2V0Q2l0eSxcclxuXHRnZXRaaXBzOiBnZXRaaXBzLFxyXG5cdGdldFppcDogZ2V0WmlwLFxyXG59O1xyXG5cclxuXHJcblxyXG4vKlxyXG4qXHRJTlNUQU5DRVxyXG4qL1xyXG5cclxudmFyIElOU1RBTkNFID0ge1xyXG5cdGFwaToge1xyXG5cdFx0cHJvdG9jb2w6ICdodHRwJyxcclxuXHRcdGhvc3Q6ICdnZW8uYXBpLnRoZS1sbi5jb20nLFxyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuKlx0Q0xBU1NFU1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gU3RhdGUocHJvcHMpIHtcclxuXHR0aGlzLm5hbWUgPSBwcm9wcy5zdGF0ZU5hbWU7XHJcblx0dGhpcy5hYmJyID0gcHJvcHMuc3RhdGVBYmJyO1xyXG5cdHRoaXMuc2x1ZyA9IHByb3BzLnN0YXRlU2x1ZztcclxuXHJcblx0cmV0dXJuIHRoaXM7XHJcbn1cclxuXHJcblN0YXRlLnByb3RvdHlwZS5nZXRMaW5rID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuICcvJyArIHRoaXMuc2x1ZztcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBDaXR5KHByb3BzKSB7XHJcblx0dGhpcy5zdGF0ZSA9IG5ldyBTdGF0ZShwcm9wcyk7XHJcblx0dGhpcy5uYW1lID0gcHJvcHMuY2l0eU5hbWU7XHJcblx0dGhpcy5zbHVnID0gcHJvcHMuY2l0eVNsdWc7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5DaXR5LnByb3RvdHlwZS5nZXRMaW5rID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXMuc3RhdGUuZ2V0TGluaygpICsgJy8nICsgdGhpcy5zbHVnO1xyXG59O1xyXG5cclxuXHJcbmZ1bmN0aW9uIFppcChwcm9wcykge1xyXG5cdHRoaXMuc3RhdGUgPSBuZXcgU3RhdGUocHJvcHMpO1xyXG5cdHRoaXMuY2l0eSA9IG5ldyBDaXR5KHByb3BzKTtcclxuXHR0aGlzLnppcCA9IHByb3BzLnppcDtcclxuXHJcblx0Ly8gY29uc29sZS5sb2coJ3RoaXN6aXAnLCB0aGlzLCBwcm9wcyk7XHJcblxyXG5cdHJldHVybiB0aGlzO1xyXG59XHJcblxyXG5aaXAucHJvdG90eXBlLmdldExpbmsgPSBmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcy5jaXR5LmdldExpbmsoKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbipcdFBVQkxJQ1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gZ2V0R2VvKHJlcXVlc3RVcmwsIG9ialR5cGUsIGZuQ2FsbGJhY2spIHtcclxuXHRhc3luYy53YXRlcmZhbGwoW1xyXG5cdFx0Z2V0SnNvbi5iaW5kKG51bGwsIHJlcXVlc3RVcmwpLFxyXG5cdFx0bm90Rm91bmQsXHJcblx0XHRvYmplY3RpZnkuYmluZChudWxsLCBvYmpUeXBlKVxyXG5cdF0sIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xyXG5cdFx0aWYgKGVycikgY29uc29sZS5sb2coJ2dldEdlbygpJywgZXJyKTtcclxuXHRcdGZuQ2FsbGJhY2soZXJyLCByZXN1bHRzKTtcclxuXHR9KTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRTdGF0ZXMoZm5DYWxsYmFjaykge1xyXG5cdGdldFN0YXRlKG51bGwsIGZuQ2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTdGF0ZShzdGF0ZVNsdWcsIGZuQ2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdFVybCA9IGdldFVybFN0YXRlcyhzdGF0ZVNsdWcpO1xyXG5cdGdldEdlbyhyZXF1ZXN0VXJsLCBTdGF0ZSwgZm5DYWxsYmFjayk7XHJcblx0Ly8gZ2V0SnNvbihcclxuXHQvLyBcdGdldFVybFN0YXRlcyhzdGF0ZVNsdWcpLFxyXG5cdC8vIFx0b2JqZWN0aWZ5LmJpbmQobnVsbCwgU3RhdGUsIG5vdEZvdW5kLmJpbmQobnVsbCwgZm5DYWxsYmFjaykpXHJcblx0Ly8gKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRDaXRpZXMoc3RhdGVTbHVnLCBmbkNhbGxiYWNrKSB7XHJcblx0Z2V0Q2l0eShzdGF0ZVNsdWcsIG51bGwsIGZuQ2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDaXR5KHN0YXRlU2x1ZywgY2l0eVNsdWcsIGZuQ2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdFVybCA9IGdldFVybENpdGllcyhzdGF0ZVNsdWcsIGNpdHlTbHVnKTtcclxuXHRnZXRHZW8ocmVxdWVzdFVybCwgQ2l0eSwgZm5DYWxsYmFjayk7XHJcblx0Ly8gZ2V0SnNvbihcclxuXHQvLyBcdGdldFVybENpdGllcyhzdGF0ZVNsdWcsIGNpdHlTbHVnKSxcclxuXHQvLyBcdG9iamVjdGlmeS5iaW5kKG51bGwsIENpdHksIG5vdEZvdW5kTWFueS5iaW5kKG51bGwsIGZuQ2FsbGJhY2spKVxyXG5cdC8vICk7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRaaXAoemlwLCBmbkNhbGxiYWNrKSB7XHJcblx0Z2V0Wmlwcyh6aXAsIGZuQ2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRaaXBzKHBhcnRpYWwsIGZuQ2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdFVybCA9IGdldFVybFppcHMocGFydGlhbCk7XHJcblx0Z2V0R2VvKHJlcXVlc3RVcmwsIFppcCwgZm5DYWxsYmFjayk7XHJcblx0Ly8gZ2V0SnNvbihcclxuXHQvLyBcdGdldFVybFppcHMocGFydGlhbCksXHJcblx0Ly8gXHRvYmplY3RpZnkuYmluZChudWxsLCBaaXAsIG5vdEZvdW5kTWFueS5iaW5kKG51bGwsIGZuQ2FsbGJhY2spKVxyXG5cdC8vICk7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbipcdFBSSVZBVEVcclxuKi9cclxuXHJcbmZ1bmN0aW9uIGdldEpzb24ocmVxdWVzdFVybCwgZm5DYWxsYmFjaykge1xyXG5cdG5ldC5nZXRKc29uKHJlcXVlc3RVcmwsIGZuQ2FsbGJhY2spO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3RGb3VuZChyZXN1bHRzLCBmbkNhbGxiYWNrKSB7XHJcblx0dmFyIGVyciA9IChfLmlzRW1wdHkocmVzdWx0cykpID8gbmV3IEVycm9yKCc0MDQnKSA6IG51bGw7XHJcblx0Zm5DYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gb2JqZWN0aWZ5KG9ialR5cGUsIHJlc3VsdHMsIGZuQ2FsbGJhY2spIHtcclxuXHQvLyBjb25zb2xlLmxvZygnb2JqZWN0aWZ5KCknKTtcclxuXHRpZiAoIV8uaXNBcnJheShyZXN1bHRzKSkge1xyXG5cdFx0cmVzdWx0cyA9IFtyZXN1bHRzXTtcclxuXHR9XHJcblxyXG5cdGFzeW5jLm1hcChcclxuXHRcdHJlc3VsdHMsXHJcblx0XHRmdW5jdGlvbihyZXN1bHQsIGNiKSB7XHJcblx0XHRcdGNiKG51bGwsIG5ldyBvYmpUeXBlKHJlc3VsdCkpO1xyXG5cdFx0fSxcclxuXHRcdGZuQ2FsbGJhY2tcclxuXHQpO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIG5vdEZvdW5kTWFueShmbkNhbGxiYWNrLCBlcnIsIHJlc3VsdHMpIHtcclxuXHQvLyBpZiAoIV8uaXNQbGFpbk9iamVjdChyZXN1bHRzKSkge1xyXG5cdC8vIFx0Y29uc29sZS5sb2coJ05vdEZvdW5kJywgZXJyLCByZXN1bHRzKTtcclxuXHQvLyBcdGVyciA9ICdOb3RGb3VuZCc7XHJcblx0Ly8gfVxyXG5cdGZuQ2FsbGJhY2soZXJyLCByZXN1bHRzKTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRVcmwoZW5kcG9pbnQpIHtcclxuXHR2YXIgcmVxdWVzdFVybCA9IHVybC5mb3JtYXQoe1xyXG5cdFx0cHJvdG9jb2w6IElOU1RBTkNFLmFwaS5wcm90b2NvbCxcclxuXHRcdGhvc3Q6IElOU1RBTkNFLmFwaS5ob3N0LFxyXG5cdFx0cGF0aG5hbWU6IGVuZHBvaW50XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiByZXF1ZXN0VXJsO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0VXJsU3RhdGVzKHN0YXRlU2x1Zykge1xyXG5cdHZhciBlbmRwb2ludCA9ICcvc3RhdGVzJztcclxuXHRpZiAoc3RhdGVTbHVnKSB7XHJcblx0XHRlbmRwb2ludCArPSAnLycgKyBzdGF0ZVNsdWc7XHJcblx0fVxyXG5cdHJldHVybiBnZXRVcmwoZW5kcG9pbnQpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0VXJsQ2l0aWVzKHN0YXRlU2x1ZywgY2l0eVNsdWcpIHtcclxuXHR2YXIgZW5kcG9pbnQgPSAnL2NpdGllcyc7XHJcblx0aWYgKHN0YXRlU2x1Zykge1xyXG5cdFx0ZW5kcG9pbnQgKz0gJy8nICsgc3RhdGVTbHVnO1xyXG5cdFx0aWYgKGNpdHlTbHVnKSB7XHJcblx0XHRcdGVuZHBvaW50ICs9ICcvJyArIGNpdHlTbHVnO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gZ2V0VXJsKGVuZHBvaW50KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldFVybFppcHMocGFydGlhbCkge1xyXG5cdHJldHVybiBnZXRVcmwoWycvemlwcycsIHBhcnRpYWxdLmpvaW4oJy8nKSk7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnbG9iYWxSZXF1aXJlKG5hbWUpIHtcclxuXHRuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuXHRpZiAobmFtZSA9PT0gJ2FzeW5jJykge1xyXG5cdFx0cmV0dXJuIGlzV2luZG93VmFyKCdhc3luYycpXHJcblx0XHRcdD8gd2luZG93LmFzeW5jXHJcblx0XHRcdDogcmVxdWlyZSgnYXN5bmMnKTtcclxuXHR9XHJcblx0ZWxzZSBpZiAobmFtZSA9PT0gJ2phZGUnKSB7XHJcblx0XHRyZXR1cm4gaXNXaW5kb3dWYXIoJ2phZGUnKVxyXG5cdFx0XHQ/IHdpbmRvdy5qYWRlXHJcblx0XHRcdDogcmVxdWlyZSgnamFkZScpO1xyXG5cdH1cclxuXHRlbHNlIGlmIChuYW1lID09PSAnanF1ZXJ5JyB8fCBuYW1lID09PSAnJCcpIHtcclxuXHRcdHJldHVybiBpc1dpbmRvd1ZhcignalF1ZXJ5JylcclxuXHRcdFx0PyB3aW5kb3cualF1ZXJ5XHJcblx0XHRcdDogcmVxdWlyZSgnanF1ZXJ5Jyk7XHJcblx0fVxyXG5cdGVsc2UgaWYgKG5hbWUgPT09ICdsb2Rhc2gnKSB7XHJcblx0XHRyZXR1cm4gaXNXaW5kb3dWYXIoJ18nKVxyXG5cdFx0XHQ/IHdpbmRvdy5fXHJcblx0XHRcdDogcmVxdWlyZSgnbG9kYXNoJyk7XHJcblx0fVxyXG5cdGVsc2UgaWYgKG5hbWUgPT09ICdwYWdlJykge1xyXG5cdFx0cmV0dXJuIGlzV2luZG93VmFyKCdwYWdlJylcclxuXHRcdFx0PyB3aW5kb3cucGFnZVxyXG5cdFx0XHQ6IHJlcXVpcmUoJ3BhZ2UnKTtcclxuXHR9XHJcblxyXG5cclxuXHQvLyBlbHNlIGlmIChuYW1lID09PSAnYm9vdHN0cmFwJykge1xyXG5cdC8vIFx0cmV0dXJuICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LmJvb3RzdHJhcCAhPT0gJ3VuZGVmaW5lZCcpXHJcblx0Ly8gXHRcdD8gd2luZG93LmJvb3RzdHJhcFxyXG5cdC8vIFx0XHQ6IHJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xyXG5cdC8vIH1cclxuXHQvLyBlbHNlIGlmIChuYW1lID09PSAncmVhY3QnKSB7XHJcblx0Ly8gXHRyZXR1cm4gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuUmVhY3QgIT09ICd1bmRlZmluZWQnKVxyXG5cdC8vIFx0XHQ/IHdpbmRvdy5SZWFjdFxyXG5cdC8vIFx0XHQ6IHJlcXVpcmUoJ3JlYWN0Jyk7XHJcblx0Ly8gfVxyXG5cclxuXHRmdW5jdGlvbiBpc1dpbmRvd1Zhcih2YXJOYW1lKSB7XHJcblx0XHRyZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvd1t2YXJOYW1lXSAhPT0gJ3VuZGVmaW5lZCc7XHJcblx0fVxyXG59O1xyXG4iLCIoZnVuY3Rpb24gKEJ1ZmZlcil7XG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcblxyXG52YXIgY2FjaGUgPSByZXF1aXJlKCdscnUtY2FjaGUnKSh7XHJcblx0bWF4OiAyNTYsXHJcblx0bWF4QWdlOiAxMDAwICogNjAgKiAxNSxcclxuXHRzdGFsZTogdHJ1ZSxcclxuXHQvLyBsZW5ndGg6IGZ1bmN0aW9uKHMpIHtyZXR1cm4gcy50b1N0cmluZygpLmxlbmd0aH0sXHJcblx0Ly8gZGlzcG9zZTogZnVuY3Rpb24oa2V5LHZhbCl7Y29uc29sZS5sb2coJ2NhY2hlIGRpcG9zZWQnLCBrZXkpO31cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Z2V0SnNvbjogZ2V0SnNvbixcclxuXHJcblx0Z2V0Q2xpZW50OiBnZXRDbGllbnQsXHJcblx0Z2V0U2VydmVyOiBnZXRTZXJ2ZXIsXHJcblxyXG5cdHBhcnNlSnNvbjogcGFyc2VKc29uLFxyXG59O1xyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRKc29uKHJlcXVlc3RVcmwsIGZuQ2FsbGJhY2spIHtcclxuXHQvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcblxyXG5cdC8vIH0sIDUwMCk7XHJcblxyXG5cdFx0dmFyIHJlc3VsdHMgPSBjYWNoZS5nZXQocmVxdWVzdFVybCk7XHJcblx0XHRpZiAocmVzdWx0cykge1xyXG5cdFx0XHRmbkNhbGxiYWNrKG51bGwsIHJlc3VsdHMpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdHZhciBmbiA9ICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJylcclxuXHRcdFx0XHQ/IGdldFNlcnZlckpzb25cclxuXHRcdFx0XHQ6IGdldENsaWVudDtcclxuXHJcblxyXG5cdFx0XHRmbihyZXF1ZXN0VXJsLCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcclxuXHRcdFx0XHRpZihlcnIpIGNvbnNvbGUubG9nKCdnZXRKc29uKCknLCBlcnIpO1xyXG5cdFx0XHRcdGNhY2hlLnNldChyZXF1ZXN0VXJsLCByZXN1bHRzKTtcclxuXHRcdFx0XHRnZXRKc29uKHJlcXVlc3RVcmwsIGZuQ2FsbGJhY2spO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRDbGllbnQocmVxdWVzdFVybCwgZm5DYWxsYmFjaykge1xyXG5cdHZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9nbG9iYWxSZXF1aXJlJyk7XHJcblx0dmFyICQgPSBnbG9iYWxSZXF1aXJlKCdqcXVlcnknKTtcclxuXHJcblx0Ly8gdmFyIHJlcXVlc3RPcHRpb25zID0ge1xyXG5cdC8vIFx0dXJsOiByZXF1ZXN0VXJsLFxyXG5cdC8vIFx0Y2FjaGU6IHRydWUsXHJcblx0Ly8gXHQvLyBjcm9zc0RvbWFpbjogZmFsc2UsXHJcblx0Ly8gXHQvLyBqc29ucENhbGxiYWNrOiAnY2InLFxyXG5cdC8vIFx0Ly8gYmVmb3JlU2VuZDogZnVuY3Rpb24oanFYSFIsIHNldHRpbmdzKSB7XHJcblx0Ly8gXHQvLyBcdGNvbnNvbGUubG9nKCdCRUZPUkUgU0VORCcsIGpxWEhSLCBzZXR0aW5ncyk7XHJcblx0Ly8gXHQvLyB9LFxyXG5cdC8vIH07XHJcblx0Ly8gY29uc29sZS5sb2coJ2dldENsaWVudCgpJywgcmVxdWVzdFVybCk7XHJcblx0JC5nZXRKU09OKHJlcXVlc3RVcmwpXHJcblx0XHQuZG9uZShmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xyXG5cdFx0XHRmbkNhbGxiYWNrKG51bGwsIGRhdGEpO1xyXG5cdFx0fSlcclxuXHRcdC5mYWlsKGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnWEhSIEVSUk9SJywganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcclxuXHRcdFx0Zm5DYWxsYmFjayhlcnJvclRocm93bi50b1N0cmluZygpLCBudWxsKTtcclxuXHRcdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldFNlcnZlckpzb24ocmVxdWVzdFVybCwgZm5DYWxsYmFjaykge1xyXG5cdGdldFNlcnZlcihyZXF1ZXN0VXJsLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcclxuXHRcdGZuQ2FsbGJhY2soZXJyLCBwYXJzZUpzb24oZGF0YSkpO1xyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldFNlcnZlcihyZXF1ZXN0VXJsLCBmbkNhbGxiYWNrKSB7XHJcblx0dmFyIHpsaWIgPSByZXF1aXJlKCd6bGliJyk7XHJcblx0dmFyIHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XHJcblxyXG5cdHZhciByZXF1ZXN0T3B0aW9ucyA9IHtcclxuXHRcdHVyaTogcmVxdWVzdFVybCxcclxuXHRcdGhlYWRlcnM6IHtcImFjY2VwdC1lbmNvZGluZ1wiIDogXCJnemlwLGRlZmxhdGVcIn0sXHJcblx0fTtcclxuXHJcblx0dmFyIHJlcSA9IHJlcXVlc3QuZ2V0KHJlcXVlc3RPcHRpb25zKTtcclxuXHJcblx0cmVxLm9uKCdyZXNwb25zZScsIGZ1bmN0aW9uKHJlcykge1xyXG5cdFx0Ly8gY29uc29sZS5sb2cocmVxdWVzdFVybCwgcmVzLnN0YXR1c0NvZGUpO1xyXG5cdFx0dmFyIHN0YXR1c0NvZGUgPSByZXMuc3RhdHVzQ29kZS50b1N0cmluZygpO1xyXG5cclxuXHRcdGlmIChzdGF0dXNDb2RlID09PSAnMjAwJykge1xyXG5cdFx0XHR2YXIgY2h1bmtzID0gW107XHJcblx0XHRcdHJlcy5vbignZGF0YScsIGZ1bmN0aW9uKGNodW5rKSB7XHJcblx0XHRcdFx0Y2h1bmtzLnB1c2goY2h1bmspO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJlcy5vbignZW5kJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKTtcclxuXHRcdFx0XHR2YXIgZW5jb2RpbmcgPSByZXMuaGVhZGVyc1snY29udGVudC1lbmNvZGluZyddO1xyXG5cdFx0XHRcdGlmIChlbmNvZGluZyA9PSAnZ3ppcCcpIHtcclxuXHRcdFx0XHRcdHpsaWIuZ3VuemlwKGJ1ZmZlciwgZnVuY3Rpb24oZXJyLCBkZWNvZGVkKSB7XHJcblx0XHRcdFx0XHRcdGZuQ2FsbGJhY2soZXJyLCBkZWNvZGVkICYmIGRlY29kZWQudG9TdHJpbmcoKSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZiAoZW5jb2RpbmcgPT0gJ2RlZmxhdGUnKSB7XHJcblx0XHRcdFx0XHR6bGliLmluZmxhdGUoYnVmZmVyLCBmdW5jdGlvbihlcnIsIGRlY29kZWQpIHtcclxuXHRcdFx0XHRcdFx0Zm5DYWxsYmFjayhlcnIsIGRlY29kZWQgJiYgZGVjb2RlZC50b1N0cmluZygpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGZuQ2FsbGJhY2sobnVsbCwgYnVmZmVyLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Zm5DYWxsYmFjayhuZXcgRXJyb3Ioc3RhdHVzQ29kZSksIG51bGwpO1xyXG5cdFx0fVxyXG5cclxuXHR9KTtcclxuXHJcblx0cmVxLm9uKCdlcnJvcicsIGZ1bmN0aW9uKGVycikge1xyXG5cdFx0Zm5DYWxsYmFjayhlcnIsIG51bGwpO1xyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHBhcnNlSnNvbihkYXRhKSB7XHJcblx0dmFyIHJlc3VsdHM7XHJcblxyXG5cdHRyeSB7XHJcblx0XHRyZXN1bHRzID0gSlNPTi5wYXJzZShkYXRhKTtcclxuXHR9XHJcblx0Y2F0Y2ggKGUpIHt9XHJcblxyXG5cdHJldHVybiByZXN1bHRzO1xyXG59XG59KS5jYWxsKHRoaXMscmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIpIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbnZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciAkID0gZ2xvYmFsUmVxdWlyZSgnanF1ZXJ5Jyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XHJcblx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdHZhciAkY29udGFpbmVyID0gJCgnI25hdi1wcm9ncmVzcycpO1xyXG5cdHZhciAkYmFyID0gJGNvbnRhaW5lci5maW5kKCcucHJvZ3Jlc3MtYmFyJyk7XHJcblxyXG5cclxuXHRzZWxmLmluaXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHNlbGYudGFza3NDb21wbGV0ZSA9IDA7XHJcblx0XHRzZWxmLm51bVRhc2tzID0gMDtcclxuXHJcblx0XHQkYmFyLnRyaWdnZXIoJ2luaXQnKTtcclxuXHJcblx0XHQvLyBjb25zb2xlLmxvZygncHJvZ3Jlc3NCYXI6OmluaXQoKScsIHNlbGYudGFza3NDb21wbGV0ZSwgc2VsZi5udW1UYXNrcyk7XHJcblx0XHRyZXR1cm4gc2VsZjtcclxuXHR9XHJcblxyXG5cdHNlbGYuZG9uZSA9IGZ1bmN0aW9uKCkge1xyXG4gXHRcdHNlbGYudGFza3NDb21wbGV0ZSA9IHNlbGYubnVtVGFza3M7XHJcblxyXG5cdFx0JGJhci50cmlnZ2VyKCdkb25lJyk7XHJcblx0XHQvLyBjb25zb2xlLmxvZygncHJvZ3Jlc3NCYXI6OmRvbmUoKScsIHNlbGYudGFza3NDb21wbGV0ZSwgc2VsZi5udW1UYXNrcyk7XHJcblx0fVxyXG5cclxuXHJcblx0c2VsZi5hZGRUYXNrID0gZnVuY3Rpb24oKSB7XHJcblx0XHRzZWxmLm51bVRhc2tzKys7XHJcblx0XHQkYmFyLnRyaWdnZXIoJ2FkZFRhc2snKTtcclxuXHRcdC8vIGNvbnNvbGUubG9nKCdwcm9ncmVzc0Jhcjo6YWRkVGFzaygpJywgc2VsZi50YXNrc0NvbXBsZXRlLCBzZWxmLm51bVRhc2tzKTtcclxuXHR9XHJcblxyXG5cdHNlbGYudGFza0NvbXBsZXRlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRzZWxmLnRhc2tzQ29tcGxldGUrKztcclxuXHRcdCRiYXIudHJpZ2dlcigndGFza0NvbXBsZXRlJyk7XHJcblx0XHQvLyBjb25zb2xlLmxvZygncHJvZ3Jlc3NCYXI6OnRhc2tDb21wbGV0ZSgpJywgc2VsZi50YXNrc0NvbXBsZXRlLCBzZWxmLm51bVRhc2tzKTtcclxuXHR9XHJcblxyXG5cclxuXHRzZWxmLmdldENvbXBsZXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdC8vIGNvbnNvbGUubG9nKCdnZXRDb21wbGV0aW9uKCknLCBzZWxmLnRhc2tzQ29tcGxldGUsIHNlbGYubnVtVGFza3MsIHNlbGYudGFza3NDb21wbGV0ZSAvIHNlbGYubnVtVGFza3MpO1xyXG5cdFx0dmFyIGNvbXBsZXRpb24gPSBzZWxmLnRhc2tzQ29tcGxldGUgLyBzZWxmLm51bVRhc2tzO1xyXG5cclxuXHRcdGNvbXBsZXRpb24gPSAoIV8uaXNOYU4oY29tcGxldGlvbikpID8gY29tcGxldGlvbiAqIDEwMCA6IDA7XHJcblxyXG5cdFx0cmV0dXJuIGNvbXBsZXRpb247XHJcblx0fVxyXG5cclxuXHRzZWxmLmdldENvbXBsZXRpb25JbnQgPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHNlbGYuZ2V0Q29tcGxldGlvbigpKTtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0LypcclxuXHQqXHRET00gQmVoYXZpb3JcclxuXHQqL1xyXG5cclxuXHQkYmFyLm9uKCdpbml0JywgZnVuY3Rpb24oKXtcclxuXHRcdC8vIGNvbnNvbGUubG9nKCdwcm9ncmVzc0Jhcjo6aW5pdCcpO1xyXG5cclxuXHRcdCRjb250YWluZXIuYWRkQ2xhc3MoJ25vdHJhbnNpdGlvbicpO1xyXG5cdFx0JGJhci5hZGRDbGFzcygnbm90cmFuc2l0aW9uJyk7XHJcblxyXG5cdFx0JGJhclxyXG5cdFx0XHQuY3NzKHt3aWR0aDogMH0pXHJcblx0XHRcdC8vIC50ZXh0KCcnKVxyXG5cdFx0XHQuZGF0YSgncGN0JywgMCk7XHJcblxyXG5cdFx0JGNvbnRhaW5lci5zdG9wKCkuZmFkZUluKDEwLCBmdW5jdGlvbigpe1xyXG5cdFx0XHQkY29udGFpbmVyLnJlbW92ZUNsYXNzKCdub3RyYW5zaXRpb24nKTtcclxuXHRcdFx0JGJhci5yZW1vdmVDbGFzcygnbm90cmFuc2l0aW9uJyk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxuXHJcblx0JGJhci5vbignZG9uZScsIGZ1bmN0aW9uKCl7XHJcblx0XHQvLyBjb25zb2xlLmxvZygncHJvZ3Jlc3NCYXI6OmRvbmUnKTtcclxuXHJcblx0XHQkYmFyXHJcblx0XHRcdC5jc3Moe3dpZHRoOiAnMTAwJSd9KVxyXG5cdFx0XHQvLyAudGV4dCgnMTAwJScpXHJcblx0XHRcdC5kYXRhKCdwY3QnLCAxMDApO1xyXG5cclxuXHRcdHNldFRpbWVvdXQoJGNvbnRhaW5lci5zdG9wKCkuZmFkZU91dC5iaW5kKCRjb250YWluZXIsICdmYXN0JyksIDQwMCk7XHJcblxyXG5cdFx0JGJhci5vZmYoKTtcclxuXHR9KTtcclxuXHJcblxyXG5cdCRiYXIub24oJ2FkZFRhc2sgdGFza0NvbXBsZXRlJywgZnVuY3Rpb24oKXtcclxuXHRcdHZhciBwY3QgPSAgc2VsZi5nZXRDb21wbGV0aW9uSW50KHNlbGYucGN0Q29tcGxldGUpO1xyXG5cdFx0dmFyIGN1clBjdCA9IF8ucGFyc2VJbnQoJGJhci5kYXRhKCdwY3QnKSk7XHJcblxyXG5cdFx0Ly8gY29uc29sZS5sb2coJ3Byb2dyZXNzQmFyOjptYWluIHRyaWdnZXInLCBzZWxmLnRhc2tzQ29tcGxldGUsIHNlbGYubnVtVGFza3MpO1xyXG5cdFx0Ly8gY29uc29sZS5sb2cocGN0LCBjdXJQY3QpO1xyXG5cclxuXHRcdC8vIGRvbid0IGFsbG93IHByb2dyZXNzIGJhciB0byByZXRyZWF0XHJcblx0XHRwY3QgPSBNYXRoLm1heChwY3QsIGN1clBjdCk7XHJcblxyXG5cdFx0JGJhclxyXG5cdFx0XHQuY3NzKHt3aWR0aDogcGN0ICsgJyUnfSlcclxuXHRcdFx0Ly8gLnRleHQocGN0ICsgJyUnKVxyXG5cdFx0XHQuZGF0YSgncGN0JywgcGN0KTtcclxuXHR9KTtcclxuXHJcblxyXG5cdHJldHVybiBzZWxmLmluaXQoKTtcclxufSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBnbG9iYWxSZXF1aXJlID0gcmVxdWlyZSgnLi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciAkID0gZ2xvYmFsUmVxdWlyZSgnanF1ZXJ5Jyk7XHJcbnZhciBhc3luYyA9IGdsb2JhbFJlcXVpcmUoJ2FzeW5jJyk7XHJcblxyXG52YXIgcmVzcG9uc2l2ZU1pbiA9IDEwO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcclxuXHJcblx0LypcclxuXHQqXHRNb2R1bGUgJ0dsb2JhbHMnXHJcblx0Ki9cclxuXHJcblx0dmFyICRyZXNwb25zaXZlQ29sVGFicyA9ICQoJ3VsLnJlc3BvbnNpdmUtY29sLXRhYnMnKTtcclxuXHR2YXIgJHRhYnMgPSAkcmVzcG9uc2l2ZUNvbFRhYnMuZmluZCgnbGknKTtcclxuXHRcclxuXHR2YXIgJHJlc3BvbnNpdmVDb2xzID0gJCgndWwucmVzcG9uc2l2ZS1jb2xzJyk7XHJcblx0dmFyICRpdGVtcyA9ICRyZXNwb25zaXZlQ29scy5maW5kKCdsaScpO1xyXG5cdHZhciAkbGlua3MgPSAkaXRlbXMuZmluZCgnYScpO1xyXG5cclxuXHJcblx0aWYoJHJlc3BvbnNpdmVDb2xzLmxlbmd0aCAmJiAkcmVzcG9uc2l2ZUNvbFRhYnMubGVuZ3RoKSB7XHJcblxyXG5cdFx0LypcclxuXHRcdCpcdEluaXRcclxuXHRcdCovXHJcblxyXG5cdFx0YXN5bmMuc2VyaWVzKFtcclxuXHRcdFx0aW5pdFRhYnMsXHJcblx0XHRcdHNtYXJ0UmVzcG9uc2l2ZS5iaW5kKG51bGwsICdBbGwnKSxcclxuXHRcdF0pO1xyXG5cclxuXHJcblxyXG5cdFx0LypcclxuXHRcdCpcdEJlaGF2aW9yc1xyXG5cdFx0Ki9cclxuXHJcblx0XHQkcmVzcG9uc2l2ZUNvbFRhYnMub24oJ2NsaWNrJywgJ2EnLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHR2YXIgJHRhYkFuY2hvciA9ICQodGhpcyk7XHJcblxyXG5cdFx0XHRhc3luYy5zZXJpZXMoW1xyXG5cdFx0XHRcdHNldFRhYi5iaW5kKG51bGwsICR0YWJBbmNob3IpLFxyXG5cdFx0XHRcdHNtYXJ0UmVzcG9uc2l2ZS5iaW5kKG51bGwsICR0YWJBbmNob3IudGV4dCgpKSxcclxuXHRcdFx0XSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cclxuXHJcblx0LypcclxuXHQqXHRQcml2YXRlIE1ldGhvZHNcclxuXHQqL1xyXG5cclxuXHRmdW5jdGlvbiBpbml0VGFicyhmbkNhbGxiYWNrKXtcclxuXHRcdC8vIGRlZmF1bHQgdGFicyB0byBkaXNhYmxlZCBleGNlcHQgdGhlIFwiQWxsXCIgdGFiXHJcblx0XHQkdGFicy5maWx0ZXIoJzpndCgwKScpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xyXG5cclxuXHRcdC8vIGVuYWJsZSB0YWJzIGZvciB3aGljaCB0aGVyZSBpcyBhbiBhc3NvY2lhdGVkIGxpc3QgaXRlbVxyXG5cdFx0YXN5bmMuZm9yRWFjaChcclxuXHRcdFx0JGl0ZW1zLFxyXG5cdFx0XHRmdW5jdGlvbihpdGVtLCBuZXh0KXtcclxuXHRcdFx0XHR2YXIgaW5pdGlhbCA9ICQoaXRlbSkuZGF0YSgnaW5pdGlhbCcpO1xyXG5cdFx0XHRcdHZhciB0YWJTZWxlY3RvciA9ICcuZGlzYWJsZWQudGFiLScgKyBpbml0aWFsO1xyXG5cclxuXHRcdFx0XHQkdGFicy5maWx0ZXIodGFiU2VsZWN0b3IpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRmbkNhbGxiYWNrXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblxyXG5cclxuXHRmdW5jdGlvbiBzbWFydFJlc3BvbnNpdmUoc2VsZWN0ZWRUYWIsIGZuQ2FsbGJhY2spe1xyXG5cdFx0dmFyIG51bVZpc2libGUgPSAoc2VsZWN0ZWRUYWIgPT09ICdBbGwnKVxyXG5cdFx0XHQ/ICRpdGVtcy5sZW5ndGhcclxuXHRcdFx0OiAkaXRlbXMuZmlsdGVyKCcubGlzdC0nICsgc2VsZWN0ZWRUYWIpLmxlbmd0aDtcclxuXHJcblx0XHRpZiAobnVtVmlzaWJsZSA+IHJlc3BvbnNpdmVNaW4pIHtcclxuXHRcdFx0JHJlc3BvbnNpdmVDb2xzLmFkZENsYXNzKCdyZXNwb25zaXZlLWNvbHMnKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHQkcmVzcG9uc2l2ZUNvbHMucmVtb3ZlQ2xhc3MoJ3Jlc3BvbnNpdmUtY29scycpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHQkcmVzcG9uc2l2ZUNvbHMuZmFkZUluKDMwMCwgZm5DYWxsYmFjayk7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cdGZ1bmN0aW9uIHNldFRhYigkdGFiQW5jaG9yLCBmbkNhbGxiYWNrKXtcclxuXHRcdHZhciAkdGFiID0gJHRhYkFuY2hvci5jbG9zZXN0KCdsaScpO1xyXG5cclxuXHRcdCRyZXNwb25zaXZlQ29scy5mYWRlT3V0KDE1MCwgZnVuY3Rpb24oKXtcclxuXHRcdFx0dmFyIGluaXRpYWwgPSAkdGFiQW5jaG9yLnRleHQoKTtcclxuXHRcdFx0JHRhYi5hZGRDbGFzcygnYWN0aXZlJykuc2libGluZ3MoKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG5cdFx0XHRpZigkdGFiLmhhc0NsYXNzKCdkaXNhYmxlZCcpKXtcclxuXHRcdFx0XHRmbkNhbGxiYWNrKDEpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoaW5pdGlhbCA9PT0gJ0FsbCcpIHtcclxuXHRcdFx0XHQkaXRlbXMuc2hvdygpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdHZhciBzZWxlY3RvciA9ICcubGlzdC0nICsgaW5pdGlhbDtcclxuXHJcblx0XHRcdFx0JGl0ZW1zXHJcblx0XHRcdFx0XHQubm90KHNlbGVjdG9yKS5oaWRlKCkuZW5kKClcclxuXHRcdFx0XHRcdC5maWx0ZXIoc2VsZWN0b3IpLnNob3coKS5lbmQoKVxyXG5cdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0Zm5DYWxsYmFjayhudWxsKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcbn07XHJcblxyXG5cclxuXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5cclxuXHJcbi8qXHJcbipcdEVYUE9SVFxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0YXJyYXlUb0FycmF5T2ZBcmF5czogYXJyYXlUb0FycmF5T2ZBcmF5cyxcclxufTtcclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbipcdFBVQkxJQ1xyXG4qL1xyXG5cclxuZnVuY3Rpb24gYXJyYXlUb0FycmF5T2ZBcmF5cyhpbnB1dCwgbnVtQXJyYXlzKSB7XHJcblx0dmFyIHRvdGFsID0gaW5wdXQubGVuZ3RoO1xyXG5cdHZhciBvdXRwdXQgPSBbXTtcclxuXHJcblx0dmFyIHBlckFycmF5ID0gTWF0aC5jZWlsKHRvdGFsIC8gbnVtQXJyYXlzKTtcclxuXHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbDsgaSArPSBwZXJBcnJheSkge1xyXG5cdFx0b3V0cHV0LnB1c2goXHJcblx0XHRcdGlucHV0LnNsaWNlKGksIGkgKyBwZXJBcnJheSlcclxuXHRcdCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gb3V0cHV0O1xyXG59XHJcbiIsbnVsbCwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyohIGh0dHA6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjIuNCBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teIC1+XS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9cXHgyRXxcXHUzMDAyfFxcdUZGMEV8XFx1RkY2MS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdGFycmF5W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHRyZXR1cm4gbWFwKHN0cmluZy5zcGxpdChyZWdleFNlcGFyYXRvcnMpLCBmbikuam9pbignLicpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIHRvIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHlcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIHRvIFVuaWNvZGUuIE9ubHkgdGhlXG5cdCAqIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS4gaXQgZG9lc24ndFxuXHQgKiBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNvbnZlcnRlZCB0b1xuXHQgKiBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgUHVueWNvZGUgZG9tYWluIG5hbWUgdG8gY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGRvbWFpbikge1xuXHRcdHJldHVybiBtYXBEb21haW4oZG9tYWluLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSB0byBQdW55Y29kZS4gT25seSB0aGVcblx0ICogbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLiBpdCBkb2Vzbid0XG5cdCAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgdG8gY29udmVydCwgYXMgYSBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZS5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjIuNCcsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHA6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcyBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBwdW55Y29kZSA9IHJlcXVpcmUoJ3B1bnljb2RlJyk7XG5cbmV4cG9ydHMucGFyc2UgPSB1cmxQYXJzZTtcbmV4cG9ydHMucmVzb2x2ZSA9IHVybFJlc29sdmU7XG5leHBvcnRzLnJlc29sdmVPYmplY3QgPSB1cmxSZXNvbHZlT2JqZWN0O1xuZXhwb3J0cy5mb3JtYXQgPSB1cmxGb3JtYXQ7XG5cbmV4cG9ydHMuVXJsID0gVXJsO1xuXG5mdW5jdGlvbiBVcmwoKSB7XG4gIHRoaXMucHJvdG9jb2wgPSBudWxsO1xuICB0aGlzLnNsYXNoZXMgPSBudWxsO1xuICB0aGlzLmF1dGggPSBudWxsO1xuICB0aGlzLmhvc3QgPSBudWxsO1xuICB0aGlzLnBvcnQgPSBudWxsO1xuICB0aGlzLmhvc3RuYW1lID0gbnVsbDtcbiAgdGhpcy5oYXNoID0gbnVsbDtcbiAgdGhpcy5zZWFyY2ggPSBudWxsO1xuICB0aGlzLnF1ZXJ5ID0gbnVsbDtcbiAgdGhpcy5wYXRobmFtZSA9IG51bGw7XG4gIHRoaXMucGF0aCA9IG51bGw7XG4gIHRoaXMuaHJlZiA9IG51bGw7XG59XG5cbi8vIFJlZmVyZW5jZTogUkZDIDM5ODYsIFJGQyAxODA4LCBSRkMgMjM5NlxuXG4vLyBkZWZpbmUgdGhlc2UgaGVyZSBzbyBhdCBsZWFzdCB0aGV5IG9ubHkgaGF2ZSB0byBiZVxuLy8gY29tcGlsZWQgb25jZSBvbiB0aGUgZmlyc3QgbW9kdWxlIGxvYWQuXG52YXIgcHJvdG9jb2xQYXR0ZXJuID0gL14oW2EtejAtOS4rLV0rOikvaSxcbiAgICBwb3J0UGF0dGVybiA9IC86WzAtOV0qJC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bYS16MC05QS1aXy1dezAsNjN9JC8sXG4gICAgaG9zdG5hbWVQYXJ0U3RhcnQgPSAvXihbYS16MC05QS1aXy1dezAsNjN9KSguKikkLyxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBjYW4gYWxsb3cgXCJ1bnNhZmVcIiBhbmQgXCJ1bndpc2VcIiBjaGFycy5cbiAgICB1bnNhZmVQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IG5ldmVyIGhhdmUgYSBob3N0bmFtZS5cbiAgICBob3N0bGVzc1Byb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgYWx3YXlzIGNvbnRhaW4gYSAvLyBiaXQuXG4gICAgc2xhc2hlZFByb3RvY29sID0ge1xuICAgICAgJ2h0dHAnOiB0cnVlLFxuICAgICAgJ2h0dHBzJzogdHJ1ZSxcbiAgICAgICdmdHAnOiB0cnVlLFxuICAgICAgJ2dvcGhlcic6IHRydWUsXG4gICAgICAnZmlsZSc6IHRydWUsXG4gICAgICAnaHR0cDonOiB0cnVlLFxuICAgICAgJ2h0dHBzOic6IHRydWUsXG4gICAgICAnZnRwOic6IHRydWUsXG4gICAgICAnZ29waGVyOic6IHRydWUsXG4gICAgICAnZmlsZTonOiB0cnVlXG4gICAgfSxcbiAgICBxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmZ1bmN0aW9uIHVybFBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKHVybCAmJiBpc09iamVjdCh1cmwpICYmIHVybCBpbnN0YW5jZW9mIFVybCkgcmV0dXJuIHVybDtcblxuICB2YXIgdSA9IG5ldyBVcmw7XG4gIHUucGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCk7XG4gIHJldHVybiB1O1xufVxuXG5VcmwucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24odXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAoIWlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgdmFyIHJlc3QgPSB1cmw7XG5cbiAgLy8gdHJpbSBiZWZvcmUgcHJvY2VlZGluZy5cbiAgLy8gVGhpcyBpcyB0byBzdXBwb3J0IHBhcnNlIHN0dWZmIGxpa2UgXCIgIGh0dHA6Ly9mb28uY29tICBcXG5cIlxuICByZXN0ID0gcmVzdC50cmltKCk7XG5cbiAgdmFyIHByb3RvID0gcHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gIGlmIChwcm90bykge1xuICAgIHByb3RvID0gcHJvdG9bMF07XG4gICAgdmFyIGxvd2VyUHJvdG8gPSBwcm90by50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMucHJvdG9jb2wgPSBsb3dlclByb3RvO1xuICAgIHJlc3QgPSByZXN0LnN1YnN0cihwcm90by5sZW5ndGgpO1xuICB9XG5cbiAgLy8gZmlndXJlIG91dCBpZiBpdCdzIGdvdCBhIGhvc3RcbiAgLy8gdXNlckBzZXJ2ZXIgaXMgKmFsd2F5cyogaW50ZXJwcmV0ZWQgYXMgYSBob3N0bmFtZSwgYW5kIHVybFxuICAvLyByZXNvbHV0aW9uIHdpbGwgdHJlYXQgLy9mb28vYmFyIGFzIGhvc3Q9Zm9vLHBhdGg9YmFyIGJlY2F1c2UgdGhhdCdzXG4gIC8vIGhvdyB0aGUgYnJvd3NlciByZXNvbHZlcyByZWxhdGl2ZSBVUkxzLlxuICBpZiAoc2xhc2hlc0Rlbm90ZUhvc3QgfHwgcHJvdG8gfHwgcmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpIHtcbiAgICB2YXIgc2xhc2hlcyA9IHJlc3Quc3Vic3RyKDAsIDIpID09PSAnLy8nO1xuICAgIGlmIChzbGFzaGVzICYmICEocHJvdG8gJiYgaG9zdGxlc3NQcm90b2NvbFtwcm90b10pKSB7XG4gICAgICByZXN0ID0gcmVzdC5zdWJzdHIoMik7XG4gICAgICB0aGlzLnNsYXNoZXMgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghaG9zdGxlc3NQcm90b2NvbFtwcm90b10gJiZcbiAgICAgIChzbGFzaGVzIHx8IChwcm90byAmJiAhc2xhc2hlZFByb3RvY29sW3Byb3RvXSkpKSB7XG5cbiAgICAvLyB0aGVyZSdzIGEgaG9zdG5hbWUuXG4gICAgLy8gdGhlIGZpcnN0IGluc3RhbmNlIG9mIC8sID8sIDssIG9yICMgZW5kcyB0aGUgaG9zdC5cbiAgICAvL1xuICAgIC8vIElmIHRoZXJlIGlzIGFuIEAgaW4gdGhlIGhvc3RuYW1lLCB0aGVuIG5vbi1ob3N0IGNoYXJzICphcmUqIGFsbG93ZWRcbiAgICAvLyB0byB0aGUgbGVmdCBvZiB0aGUgbGFzdCBAIHNpZ24sIHVubGVzcyBzb21lIGhvc3QtZW5kaW5nIGNoYXJhY3RlclxuICAgIC8vIGNvbWVzICpiZWZvcmUqIHRoZSBALXNpZ24uXG4gICAgLy8gVVJMcyBhcmUgb2Jub3hpb3VzLlxuICAgIC8vXG4gICAgLy8gZXg6XG4gICAgLy8gaHR0cDovL2FAYkBjLyA9PiB1c2VyOmFAYiBob3N0OmNcbiAgICAvLyBodHRwOi8vYUBiP0BjID0+IHVzZXI6YSBob3N0OmMgcGF0aDovP0BjXG5cbiAgICAvLyB2MC4xMiBUT0RPKGlzYWFjcyk6IFRoaXMgaXMgbm90IHF1aXRlIGhvdyBDaHJvbWUgZG9lcyB0aGluZ3MuXG4gICAgLy8gUmV2aWV3IG91ciB0ZXN0IGNhc2UgYWdhaW5zdCBicm93c2VycyBtb3JlIGNvbXByZWhlbnNpdmVseS5cblxuICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIGFueSBob3N0RW5kaW5nQ2hhcnNcbiAgICB2YXIgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaG9zdEVuZGluZ0NoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKGhvc3RFbmRpbmdDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuXG4gICAgLy8gYXQgdGhpcyBwb2ludCwgZWl0aGVyIHdlIGhhdmUgYW4gZXhwbGljaXQgcG9pbnQgd2hlcmUgdGhlXG4gICAgLy8gYXV0aCBwb3J0aW9uIGNhbm5vdCBnbyBwYXN0LCBvciB0aGUgbGFzdCBAIGNoYXIgaXMgdGhlIGRlY2lkZXIuXG4gICAgdmFyIGF1dGgsIGF0U2lnbjtcbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpIHtcbiAgICAgIC8vIGF0U2lnbiBjYW4gYmUgYW55d2hlcmUuXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGF0U2lnbiBtdXN0IGJlIGluIGF1dGggcG9ydGlvbi5cbiAgICAgIC8vIGh0dHA6Ly9hQGIvY0BkID0+IGhvc3Q6YiBhdXRoOmEgcGF0aDovY0BkXG4gICAgICBhdFNpZ24gPSByZXN0Lmxhc3RJbmRleE9mKCdAJywgaG9zdEVuZCk7XG4gICAgfVxuXG4gICAgLy8gTm93IHdlIGhhdmUgYSBwb3J0aW9uIHdoaWNoIGlzIGRlZmluaXRlbHkgdGhlIGF1dGguXG4gICAgLy8gUHVsbCB0aGF0IG9mZi5cbiAgICBpZiAoYXRTaWduICE9PSAtMSkge1xuICAgICAgYXV0aCA9IHJlc3Quc2xpY2UoMCwgYXRTaWduKTtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKGF0U2lnbiArIDEpO1xuICAgICAgdGhpcy5hdXRoID0gZGVjb2RlVVJJQ29tcG9uZW50KGF1dGgpO1xuICAgIH1cblxuICAgIC8vIHRoZSBob3N0IGlzIHRoZSByZW1haW5pbmcgdG8gdGhlIGxlZnQgb2YgdGhlIGZpcnN0IG5vbi1ob3N0IGNoYXJcbiAgICBob3N0RW5kID0gLTE7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub25Ib3N0Q2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBoZWMgPSByZXN0LmluZGV4T2Yobm9uSG9zdENoYXJzW2ldKTtcbiAgICAgIGlmIChoZWMgIT09IC0xICYmIChob3N0RW5kID09PSAtMSB8fCBoZWMgPCBob3N0RW5kKSlcbiAgICAgICAgaG9zdEVuZCA9IGhlYztcbiAgICB9XG4gICAgLy8gaWYgd2Ugc3RpbGwgaGF2ZSBub3QgaGl0IGl0LCB0aGVuIHRoZSBlbnRpcmUgdGhpbmcgaXMgYSBob3N0LlxuICAgIGlmIChob3N0RW5kID09PSAtMSlcbiAgICAgIGhvc3RFbmQgPSByZXN0Lmxlbmd0aDtcblxuICAgIHRoaXMuaG9zdCA9IHJlc3Quc2xpY2UoMCwgaG9zdEVuZCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoaG9zdEVuZCk7XG5cbiAgICAvLyBwdWxsIG91dCBwb3J0LlxuICAgIHRoaXMucGFyc2VIb3N0KCk7XG5cbiAgICAvLyB3ZSd2ZSBpbmRpY2F0ZWQgdGhhdCB0aGVyZSBpcyBhIGhvc3RuYW1lLFxuICAgIC8vIHNvIGV2ZW4gaWYgaXQncyBlbXB0eSwgaXQgaGFzIHRvIGJlIHByZXNlbnQuXG4gICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUgfHwgJyc7XG5cbiAgICAvLyBpZiBob3N0bmFtZSBiZWdpbnMgd2l0aCBbIGFuZCBlbmRzIHdpdGggXVxuICAgIC8vIGFzc3VtZSB0aGF0IGl0J3MgYW4gSVB2NiBhZGRyZXNzLlxuICAgIHZhciBpcHY2SG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lWzBdID09PSAnWycgJiZcbiAgICAgICAgdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aCAtIDFdID09PSAnXSc7XG5cbiAgICAvLyB2YWxpZGF0ZSBhIGxpdHRsZS5cbiAgICBpZiAoIWlwdjZIb3N0bmFtZSkge1xuICAgICAgdmFyIGhvc3RwYXJ0cyA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBob3N0cGFydHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gaG9zdHBhcnRzW2ldO1xuICAgICAgICBpZiAoIXBhcnQpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICB2YXIgbmV3cGFydCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBrID0gcGFydC5sZW5ndGg7IGogPCBrOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChwYXJ0LmNoYXJDb2RlQXQoaikgPiAxMjcpIHtcbiAgICAgICAgICAgICAgLy8gd2UgcmVwbGFjZSBub24tQVNDSUkgY2hhciB3aXRoIGEgdGVtcG9yYXJ5IHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byBtYWtlIHN1cmUgc2l6ZSBvZiBob3N0bmFtZSBpcyBub3RcbiAgICAgICAgICAgICAgLy8gYnJva2VuIGJ5IHJlcGxhY2luZyBub24tQVNDSUkgYnkgbm90aGluZ1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9ICd4JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld3BhcnQgKz0gcGFydFtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgdGVzdCBhZ2FpbiB3aXRoIEFTQ0lJIGNoYXIgb25seVxuICAgICAgICAgIGlmICghbmV3cGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSkge1xuICAgICAgICAgICAgdmFyIHZhbGlkUGFydHMgPSBob3N0cGFydHMuc2xpY2UoMCwgaSk7XG4gICAgICAgICAgICB2YXIgbm90SG9zdCA9IGhvc3RwYXJ0cy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICB2YXIgYml0ID0gcGFydC5tYXRjaChob3N0bmFtZVBhcnRTdGFydCk7XG4gICAgICAgICAgICBpZiAoYml0KSB7XG4gICAgICAgICAgICAgIHZhbGlkUGFydHMucHVzaChiaXRbMV0pO1xuICAgICAgICAgICAgICBub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub3RIb3N0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXN0ID0gJy8nICsgbm90SG9zdC5qb2luKCcuJykgKyByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ob3N0bmFtZSA9IHZhbGlkUGFydHMuam9pbignLicpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaG9zdG5hbWUubGVuZ3RoID4gaG9zdG5hbWVNYXhMZW4pIHtcbiAgICAgIHRoaXMuaG9zdG5hbWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaG9zdG5hbWVzIGFyZSBhbHdheXMgbG93ZXIgY2FzZS5cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIC8vIElETkEgU3VwcG9ydDogUmV0dXJucyBhIHB1bnkgY29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgdGhlIHBhcnQgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhcyBub24gQVNDSUkgY2hhcmFjdGVycy4gSS5lLiBpdCBkb3NlbnQgbWF0dGVyIGlmXG4gICAgICAvLyB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQgYWxyZWFkeSBpcyBpbiBBU0NJSS5cbiAgICAgIHZhciBkb21haW5BcnJheSA9IHRoaXMuaG9zdG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgIHZhciBuZXdPdXQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZG9tYWluQXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHMgPSBkb21haW5BcnJheVtpXTtcbiAgICAgICAgbmV3T3V0LnB1c2gocy5tYXRjaCgvW15BLVphLXowLTlfLV0vKSA/XG4gICAgICAgICAgICAneG4tLScgKyBwdW55Y29kZS5lbmNvZGUocykgOiBzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaG9zdG5hbWUgPSBuZXdPdXQuam9pbignLicpO1xuICAgIH1cblxuICAgIHZhciBwID0gdGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyc7XG4gICAgdmFyIGggPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuICAgIHRoaXMuaG9zdCA9IGggKyBwO1xuICAgIHRoaXMuaHJlZiArPSB0aGlzLmhvc3Q7XG5cbiAgICAvLyBzdHJpcCBbIGFuZCBdIGZyb20gdGhlIGhvc3RuYW1lXG4gICAgLy8gdGhlIGhvc3QgZmllbGQgc3RpbGwgcmV0YWlucyB0aGVtLCB0aG91Z2hcbiAgICBpZiAoaXB2Nkhvc3RuYW1lKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS5zdWJzdHIoMSwgdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIGlmIChyZXN0WzBdICE9PSAnLycpIHtcbiAgICAgICAgcmVzdCA9ICcvJyArIHJlc3Q7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IHJlc3QgaXMgc2V0IHRvIHRoZSBwb3N0LWhvc3Qgc3R1ZmYuXG4gIC8vIGNob3Agb2ZmIGFueSBkZWxpbSBjaGFycy5cbiAgaWYgKCF1bnNhZmVQcm90b2NvbFtsb3dlclByb3RvXSkge1xuXG4gICAgLy8gRmlyc3QsIG1ha2UgMTAwJSBzdXJlIHRoYXQgYW55IFwiYXV0b0VzY2FwZVwiIGNoYXJzIGdldFxuICAgIC8vIGVzY2FwZWQsIGV2ZW4gaWYgZW5jb2RlVVJJQ29tcG9uZW50IGRvZXNuJ3QgdGhpbmsgdGhleVxuICAgIC8vIG5lZWQgdG8gYmUuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdXRvRXNjYXBlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGFlID0gYXV0b0VzY2FwZVtpXTtcbiAgICAgIHZhciBlc2MgPSBlbmNvZGVVUklDb21wb25lbnQoYWUpO1xuICAgICAgaWYgKGVzYyA9PT0gYWUpIHtcbiAgICAgICAgZXNjID0gZXNjYXBlKGFlKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSByZXN0LnNwbGl0KGFlKS5qb2luKGVzYyk7XG4gICAgfVxuICB9XG5cblxuICAvLyBjaG9wIG9mZiBmcm9tIHRoZSB0YWlsIGZpcnN0LlxuICB2YXIgaGFzaCA9IHJlc3QuaW5kZXhPZignIycpO1xuICBpZiAoaGFzaCAhPT0gLTEpIHtcbiAgICAvLyBnb3QgYSBmcmFnbWVudCBzdHJpbmcuXG4gICAgdGhpcy5oYXNoID0gcmVzdC5zdWJzdHIoaGFzaCk7XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgaGFzaCk7XG4gIH1cbiAgdmFyIHFtID0gcmVzdC5pbmRleE9mKCc/Jyk7XG4gIGlmIChxbSAhPT0gLTEpIHtcbiAgICB0aGlzLnNlYXJjaCA9IHJlc3Quc3Vic3RyKHFtKTtcbiAgICB0aGlzLnF1ZXJ5ID0gcmVzdC5zdWJzdHIocW0gKyAxKTtcbiAgICBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO1xuICAgIH1cbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBxbSk7XG4gIH0gZWxzZSBpZiAocGFyc2VRdWVyeVN0cmluZykge1xuICAgIC8vIG5vIHF1ZXJ5IHN0cmluZywgYnV0IHBhcnNlUXVlcnlTdHJpbmcgc3RpbGwgcmVxdWVzdGVkXG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgICB0aGlzLnF1ZXJ5ID0ge307XG4gIH1cbiAgaWYgKHJlc3QpIHRoaXMucGF0aG5hbWUgPSByZXN0O1xuICBpZiAoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dICYmXG4gICAgICB0aGlzLmhvc3RuYW1lICYmICF0aGlzLnBhdGhuYW1lKSB7XG4gICAgdGhpcy5wYXRobmFtZSA9ICcvJztcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgaWYgKHRoaXMucGF0aG5hbWUgfHwgdGhpcy5zZWFyY2gpIHtcbiAgICB2YXIgcCA9IHRoaXMucGF0aG5hbWUgfHwgJyc7XG4gICAgdmFyIHMgPSB0aGlzLnNlYXJjaCB8fCAnJztcbiAgICB0aGlzLnBhdGggPSBwICsgcztcbiAgfVxuXG4gIC8vIGZpbmFsbHksIHJlY29uc3RydWN0IHRoZSBocmVmIGJhc2VkIG9uIHdoYXQgaGFzIGJlZW4gdmFsaWRhdGVkLlxuICB0aGlzLmhyZWYgPSB0aGlzLmZvcm1hdCgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGZvcm1hdCBhIHBhcnNlZCBvYmplY3QgaW50byBhIHVybCBzdHJpbmdcbmZ1bmN0aW9uIHVybEZvcm1hdChvYmopIHtcbiAgLy8gZW5zdXJlIGl0J3MgYW4gb2JqZWN0LCBhbmQgbm90IGEgc3RyaW5nIHVybC5cbiAgLy8gSWYgaXQncyBhbiBvYmosIHRoaXMgaXMgYSBuby1vcC5cbiAgLy8gdGhpcyB3YXksIHlvdSBjYW4gY2FsbCB1cmxfZm9ybWF0KCkgb24gc3RyaW5nc1xuICAvLyB0byBjbGVhbiB1cCBwb3RlbnRpYWxseSB3b25reSB1cmxzLlxuICBpZiAoaXNTdHJpbmcob2JqKSkgb2JqID0gdXJsUGFyc2Uob2JqKTtcbiAgaWYgKCEob2JqIGluc3RhbmNlb2YgVXJsKSkgcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtcbiAgcmV0dXJuIG9iai5mb3JtYXQoKTtcbn1cblxuVXJsLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF1dGggPSB0aGlzLmF1dGggfHwgJyc7XG4gIGlmIChhdXRoKSB7XG4gICAgYXV0aCA9IGVuY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICBhdXRoID0gYXV0aC5yZXBsYWNlKC8lM0EvaSwgJzonKTtcbiAgICBhdXRoICs9ICdAJztcbiAgfVxuXG4gIHZhciBwcm90b2NvbCA9IHRoaXMucHJvdG9jb2wgfHwgJycsXG4gICAgICBwYXRobmFtZSA9IHRoaXMucGF0aG5hbWUgfHwgJycsXG4gICAgICBoYXNoID0gdGhpcy5oYXNoIHx8ICcnLFxuICAgICAgaG9zdCA9IGZhbHNlLFxuICAgICAgcXVlcnkgPSAnJztcblxuICBpZiAodGhpcy5ob3N0KSB7XG4gICAgaG9zdCA9IGF1dGggKyB0aGlzLmhvc3Q7XG4gIH0gZWxzZSBpZiAodGhpcy5ob3N0bmFtZSkge1xuICAgIGhvc3QgPSBhdXRoICsgKHRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpID09PSAtMSA/XG4gICAgICAgIHRoaXMuaG9zdG5hbWUgOlxuICAgICAgICAnWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nKTtcbiAgICBpZiAodGhpcy5wb3J0KSB7XG4gICAgICBob3N0ICs9ICc6JyArIHRoaXMucG9ydDtcbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5xdWVyeSAmJlxuICAgICAgaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKGlzU3RyaW5nKHJlbGF0aXZlKSkge1xuICAgIHZhciByZWwgPSBuZXcgVXJsKCk7XG4gICAgcmVsLnBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgcmVsYXRpdmUgPSByZWw7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gbmV3IFVybCgpO1xuICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICByZXN1bHRba10gPSB0aGlzW2tdO1xuICB9LCB0aGlzKTtcblxuICAvLyBoYXNoIGlzIGFsd2F5cyBvdmVycmlkZGVuLCBubyBtYXR0ZXIgd2hhdC5cbiAgLy8gZXZlbiBocmVmPVwiXCIgd2lsbCByZW1vdmUgaXQuXG4gIHJlc3VsdC5oYXNoID0gcmVsYXRpdmUuaGFzaDtcblxuICAvLyBpZiB0aGUgcmVsYXRpdmUgdXJsIGlzIGVtcHR5LCB0aGVuIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvIGhlcmUuXG4gIGlmIChyZWxhdGl2ZS5ocmVmID09PSAnJykge1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBocmVmcyBsaWtlIC8vZm9vL2JhciBhbHdheXMgY3V0IHRvIHRoZSBwcm90b2NvbC5cbiAgaWYgKHJlbGF0aXZlLnNsYXNoZXMgJiYgIXJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgLy8gdGFrZSBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgcHJvdG9jb2wgZnJvbSByZWxhdGl2ZVxuICAgIE9iamVjdC5rZXlzKHJlbGF0aXZlKS5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICAgIGlmIChrICE9PSAncHJvdG9jb2wnKVxuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICB9KTtcblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZWxhdGl2ZSkuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfSk7XG4gICAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb3RvY29sID0gcmVsYXRpdmUucHJvdG9jb2w7XG4gICAgaWYgKCFyZWxhdGl2ZS5ob3N0ICYmICFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgdmFyIHJlbFBhdGggPSAocmVsYXRpdmUucGF0aG5hbWUgfHwgJycpLnNwbGl0KCcvJyk7XG4gICAgICB3aGlsZSAocmVsUGF0aC5sZW5ndGggJiYgIShyZWxhdGl2ZS5ob3N0ID0gcmVsUGF0aC5zaGlmdCgpKSk7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3QpIHJlbGF0aXZlLmhvc3QgPSAnJztcbiAgICAgIGlmICghcmVsYXRpdmUuaG9zdG5hbWUpIHJlbGF0aXZlLmhvc3RuYW1lID0gJyc7XG4gICAgICBpZiAocmVsUGF0aFswXSAhPT0gJycpIHJlbFBhdGgudW5zaGlmdCgnJyk7XG4gICAgICBpZiAocmVsUGF0aC5sZW5ndGggPCAyKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgcmVzdWx0LnBhdGhuYW1lID0gcmVsUGF0aC5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbGF0aXZlLnBhdGhuYW1lO1xuICAgIH1cbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICAgIHJlc3VsdC5ob3N0ID0gcmVsYXRpdmUuaG9zdCB8fCAnJztcbiAgICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGg7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdDtcbiAgICByZXN1bHQucG9ydCA9IHJlbGF0aXZlLnBvcnQ7XG4gICAgLy8gdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnBhdGhuYW1lIHx8IHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHZhciBwID0gcmVzdWx0LnBhdGhuYW1lIHx8ICcnO1xuICAgICAgdmFyIHMgPSByZXN1bHQuc2VhcmNoIHx8ICcnO1xuICAgICAgcmVzdWx0LnBhdGggPSBwICsgcztcbiAgICB9XG4gICAgcmVzdWx0LnNsYXNoZXMgPSByZXN1bHQuc2xhc2hlcyB8fCByZWxhdGl2ZS5zbGFzaGVzO1xuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgaXNTb3VyY2VBYnMgPSAocmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyksXG4gICAgICBpc1JlbEFicyA9IChcbiAgICAgICAgICByZWxhdGl2ZS5ob3N0IHx8XG4gICAgICAgICAgcmVsYXRpdmUucGF0aG5hbWUgJiYgcmVsYXRpdmUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLydcbiAgICAgICksXG4gICAgICBtdXN0RW5kQWJzID0gKGlzUmVsQWJzIHx8IGlzU291cmNlQWJzIHx8XG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuaG9zdCAmJiByZWxhdGl2ZS5wYXRobmFtZSkpLFxuICAgICAgcmVtb3ZlQWxsRG90cyA9IG11c3RFbmRBYnMsXG4gICAgICBzcmNQYXRoID0gcmVzdWx0LnBhdGhuYW1lICYmIHJlc3VsdC5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcmVsUGF0aCA9IHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLnNwbGl0KCcvJykgfHwgW10sXG4gICAgICBwc3ljaG90aWMgPSByZXN1bHQucHJvdG9jb2wgJiYgIXNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdO1xuXG4gIC8vIGlmIHRoZSB1cmwgaXMgYSBub24tc2xhc2hlZCB1cmwsIHRoZW4gcmVsYXRpdmVcbiAgLy8gbGlua3MgbGlrZSAuLi8uLiBzaG91bGQgYmUgYWJsZVxuICAvLyB0byBjcmF3bCB1cCB0byB0aGUgaG9zdG5hbWUsIGFzIHdlbGwuICBUaGlzIGlzIHN0cmFuZ2UuXG4gIC8vIHJlc3VsdC5wcm90b2NvbCBoYXMgYWxyZWFkeSBiZWVuIHNldCBieSBub3cuXG4gIC8vIExhdGVyIG9uLCBwdXQgdGhlIGZpcnN0IHBhdGggcGFydCBpbnRvIHRoZSBob3N0IGZpZWxkLlxuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gJyc7XG4gICAgcmVzdWx0LnBvcnQgPSBudWxsO1xuICAgIGlmIChyZXN1bHQuaG9zdCkge1xuICAgICAgaWYgKHNyY1BhdGhbMF0gPT09ICcnKSBzcmNQYXRoWzBdID0gcmVzdWx0Lmhvc3Q7XG4gICAgICBlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7XG4gICAgfVxuICAgIHJlc3VsdC5ob3N0ID0gJyc7XG4gICAgaWYgKHJlbGF0aXZlLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZS5ob3N0bmFtZSA9IG51bGw7XG4gICAgICByZWxhdGl2ZS5wb3J0ID0gbnVsbDtcbiAgICAgIGlmIChyZWxhdGl2ZS5ob3N0KSB7XG4gICAgICAgIGlmIChyZWxQYXRoWzBdID09PSAnJykgcmVsUGF0aFswXSA9IHJlbGF0aXZlLmhvc3Q7XG4gICAgICAgIGVsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO1xuICAgICAgfVxuICAgICAgcmVsYXRpdmUuaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzICYmIChyZWxQYXRoWzBdID09PSAnJyB8fCBzcmNQYXRoWzBdID09PSAnJyk7XG4gIH1cblxuICBpZiAoaXNSZWxBYnMpIHtcbiAgICAvLyBpdCdzIGFic29sdXRlLlxuICAgIHJlc3VsdC5ob3N0ID0gKHJlbGF0aXZlLmhvc3QgfHwgcmVsYXRpdmUuaG9zdCA9PT0gJycpID9cbiAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3QgOiByZXN1bHQuaG9zdDtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSAocmVsYXRpdmUuaG9zdG5hbWUgfHwgcmVsYXRpdmUuaG9zdG5hbWUgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgOiByZXN1bHQuaG9zdG5hbWU7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICBzcmNQYXRoID0gcmVsUGF0aDtcbiAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGRvdC1oYW5kbGluZyBiZWxvdy5cbiAgfSBlbHNlIGlmIChyZWxQYXRoLmxlbmd0aCkge1xuICAgIC8vIGl0J3MgcmVsYXRpdmVcbiAgICAvLyB0aHJvdyBhd2F5IHRoZSBleGlzdGluZyBmaWxlLCBhbmQgdGFrZSB0aGUgbmV3IHBhdGggaW5zdGVhZC5cbiAgICBpZiAoIXNyY1BhdGgpIHNyY1BhdGggPSBbXTtcbiAgICBzcmNQYXRoLnBvcCgpO1xuICAgIHNyY1BhdGggPSBzcmNQYXRoLmNvbmNhdChyZWxQYXRoKTtcbiAgICByZXN1bHQuc2VhcmNoID0gcmVsYXRpdmUuc2VhcmNoO1xuICAgIHJlc3VsdC5xdWVyeSA9IHJlbGF0aXZlLnF1ZXJ5O1xuICB9IGVsc2UgaWYgKCFpc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKCFpc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgICByZXN1bHQucGF0aCA9IChyZXN1bHQucGF0aG5hbWUgPyByZXN1bHQucGF0aG5hbWUgOiAnJykgK1xuICAgICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgLy8gbm8gcGF0aCBhdCBhbGwuICBlYXN5LlxuICAgIC8vIHdlJ3ZlIGFscmVhZHkgaGFuZGxlZCB0aGUgb3RoZXIgc3R1ZmYgYWJvdmUuXG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5zZWFyY2gpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gJy8nICsgcmVzdWx0LnNlYXJjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaWYgYSB1cmwgRU5EcyBpbiAuIG9yIC4uLCB0aGVuIGl0IG11c3QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIC8vIGhvd2V2ZXIsIGlmIGl0IGVuZHMgaW4gYW55dGhpbmcgZWxzZSBub24tc2xhc2h5LFxuICAvLyB0aGVuIGl0IG11c3QgTk9UIGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICB2YXIgbGFzdCA9IHNyY1BhdGguc2xpY2UoLTEpWzBdO1xuICB2YXIgaGFzVHJhaWxpbmdTbGFzaCA9IChcbiAgICAgIChyZXN1bHQuaG9zdCB8fCByZWxhdGl2ZS5ob3N0KSAmJiAobGFzdCA9PT0gJy4nIHx8IGxhc3QgPT09ICcuLicpIHx8XG4gICAgICBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT0gJy4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHNyY1BhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoIW11c3RFbmRBYnMgJiYgIXJlbW92ZUFsbERvdHMpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHNyY1BhdGgudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICBpZiAobXVzdEVuZEFicyAmJiBzcmNQYXRoWzBdICE9PSAnJyAmJlxuICAgICAgKCFzcmNQYXRoWzBdIHx8IHNyY1BhdGhbMF0uY2hhckF0KDApICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmIChoYXNUcmFpbGluZ1NsYXNoICYmIChzcmNQYXRoLmpvaW4oJy8nKS5zdWJzdHIoLTEpICE9PSAnLycpKSB7XG4gICAgc3JjUGF0aC5wdXNoKCcnKTtcbiAgfVxuXG4gIHZhciBpc0Fic29sdXRlID0gc3JjUGF0aFswXSA9PT0gJycgfHxcbiAgICAgIChzcmNQYXRoWzBdICYmIHNyY1BhdGhbMF0uY2hhckF0KDApID09PSAnLycpO1xuXG4gIC8vIHB1dCB0aGUgaG9zdCBiYWNrXG4gIGlmIChwc3ljaG90aWMpIHtcbiAgICByZXN1bHQuaG9zdG5hbWUgPSByZXN1bHQuaG9zdCA9IGlzQWJzb2x1dGUgPyAnJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNQYXRoLmxlbmd0aCA/IHNyY1BhdGguc2hpZnQoKSA6ICcnO1xuICAgIC8vb2NjYXRpb25hbHkgdGhlIGF1dGggY2FuIGdldCBzdHVjayBvbmx5IGluIGhvc3RcbiAgICAvL3RoaXMgZXNwZWNpYWx5IGhhcHBlbnMgaW4gY2FzZXMgbGlrZVxuICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgdmFyIGF1dGhJbkhvc3QgPSByZXN1bHQuaG9zdCAmJiByZXN1bHQuaG9zdC5pbmRleE9mKCdAJykgPiAwID9cbiAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5ob3N0LnNwbGl0KCdAJykgOiBmYWxzZTtcbiAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgcmVzdWx0LmF1dGggPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICByZXN1bHQuaG9zdCA9IHJlc3VsdC5ob3N0bmFtZSA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyB8fCAocmVzdWx0Lmhvc3QgJiYgc3JjUGF0aC5sZW5ndGgpO1xuXG4gIGlmIChtdXN0RW5kQWJzICYmICFpc0Fic29sdXRlKSB7XG4gICAgc3JjUGF0aC51bnNoaWZ0KCcnKTtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQucGF0aG5hbWUgPSBzcmNQYXRoLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vdG8gc3VwcG9ydCByZXF1ZXN0Lmh0dHBcbiAgaWYgKCFpc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiAgYXJnID09IG51bGw7XG59XG4iLCI7KGZ1bmN0aW9uICgpIHsgLy8gY2xvc3VyZSBmb3Igd2ViIGJyb3dzZXJzXG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IExSVUNhY2hlXG59IGVsc2Uge1xuICAvLyBqdXN0IHNldCB0aGUgZ2xvYmFsIGZvciBub24tbm9kZSBwbGF0Zm9ybXMuXG4gIHRoaXMuTFJVQ2FjaGUgPSBMUlVDYWNoZVxufVxuXG5mdW5jdGlvbiBoT1AgKG9iaiwga2V5KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpXG59XG5cbmZ1bmN0aW9uIG5haXZlTGVuZ3RoICgpIHsgcmV0dXJuIDEgfVxuXG5mdW5jdGlvbiBMUlVDYWNoZSAob3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTFJVQ2FjaGUpKVxuICAgIHJldHVybiBuZXcgTFJVQ2FjaGUob3B0aW9ucylcblxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKVxuICAgIG9wdGlvbnMgPSB7IG1heDogb3B0aW9ucyB9XG5cbiAgaWYgKCFvcHRpb25zKVxuICAgIG9wdGlvbnMgPSB7fVxuXG4gIHRoaXMuX21heCA9IG9wdGlvbnMubWF4XG4gIC8vIEtpbmQgb2Ygd2VpcmQgdG8gaGF2ZSBhIGRlZmF1bHQgbWF4IG9mIEluZmluaXR5LCBidXQgb2ggd2VsbC5cbiAgaWYgKCF0aGlzLl9tYXggfHwgISh0eXBlb2YgdGhpcy5fbWF4ID09PSBcIm51bWJlclwiKSB8fCB0aGlzLl9tYXggPD0gMCApXG4gICAgdGhpcy5fbWF4ID0gSW5maW5pdHlcblxuICB0aGlzLl9sZW5ndGhDYWxjdWxhdG9yID0gb3B0aW9ucy5sZW5ndGggfHwgbmFpdmVMZW5ndGhcbiAgaWYgKHR5cGVvZiB0aGlzLl9sZW5ndGhDYWxjdWxhdG9yICE9PSBcImZ1bmN0aW9uXCIpXG4gICAgdGhpcy5fbGVuZ3RoQ2FsY3VsYXRvciA9IG5haXZlTGVuZ3RoXG5cbiAgdGhpcy5fYWxsb3dTdGFsZSA9IG9wdGlvbnMuc3RhbGUgfHwgZmFsc2VcbiAgdGhpcy5fbWF4QWdlID0gb3B0aW9ucy5tYXhBZ2UgfHwgbnVsbFxuICB0aGlzLl9kaXNwb3NlID0gb3B0aW9ucy5kaXNwb3NlXG4gIHRoaXMucmVzZXQoKVxufVxuXG4vLyByZXNpemUgdGhlIGNhY2hlIHdoZW4gdGhlIG1heCBjaGFuZ2VzLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KExSVUNhY2hlLnByb3RvdHlwZSwgXCJtYXhcIixcbiAgeyBzZXQgOiBmdW5jdGlvbiAobUwpIHtcbiAgICAgIGlmICghbUwgfHwgISh0eXBlb2YgbUwgPT09IFwibnVtYmVyXCIpIHx8IG1MIDw9IDAgKSBtTCA9IEluZmluaXR5XG4gICAgICB0aGlzLl9tYXggPSBtTFxuICAgICAgaWYgKHRoaXMuX2xlbmd0aCA+IHRoaXMuX21heCkgdHJpbSh0aGlzKVxuICAgIH1cbiAgLCBnZXQgOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9tYXggfVxuICAsIGVudW1lcmFibGUgOiB0cnVlXG4gIH0pXG5cbi8vIHJlc2l6ZSB0aGUgY2FjaGUgd2hlbiB0aGUgbGVuZ3RoQ2FsY3VsYXRvciBjaGFuZ2VzLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KExSVUNhY2hlLnByb3RvdHlwZSwgXCJsZW5ndGhDYWxjdWxhdG9yXCIsXG4gIHsgc2V0IDogZnVuY3Rpb24gKGxDKSB7XG4gICAgICBpZiAodHlwZW9mIGxDICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoQ2FsY3VsYXRvciA9IG5haXZlTGVuZ3RoXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IHRoaXMuX2l0ZW1Db3VudFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fY2FjaGUpIHtcbiAgICAgICAgICB0aGlzLl9jYWNoZVtrZXldLmxlbmd0aCA9IDFcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbGVuZ3RoQ2FsY3VsYXRvciA9IGxDXG4gICAgICAgIHRoaXMuX2xlbmd0aCA9IDBcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX2NhY2hlKSB7XG4gICAgICAgICAgdGhpcy5fY2FjaGVba2V5XS5sZW5ndGggPSB0aGlzLl9sZW5ndGhDYWxjdWxhdG9yKHRoaXMuX2NhY2hlW2tleV0udmFsdWUpXG4gICAgICAgICAgdGhpcy5fbGVuZ3RoICs9IHRoaXMuX2NhY2hlW2tleV0ubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2xlbmd0aCA+IHRoaXMuX21heCkgdHJpbSh0aGlzKVxuICAgIH1cbiAgLCBnZXQgOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9sZW5ndGhDYWxjdWxhdG9yIH1cbiAgLCBlbnVtZXJhYmxlIDogdHJ1ZVxuICB9KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTFJVQ2FjaGUucHJvdG90eXBlLCBcImxlbmd0aFwiLFxuICB7IGdldCA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2xlbmd0aCB9XG4gICwgZW51bWVyYWJsZSA6IHRydWVcbiAgfSlcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTFJVQ2FjaGUucHJvdG90eXBlLCBcIml0ZW1Db3VudFwiLFxuICB7IGdldCA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2l0ZW1Db3VudCB9XG4gICwgZW51bWVyYWJsZSA6IHRydWVcbiAgfSlcblxuTFJVQ2FjaGUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZm4sIHRoaXNwKSB7XG4gIHRoaXNwID0gdGhpc3AgfHwgdGhpc1xuICB2YXIgaSA9IDA7XG4gIGZvciAodmFyIGsgPSB0aGlzLl9tcnUgLSAxOyBrID49IDAgJiYgaSA8IHRoaXMuX2l0ZW1Db3VudDsgay0tKSBpZiAodGhpcy5fbHJ1TGlzdFtrXSkge1xuICAgIGkrK1xuICAgIHZhciBoaXQgPSB0aGlzLl9scnVMaXN0W2tdXG4gICAgaWYgKHRoaXMuX21heEFnZSAmJiAoRGF0ZS5ub3coKSAtIGhpdC5ub3cgPiB0aGlzLl9tYXhBZ2UpKSB7XG4gICAgICBkZWwodGhpcywgaGl0KVxuICAgICAgaWYgKCF0aGlzLl9hbGxvd1N0YWxlKSBoaXQgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgaWYgKGhpdCkge1xuICAgICAgZm4uY2FsbCh0aGlzcCwgaGl0LnZhbHVlLCBoaXQua2V5LCB0aGlzKVxuICAgIH1cbiAgfVxufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGtleXMgPSBuZXcgQXJyYXkodGhpcy5faXRlbUNvdW50KVxuICB2YXIgaSA9IDBcbiAgZm9yICh2YXIgayA9IHRoaXMuX21ydSAtIDE7IGsgPj0gMCAmJiBpIDwgdGhpcy5faXRlbUNvdW50OyBrLS0pIGlmICh0aGlzLl9scnVMaXN0W2tdKSB7XG4gICAgdmFyIGhpdCA9IHRoaXMuX2xydUxpc3Rba11cbiAgICBrZXlzW2krK10gPSBoaXQua2V5XG4gIH1cbiAgcmV0dXJuIGtleXNcbn1cblxuTFJVQ2FjaGUucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheSh0aGlzLl9pdGVtQ291bnQpXG4gIHZhciBpID0gMFxuICBmb3IgKHZhciBrID0gdGhpcy5fbXJ1IC0gMTsgayA+PSAwICYmIGkgPCB0aGlzLl9pdGVtQ291bnQ7IGstLSkgaWYgKHRoaXMuX2xydUxpc3Rba10pIHtcbiAgICB2YXIgaGl0ID0gdGhpcy5fbHJ1TGlzdFtrXVxuICAgIHZhbHVlc1tpKytdID0gaGl0LnZhbHVlXG4gIH1cbiAgcmV0dXJuIHZhbHVlc1xufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9kaXNwb3NlICYmIHRoaXMuX2NhY2hlKSB7XG4gICAgZm9yICh2YXIgayBpbiB0aGlzLl9jYWNoZSkge1xuICAgICAgdGhpcy5fZGlzcG9zZShrLCB0aGlzLl9jYWNoZVtrXS52YWx1ZSlcbiAgICB9XG4gIH1cblxuICB0aGlzLl9jYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCkgLy8gaGFzaCBvZiBpdGVtcyBieSBrZXlcbiAgdGhpcy5fbHJ1TGlzdCA9IE9iamVjdC5jcmVhdGUobnVsbCkgLy8gbGlzdCBvZiBpdGVtcyBpbiBvcmRlciBvZiB1c2UgcmVjZW5jeVxuICB0aGlzLl9tcnUgPSAwIC8vIG1vc3QgcmVjZW50bHkgdXNlZFxuICB0aGlzLl9scnUgPSAwIC8vIGxlYXN0IHJlY2VudGx5IHVzZWRcbiAgdGhpcy5fbGVuZ3RoID0gMCAvLyBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGxpc3RcbiAgdGhpcy5faXRlbUNvdW50ID0gMFxufVxuXG4vLyBQcm92aWRlZCBmb3IgZGVidWdnaW5nL2RldiBwdXJwb3NlcyBvbmx5LiBObyBwcm9taXNlcyB3aGF0c29ldmVyIHRoYXRcbi8vIHRoaXMgQVBJIHN0YXlzIHN0YWJsZS5cbkxSVUNhY2hlLnByb3RvdHlwZS5kdW1wID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fY2FjaGVcbn1cblxuTFJVQ2FjaGUucHJvdG90eXBlLmR1bXBMcnUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLl9scnVMaXN0XG59XG5cbkxSVUNhY2hlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICBpZiAoaE9QKHRoaXMuX2NhY2hlLCBrZXkpKSB7XG4gICAgLy8gZGlzcG9zZSBvZiB0aGUgb2xkIG9uZSBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgICBpZiAodGhpcy5fZGlzcG9zZSkgdGhpcy5fZGlzcG9zZShrZXksIHRoaXMuX2NhY2hlW2tleV0udmFsdWUpXG4gICAgaWYgKHRoaXMuX21heEFnZSkgdGhpcy5fY2FjaGVba2V5XS5ub3cgPSBEYXRlLm5vdygpXG4gICAgdGhpcy5fY2FjaGVba2V5XS52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5nZXQoa2V5KVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICB2YXIgbGVuID0gdGhpcy5fbGVuZ3RoQ2FsY3VsYXRvcih2YWx1ZSlcbiAgdmFyIGFnZSA9IHRoaXMuX21heEFnZSA/IERhdGUubm93KCkgOiAwXG4gIHZhciBoaXQgPSBuZXcgRW50cnkoa2V5LCB2YWx1ZSwgdGhpcy5fbXJ1KyssIGxlbiwgYWdlKVxuXG4gIC8vIG92ZXJzaXplZCBvYmplY3RzIGZhbGwgb3V0IG9mIGNhY2hlIGF1dG9tYXRpY2FsbHkuXG4gIGlmIChoaXQubGVuZ3RoID4gdGhpcy5fbWF4KSB7XG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2UpIHRoaXMuX2Rpc3Bvc2Uoa2V5LCB2YWx1ZSlcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRoaXMuX2xlbmd0aCArPSBoaXQubGVuZ3RoXG4gIHRoaXMuX2xydUxpc3RbaGl0Lmx1XSA9IHRoaXMuX2NhY2hlW2tleV0gPSBoaXRcbiAgdGhpcy5faXRlbUNvdW50ICsrXG5cbiAgaWYgKHRoaXMuX2xlbmd0aCA+IHRoaXMuX21heCkgdHJpbSh0aGlzKVxuICByZXR1cm4gdHJ1ZVxufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkge1xuICBpZiAoIWhPUCh0aGlzLl9jYWNoZSwga2V5KSkgcmV0dXJuIGZhbHNlXG4gIHZhciBoaXQgPSB0aGlzLl9jYWNoZVtrZXldXG4gIGlmICh0aGlzLl9tYXhBZ2UgJiYgKERhdGUubm93KCkgLSBoaXQubm93ID4gdGhpcy5fbWF4QWdlKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbkxSVUNhY2hlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBnZXQodGhpcywga2V5LCB0cnVlKVxufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGdldCh0aGlzLCBrZXksIGZhbHNlKVxufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaGl0ID0gdGhpcy5fbHJ1TGlzdFt0aGlzLl9scnVdXG4gIGRlbCh0aGlzLCBoaXQpXG4gIHJldHVybiBoaXQgfHwgbnVsbFxufVxuXG5MUlVDYWNoZS5wcm90b3R5cGUuZGVsID0gZnVuY3Rpb24gKGtleSkge1xuICBkZWwodGhpcywgdGhpcy5fY2FjaGVba2V5XSlcbn1cblxuZnVuY3Rpb24gZ2V0IChzZWxmLCBrZXksIGRvVXNlKSB7XG4gIHZhciBoaXQgPSBzZWxmLl9jYWNoZVtrZXldXG4gIGlmIChoaXQpIHtcbiAgICBpZiAoc2VsZi5fbWF4QWdlICYmIChEYXRlLm5vdygpIC0gaGl0Lm5vdyA+IHNlbGYuX21heEFnZSkpIHtcbiAgICAgIGRlbChzZWxmLCBoaXQpXG4gICAgICBpZiAoIXNlbGYuX2FsbG93U3RhbGUpIGhpdCA9IHVuZGVmaW5lZFxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZG9Vc2UpIHVzZShzZWxmLCBoaXQpXG4gICAgfVxuICAgIGlmIChoaXQpIGhpdCA9IGhpdC52YWx1ZVxuICB9XG4gIHJldHVybiBoaXRcbn1cblxuZnVuY3Rpb24gdXNlIChzZWxmLCBoaXQpIHtcbiAgc2hpZnRMVShzZWxmLCBoaXQpXG4gIGhpdC5sdSA9IHNlbGYuX21ydSArK1xuICBzZWxmLl9scnVMaXN0W2hpdC5sdV0gPSBoaXRcbn1cblxuZnVuY3Rpb24gdHJpbSAoc2VsZikge1xuICB3aGlsZSAoc2VsZi5fbHJ1IDwgc2VsZi5fbXJ1ICYmIHNlbGYuX2xlbmd0aCA+IHNlbGYuX21heClcbiAgICBkZWwoc2VsZiwgc2VsZi5fbHJ1TGlzdFtzZWxmLl9scnVdKVxufVxuXG5mdW5jdGlvbiBzaGlmdExVIChzZWxmLCBoaXQpIHtcbiAgZGVsZXRlIHNlbGYuX2xydUxpc3RbIGhpdC5sdSBdXG4gIHdoaWxlIChzZWxmLl9scnUgPCBzZWxmLl9tcnUgJiYgIXNlbGYuX2xydUxpc3Rbc2VsZi5fbHJ1XSkgc2VsZi5fbHJ1ICsrXG59XG5cbmZ1bmN0aW9uIGRlbCAoc2VsZiwgaGl0KSB7XG4gIGlmIChoaXQpIHtcbiAgICBpZiAoc2VsZi5fZGlzcG9zZSkgc2VsZi5fZGlzcG9zZShoaXQua2V5LCBoaXQudmFsdWUpXG4gICAgc2VsZi5fbGVuZ3RoIC09IGhpdC5sZW5ndGhcbiAgICBzZWxmLl9pdGVtQ291bnQgLS1cbiAgICBkZWxldGUgc2VsZi5fY2FjaGVbIGhpdC5rZXkgXVxuICAgIHNoaWZ0TFUoc2VsZiwgaGl0KVxuICB9XG59XG5cbi8vIGNsYXNzeSwgc2luY2UgVjggcHJlZmVycyBwcmVkaWN0YWJsZSBvYmplY3RzLlxuZnVuY3Rpb24gRW50cnkgKGtleSwgdmFsdWUsIGx1LCBsZW5ndGgsIG5vdykge1xuICB0aGlzLmtleSA9IGtleVxuICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgdGhpcy5sdSA9IGx1XG4gIHRoaXMubGVuZ3RoID0gbGVuZ3RoXG4gIHRoaXMubm93ID0gbm93XG59XG5cbn0pKClcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBxcyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XHJcblxyXG5cclxudmFyIGdsb2JhbFJlcXVpcmUgPSByZXF1aXJlKCcuLi9saWIvZ2xvYmFsUmVxdWlyZScpO1xyXG52YXIgXyA9IGdsb2JhbFJlcXVpcmUoJ2xvZGFzaCcpO1xyXG52YXIgJCA9IGdsb2JhbFJlcXVpcmUoJ2pRdWVyeScpO1xyXG52YXIgcGFnZSA9IGdsb2JhbFJlcXVpcmUoJ3BhZ2UnKTtcclxuXHJcbnZhciBzaGFyZWRSb3V0ZXMgPSByZXF1aXJlKCcuL3NoYXJlZCcpO1xyXG5cclxudmFyIFByb2dyZXNzQmFyID0gcmVxdWlyZSgnLi4vbGliL3Byb2dyZXNzQmFyLmpzJyk7XHJcblxyXG5cclxuXHJcbndpbmRvdy53YXNQcmVyZW5kZXJlZDtcclxudmFyIHRyYW5zaXRpb25UaW1lID0gMzAwO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocm9vdE5vZGUsIHByZXJlbmRlcmVkKSB7XHJcblx0Ly8gdmFyIHJvb3ROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocm9vdEVsZW1lbnQpO1xyXG5cclxuXHR3aW5kb3cud2FzUHJlcmVuZGVyZWQgPSBwcmVyZW5kZXJlZDtcclxuXHJcblx0Y29uc29sZS5sb2coJ3JvdXRlcycsIHJvb3ROb2RlKTtcclxuXHJcblx0Xy5mb3JFYWNoKFxyXG5cdFx0c2hhcmVkUm91dGVzLFxyXG5cdFx0YXR0YWNoUm91dGUuYmluZChudWxsLCByb290Tm9kZSlcclxuXHQpO1xyXG59O1xyXG5cclxuXHJcblxyXG5cclxuZnVuY3Rpb24gYXR0YWNoUm91dGUocm9vdE5vZGUsIHJvdXRlKSB7XHJcblx0Y29uc29sZS5sb2coJ2F0dGFjaFJvdXRlKCknLCByb3V0ZSk7XHJcblxyXG5cdHBhZ2Uocm91dGUucGF0aCwgZnVuY3Rpb24oY29udGV4dCkge1xyXG5cdFx0aWYgKHdpbmRvdy53YXNQcmVyZW5kZXJlZCkge1xyXG5cdFx0XHR3aW5kb3cud2FzUHJlcmVuZGVyZWQgPSBmYWxzZTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHByb2dyZXNzQmFyID0gbmV3IFByb2dyZXNzQmFyKCk7XHJcblx0XHRwcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblxyXG5cclxuXHJcblx0XHR2YXIgJG9sZENvbnRlbnQgPSAoJCgnLmNvbnRlbnRXcmFwcGVyJykubGVuZ3RoKVxyXG5cdFx0XHQ/ICQoJy5jb250ZW50V3JhcHBlcicpXHJcblx0XHRcdDogJCgnI2NvbnRlbnQnKS53cmFwKCc8ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXJcIj48L2Rpdj4nKS5jbG9zZXN0KCcuY29udGVudFdyYXBwZXInKTtcclxuXHJcblx0XHQvLyBwcm92aWRlIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrIHZpYSBmYWRlb3V0XHJcblx0XHRwcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0XHQkb2xkQ29udGVudC5mYWRlT3V0KHRyYW5zaXRpb25UaW1lLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRwcm9ncmVzc0Jhci50YXNrQ29tcGxldGUoKTtcclxuXHRcdFx0JCh0aGlzKS5yZW1vdmUoKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dmFyIHJlbmRlclBhcmFtcyA9IHtcclxuXHRcdFx0cXVlcnk6IHFzLnBhcnNlKGNvbnRleHQucXVlcnlzdHJpbmcpLFxyXG5cdFx0XHRwYXJhbXM6IGNvbnRleHQucGFyYW1zLFxyXG5cdFx0XHR0ZW1wbGF0ZXM6IHRlbXBsYXRlcyxcclxuXHRcdFx0cHJvZ3Jlc3NCYXI6IHByb2dyZXNzQmFyLFxyXG5cdFx0fTtcclxuXHJcblx0XHR2YXIgbG9hZFN0YXJ0ID0gRGF0ZS5ub3coKTtcclxuXHRcdHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHRcdHJvdXRlLnJlbmRlcihyZW5kZXJQYXJhbXMsIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xyXG5cdFx0XHRwcm9ncmVzc0Jhci50YXNrQ29tcGxldGUoKTtcclxuXHRcdFx0Ly8gY29uc29sZS5sb2coJ3Jlc3VsdHMnLCByZXN1bHRzKTtcclxuXHJcblx0XHRcdHZhciAkbmV3Q29udGVudCA9ICQocmVzdWx0cy5jb250ZW50KS53cmFwKCc8ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXJcIj48ZGl2IGlkPVwiY29udGVudFwiIGNsYXNzPVwiY29udGFpbmVyXCI+PC9kaXY+PC9kaXY+JykuY2xvc2VzdCgnLmNvbnRlbnRXcmFwcGVyJykuaGlkZSgpO1xyXG5cdFx0XHR2YXIgbG9hZENvbXBsZXRlID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0dmFyIGxvYWRpbmdUaW1lID0gKGxvYWRDb21wbGV0ZSAtIGxvYWRTdGFydCk7XHJcblxyXG5cdFx0XHQvLyB0cnkgdG8gbWF0Y2ggdGhlIHRpbWluZyBvZiB0aGUgZmFkZW91dCwgYnV0IHJlcXVpcmUgbGVhc3QgNTAlIG9mIHRoZSB0cmFuc2l0aW9uIHRpbWVcclxuXHRcdFx0dmFyIHRyYW5zaXRpb25SZW1haW5pbmcgPSB0cmFuc2l0aW9uVGltZSAtIGxvYWRpbmdUaW1lO1xyXG5cdFx0XHR2YXIgZmFkZUluVGltZSA9IE1hdGgubWF4KHRyYW5zaXRpb25SZW1haW5pbmcsIHRyYW5zaXRpb25UaW1lIC8gMik7XHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKGZhZGVJblRpbWUsIHRyYW5zaXRpb25SZW1haW5pbmcsIGxvYWRpbmdUaW1lKVxyXG5cclxuXHRcdFx0d2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG5cdFx0XHQkbmV3Q29udGVudFxyXG5cdFx0XHRcdC5hcHBlbmRUbygnYm9keScpXHJcblx0XHRcdFx0LmZhZGVJbihmYWRlSW5UaW1lLCBmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0cHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblx0XHRcdFx0XHRwcm9ncmVzc0Jhci5kb25lKCk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdCQod2luZG93KS50cmlnZ2VyKCdoYXNoY2hhbmdlJyk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHQkKCd0aXRsZScpLnRleHQocmVzdWx0cy5tZXRhLnRpdGxlKTtcclxuXHRcdFx0JCgnbWV0YVtuYW1lPVwiZGVzY3JpcHRpb25cIl0nKS5hdHRyKCdjb250ZW50JywgcmVzdWx0cy5tZXRhLmRlc2NyaXB0aW9uKTtcclxuXHJcblxyXG5cdFx0fSk7XHJcblxyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRSZW5kZXIocm91dGUsIGNvbnRleHQsIHJvb3ROb2RlLCBmbkNhbGxiYWNrKSB7XHJcblx0Y29uc29sZS5sb2coJ2luaXRSZW5kZXIoKScsIHJvdXRlKTtcclxuXHJcblx0cm91dGUucmVuZGVyKFxyXG5cdFx0Y29udGV4dCxcclxuXHRcdGZuQ2FsbGJhY2tcclxuXHQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXIocm9vdE5vZGUsIGZuQ2FsbGJhY2ssIHJlc3VsdHMpIHtcclxuXHRjb25zb2xlLmxvZygncmVuZGVyKCknLCByZXN1bHRzKTtcclxuXHJcblx0dmFyIHZpZXcgPSByZXN1bHRzLmluaXRSZW5kZXIudmlldztcclxuXHR2YXIgcHJvcHMgPSByZXN1bHRzLmluaXRSZW5kZXIucHJvcHM7XHJcblxyXG5cdC8vIGNvbnNvbGUubG9nKCdyZW5kZXIgY2xpZW50IHN0YXJ0JywgYXJndW1lbnRzKTtcclxuXHJcblx0UmVhY3QucmVuZGVyQ29tcG9uZW50KFxyXG5cdFx0dmlldyhwcm9wcyksXHJcblx0XHRyb290Tm9kZSxcclxuXHRcdGZuQ2FsbGJhY2suYmluZChudWxsLCBudWxsKVxyXG5cdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvc3RSZW5kZXIocm9vdE5vZGUsIGZuQ2FsbGJhY2ssIHJlc3VsdHMpIHtcclxuXHRjb25zb2xlLmxvZygncG9zdFJlbmRlcigpJywgcmVzdWx0cyk7XHJcblxyXG5cdGNvbnNvbGUubG9nKCdwb3N0UmVuZGVyJywgYXJndW1lbnRzKTtcclxuXHR2YXIgbWV0YSA9IHJlc3VsdHMuaW5pdFJlbmRlci5tZXRhO1xyXG5cclxuXHRjb25zb2xlLmxvZygncmVuZGVyIGNsaWVudCBjb21wbGV0ZScsIG1ldGEpO1xyXG5cdCQoJ3RpdGxlJykuaHRtbChtZXRhLnRpdGxlKTtcclxuXHJcblx0d2luZG93LnNjcm9sbFRvKDAsIDApO1xyXG5cdCQocm9vdE5vZGUpLmZhZGVJbih0cmFuc2l0aW9uVGltZSk7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBbe1xyXG5cdHBhdGg6ICcvJyxcclxuXHRyZW5kZXI6IHJlcXVpcmUoJy4vc2hhcmVkL2hvbWUnKVxyXG59LCB7XHJcblx0cGF0aDogJy86c3RhdGVTbHVnKFthLXotXSspJyxcclxuXHRyZW5kZXI6IHJlcXVpcmUoJy4vc2hhcmVkL2Jyb3dzZS9zdGF0ZScpXHJcbn0sIHtcclxuXHRwYXRoOiAnLzpzdGF0ZVNsdWcoW2Etei1dKykvOmNpdHlTbHVnKFthLXotXSspJyxcclxuXHRyZW5kZXI6IHJlcXVpcmUoJy4vc2hhcmVkL2Jyb3dzZS9jaXR5JylcclxufSwge1xyXG5cdHBhdGg6ICcqJyxcclxuXHRyZW5kZXI6IHJlcXVpcmUoJy4vc2hhcmVkL2Vycm9ycycpLmJpbmQobnVsbCwgbmV3IEVycm9yKDQwNCkpLFxyXG59XTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgZ2xvYmFsUmVxdWlyZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcbnZhciBhc3luYyA9IGdsb2JhbFJlcXVpcmUoJ2FzeW5jJyk7XHJcblxyXG52YXIgbGliR2VvID0gcmVxdWlyZSgnLi4vLi4vLi4vbGliL2dlbycpO1xyXG52YXIgbGliQ0cgPSByZXF1aXJlKCcuLi8uLi8uLi9saWIvY2l0eWdyaWQnKTtcclxudmFyIGxpYlV0aWwgPSByZXF1aXJlKCcuLi8uLi8uLi9saWIvdXRpbCcpO1xyXG5cclxudmFyIGVycm9yUmVyb3V0ZXMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIHByb2dyZXNzQmFyO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucywgZm5DYWxsYmFjayl7XHJcblx0cHJvZ3Jlc3NCYXIgPSBvcHRpb25zLnByb2dyZXNzQmFyO1xyXG5cdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHQvLyBjb25zb2xlLmxvZygnZ2V0UHJvcHMoKScsIGFyZ3VtZW50cyk7XHJcblx0Ly8gdmFyIHJlcXVlc3RVcmwgPSBnZXRSZXF1ZXN0VXJsKHBhcmFtcyk7XHJcblxyXG5cdGFzeW5jLmF1dG8oe1xyXG5cdFx0c3RhdGU6IGdldFN0YXRlLmJpbmQobnVsbCwgb3B0aW9ucy5wYXJhbXMuc3RhdGVTbHVnKSxcclxuXHRcdGNpdHk6IGdldENpdHkuYmluZChudWxsLCBvcHRpb25zLnBhcmFtcy5zdGF0ZVNsdWcsIG9wdGlvbnMucGFyYW1zLmNpdHlTbHVnKSxcclxuXHRcdHBsYWNlczogWydjaXR5JywgJ3N0YXRlJywgZ2V0UGxhY2VzLmJpbmQobnVsbCwgb3B0aW9ucy5xdWVyeSldLFxyXG5cdFx0cGxhY2VzQ2l0aWVzOiBbJ3BsYWNlcycsIGdldFBsYWNlc0NpdGllc11cclxuXHR9LCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcclxuXHRcdHZhciBzdGF0ZSA9IChfLmlzQXJyYXkocmVzdWx0cy5zdGF0ZSkgJiYgcmVzdWx0cy5zdGF0ZS5sZW5ndGgpID8gcmVzdWx0cy5zdGF0ZVswXSA6IG51bGw7XHJcblx0XHR2YXIgY2l0eSA9IChfLmlzQXJyYXkocmVzdWx0cy5jaXR5KSAmJiByZXN1bHRzLmNpdHkubGVuZ3RoKSA/IHJlc3VsdHMuY2l0eVswXSA6IG51bGw7XHJcblx0XHR2YXIgcGxhY2VzID0gKF8uaXNBcnJheShyZXN1bHRzLnBsYWNlc0NpdGllcykgJiYgcmVzdWx0cy5wbGFjZXNDaXRpZXMubGVuZ3RoKSA/IHJlc3VsdHMucGxhY2VzQ2l0aWVzIDogbnVsbDtcclxuXHJcblx0XHR2YXIgaGFzUmVzdWx0cyA9ICghIXN0YXRlICYmICEhY2l0eSAmJiAhIXBsYWNlcyAmJiAhIXBsYWNlcy5sZW5ndGgpO1xyXG5cclxuXHRcdGlmIChlcnIgfHwgIWhhc1Jlc3VsdHMpIHtcclxuXHRcdFx0ZXJyID0gZXJyIHx8IG5ldyBFcnJvcig0MDQpO1xyXG5cdFx0XHRlcnJvclJlcm91dGVzKGVyciwgb3B0aW9ucywgZm5DYWxsYmFjayk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0dmFyIHBhZ2VUaXRsZSA9IGNpdHkubmFtZSArICcsICcgKyBzdGF0ZS5uYW1lICsgJyBNZWNoYW5pY3MnO1xyXG5cdFx0XHR2YXIgZGVzY3JpcHRpb24gPSAnRmluZGluZyB0aGUgcmlnaHQgbWVjaGFuaWMgaW4gJyArIGNpdHkubmFtZSArICcsICcgKyBzdGF0ZS5uYW1lICsgJyBqdXN0IGdvdCBlYXNpZXIhIERvblxcJ3QgcGljayBhIG1lY2hhbmljIHJhbmRvbWx5IG91dCBvZiB0aGUgcGhvbmVib29rLiBXaGV0aGVyIHlvdXIgY2FyIG5lZWRzIG1haW50ZW5hbmNlIHdvcmssIG9yIGlmIHlvdSBoYXZlIGRhbWFnZSB0aGF0IG5lZWRzIHJlcGFpcmVkLCB3ZVxcJ2xsIGhlbHAgeW91IGZpbmQgdGhlIHBlcmZlY3QgbG9jYWwgbWVjaGFuaWMhJztcclxuXHJcblx0XHRcdHZhciBtZXRhVGl0bGUgPSBwYWdlVGl0bGU7XHJcblx0XHRcdHZhciBtZXRhRGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuXHRcdFx0XHJcblxyXG5cdFx0XHR2YXIgaHRtbCA9IG9wdGlvbnMudGVtcGxhdGVzWycvYnJvd3NlL2NpdHknXShfLmRlZmF1bHRzKHtcclxuXHRcdFx0XHRwYWdlVGl0bGU6IHBhZ2VUaXRsZSxcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXHJcblx0XHRcdFx0cGxhY2VzOiBwbGFjZXMsXHJcblx0XHRcdFx0cmVuZGVyUGxhY2U6IG9wdGlvbnMudGVtcGxhdGVzWycvYnJvd3NlL3BsYWNlJ11cclxuXHRcdFx0fSwgb3B0aW9ucy50ZW1wbGF0ZXMucHJvcHMpKTtcclxuXHJcblx0XHRcdHZhciBwcm9wcyA9IF8uZGVmYXVsdHMoe1xyXG5cdFx0XHRcdG1ldGE6IHtcclxuXHRcdFx0XHRcdHRpdGxlOiBtZXRhVGl0bGUsXHJcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogbWV0YURlc2NyaXB0aW9uLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0Y29udGVudDogaHRtbCxcclxuXHRcdFx0fSwgb3B0aW9ucy50ZW1wbGF0ZXMucHJvcHMpO1xyXG5cclxuXHRcdFx0cHJvZ3Jlc3NCYXIgJiYgcHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblx0XHRcdGZuQ2FsbGJhY2sobnVsbCwgcHJvcHMpO1xyXG5cdFx0fVxyXG5cclxuXHR9KTtcclxufTtcclxuXHJcblxyXG5mdW5jdGlvbiBnZXRTdGF0ZShzdGF0ZVNsdWcsIGZuQ2FsbGJhY2spIHtcclxuXHRwcm9ncmVzc0JhciAmJiBwcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0bGliR2VvLmdldFN0YXRlKHN0YXRlU2x1ZywgZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XHJcblx0XHRwcm9ncmVzc0JhciAmJiBwcm9ncmVzc0Jhci50YXNrQ29tcGxldGUoKTtcclxuXHRcdGZuQ2FsbGJhY2soZXJyLCByZXN1bHRzKTtcclxuXHR9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldENpdHkoc3RhdGVTbHVnLCBjaXR5U2x1ZywgZm5DYWxsYmFjaykge1xyXG5cdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHRsaWJHZW8uZ2V0Q2l0eShzdGF0ZVNsdWcsIGNpdHlTbHVnLCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcclxuXHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0Zm5DYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xyXG5cdH0pO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldFBsYWNlcyhxdWVyeSwgZm5DYWxsYmFjaywgcmVzdWx0cykge1xyXG5cdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHJcblx0dmFyIGNpdHkgPSByZXN1bHRzLmNpdHlbMF07XHJcblx0dmFyIHN0YXRlID0gcmVzdWx0cy5zdGF0ZVswXTtcclxuXHJcblx0bGliQ0cuZ2V0UGxhY2VzKFxyXG5cdFx0c3RhdGUuYWJicixcclxuXHRcdGNpdHkubmFtZSxcclxuXHRcdHF1ZXJ5LFxyXG5cdFx0ZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XHJcblx0XHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0XHRmbkNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XHJcblx0XHR9XHJcblx0KTtcclxufVxyXG5cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRQbGFjZXNDaXRpZXMoZm5DYWxsYmFjaywgcmVzdWx0cykge1xyXG5cdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHRcclxuXHR2YXIgX3BsYWNlcyA9IHJlc3VsdHMucGxhY2VzO1xyXG5cdHZhciB6aXBzID0gXy5tYXAoX3BsYWNlcywgZnVuY3Rpb24ocGxhY2UpIHtcclxuXHRcdHJldHVybiBwbGFjZS5hZGRyZXNzLnBvc3RhbF9jb2RlO1xyXG5cdH0pO1xyXG5cclxuXHR2YXIgZ2VvWmlwcyA9IHt9O1xyXG5cclxuXHR6aXBzID0gXy51bmlxKHppcHMpO1xyXG5cdC8vIGNvbnNvbGUubG9nKCdicm93c2U6OmdldFBsYWNlc0NpdGllcygpJywgemlwcyk7XHJcblxyXG5cdGFzeW5jLmVhY2goXHJcblx0XHR6aXBzLFxyXG5cdFx0Z2V0WmlwLmJpbmQobnVsbCwgZ2VvWmlwcyksXHJcblx0XHRmdW5jdGlvbihlcnIpIHtcclxuXHRcdFx0Z2VvWmlwcyA9IF8ubWFwKF9wbGFjZXMsIGZ1bmN0aW9uKHBsYWNlKSB7XHJcblx0XHRcdFx0cGxhY2UuZ2VvID0gZ2VvWmlwc1twbGFjZS5hZGRyZXNzLnBvc3RhbF9jb2RlXTtcclxuXHRcdFx0XHRyZXR1cm4gcGxhY2U7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhfcGxhY2VzKTtcclxuXHJcblx0XHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0XHRmbkNhbGxiYWNrKG51bGwsIF9wbGFjZXMpO1xyXG5cdFx0fVxyXG5cdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFppcChnZW9aaXBzLCB6aXAsIGZuQ2FsbGJhY2spIHtcclxuXHRwcm9ncmVzc0JhciAmJiBwcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0bGliR2VvLmdldFppcCh6aXAsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcclxuXHRcdGdlb1ppcHNbemlwXSA9IHJlc3VsdFswXTtcclxuXHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0Zm5DYWxsYmFjaygpO1xyXG5cdH0pXHJcbn0iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgZ2xvYmFsUmVxdWlyZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcbnZhciBhc3luYyA9IGdsb2JhbFJlcXVpcmUoJ2FzeW5jJyk7XHJcblxyXG52YXIgbGliR2VvID0gcmVxdWlyZSgnLi4vLi4vLi4vbGliL2dlbycpO1xyXG52YXIgbGliQ0cgPSByZXF1aXJlKCcuLi8uLi8uLi9saWIvY2l0eWdyaWQnKTtcclxudmFyIGxpYlV0aWwgPSByZXF1aXJlKCcuLi8uLi8uLi9saWIvdXRpbCcpO1xyXG5cclxudmFyIGVycm9yUmVyb3V0ZXMgPSByZXF1aXJlKCcuLi9lcnJvcnMnKTtcclxudmFyIHByb2dyZXNzQmFyO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucywgZm5DYWxsYmFjayl7XHJcblx0cHJvZ3Jlc3NCYXIgPSBvcHRpb25zLnByb2dyZXNzQmFyO1xyXG5cdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHQvLyBjb25zb2xlLmxvZygnZ2V0UHJvcHMoKScsIGFyZ3VtZW50cyk7XHJcblx0Ly8gdmFyIHJlcXVlc3RVcmwgPSBnZXRSZXF1ZXN0VXJsKHBhcmFtcyk7XHJcblxyXG5cdGFzeW5jLmF1dG8oe1xyXG5cdFx0c3RhdGU6IGdldFN0YXRlLmJpbmQobnVsbCwgb3B0aW9ucy5wYXJhbXMuc3RhdGVTbHVnKSxcclxuXHRcdGNpdGllczogZ2V0Q2l0aWVzLmJpbmQobnVsbCwgb3B0aW9ucy5wYXJhbXMuc3RhdGVTbHVnKSxcclxuXHR9LCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcclxuXHRcdHZhciBzdGF0ZSA9IChfLmlzQXJyYXkocmVzdWx0cy5zdGF0ZSkgJiYgcmVzdWx0cy5zdGF0ZS5sZW5ndGgpID8gcmVzdWx0cy5zdGF0ZVswXSA6IG51bGw7XHJcblx0XHR2YXIgY2l0aWVzID0gKF8uaXNBcnJheShyZXN1bHRzLmNpdGllcykgJiYgcmVzdWx0cy5jaXRpZXMubGVuZ3RoKSA/IHJlc3VsdHMuY2l0aWVzIDogbnVsbDtcclxuXHJcblx0XHR2YXIgaGFzUmVzdWx0cyA9ICghIXN0YXRlICYmICEhY2l0aWVzICYmICEhY2l0aWVzLmxlbmd0aCk7XHJcblxyXG5cdFx0aWYgKGVyciB8fCAhaGFzUmVzdWx0cykge1xyXG5cdFx0XHRlcnIgPSBlcnIgfHwgbmV3IEVycm9yKDQwNCk7XHJcblx0XHRcdGVycm9yUmVyb3V0ZXMoZXJyLCBvcHRpb25zLCBmbkNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR2YXIgcGFnZVRpdGxlID0gc3RhdGUubmFtZSArICcgTWVjaGFuaWNzJztcclxuXHRcdFx0dmFyIGRlc2NyaXB0aW9uID0gJ0ZpbmRpbmcgdGhlIHJpZ2h0IG1lY2hhbmljIGluICcgKyBzdGF0ZS5uYW1lICsgJyBqdXN0IGdvdCBlYXNpZXIhIERvblxcJ3QgcGljayBhIG1lY2hhbmljIHJhbmRvbWx5IG91dCBvZiB0aGUgcGhvbmVib29rLiBXaGV0aGVyIHlvdXIgY2FyIG5lZWRzIG1haW50ZW5hbmNlIHdvcmssIG9yIGlmIHlvdSBoYXZlIGRhbWFnZSB0aGF0IG5lZWRzIHJlcGFpcmVkLCB3ZVxcJ2xsIGhlbHAgeW91IGZpbmQgdGhlIHBlcmZlY3QgbG9jYWwgbWVjaGFuaWMhJztcclxuXHJcblx0XHRcdHZhciBtZXRhVGl0bGUgPSBwYWdlVGl0bGU7XHJcblx0XHRcdHZhciBtZXRhRGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcclxuXHRcdFx0XHJcblxyXG5cdFx0XHR2YXIgY2l0aWVzSHRtbCA9IG9wdGlvbnMudGVtcGxhdGVzWycvZnJhZ21lbnRzL2dlby1saXN0J10oXy5kZWZhdWx0cyh7XHJcblx0XHRcdFx0cGxhY2VzOiBjaXRpZXNcclxuXHRcdFx0fSwgb3B0aW9ucy50ZW1wbGF0ZXMucHJvcHMpKTtcclxuXHJcblxyXG5cdFx0XHR2YXIgaHRtbCA9IG9wdGlvbnMudGVtcGxhdGVzWycvYnJvd3NlL3N0YXRlJ10oXy5kZWZhdWx0cyh7XHJcblx0XHRcdFx0cGFnZVRpdGxlOiBwYWdlVGl0bGUsXHJcblx0XHRcdFx0ZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxyXG5cdFx0XHRcdGNpdGllczogY2l0aWVzLFxyXG5cdFx0XHRcdGNpdGllc0h0bWw6IGNpdGllc0h0bWwsXHJcblx0XHRcdH0sIG9wdGlvbnMudGVtcGxhdGVzLnByb3BzKSk7XHJcblxyXG5cdFx0XHR2YXIgcHJvcHMgPSBfLmRlZmF1bHRzKHtcclxuXHRcdFx0XHRtZXRhOiB7XHJcblx0XHRcdFx0XHR0aXRsZTogbWV0YVRpdGxlLFxyXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IG1ldGFEZXNjcmlwdGlvbixcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGNvbnRlbnQ6IGh0bWwsXHJcblx0XHRcdH0sIG9wdGlvbnMudGVtcGxhdGVzLnByb3BzKTtcclxuXHJcblx0XHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0XHRmbkNhbGxiYWNrKG51bGwsIHByb3BzKTtcclxuXHRcdH1cclxuXHJcblx0fSk7XHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0U3RhdGUoc3RhdGVTbHVnLCBmbkNhbGxiYWNrKSB7XHJcblx0cHJvZ3Jlc3NCYXIgJiYgcHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cdGxpYkdlby5nZXRTdGF0ZShzdGF0ZVNsdWcsIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xyXG5cdFx0cHJvZ3Jlc3NCYXIgJiYgcHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblx0XHRmbkNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XHJcblx0fSk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRDaXRpZXMoc3RhdGVTbHVnLCBmbkNhbGxiYWNrKSB7XHJcblx0cHJvZ3Jlc3NCYXIgJiYgcHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cdGxpYkdlby5nZXRDaXRpZXMoc3RhdGVTbHVnLCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcclxuXHRcdHByb2dyZXNzQmFyICYmIHByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cdFx0Zm5DYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xyXG5cdH0pO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2xvYmFsUmVxdWlyZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2xpYi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcbnZhciBqYWRlID0gZ2xvYmFsUmVxdWlyZSgnamFkZScpO1xyXG5cclxuXHJcbnZhciBlcnJvck1hcHBpbmdzID0ge1xyXG5cdCd1bmhhbmRsZWQnOiB1bmhhbmRsZWQsXHJcblx0J25vdEZvdW5kJzogbm90Rm91bmQsXHJcblxyXG5cdCc0MDQnOiBub3RGb3VuZCxcclxuXHQnNTAwJzogdW5oYW5kbGVkLFxyXG59O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXJyLCBvcHRpb25zLCBmbkNhbGxiYWNrKXtcclxuXHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cdHZhciBlcnJvckhhbmRsZXIgPSBlcnJvck1hcHBpbmdzW2Vyci5tZXNzYWdlXSB8fCBlcnJvck1hcHBpbmdzWyd1bmhhbmRsZWQnXTtcclxuXHJcblx0ZXJyb3JIYW5kbGVyKG9wdGlvbnMsIGZuQ2FsbGJhY2spO1xyXG5cdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci50YXNrQ29tcGxldGUoKTtcclxufTtcclxuXHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0UHJvcHMob3B0aW9ucywgcHJvcHMsIGZuQ2FsbGJhY2spIHtcclxuXHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cclxuXHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cdHZhciBodG1sID0gb3B0aW9ucy50ZW1wbGF0ZXNbJy9lcnJvcnMvZ2VuZXJpYyddKF8uZGVmYXVsdHMoe1xyXG5cdFx0cGFnZVRpdGxlOiBwcm9wcy5wYWdlVGl0bGUsXHJcblx0XHRkZXNjcmlwdGlvbjogcHJvcHMuZGVzY3JpcHRpb24sXHJcblx0fSwgb3B0aW9ucy50ZW1wbGF0ZXMucHJvcHMpKTtcclxuXHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblxyXG5cdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0dmFyIHByb3BzID0gXy5kZWZhdWx0cyh7XHJcblx0XHRzdGF0dXNDb2RlOiBwcm9wcy5zdGF0dXNDb2RlLFxyXG5cdFx0bWV0YToge1xyXG5cdFx0XHR0aXRsZTogcHJvcHMubWV0YVRpdGxlLFxyXG5cdFx0XHRkZXNjcmlwdGlvbjogcHJvcHMubWV0YURlc2NyaXB0aW9uLFxyXG5cdFx0fSxcclxuXHRcdGNvbnRlbnQ6IGh0bWwsXHJcblx0fSwgb3B0aW9ucy50ZW1wbGF0ZXMucHJvcHMpO1xyXG5cdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci50YXNrQ29tcGxldGUoKTtcclxuXHJcblx0Zm5DYWxsYmFjayhudWxsLCBwcm9wcyk7XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIHVuaGFuZGxlZChvcHRpb25zLCBmbkNhbGxiYWNrKSB7XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHRjb25zb2xlLmxvZyhcIkVSUk9SOnVuaGFuZGxlZFwiLCBvcHRpb25zLnBhcmFtcywgb3B0aW9ucy5xdWVyeSk7XHJcblx0XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHR2YXIgY3VzdG9tUHJvcHMgPSB7XHJcblx0XHRzdGF0dXNDb2RlOiA1MDAsXHJcblx0XHRtZXRhVGl0bGU6ICdFcnJvcicsXHJcblx0XHRtZXRhRGVzY3JpcHRpb246ICdUaGUgc2VydmVyIGhhcyBlbmNvdW50ZXJlZCBhbiBlcnJvci4nLFxyXG5cdFx0cGFnZVRpdGxlOiAnRXJyb3IhJyxcclxuXHRcdGRlc2NyaXB0aW9uOiAnVGhlIHNlcnZlciBoYXMgZW5jb3VudGVyZWQgYW4gZXJyb3IuJ1xyXG5cdH07XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cclxuXHRnZXRQcm9wcyhvcHRpb25zLCBjdXN0b21Qcm9wcywgZm5DYWxsYmFjayk7XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG59XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIG5vdEZvdW5kKG9wdGlvbnMsIGZuQ2FsbGJhY2spIHtcclxuXHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIuYWRkVGFzaygpO1xyXG5cdGNvbnNvbGUubG9nKFwiRVJST1I6bm90Rm91bmRcIiwgb3B0aW9ucy5wYXJhbXMsIG9wdGlvbnMucXVlcnkpO1xyXG5cdFxyXG5cdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0dmFyIGN1c3RvbVByb3BzID0ge1xyXG5cdFx0c3RhdHVzQ29kZTogNDA0LFxyXG5cdFx0bWV0YVRpdGxlOiAnTm90IEZvdW5kIScsXHJcblx0XHRtZXRhRGVzY3JpcHRpb246ICdUaGUgc2VydmVyIGNvdWxkIG5vdCBmaW5kIHRoZSByZXF1ZXN0ZWQgcmVzb3VyY2UuJyxcclxuXHRcdHBhZ2VUaXRsZTogJ05vdCBGb3VuZCEnLFxyXG5cdFx0ZGVzY3JpcHRpb246ICdUaGUgc2VydmVyIGNvdWxkIG5vdCBmaW5kIHRoZSByZXF1ZXN0ZWQgcmVzb3VyY2UuJ1xyXG5cdH07XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cclxuXHRnZXRQcm9wcyhvcHRpb25zLCBjdXN0b21Qcm9wcywgZm5DYWxsYmFjayk7XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgZ2xvYmFsUmVxdWlyZSA9IHJlcXVpcmUoJy4uLy4uL2xpYi9nbG9iYWxSZXF1aXJlJyk7XHJcbnZhciBfID0gZ2xvYmFsUmVxdWlyZSgnbG9kYXNoJyk7XHJcbnZhciBqYWRlID0gZ2xvYmFsUmVxdWlyZSgnamFkZScpO1xyXG5cclxudmFyIGxpYkdlbyA9IHJlcXVpcmUoJy4uLy4uL2xpYi9nZW8nKTtcclxudmFyIGxpYlV0aWwgPSByZXF1aXJlKCcuLi8uLi9saWIvdXRpbCcpO1xyXG5cclxuXHJcbnZhciB3aGl0ZWxpc3QgPSBbXHJcblx0J0FsYWJhbWEnLFxyXG5cdCdBbGFza2EnLFxyXG5cdCdBcml6b25hJyxcclxuXHQnQXJrYW5zYXMnLFxyXG5cdCdDYWxpZm9ybmlhJyxcclxuXHQnQ29sb3JhZG8nLFxyXG5cdCdDb25uZWN0aWN1dCcsXHJcblx0J0RlbGF3YXJlJyxcclxuXHQnRGlzdHJpY3Qgb2YgQ29sdW1iaWEnLFxyXG5cdCdGbG9yaWRhJyxcclxuXHQnR2VvcmdpYScsXHJcblx0J0hhd2FpaScsXHJcblx0J0lkYWhvJyxcclxuXHQnSWxsaW5vaXMnLFxyXG5cdCdJbmRpYW5hJyxcclxuXHQnSW93YScsXHJcblx0J0thbnNhcycsXHJcblx0J0tlbnR1Y2t5JyxcclxuXHQnTG91aXNpYW5hJyxcclxuXHQnTWFpbmUnLFxyXG5cdCdNYXJ5bGFuZCcsXHJcblx0J01hc3NhY2h1c2V0dHMnLFxyXG5cdCdNaWNoaWdhbicsXHJcblx0J01pbm5lc290YScsXHJcblx0J01pc3Npc3NpcHBpJyxcclxuXHQnTWlzc291cmknLFxyXG5cdCdNb250YW5hJyxcclxuXHQnTmVicmFza2EnLFxyXG5cdCdOZXZhZGEnLFxyXG5cdCdOZXcgSGFtcHNoaXJlJyxcclxuXHQnTmV3IEplcnNleScsXHJcblx0J05ldyBNZXhpY28nLFxyXG5cdCdOZXcgWW9yaycsXHJcblx0J05vcnRoIENhcm9saW5hJyxcclxuXHQnTm9ydGggRGFrb3RhJyxcclxuXHQnT2hpbycsXHJcblx0J09rbGFob21hJyxcclxuXHQnT3JlZ29uJyxcclxuXHQnUGVubnN5bHZhbmlhJyxcclxuXHQnUmhvZGUgSXNsYW5kJyxcclxuXHQnU291dGggQ2Fyb2xpbmEnLFxyXG5cdCdTb3V0aCBEYWtvdGEnLFxyXG5cdCdUZW5uZXNzZWUnLFxyXG5cdCdUZXhhcycsXHJcblx0J1V0YWgnLFxyXG5cdCdWZXJtb250JyxcclxuXHQnVmlyZ2luaWEnLFxyXG5cdCdXYXNoaW5ndG9uJyxcclxuXHQnV2VzdCBWaXJnaW5pYScsXHJcblx0J1dpc2NvbnNpbicsXHJcblx0J1d5b21pbmcnXHJcblx0Ly8gJ0FtZXJpY2FuIFNhbW9hJyxcclxuXHQvLyAnQXJtZWQgRm9yY2VzIC0gQW1lcmljYXMnLFxyXG5cdC8vICdBcm1lZCBGb3JjZXMgLSBFdXJvcGUvQWZyaWNhL0NhbmFkYScsXHJcblx0Ly8gJ0FybWVkIEZvcmNlcyAtIFBhY2lmaWMnLFxyXG5cdC8vICdGZWRlcmF0ZWQgU3RhdGVzIG9mIE1pY3JvbmVzaWEnLFxyXG5cdC8vICdHdWFtJyxcclxuXHQvLyAnTWFyc2hhbGwgSXNsYW5kcycsXHJcblx0Ly8gJ05vcnRoZXJuIE1hcmlhbmEgSXNsYW5kcycsXHJcblx0Ly8gJ1BhbGF1JyxcclxuXHQvLyAnUHVlcnRvIFJpY28nLFxyXG5cdC8vICdWaXJnaW4gSXNsYW5kcycsXHJcbl07XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucywgZm5DYWxsYmFjayl7XHJcblx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLmFkZFRhc2soKTtcclxuXHJcblx0Z2V0U3RhdGVzKGZ1bmN0aW9uKGVyciwgc3RhdGVzKSB7XHJcblx0XHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblxyXG5cclxuXHRcdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0XHR2YXIgc3RhdGVzSHRtbCA9IG9wdGlvbnMudGVtcGxhdGVzWycvZnJhZ21lbnRzL2dlby1saXN0J10oXy5kZWZhdWx0cyh7XHJcblx0XHRcdHBsYWNlczogc3RhdGVzXHJcblx0XHR9LCBvcHRpb25zLnRlbXBsYXRlcy5wcm9wcykpO1xyXG5cdFx0b3B0aW9ucy5wcm9ncmVzc0JhciAmJiBvcHRpb25zLnByb2dyZXNzQmFyLnRhc2tDb21wbGV0ZSgpO1xyXG5cclxuXHRcdG9wdGlvbnMucHJvZ3Jlc3NCYXIgJiYgb3B0aW9ucy5wcm9ncmVzc0Jhci5hZGRUYXNrKCk7XHJcblx0XHR2YXIgaHRtbCA9IG9wdGlvbnMudGVtcGxhdGVzWycvaG9tZSddKF8uZGVmYXVsdHMoe1xyXG5cdFx0XHRwYWdlVGl0bGU6ICdXZWxjb21lIHRvIExvY2FsLU1lY2hhbmljcy5jb20hJyxcclxuXHRcdFx0ZGVzY3JpcHRpb246ICdGaW5kaW5nIHRoZSByaWdodCBsb2NhbCBtZWNoYW5pYyBqdXN0IGdvdCBlYXNpZXIhIERvblxcJ3QgcGljayBhIG1lY2hhbmljIHJhbmRvbWx5IG91dCBvZiB0aGUgcGhvbmVib29rLiBXaGV0aGVyIHlvdXIgY2FyIG5lZWRzIG1haW50ZW5hbmNlIHdvcmssIG9yIGlmIHlvdSBoYXZlIGRhbWFnZSB0aGF0IG5lZWRzIHJlcGFpcmVkLCB3ZVxcJ2xsIGhlbHAgeW91IGZpbmQgdGhlIHBlcmZlY3QgbG9jYWwgbWVjaGFuaWMhJyxcclxuXHRcdFx0c3RhdGVzSHRtbDogc3RhdGVzSHRtbCxcclxuXHRcdH0sIG9wdGlvbnMudGVtcGxhdGVzLnByb3BzKSk7XHJcblx0XHRvcHRpb25zLnByb2dyZXNzQmFyICYmIG9wdGlvbnMucHJvZ3Jlc3NCYXIudGFza0NvbXBsZXRlKCk7XHJcblxyXG5cdFx0dmFyIHByb3BzID0gXy5kZWZhdWx0cyh7XHJcblx0XHRcdG1ldGE6IHtcclxuXHRcdFx0XHR0aXRsZTogJ0xvY2FsIE1lY2hhbmljcyEnLFxyXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiAnRmluZGluZyB0aGUgcmlnaHQgbG9jYWwgbWVjaGFuaWMganVzdCBnb3QgZWFzaWVyISBEb25cXCd0IHBpY2sgYSBtZWNoYW5pYyByYW5kb21seSBvdXQgb2YgdGhlIHBob25lYm9vay4gV2hldGhlciB5b3VyIGNhciBuZWVkcyBtYWludGVuYW5jZSB3b3JrLCBvciBpZiB5b3UgaGF2ZSBkYW1hZ2UgdGhhdCBuZWVkcyByZXBhaXJlZCwgd2VcXCdsbCBoZWxwIHlvdSBmaW5kIHRoZSBwZXJmZWN0IGxvY2FsIG1lY2hhbmljIScsXHJcblx0XHRcdH0sXHJcblx0XHRcdGNvbnRlbnQ6IGh0bWwsXHJcblx0XHR9LCBvcHRpb25zLnRlbXBsYXRlcy5wcm9wcyk7XHJcblxyXG5cdFx0Zm5DYWxsYmFjayhudWxsLCBwcm9wcyk7XHJcblx0fSk7XHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0U3RhdGVzKGZuQ2FsbGJhY2spIHtcclxuXHRsaWJHZW8uZ2V0U3RhdGVzKGZ1bmN0aW9uKGVyciwgc3RhdGVzKSB7XHJcblx0XHQvLyB2YXIgX3N0YXRlcyA9IFtdO1xyXG5cdFx0c3RhdGVzID0gXy5maWx0ZXIoc3RhdGVzLCBmdW5jdGlvbihzdGF0ZSl7XHJcblx0XHRcdHJldHVybiAoXy5pbmRleE9mKHdoaXRlbGlzdCwgc3RhdGUubmFtZSkgIT09IC0xKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Zm5DYWxsYmFjayhudWxsLCBzdGF0ZXMpO1xyXG5cdH0pO1xyXG59Il19
