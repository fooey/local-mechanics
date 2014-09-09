var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var firstPage = 1;
	var prevPage = Math.max(1, appState.page - 1);
	var nextPage = Math.min(appState.numPages, appState.page + 1);
	var lastPage = appState.numPages;
;
__p += '<div class="btn-group text-center"><div class=btn-group><a class="btn btn-sm ' +
((__t = ( (firstPage === appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'" data-page="' +
((__t = ( firstPage )) == null ? '' : __t) +
'" title="First Page"><i class="fa fa-angle-double-left"></i></a></div><div class=btn-group><a class="btn btn-sm ' +
((__t = ( (prevPage === appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'" data-page="' +
((__t = ( prevPage )) == null ? '' : __t) +
'" title="Previous Page (' +
((__t = ( prevPage )) == null ? '' : __t) +
')"><i class="fa fa-angle-left"></i></a></div><div class=btn-group><a class="btn btn-sm ' +
((__t = ( (nextPage === appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'" data-page="' +
((__t = ( nextPage )) == null ? '' : __t) +
'" title="Next Page (' +
((__t = ( nextPage )) == null ? '' : __t) +
')"><i class="fa fa-angle-right"></i></a></div><div class=btn-group><a class="btn btn-sm ' +
((__t = ( (lastPage === appState.page) ? 'disabled' : '' )) == null ? '' : __t) +
'" data-page="' +
((__t = ( lastPage )) == null ? '' : __t) +
'" title="Last Page (' +
((__t = ( lastPage )) == null ? '' : __t) +
')"><i class="fa fa-angle-double-right"></i></a></div></div>';

}
return __p
}