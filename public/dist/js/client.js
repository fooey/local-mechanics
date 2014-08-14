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


//# sourceMappingURL=client.js.map