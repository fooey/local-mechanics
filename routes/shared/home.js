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