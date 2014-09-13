var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id=error> <div class=row><div class=col-lg-24> <header> <h1 class=pageTitle>' +
((__t = ( props.pageTitle )) == null ? '' : __t) +
'</h1> </header> <div class="alert alert-info"> <p class=description>' +
((__t = ( props.description )) == null ? '' : __t) +
'</p> </div> </div></div> </div>';

}
return __p
}