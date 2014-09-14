var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 
	var numeral = require('numeral');
 ;
__p += ' <div id=options> <h4 class="meta text-center"> ' +
__e( numeral(props.appState.totalHits).format('0,0') ) +
' Results &mdash; Page ' +
__e( props.appState.page ) +
' of ' +
__e( props.appState.numPages ) +
' </h4> ' +
((__t = ( props.render('/browse/options/offers', {
		has_offers: props.appState.has_offers,
		getLink: props.appState.getLink,
	}) )) == null ? '' : __t) +
' ' +
((__t = ( props.render('/browse/options/radius', {
		radius: props.appState.radius,
		getLink: props.appState.getLink,
	}) )) == null ? '' : __t) +
' ' +
((__t = ( props.render('/browse/options/rpp', {
		rpp: props.appState.rpp,
		getLink: props.appState.getLink,
	}) )) == null ? '' : __t) +
' ' +
((__t = ( props.render('/browse/options/sort', {
		sort: props.appState.sort,
		getLink: props.appState.getLink,
	}) )) == null ? '' : __t) +
' <ul class="sorts list-inline"></ul> <ul class="radius list-inline"></ul> <ul class="rpp list-inline"></ul>   </div>';

}
return __p
}