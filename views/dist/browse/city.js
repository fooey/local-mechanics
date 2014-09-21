var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( props.render('/fragments/breadcrumbs', {
	crumbs: props.crumbs,
}) )) == null ? '' : __t) +
' <div id=browse class=city> <div class=row><div class=col-lg-24> <header> <h1 class=pageTitle>' +
((__t = ( props.pageTitle )) == null ? '' : __t) +
'</h1> </header> <div class="alert alert-info"> <p class=description>' +
((__t = ( props.description )) == null ? '' : __t) +
'</p> </div> </div></div> <div class=row> <div class="col-sm-8 col-md-8 col-md-6"> ' +
((__t = ( props.render('/browse/options', {
				appState: props.appState
			}) )) == null ? '' : __t) +
' </div> <div class="col-sm-16 col-md-16 col-lg-18"> <div class=top-pagination> ' +
((__t = ( props.render('/browse/options/pagination', {
					page: props.appState.page,
					numPages: props.appState.numPages,
					call_id: props.appState.call_id,
					getLink: props.appState.getLink,
				}) )) == null ? '' : __t) +
' </div> ' +
((__t = ( props.render('/browse/places', {
				places: props.places, 
				appState: props.appState}
			) )) == null ? '' : __t) +
' <div class=bottom-pagination> ' +
((__t = ( props.render('/browse/options/pagination', {
					page: props.appState.page,
					numPages: props.appState.numPages,
					call_id: props.appState.call_id,
					getLink: props.appState.getLink,
				}) )) == null ? '' : __t) +
' </div> <div class=attribution> <a href="http://www.citygrid.com/"> <span>Powered by</span> <img src=/img/citygrid.svg> </a> </div> </div> </div> </div>';

}
return __p
}