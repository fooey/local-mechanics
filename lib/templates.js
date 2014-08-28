'use strict';

var globalRequire = require('./globalRequire');
var _ = globalRequire('lodash');



/*
*	EXPORT
*/

module.exports = function(templates){
	return render(templates);
}


var render = _.curry(function(templates, key, props) {
	// console.log('templates', templates);
	// console.log('key', key);

	return templates[key]({props: _.defaults(props, templates.props)}, {variable: 'props'});
})
