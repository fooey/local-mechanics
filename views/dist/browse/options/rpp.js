var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var rppOptions = [5,10,15,20,25,30,40,50];

	var getLink = function(rpp) {
		return props.getLink({
			rpp: rpp,
			page: 1,
		});
	};
;
__p += ' <div class=option-group> <h5>Results Per Page: ' +
((__t = ( props.rpp )) == null ? '' : __t) +
'</h5> <div class="btn-group btn-group-justified"> ';
 _.each(rppOptions, function(rpp){ ;
__p += ' <div class=btn-group> <a href="' +
((__t = ( getLink(rpp) )) == null ? '' : __t) +
'" class="btn btn-sm btn-info ' +
((__t = ( (props.rpp === rpp) ? 'active' : '' )) == null ? '' : __t) +
'" rel=nofollow> ' +
((__t = ( rpp )) == null ? '' : __t) +
' </a> </div> ';
 }) ;
__p += ' </div> </div>';

}
return __p
}