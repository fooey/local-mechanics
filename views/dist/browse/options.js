var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id=options class="well well-sm"><h1>Options</h1><div class=meta></div><ul class="offers list-inline"></ul><ul class="sorts list-inline"></ul><ul class="radius list-inline"></ul><ul class="rpp list-inline"></ul><ul class=pager></ul>' +
((__t = ( props.render('/util/pager', props) )) == null ? '' : __t) +
'<pre>' +
__e( JSON.stringify(props, null, '\t') ) +
'</pre></div>';

}
return __p
}