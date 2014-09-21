var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var images = props.images;
;

 if ((images && images.length)) { ;
__p += ' <h3 class=section-header>Images</h3> ';
 } ;
__p += ' <div id=images> <ul> ';
 _.each(images, function(i) { ;
__p += ' <li title="Image provided by ' +
__e( i.attribution_text ) +
'"> <a href="' +
__e( i.image_url ) +
'"><img itemprop=image src="' +
__e( i.image_url ) +
'"></a> <a class=attribution href="' +
__e( i.attribution_url ) +
'">' +
__e( i.attribution_text ) +
'</a> </li> ';
 }) ;
__p += ' </ul> </div>';

}
return __p
}