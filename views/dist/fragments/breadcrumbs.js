var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (props.crumbs && props.crumbs.length) { ;
__p += ' <ol class=breadcrumb> ';
 _.each(props.crumbs, function(c) { ;
__p += ' <li itemscope itemtype=https://schema.org/breadcrumb title="' +
__e( c.title || c.label ) +
'" class="' +
__e( c.active && 'active' ) +
'"> <a href="' +
__e( c.href ) +
'">' +
__e( c.label ) +
'</a> </li> ';
 }); ;
__p += ' </ol> ';
 } ;


}
return __p
}