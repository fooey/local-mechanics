module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (props, Math, numCols) {
var numStates = props.states.length;
var perCol = Math.ceil(numStates / numCols);
var colClasses = [];
colClasses.push('col-md-' + Math.ceil(24/numCols).toString());
buf.push("");
var pos = 0;
buf.push("<div class=\"stateCols row\">");
while (pos < numStates)
{
var colStates = props.states.slice(pos, pos += perCol);
buf.push("<div" + (jade.cls([colClasses], [true])) + "><ul class=\"nav nav-list\">");
// iterate colStates
;(function(){
  var $$obj = colStates;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var state = $$obj[$index];

buf.push("<li><a" + (jade.attr("href", state.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = state.name) ? "" : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var state = $$obj[$index];

buf.push("<li><a" + (jade.attr("href", state.getLink(), true, false)) + ">" + (jade.escape(null == (jade_interp = state.name) ? "" : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
}
buf.push("</div>");}.call(this,"props" in locals_for_with?locals_for_with.props:typeof props!=="undefined"?props:undefined,"Math" in locals_for_with?locals_for_with.Math:typeof Math!=="undefined"?Math:undefined,"numCols" in locals_for_with?locals_for_with.numCols:typeof numCols!=="undefined"?numCols:undefined));;return buf.join("");
}