'use strict';
var view = 'home';

//var /*global*/require = require('../lib//*global*/require');
var _ = require('lodash');

var libGeo = require('../lib/geo');
var libUtil = require('../lib/util');


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



module.exports = function(req, res){
	var templateData = _.clone(req.app.locals);
	delete templateData.settings;


	getStates(function(err, states) {
		// var stateCols = libUtil.arrayToArrayOfArays(states, 4);

		var jade = require('jade');
		var statesHtml = jade.renderFile(GLOBAL.paths.getView('home/states.jade'), {
			numCols: 4,
			states: states,
		});


		var content = jade.renderFile(GLOBAL.paths.getView('home/index.jade'), _.defaults({
			pageTitle: 'Welcome to Local-Mechanics.com!',
			description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			// params: params,
			// query: query,
			statesHtml: statesHtml,
		}, templateData));

		res.render('layout', _.defaults({
			meta: {
				title: 'Local Mechanics!',
				description: 'Finding the right local mechanic just got easier! Don\'t pick a mechanic randomly out of the phonebook. Whether your car needs maintenance work, or if you have damage that needs repaired, we\'ll help you find the perfect local mechanic!',
			},
			content: content
		}, templateData));
	});
};


function getStates(fnCallback) {
	libGeo.getStates(function(err, states) {

		// var _states = _.remove(states, function(state) {
		// 	var isWhitelitested = (_.indexOf(whitelist, state.name) > -1);
		// 	// console.log(state.getLink());
		// 	return isWhitelitested;
		// });

		var _states = [];
		states.forEach(function(state){
			var isWhitelitested = (_.indexOf(whitelist, state.name) > -1);
			if(isWhitelitested) {
				state.link = state.getLink();
				_states.push(state);
			}
		});

		// console.log(_states);

		fnCallback(null, _states);
	});
}

/*


				<div class="row">
					{{#columns}}
						<div class="col-lg-6">
							<ul>
								{{#.}}
									<li href="{{getLink()}}">{{name}}</li>
								{{/.}}
							</ul>
						</div>
					{{/columns}}
				</div>

*/