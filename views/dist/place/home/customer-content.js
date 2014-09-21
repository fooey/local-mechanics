var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var customerContent = props.customerContent;
;

 if (
		customerContent
		&& customerContent.customer_message
		&& !_.isEmpty(customerContent.customer_message)
		&& !_.isEmpty(customerContent.customer_message.value)
) { ;


		var customerMessage = customerContent.customer_message;
		var customerBullets = customerContent.bullets;

		var messageContent = customerMessage.value.replace(/\\n/gi, String.fromCharCode(13, 10));
	;
__p += ' <div id=customer-content class=well> ';
 if (customerMessage && messageContent && !_.isEmpty(messageContent)) { ;
__p += ' <div id=customer_message itemprop=description> <p>' +
__e( messageContent ) +
'</p> </div> ';
 } ;
__p += ' ';
 if (customerBullets && !_.isEmpty(customerBullets)) { ;
__p += ' <ul id=customer_bullets> ';
 _.each(customerBullets, function(bullet){ ;
__p += ' <li>' +
__e( bullet ) +
'</li> ';
 }); ;
__p += ' </ul> ';
 } ;
__p += ' <div class=content-attribution> Content provided by <a href="' +
((__t = ( customerMessage.attribution_url )) == null ? '' : __t) +
'"> ';
 if (!_.isEmpty(customerMessage.attribution_logo)) { ;
__p += ' <img src="' +
((__t = ( customerMessage.attribution_logo )) == null ? '' : __t) +
'" alt="' +
__e( customerContent.attribution_text ) +
'"> ';
 } else { ;
__p += ' <span class=text>' +
__e( customerMessage.attribution_text ) +
'</span> ';
 } ;
__p += ' </a> </div> </div> ';
 } ;


}
return __p
}