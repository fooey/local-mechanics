module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (props, JSON) {
buf.push("<div id=\"browse\" class=\"city\"><div class=\"row\"><div class=\"col-lg-24\"><header><h1 class=\"pageTitle\">" + (jade.escape(null == (jade_interp = props.pageTitle) ? "" : jade_interp)) + "</h1></header><div class=\"alert alert-info\"><p class=\"description\">" + (jade.escape(null == (jade_interp = props.description) ? "" : jade_interp)) + "</p></div></div></div><div class=\"row\"><div class=\"col-sm-6\">" + (null == (jade_interp = props.optionsHtml) ? "" : jade_interp) + "</div><div class=\"col-sm-18\">" + (null == (jade_interp = props.placesHtml) ? "" : jade_interp) + "</div></div><script>var browseConfig = " + (((jade_interp = JSON.stringify(props.browseConfig)) == null ? '' : jade_interp)) + ";</script></div>");}.call(this,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined,"JSON" in locals_for_with?locals_for_with.JSON:typeof JSON!=="undefined"?JSON:undefined));;return buf.join("");
}