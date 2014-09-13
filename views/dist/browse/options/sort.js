var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var sorts = [
		{key: 'alpha', label: 'Alphabetical', icon: 'font'},
		{key: 'dist', label: 'Distance', icon: 'map-marker'},
		{key: 'highestrated', label: 'Highest Rated', icon: 'star'},
		{key: 'mostreviewed', label: 'Most Reviewed', icon: 'comments'},
		{key: 'topmatches', label: 'Top Matches', icon: 'trophy'},
		{key: 'offers', label: 'Offers', icon: 'dollar'},
	];

	var getLink = function(sort) {
		return props.getLink({
			sort: sort,
			page: 1,
		});
	};
;
__p += ' <div class=option-group> <h5> Sorting: ' +
((__t = ( _.find(sorts, function(sort){return sort.key === props.sort}).label )) == null ? '' : __t) +
' </h5> <div class="btn-group btn-group-justified"> ';
 _.each(sorts, function(sort) { ;
__p += ' <div class=btn-group> <a class="btn btn-sm btn-info ' +
((__t = ( (props.sort === sort.key) ? 'active' : '' )) == null ? '' : __t) +
'" title="' +
((__t = ( sort.label )) == null ? '' : __t) +
'" href="' +
((__t = ( getLink(sort.key) )) == null ? '' : __t) +
'" rel=nofollow> <i class="fa fa-' +
((__t = ( sort.icon )) == null ? '' : __t) +
'"></i> </a> </div> ';
 }) ;
__p += ' </div> </div>';

}
return __p
}