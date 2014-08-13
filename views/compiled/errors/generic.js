templates['/errors/generic'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pageTitle, description) {
buf.push("<div id=\"error\"><div class=\"row\"><div class=\"col-lg-24\"><header><h1 class=\"pageTitle\">" + (jade.escape(null == (jade_interp = pageTitle) ? "" : jade_interp)) + "</h1></header><p class=\"description\">" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "</p></div></div></div>");}("pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined));;return buf.join("");
}