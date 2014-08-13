templates['/fragments/cities'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (places) {
buf.push("<div class=\"row\"><div class=\"col-lg-24\"><ul class=\"list-unstyled responsive-cols\">");
// iterate places
;(function(){
  var $$obj = places;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var place = $$obj[$index];

buf.push("<li><a" + (jade.attr("href", place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.name) ? "" : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var place = $$obj[$index];

buf.push("<li><a" + (jade.attr("href", place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.name) ? "" : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div>");}("places" in locals_for_with?locals_for_with.places:typeof places!=="undefined"?places:undefined));;return buf.join("");
}