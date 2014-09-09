'use strict';
//var /*global*/require = require('../../lib//*global*/require');
var _ = require('lodash');

var libGeo = require('../../lib/geo');
var libUtil = require('../../lib/util');


var whitelist = [
	'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida',
 	'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 
 	'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 
 	'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 
 	'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
	// 'American Samoa', 'Armed Forces - Americas', 'Armed Forces - Europe/Africa/Canada', 'Armed Forces - Pacific', 'Federated States of Micronesia', 'Guam', 'Marshall Islands', 'Northern Mariana Islands', 'Palau', 'Puerto Rico', 'Virgin Islands',
];



module.exports = function(render, requestProps, fnCallback){
	getStates(function(err, states) {

		var statesHtml = render('/fragments/geo-list', {
			places: states
		});


		var contentHtml = render('/home', {
			pageTitle: 'Welcome to Local-Mechanics.com!',
			description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			statesHtml: statesHtml,
		});

		fnCallback(null, {
			meta: {
				title: 'Local Mechanics!',
				description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			},
			contentHtml: contentHtml,
		});
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