var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<!DOCTYPE html>\r\n<html lang="en">\r\n\t<head>\r\n\t\t<meta charSet="utf-8">\r\n\r\n\t\t<title>' +
((__t = ( props.meta.title )) == null ? '' : __t) +
'</title>\r\n\t\t<meta name="description" itemProp="description" content="' +
((__t = ( props.meta.description )) == null ? '' : __t) +
'">\r\n\r\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n\t\t<meta itemProp="isFamilyFriendly" content="true">\r\n\t\t<meta itemProp="inLanguage" content="en-US">\r\n\t\t<link rel="apple-touch-icon" href="/img/car.png">\r\n\t\t<link rel="shortcut icon" href="/img/car.png" itemProp="image">\r\n\t\t<link rel="stylesheet" type="text/css" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.css">\r\n\t\t<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Open+Sans+Condensed:300|Raleway:400,700|Lato:100,300,400,700,900,100italic,300italic,400italic,700italic,900italic|Source+Sans+Pro:400,700">\r\n\r\n\t\t';
 if(props.isProd) { ;
__p += '\r\n\t\t\t<link rel="stylesheet" type="text/css" href="/dist/css/app.min.css">\r\n\t\t';
 } else { ;
__p += '\r\n\t\t\t<link rel="stylesheet" type="text/css" href="/dist/css/app.css">\r\n\t\t';
 } ;
__p += '\r\n\r\n\t</head>\r\n\t<body>\r\n\r\n\t\t<nav class="navbar navbar-default">\r\n\t\t\t<div class="navbar-header">\r\n\t\t\t\t<a href="/" class="navbar-brand">\r\n\t\t\t\t<img src="/img/car.white.32.png">Local Mechanics</a>\r\n\t\t\t</div>\r\n\t\t</nav>\r\n\r\n\t\t<div id="loading" class="navbar navbar-default hidden">\r\n\t\t\t<div class="progress"> \r\n\t\t\t\t<div class="progress-bar progress-bar-striped active"></div> \r\n\t\t\t</div> \r\n\t\t</div>\r\n\r\n\t\t<div id="content" class="container">' +
((__t = ( props.contentHtml )) == null ? '' : __t) +
'</div>\r\n\r\n\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.2/modernizr.min.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2.min.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/js/bootstrap.min.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.js"></script>\r\n\t\t<script src="//cdnjs.cloudflare.com/ajax/libs/jade/1.3.1/runtime.min.js"></script>\r\n\r\n\t\t';
 if(props.isProd) { ;
__p += '\r\n\t\t\t<script src="/dist/js/client.min.js"></script>\r\n\t\t';
 } else { ;
__p += '\r\n\t\t\t<script src="/dist/js/client.js"></script>\r\n\t\t';
 } ;
__p += '\r\n\t\t\r\n\t\t';
 if (props.exports){ ;
__p += '\r\n\t\t\t<script>_.assign(window, ' +
((__t = ( JSON.stringify(props.exports) )) == null ? '' : __t) +
');</script>\r\n\t\t';
 } ;
__p += '\r\n\t</body>\r\n</html>';

}
return __p
}