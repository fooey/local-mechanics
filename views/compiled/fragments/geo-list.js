templates['/fragments/geo-list'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (places) {
var alpha = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',');
buf.push("<div class=\"row\"><div class=\"col-lg-24\"><ul class=\"nav nav-tabs responsive-col-tabs\"><li class=\"active\"><a>All</a></li>");
// iterate alpha
;(function(){
  var $$obj = alpha;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var letter = $$obj[$index];

buf.push("<li" + (jade.cls(["tab-" + letter], [true])) + "><a>" + (jade.escape(null == (jade_interp = letter) ? "" : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var letter = $$obj[$index];

buf.push("<li" + (jade.cls(["tab-" + letter], [true])) + "><a>" + (jade.escape(null == (jade_interp = letter) ? "" : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div><div class=\"row\"><div class=\"col-lg-24\"><ul class=\"list-unstyled geo-list responsive-cols\">");
// iterate places
;(function(){
  var $$obj = places;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var place = $$obj[$index];

buf.push("<li" + (jade.attr("data-initial", place.name.charAt(0), true, false)) + (jade.cls(["list-" + place.name.charAt(0)], [true])) + "><a" + (jade.attr("href", place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.name) ? "" : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var place = $$obj[$index];

buf.push("<li" + (jade.attr("data-initial", place.name.charAt(0), true, false)) + (jade.cls(["list-" + place.name.charAt(0)], [true])) + "><a" + (jade.attr("href", place.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = place.name) ? "" : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div>");}("places" in locals_for_with?locals_for_with.places:typeof places!=="undefined"?places:undefined));;return buf.join("");
}