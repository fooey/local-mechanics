templates['/fragments/geo-list-tabs'] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (alpha, String) {
buf.push("<div class=\"row\"><div class=\"col-lg-24\"><ul class=\"nav nav-tabs responsive-col-tabs\"><li><a>All</a></li>");
// iterate alpha
;(function(){
  var $$obj = alpha;
  if ('number' == typeof $$obj.length) {

    for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
      var letter = $$obj[key];

buf.push("<li" + (jade.cls([(letter) ? '' : 'disabled'], [true])) + "><a>" + (jade.escape(null == (jade_interp = String.fromCharCode(key)) ? "" : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var key in $$obj) {
      $$l++;      var letter = $$obj[key];

buf.push("<li" + (jade.cls([(letter) ? '' : 'disabled'], [true])) + "><a>" + (jade.escape(null == (jade_interp = String.fromCharCode(key)) ? "" : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div>");}("alpha" in locals_for_with?locals_for_with.alpha:typeof alpha!=="undefined"?alpha:undefined,"String" in locals_for_with?locals_for_with.String:typeof String!=="undefined"?String:undefined));;return buf.join("");
}