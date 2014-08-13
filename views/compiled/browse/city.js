templates['/browse/city'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pageTitle, description, places, renderPlace) {
buf.push("<div id=\"browse\"><div class=\"row\"><div class=\"col-lg-24\"><header><h1 class=\"pageTitle\">" + (jade.escape(null == (jade_interp = pageTitle) ? "" : jade_interp)) + "</h1></header><p class=\"description\">" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "</p></div></div><div class=\"row\"><div class=\"col-lg-24\"><div id=\"list\">");
// iterate places
;(function(){
  var $$obj = places;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var place = $$obj[$index];

buf.push(null == (jade_interp = renderPlace({place: place})) ? "" : jade_interp);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var place = $$obj[$index];

buf.push(null == (jade_interp = renderPlace({place: place})) ? "" : jade_interp);
    }

  }
}).call(this);

buf.push("</div></div></div></div>");}("pageTitle" in locals_for_with?locals_for_with.pageTitle:typeof pageTitle!=="undefined"?pageTitle:undefined,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined,"places" in locals_for_with?locals_for_with.places:typeof places!=="undefined"?places:undefined,"renderPlace" in locals_for_with?locals_for_with.renderPlace:typeof renderPlace!=="undefined"?renderPlace:undefined));;return buf.join("");
}