var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var radii = [1, 5,10,15,20,25,30,40,50];

	var getLink = function(has_offers) {
		return props.getLink({
			has_offers: has_offers,
			page: 1,
		});
	};
;
__p += ' <div class=option-group> <h6>Special Offers: ' +
((__t = ( !!props.has_offers )) == null ? '' : __t) +
'</h6> <div class="btn-group btn-group-justified"> <div class=btn-group> <a class="btn btn-sm btn-' +
((__t = ( (props.has_offers) ? 'success' : 'default' )) == null ? '' : __t) +
'" href="' +
((__t = ( getLink(1) )) == null ? '' : __t) +
'" rel=nofollow> On </a> </div> <div class=btn-group> <a class="btn btn-sm btn-' +
((__t = ( (!props.has_offers) ? 'danger' : 'default' )) == null ? '' : __t) +
'" href="' +
((__t = ( getLink(0) )) == null ? '' : __t) +
'" rel=nofollow> Off </a> </div> </div> </div>';

}
return __p
}