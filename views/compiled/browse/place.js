templates['/browse/place'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (place) {
if ( place)
{
buf.push("<div class=\"place panel panel-default\"><div class=\"panel-heading\"><h2><a" + (jade.attr("href", place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.name) ? "" : jade_interp)) + "</a></h2></div><div class=\"panel-body\"><address><div>" + (jade.escape(null == (jade_interp = place.address.street) ? "" : jade_interp)) + "</div><div><a" + (jade.attr("href", place.geo.city.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.geo.city.name) ? "" : jade_interp)) + "</a>, <a" + (jade.attr("href", place.geo.state.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.geo.state.abbr) ? "" : jade_interp)) + "</a> <span>" + (jade.escape(null == (jade_interp = place.geo.zip) ? "" : jade_interp)) + "</span></div></address><div><ul class=\"list-inline\"><li><a" + (jade.attr("href", place.getLink('reviews'), true, false)) + ">reviews</a></li><li><a" + (jade.attr("href", place.getLink('jobs'), true, false)) + ">jobs</a></li></ul></div></div></div>");
}
else
{
buf.push("<p>Error</p>");
}}("place" in locals_for_with?locals_for_with.place:typeof place!=="undefined"?place:undefined));;return buf.join("");
}