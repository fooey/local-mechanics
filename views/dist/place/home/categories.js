var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var categories = props.categories;

	var primary = _.where(categories, {primary:true});

	var additional = _
		.chain(categories)
		.map(function(c){
			if (c.parent === 'Global' && c.groups && c.groups.length && c.groups[0].name) {
				c.parent = c.groups[0].name;
			}
			return c;
		})
		.value();



	var roots = _
		.chain(categories)
		.filter(function(c){
			// only categories whose parent is not in the collection
			return !_.find(categories, {name: c.parent})
		})
		.map(function(c){
			if (c.parent === null) {
				return c.name;
			}
			else {
				return c.parent;
			}
		})
		.unique()
		.sort()
		.value();



	var getChildren = function(parentName, depth) {
		var depth = depth || 1;
		console.log(parentName)

		var children = _
			.chain(categories)
			.where({parent: parentName})
			.reject({name: parentName})
			.pluck('name')
			.value();

		if (children.length) {
			return '<dd><dl>'
				+ '<dt itemprop="makesOffer">' + parentName + '</dt>'
				+ _.map(children, getChildren).join('')
			+ '</dl></dd>';
		}
		else {
			return '<dd itemprop="makesOffer">' + parentName + '</dd>';
		}
	}

;

 if (categories && _.isArray(categories) && !_.isEmpty(categories)) { ;
__p += ' <h3 class=section-header>Categorization</h3> <div id=place-categories> <dl class=primary> <dt>Primary Focus</dt> ';
 _.each(primary, function(c) { ;
__p += ' <dd itemprop=makesOffer>' +
__e( c.name ) +
'</dd> ';
 }) ;
__p += ' </dl> <dl class=all> <dt>All Categories</dt> ' +
((__t = ( _.map(roots, getChildren).join('') )) == null ? '' : __t) +
' </dl>  </div> ';
 } ;


}
return __p
}