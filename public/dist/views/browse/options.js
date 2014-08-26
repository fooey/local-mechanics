module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (JSON, props) {
buf.push("<div id=\"options\" class=\"well well-sm\"><h1>options</h1><pre>" + (jade.escape(null == (jade_interp = JSON.stringify(props.browseConfig, null, '\t')) ? "" : jade_interp)) + "</pre></div>");}.call(this,"JSON" in locals_for_with?locals_for_with.JSON:typeof JSON!=="undefined"?JSON:undefined,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined));;return buf.join("");
}