var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var name = props.name;
	var address = props.address;
	var geo = props.geo;
	var contact = props.contact_info;
;
__p += ' <div itemprop=location itemscope itemtype=http://schema.org/Place> <div itemprop=geo itemscope itemtype=http://schema.org/GeoCoordinates> <meta itemprop=latitude content="' +
__e( address.latitude ) +
'"> <meta itemprop=longitude content="' +
__e( address.longitude ) +
'"> </div> <address itemprop=address itemscope itemtype=http://schema.org/PostalAddress> <div itemprop=name>' +
__e( name ) +
'</div> <div itemprop=streetAddress>' +
__e( address.street ) +
'</div> ';
 if(geo) { ;
__p += ' <div> <a href="' +
__e( geo.city.getLink() ) +
'" itemprop=addressLocality>' +
__e( geo.city.name ) +
'</a>, <a href="' +
__e( geo.state.getLink() ) +
'" itemprop=addressRegion>' +
__e( geo.state.name ) +
'</a> <span itemprop=postalCode>' +
__e( geo.zip ) +
'</span> </div> ';
 } else { ;
__p += ' <div> <span>' +
__e( address.city ) +
', </span> <span>' +
__e( address.state ) +
' </span> <span>' +
__e( address.postal_code ) +
'</span> </div> ';
 } ;
__p += ' ';
 if(contact) { ;
__p += ' ';
 if(contact.display_phone && !_.isEmpty(contact.display_phone)) { ;
__p += ' <div itemprop=telephone>' +
__e( contact.display_phone ) +
'</div> ';
 } ;
__p += ' ';
 if(contact.display_url && !_.isEmpty(contact.display_url)) { ;
__p += ' <div class=url> <a href="' +
__e( contact.display_url ) +
'" itemprop=url>' +
__e( contact.display_url ) +
'</a> </div> ';
 } ;
__p += ' ';
 if(contact.social_media && !_.isEmpty(contact.social_media) && _.isObject(contact.social_media)) { ;
__p += ' ';
 tw = contact.social_media.twitter_username ;
__p += ' ';
 if(tw && !_.isEmpty(tw) && _.isObject(tw)) { ;
__p += ' <div class=twitter> <i class="fa fa-twitter"></i> <a href="' +
__e( tw.url ) +
'" itemprop=url>' +
__e( tw.text ) +
'</a> </div> ';
 } ;
__p += ' ';
 fb = contact.social_media.facebook_fanpage ;
__p += ' ';
 if(fb && !_.isEmpty(fb) && _.isObject(fb)) { ;
__p += ' <div class=facebook> <i class="fa fa-facebook-square"></i> <a href="' +
__e( fb.url ) +
'" itemprop=url>' +
__e( fb.text ) +
'</a> </div> ';
 } ;
__p += ' ';
 } ;
__p += ' ';
 } ;
__p += ' </address> </div>';

}
return __p
}