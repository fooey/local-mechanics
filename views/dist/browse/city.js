var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id=browse class=city><div class=row><div class=col-lg-24><header><h1 class=pageTitle>' +
((__t = ( props.pageTitle )) == null ? '' : __t) +
'</h1></header><div class="alert alert-info"><p class=description>' +
((__t = ( props.description )) == null ? '' : __t) +
'</p></div></div></div><div class=row><div class=col-sm-6>' +
((__t = ( props.optionsHtml )) == null ? '' : __t) +
'</div><div class=col-sm-18>' +
((__t = ( props.placesHtml )) == null ? '' : __t) +
'</div></div></div>';

}
return __p
}