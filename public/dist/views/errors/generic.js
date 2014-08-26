module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (props) {
buf.push("<div id=\"error\"><div class=\"row\"><div class=\"col-lg-24\"><header><h1 class=\"pageTitle\">" + (jade.escape(null == (jade_interp = props.pageTitle) ? "" : jade_interp)) + "</h1></header><p class=\"description\">" + (jade.escape(null == (jade_interp = props.description) ? "" : jade_interp)) + "</p></div></div></div>");}.call(this,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined));;return buf.join("");
}