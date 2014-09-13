var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id=browse class=city> <div class=row><div class=col-lg-24> <header> <h1 class=pageTitle>' +
((__t = ( props.pageTitle )) == null ? '' : __t) +
'</h1> </header> <div class="alert alert-info"> <p class=description>' +
((__t = ( props.description )) == null ? '' : __t) +
'</p> </div> </div></div> <div class=row> <div class="col-sm-10 col-md-8 col-sm-push-14 col-md-push-16"> ' +
((__t = ( props.render('/browse/options', {appState: props.appState}) )) == null ? '' : __t) +
' </div> <div class="col-sm-14 col-md-16 col-sm-pull-10 col-md-pull-8"> ' +
((__t = ( props.render('/browse/places', {places: props.places, appState: props.appState}) )) == null ? '' : __t) +
' </div> </div> </div>';

}
return __p
}