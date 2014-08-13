templates['/layout'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (meta, isProd, content) {
buf.push("<!DOCTYPE html><html lang=\"en\"><head><meta charSet=\"utf-8\"><title>" + (jade.escape(null == (jade_interp = meta.title) ? "" : jade_interp)) + "</title><meta name=\"description\" itemProp=\"description\"" + (jade.attr("content", '' + (meta.description) + '', true, true)) + "><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta itemProp=\"isFamilyFriendly\" content=\"true\"><meta itemProp=\"inLanguage\" content=\"en-US\"><link rel=\"apple-touch-icon\" href=\"/img/car.png\"><link rel=\"shortcut icon\" href=\"/img/car.png\" itemProp=\"image\"><link rel=\"stylesheet\" type=\"text/css\" href=\"http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.css\"><link rel=\"stylesheet\" type=\"text/css\" href=\"http://fonts.googleapis.com/css?family=Open+Sans+Condensed:300|Raleway:400,700|Lato:100,300,400,700,900,100italic,300italic,400italic,700italic,900italic|Source+Sans+Pro:400,700\">");
if ( isProd)
{
buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"/dist/css/app.min.css\">");
}
else
{
buf.push("<link rel=\"stylesheet\" type=\"text/css\" href=\"/dist/css/app.css\">");
}
buf.push("</head><body><nav class=\"navbar navbar-default\"><div class=\"navbar-header\"><a href=\"/\" class=\"navbar-brand\"><img src=\"/img/car.white.32.png\" width=\"32\" height=\"32\">Local Mechanics</a></div></nav><div id=\"nav-progress\"><div class=\"progress\"><div data-pct=\"0\" class=\"progress-bar progress-bar-striped active\"></div></div></div><div id=\"content\" class=\"container\">" + (null == (jade_interp = content) ? "" : jade_interp) + "</div><script src=\"//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js\"></script><script src=\"//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js\"></script><script src=\"//cdnjs.cloudflare.com/ajax/libs/async/0.9.0/async.js\"></script><script src=\"//cdnjs.cloudflare.com/ajax/libs/jade/1.3.1/runtime.min.js\"></script><script src=\"/dist/js/lib/page.js\"></script><script src=\"/views/compiled.min.js\"></script>");
if ( isProd)
{
buf.push("<script src=\"/dist/js/client.min.js\"></script>");
}
else
{
buf.push("<script src=\"/dist/js/client.js\"></script>");
}
buf.push("</body></html>");}("meta" in locals_for_with?locals_for_with.meta:typeof meta!=="undefined"?meta:undefined,"isProd" in locals_for_with?locals_for_with.isProd:typeof isProd!=="undefined"?isProd:undefined,"content" in locals_for_with?locals_for_with.content:typeof content!=="undefined"?content:undefined));;return buf.join("");
}