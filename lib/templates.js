'use strict';

//var /*global*/require = require('.//*global*/require');
var _ = require('lodash');



/*
*	EXPORT
*/

module.exports = function(templates){
	return render(templates);
}


var render = _.curry(function(templates, key, props) {
	// console.log('templates', templates);
	// console.log('key', key);

	var templateProps = _.defaults(props, templates.props);
	templateProps.render = render(templates);
	// templateProps.util = {
	// 	numeral: require('numeral'),
	// 	moment: require('moment'),
	// }

	return templates[key](
		{props: templateProps},
		{variable: 'props'}
	);
})
