var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (!props.place) { ;
__p += '<h2>Error!</h2>';
 } else { ;
__p += '<div class=place><h2><a href="' +
((__t = ( props.place.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.name )) == null ? '' : __t) +
'</a></h2><div class=row><div class=col-sm-12><address><div>' +
((__t = ( props.place.address.street )) == null ? '' : __t) +
'</div><div><a href="' +
((__t = ( props.place.geo.city.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.city.name )) == null ? '' : __t) +
'</a>, <a href="' +
((__t = ( props.place.geo.state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.state.abbr )) == null ? '' : __t) +
'</a> <span>' +
((__t = ( props.place.geo.zip )) == null ? '' : __t) +
'</span></div></address>';
 if (props.place.has_offers) { ;
__p += '<div><span class="label label-danger">Special Offers Available!</span>.</div>';
 } ;

 if (props.place.tags && props.place.tags.length) { ;
__p += '<div>Primary Service:<ul class=list-inline>';
 _.each(_.filter(props.place.tags, function(tag){return tag.primary}), function(tag) { ;
__p += '<li>' +
__e( tag.name );
 }) ;
__p += '</li></ul></div><div>Additional Services:<ul class=list-inline>';
 _.each(_.filter(props.place.tags, function(tag){return !tag.primary}), function(tag) { ;
__p += '<li>' +
__e( tag.name );
 }) ;
__p += '</li></ul></div>';
 } ;
__p += '<div><ul class=list-inline><li><a href="' +
((__t = ( props.place.getLink('reviews') )) == null ? '' : __t) +
'">reviews</a></li><li><a href="' +
((__t = ( props.place.getLink('jobs') )) == null ? '' : __t) +
'">jobs</a></li></ul></div></div><div class="col-sm-12 text-center"><img src=http://nosrc.net/400x300></div></div></div>';
 } ;


}
return __p
}