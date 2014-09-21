var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p +=
((__t = ( props.render('/fragments/breadcrumbs', {
	crumbs: props.crumbs,
}) )) == null ? '' : __t) +
' <div id=place itemscope itemtype=http://schema.org/AutomotiveBusiness> <header> <h1 class=pageTitle> <a href="' +
((__t = ( props.place.getLink() )) == null ? '' : __t) +
'" itemprop=url> <span itemprop=name>' +
__e( props.place.name ) +
'</span> </a> </h1> ';
 if (props.place.teaser && !_.isEmpty(props.place.teaser)) { ;
__p += ' <div class=teaser> <p>' +
__e( props.place.teaser ) +
'</p> </div> ';
 } ;
__p += ' </header> <div class=row> <div class=col-sm-24> ' +
((__t = ( props.render('/place/home/customer-content', {
				customerContent: props.place.customer_content,
			}) )) == null ? '' : __t) +
' </div> </div> <div class=row> <div class=col-sm-12> ' +
((__t = ( props.render('/place/home/address', {
				business_hours: props.place.business_hours,
				name: props.place.name,
				address: props.place.address,
				geo: props.place.geo,
				contact_info: props.place.contact_info,
			}) )) == null ? '' : __t) +
' </div> <div class=col-sm-12> ' +
((__t = ( props.render('/place/home/misc', {
				business_hours: props.place.business_hours,
				parking: props.place.parking,
				years_in_business: props.place.years_in_business,
				last_update_time: props.place.last_update_time,
				business_operation_status: props.place.business_operation_status,
				markets: props.place.markets,
			}) )) == null ? '' : __t) +
' </div> </div> <div class=row> <div class=col-sm-12> ' +
((__t = ( props.render('/place/home/urls', {
				urls: props.place.urls,
			}) )) == null ? '' : __t) +
' </div> <div class=col-sm-12> ' +
((__t = ( props.render('/place/home/categories', {
				categories: props.place.categories,
			}) )) == null ? '' : __t) +
' </div> </div> <div class=row> <div class=col-sm-24> ' +
((__t = ( props.render('/place/home/reviews', {
				name: props.place.name,
				review_info: props.place.review_info,
			}) )) == null ? '' : __t) +
' </div> </div> <div class=row> <div class=col-sm-24> ' +
((__t = ( props.render('/place/home/images', {
				images: props.place.images,
			}) )) == null ? '' : __t) +
' </div> </div>    </div>';

}
return __p
}