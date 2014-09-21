var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<!DOCTYPE html> <html lang=en> <head> <meta charset=utf-8> <title>' +
((__t = ( props.meta.title )) == null ? '' : __t) +
'</title> <meta name=description itemprop=description content="' +
((__t = ( props.meta.description )) == null ? '' : __t) +
'"> <meta name=viewport content="width=device-width,initial-scale=1"> <meta itemprop=isFamilyFriendly content=true> <meta itemprop=inLanguage content=en-US> <link rel=apple-touch-icon href=/img/car.svg> <link rel="shortcut icon" href=/img/car.svg itemprop=image> <link rel=stylesheet href=http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.css> <link rel=stylesheet href="http://fonts.googleapis.com/css?family=Open+Sans+Condensed:300|Raleway:400,700|Lato:100,300,400,700,900,100italic,300italic,400italic,700italic,900italic|Source+Sans+Pro:400,700"> <link rel=stylesheet href="/dist/css/app' +
((__t = ( (props.isProd) ? '.min': '' )) == null ? '' : __t) +
'.css"> ';
 if (props.appendToHead && _.isArray(props.appendToHead)) { ;
__p += ' ' +
((__t = ( props.appendToHead.join('\n') )) == null ? '' : __t) +
' ';
 } ;
__p += ' </head> <body> <nav class="navbar navbar-default"> <div class=navbar-header> <a href="/" class=navbar-brand> <img src=/img/car.white.svg width=18 height=18> Local Mechanics </a> </div> </nav> <div id=loading class="navbar navbar-default hidden"> <div class=progress><div class="progress-bar progress-bar-striped active"></div></div> </div> <div id=content class=container>' +
((__t = ( props.contentHtml )) == null ? '' : __t) +
'</div> <script src=https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/velocity/0.11.9/jquery.velocity.min.js></script> <script src=https://cdn.rawgit.com/julianshapiro/velocity/master/velocity.ui.min.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/js/bootstrap.min.js></script>  <script src=https://cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js></script> <script src=https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js></script> <script src="/dist/js/client' +
((__t = ( (props.isProd) ? '.min': '' )) == null ? '' : __t) +
'.js"></script>  ';
 if (props.appendToBody && _.isArray(props.appendToBody)) { ;
__p += ' ' +
((__t = ( props.appendToBody.join('\n') )) == null ? '' : __t) +
' ';
 } ;
__p += ' </body> </html>';

}
return __p
}