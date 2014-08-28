var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="places">\r\n\t';
 if (props.places.length) { ;
__p += '\r\n\r\n\t\t' +
((__t = ( _.map(props.places, function(place){
			return props.renderPlace({place: place})
		}) )) == null ? '' : __t) +
'\r\n\r\n\t';
 } else { ;
__p += '\r\n\t\t<div class="alert alert-warning">\r\n\t\t\t<h1>No Results</h1>\r\n\t\t\t<p>\r\n\t\t\t\tTry a bigger search radius, or check somewhere else in \r\n\t\t\t\t<a class="alert-link" href="' +
((__t = ( props.browseConfig.city.state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.browseConfig.city.state.name )) == null ? '' : __t) +
'</a>\r\n\t\t\t</p>\r\n\t\t\t\r\n\t\t</div>\r\n\t';
 } ;
__p += '\r\n</div>';

}
return __p
}