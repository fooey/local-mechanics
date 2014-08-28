var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 var alpha = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',') ;
__p += '<div class=row><div class=col-lg-24><ul class="nav nav-tabs responsive-col-tabs"><li class=active><a>All</a></li>';
 _.each(alpha, function(letter){ ;
__p += '<li class="tab-' +
((__t = ( letter )) == null ? '' : __t) +
'"><a>' +
((__t = ( letter )) == null ? '' : __t) +
'</a></li>';
 }) ;
__p += '</ul></div></div><div class=row><div class=col-lg-24><ul class="list-unstyled geo-list responsive-cols">';
 _.each(props.places, function(place){ ;
__p += '<li class="list-' +
((__t = ( place.name.charAt(0) )) == null ? '' : __t) +
'" data-initial="' +
((__t = ( place.name.charAt(0) )) == null ? '' : __t) +
'"><a href="' +
((__t = ( place.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( place.name )) == null ? '' : __t) +
'</a></li>';
 }) ;
__p += '</ul></div></div>';

}
return __p
}