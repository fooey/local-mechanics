var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var getLink = function(pageNum) {
		return props.getLink({
			call_id: props.call_id,
			page: pageNum,
		});
	};

	var firstPage = 1;
	var lastPage = props.numPages;

	var prevPage = Math.max(firstPage, props.page - 1);
	var nextPage = Math.min(lastPage, props.page + 1);
;
__p += ' <ul class=pager> <li class="previous ' +
((__t = ( (firstPage == props.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a data-page="' +
((__t = ( firstPage )) == null ? '' : __t) +
'" title="First Page" href="' +
((__t = ( getLink(firstPage) )) == null ? '' : __t) +
'" rel=nofollow> <i class="fa fa-angle-double-left"></i> </a> </li> <li class="previous ' +
((__t = ( (prevPage == props.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a data-page="' +
((__t = ( prevPage )) == null ? '' : __t) +
'" title="Previous Page" href="' +
((__t = ( getLink(prevPage) )) == null ? '' : __t) +
'" rel=nofollow> <i class="fa fa-angle-left"></i> Prev </a> </li> <li class="next ' +
((__t = ( (lastPage == props.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a data-page="' +
((__t = ( lastPage )) == null ? '' : __t) +
'" title="Last Page" href="' +
((__t = ( getLink(lastPage) )) == null ? '' : __t) +
'" rel=nofollow> <i class="fa fa-angle-double-right"></i> </a> </li> <li class="next ' +
((__t = ( (nextPage == props.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a data-page="' +
((__t = ( nextPage )) == null ? '' : __t) +
'" title="Next Page" href="' +
((__t = ( getLink(nextPage) )) == null ? '' : __t) +
'" rel=nofollow> Next <i class="fa fa-angle-right"></i> </a> </li> </ul>';

}
return __p
}