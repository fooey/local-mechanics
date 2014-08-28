var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="error">\r\n\t<div class="row"><div class="col-lg-24">\r\n\t\t<header>\r\n\t\t\t<h1 class="pageTitle">' +
((__t = ( props.pageTitle )) == null ? '' : __t) +
'</h1>\r\n\t\t</header>\r\n\t\t<div class="alert alert-info">\r\n\t\t\t<p class="description">' +
((__t = ( props.description )) == null ? '' : __t) +
'</p>\r\n\t\t</div>\r\n\t</div></div>\r\n</div>';

}
return __p
}