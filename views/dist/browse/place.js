var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if (!props.place) { ;
__p += '\r\n\t<h2>Error!</h2>\r\n';
 } else { ;
__p += '\r\n\t<div class="place">\r\n\t\t<h2>\r\n\t\t\t<a href="' +
((__t = ( props.place.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.name )) == null ? '' : __t) +
'</a>\r\n\t\t</h2>\r\n\r\n\t\t<div class="row">\r\n\t\t\t<div class="col-sm-12">\r\n\t\t\t\t<address>\r\n\t\t\t\t\t<div>' +
((__t = ( props.place.address.street )) == null ? '' : __t) +
'</div>\r\n\t\t\t\t\t<div>\r\n\t\t\t\t\t\t<a href="' +
((__t = ( props.place.geo.city.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.city.name )) == null ? '' : __t) +
'</a>,\r\n\t\t\t\t\t\t<a href="' +
((__t = ( props.place.geo.state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.state.abbr )) == null ? '' : __t) +
'</a>\r\n\t\t\t\t\t\t<span>' +
((__t = ( props.place.geo.zip )) == null ? '' : __t) +
'</span>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</address>\r\n\t\t\t\t';
 if (props.place.has_offers) { ;
__p += '\r\n\t\t\t\t\t<div><span class="label label-danger">Special Offers Available!</span>.</div>\r\n\t\t\t\t';
 } ;
__p += '\r\n\t\t\t\t';
 if (props.place.tags && props.place.tags.length) { ;
__p += '\r\n\t\t\t\t\t<div>\r\n\t\t\t\t\t\tPrimary Service: \r\n\t\t\t\t\t\t<ul class="list-inline">\r\n\t\t\t\t\t\t\t';
 _.each(_.filter(props.place.tags, function(tag){return tag.primary}), function(tag) { ;
__p += '\r\n\t\t\t\t\t\t\t\t<li> ' +
__e( tag.name ) +
'\r\n\t\t\t\t\t\t\t';
 }) ;
__p += '\r\n\t\t\t\t\t\t</ul>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div>\r\n\t\t\t\t\t\tAdditional Services: \r\n\t\t\t\t\t\t<ul class="list-inline">\r\n\t\t\t\t\t\t\t';
 _.each(_.filter(props.place.tags, function(tag){return !tag.primary}), function(tag) { ;
__p += '\r\n\t\t\t\t\t\t\t\t<li> ' +
__e( tag.name ) +
'\r\n\t\t\t\t\t\t\t';
 }) ;
__p += '\r\n\t\t\t\t\t\t</ul>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t';
 } ;
__p += '\r\n\t\t\t\t<div>\r\n\t\t\t\t\t<ul class="list-inline">\r\n\t\t\t\t\t\t<li><a href="' +
((__t = ( props.place.getLink('reviews') )) == null ? '' : __t) +
'"> reviews</a></li>\r\n\t\t\t\t\t\t<li><a href="' +
((__t = ( props.place.getLink('jobs') )) == null ? '' : __t) +
'"> jobs</a></li>\r\n\t\t\t\t\t</ul>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t</div>\r\n\t\t\t<div class="col-sm-12 text-center">\r\n\t\t\t\t<!-- <img src="' +
((__t = ( props.place.getMapSrc('400x300') )) == null ? '' : __t) +
'" /> -->\r\n\t\t\t\t<img src="http://nosrc.net/400x300" />\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n';
 } ;
__p += '\r\n';

}
return __p
}