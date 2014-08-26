module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (props) {
buf.push("<div id=\"places\">");
if ( props.places.length)
{
// iterate props.places
;(function(){
  var $$obj = props.places;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var place = $$obj[$index];

buf.push(null == (jade_interp = props.renderPlace({place: place})) ? "" : jade_interp);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var place = $$obj[$index];

buf.push(null == (jade_interp = props.renderPlace({place: place})) ? "" : jade_interp);
    }

  }
}).call(this);

}
else
{
buf.push("<div class=\"alert alert-warning\"><h1>No Results</h1><p>Try a bigger search radius, or check somewhere else in <a" + (jade.attr("href", props.browseConfig.city.state.getLink(), true, false)) + " class=\"alert-link\">" + (jade.escape(null == (jade_interp = props.browseConfig.city.state.name) ? "" : jade_interp)) + "</a></p></div>");
}
buf.push("</div>");}.call(this,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined));;return buf.join("");
}