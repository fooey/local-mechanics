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
__p += ' <div class=stateCols> <div class=row> ';
 while (pos < numStatess) { ;
__p += ' ';
 var colStates = props.states.slice(pos, pos += perCol); ;
__p += ' <div class="' +
((__t = ( colStates.join(' ') )) == null ? '' : __t) +
'"> <ul class="nav nav-list"> ';
 _.each(colStates, function(state){ ;
__p += ' <li> <a href="' +
((__t = ( state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( state.name )) == null ? '' : __t) +
'</a> </li> ';
 }) ;
__p += ' </ul> </div> ';
 } ;
__p += ' </div> </div>';

}
return __p
}