var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var firstPage = 1;
	var prevPage = Math.max(1, props.appState.page - 1);
	var nextPage = Math.min(props.appState.numPages, props.appState.page + 1);
	var lastPage = props.appState.numPages;
;
__p += '<ul class=pager><li class="previous ' +
((__t = ( (firstPage === props.appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"><a data-page="' +
((__t = ( firstPage )) == null ? '' : __t) +
'" title="First Page"><i class="fa fa-angle-double-left"></i></a></li><li class="previous ' +
((__t = ( (prevPage === props.appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"><a data-page="' +
((__t = ( prevPage )) == null ? '' : __t) +
'" title="Previous Page (' +
((__t = ( prevPage )) == null ? '' : __t) +
')"><i class="fa fa-angle-left"></i> Prev</a></li><li class="next ' +
((__t = ( (lastPage === props.appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"><a data-page="' +
((__t = ( lastPage )) == null ? '' : __t) +
'" title="Last Page (' +
((__t = ( lastPage )) == null ? '' : __t) +
')"><i class="fa fa-angle-double-right"></i></a></li><li class="next ' +
((__t = ( (nextPage === props.appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'"><a data-page="' +
((__t = ( nextPage )) == null ? '' : __t) +
'" title="Next Page (' +
((__t = ( nextPage )) == null ? '' : __t) +
')">Next <i class="fa fa-angle-right"></i></a></li></ul>';

}
return __p
}