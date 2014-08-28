var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 for(var ixPage=1; ixPage <= props.numPages; ixPage++) { ;
__p += '\r\n\t<li class="' +
((__t = ( (ixPage === browseConfig.page) ? 'active' : '' )) == null ? '' : __t) +
'">\r\n\t\t<a data-page="' +
((__t = ( ixPage )) == null ? '' : __t) +
'">' +
((__t = ( ixPage )) == null ? '' : __t) +
'</a>\r\n\t</li>\r\n';
 } ;


}
return __p
}