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
	return templates[key](_.defaults(props, templates.props));
})
