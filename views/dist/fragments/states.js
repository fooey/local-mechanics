var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var numStates = props.states.length;
	var perCol = Math.ceil(numStates / numCols);
	var colClasses = [];
	colClasses.push('col-md-' + Math.ceil(24/numCols).toString());

	var pos = 0;
;
__p += '\r\n\r\n<div class="stateCols">\r\n\t<div class="row">\r\n\t\t';
 while (pos < numStatess) { ;
__p += '\r\n\t\t\t';
 var colStates = props.states.slice(pos, pos += perCol); ;
__p += '\r\n\t\t\t<div class="' +
((__t = ( colStates.join(' ') )) == null ? '' : __t) +
'">\r\n\t\t\t\t<ul class="nav nav-list">\r\n\t\t\t\t\t';
 _.each(colStates, function(state){ ;
__p += '\r\n\t\t\t\t\t\t<li>\r\n\t\t\t\t\t\t\t<a href="' +
((__t = ( state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( state.name )) == null ? '' : __t) +
'</a>\r\n\t\t\t\t\t\t</li>\r\n\t\t\t\t\t';
 }) ;
__p += '\r\n\t\t\t\t</ul>\r\n\t\t\t</div>\r\n\t\t';
 } ;
__p += '\r\n\t</div>\r\n</div>';

}
return __p
}