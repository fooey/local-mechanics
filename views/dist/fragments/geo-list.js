var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 var alpha = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',') ;
__p += '\r\n\r\n<div class="row">\r\n\t<div class="col-lg-24">\r\n\t\t<ul class="nav nav-tabs responsive-col-tabs">\r\n\t\t\t<li class="active"><a>All</a></li>\r\n\t\t\t';
 _.each(alpha, function(letter){ ;
__p += '\r\n\t\t\t\t<li class="tab-' +
((__t = ( letter )) == null ? '' : __t) +
'">\r\n\t\t\t\t\t<a>' +
((__t = ( letter )) == null ? '' : __t) +
'</a>\r\n\t\t\t\t</li>\r\n\t\t\t';
 }) ;
__p += '\r\n\t\t</ul>\r\n\t</div>\r\n</div>\r\n<div class="row">\r\n\t<div class="col-lg-24">\r\n\t\t<ul class="list-unstyled geo-list responsive-cols">\r\n\t\t\t';
 _.each(props.places, function(place){ ;
__p += '\r\n\t\t\t\t<li class="list-' +
((__t = ( place.name.charAt(0) )) == null ? '' : __t) +
'" data-initial="' +
((__t = ( place.name.charAt(0) )) == null ? '' : __t) +
'">\r\n\t\t\t\t\t<a href="' +
((__t = ( place.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( place.name )) == null ? '' : __t) +
'\r\n\t\t\t\t</li>\r\n\t\t\t';
 }) ;
__p += '\r\n\t\t</ul>\r\n\t</div>\r\n</div>';

}
return __p
}