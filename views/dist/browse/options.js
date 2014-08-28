var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="options" class="well well-sm">\r\n\t<h1>Options</h1>\r\n\r\n\t<div class="meta"></div>\r\n\t<ul class="offers list-inline"></ul>\r\n\t<ul class="sorts list-inline"></ul>\r\n\t<ul class="radius list-inline"></ul>\r\n\t<ul class="rpp list-inline"></ul>\r\n\t<ul class="paging pagination"></ul>\r\n</div>';

}
return __p
}