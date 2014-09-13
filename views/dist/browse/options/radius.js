var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var radii = [1, 5,10,15,20,25,30,40,50];

	var getLink = function(radius) {
		return props.getLink({
			radius: radius,
			page: 1,
		});
	};
;
__p += ' <div class=option-group> <h5>Search Radius: ' +
((__t = ( props.radius )) == null ? '' : __t) +
'</h5> <div class="btn-group btn-group-justified"> ';
 _.each(radii, function(radius){ ;
__p += ' <div class=btn-group> <a href="' +
((__t = ( getLink(radius) )) == null ? '' : __t) +
'" class="btn btn-sm btn-info ' +
((__t = ( (props.radius === radius) ? 'active' : '' )) == null ? '' : __t) +
'" rel=nofollow> ' +
((__t = ( radius )) == null ? '' : __t) +
' </a> </div> ';
 }) ;
__p += ' </div> </div>';

}
return __p
}