var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id=places>';
 if (props.places.length) { ;
__p +=
((__t = ( _.map(props.places, function(place){
			return props.renderPlace({place: place})
		}) )) == null ? '' : __t);
 } else { ;
__p += '<div class="alert alert-warning"><h1>No Results</h1><p>Try a bigger search radius, or check somewhere else in <a class=alert-link href="' +
((__t = ( props.appState.city.state.getLink() )) == null ? '' : __t) +
'">' +
((__t = ( props.appState.city.state.name )) == null ? '' : __t) +
'</a></p></div>';
 } ;
__p += '</div>';

}
return __p
}