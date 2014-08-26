module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (props) {
if ( props.place)
{
buf.push("<div class=\"place\"><h2><a" + (jade.attr("href", props.place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = props.place.name) ? "" : jade_interp)) + "</a></h2><div class=\"row\"><div class=\"col-sm-12\"><address><div>" + (jade.escape(null == (jade_interp = props.place.address.street) ? "" : jade_interp)) + "</div><div><a" + (jade.attr("href", props.place.geo.city.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = props.place.geo.city.name) ? "" : jade_interp)) + "</a>, <a" + (jade.attr("href", props.place.geo.state.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = props.place.geo.state.abbr) ? "" : jade_interp)) + "</a> <span>" + (jade.escape(null == (jade_interp = props.place.geo.zip) ? "" : jade_interp)) + "</span></div></address>");
if ((props.place.has_offers))
{
buf.push("<div><span class=\"label label-danger\">Special Offers Available!</span></div>");
}
if ( props.place.tags && props.place.tags.length)
{
buf.push("<div>Primary Service: <ul class=\"list-inline\">");
// iterate props.place.tags.filter(function(tag){return tag.primary})
;(function(){
  var $$obj = props.place.tags.filter(function(tag){return tag.primary});
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var tag = $$obj[$index];

buf.push("<li>" + (jade.escape(null == (jade_interp = tag.name) ? "" : jade_interp)) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var tag = $$obj[$index];

buf.push("<li>" + (jade.escape(null == (jade_interp = tag.name) ? "" : jade_interp)) + "</li>");
    }

  }
}).call(this);

buf.push("</ul></div><div>Additional Services: <ul class=\"list-inline small\"><li>" + (null == (jade_interp = props.place.tags.filter(function(tag){return !tag.primary}).map(function(tag){return tag.name}).join('</li><li>')) ? "" : jade_interp) + "</li></ul></div>");
}
buf.push("<div><ul class=\"list-inline\"><li><a" + (jade.attr("href", props.place.getLink('reviews'), true, false)) + ">reviews</a></li><li><a" + (jade.attr("href", props.place.getLink('jobs'), true, false)) + ">jobs</a></li></ul></div></div><div class=\"col-sm-12 text-center\"><a" + (jade.attr("href", props.place.mapHref, true, false)) + "><img" + (jade.attr("src", props.place.getMapSrc('400x300'), true, false)) + "/></a></div></div></div>");
}
else
{
buf.push("<div class=\"place\"><h2>Error</h2></div>");
}}.call(this,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined));;return buf.join("");
}