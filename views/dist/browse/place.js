var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var numeral = require('numeral');
;

 if (!props.place) { ;
__p += ' <h2>Error!</h2> ';
 } else { ;
__p += ' <div class=place> <h2><a href="' +
((__t = ( props.place.getLink() )) == null ? '' : __t) +
'">' +
__e( props.place.name ) +
'</a></h2> <div class=row> <div class=col-sm-12> ';
 if(props.place.rating && _.isNumber(props.place.rating)) { ;
__p += ' <div class=rating> ' +
((__t = ( props.place.rating )) == null ? '' : __t) +
'<span> / 10 User Rating </span></div> ';
 } ;
__p += ' ';
 if(props.place.user_review_count) { ;
__p += ' <div class=reviewCount> ' +
((__t = ( props.place.user_review_count )) == null ? '' : __t) +
' User Reviews </div> ';
 } ;
__p += ' <address> <div>' +
((__t = ( props.place.address.street )) == null ? '' : __t) +
'</div> ';
 if(props.place.geo) { ;
__p += ' <div> <a href="' +
((__t = ( props.place.geo.city.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.city.name )) == null ? '' : __t) +
'</a>, <a href="' +
((__t = ( props.place.geo.state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.place.geo.state.name )) == null ? '' : __t) +
'</a>  </div> ';
 } else { ;
__p += ' <div> <span>' +
((__t = ( props.place.address.city )) == null ? '' : __t) +
', </span> <span>' +
((__t = ( props.place.address.state )) == null ? '' : __t) +
' </span> <span>' +
((__t = ( props.place.address.postal_code )) == null ? '' : __t) +
'</span> </div> ';
 } ;
__p += ' </address> ';
 if (props.place.has_offers) { ;
__p += ' <div class=offers> <span class="label label-danger">Special Offers Available!</span> </div> ';
 } ;
__p += ' ';
 if (props.place.tags && props.place.tags.length) { ;
__p += ' <div class=services> ';
 var primaryService = _.filter(props.place.tags, function(tag){return tag.primary}) ;
__p += ' ';
 if (primaryService.length) { ;
__p += ' <div class=primary> <h4>Primary Service:</h4> <ul class=list-unstyled> ';
 _.each(primaryService, function(tag) { ;
__p += ' <li>' +
__e( tag.name ) +
'</li> ';
 }) ;
__p += ' </ul> </div> ';
 } ;
__p += ' ';
 var additionalServices = _.filter(props.place.tags, function(tag){return !tag.primary}) ;
__p += ' ';
 if (additionalServices.length) { ;
__p += ' <div class=additional> <h4>Additional Services: </h4> <ul class=list-unstyled> ';
 _.each(additionalServices, function(tag) { ;
__p += ' <li title="' +
__e( tag.name ) +
'">' +
__e( tag.name ) +
'</li> ';
 }) ;
__p += ' </ul> </div> ';
 } ;
__p += ' </div> ';
 } ;
__p += '  </div> <div class="col-sm-12 text-center">  <img src=http://nosrc.net/400x300> </div> </div> </div> ';
 } ;


}
return __p
}