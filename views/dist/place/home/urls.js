var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var urls = props.urls;

	var urlsMeta = [
		{label: 'Profile', key: 'profile_url'},
		{label: 'Reviews', key: 'reviews_url'},
		{label: 'Video', key: 'video_url'},
		{label: 'Website', key: 'website_url'},
		{label: 'Menu', key: 'menu_url'},
		{label: 'Reservations', key: 'reservation_url'},
		{label: 'Map', key: 'map_url'},
		{label: 'Send To Friend', key: 'send_to_friend_url'},
		{label: 'E-Mail', key: 'email_link'},
		{label: 'Web Comment', key: 'web_comment_url'},
		{label: 'Web Article', key: 'web_article_url'},
		{label: 'Web Profile', key: 'web_profile_url'},
		{label: 'Web Rates', key: 'web_rates_url'},
		{label: 'Gift', key: 'gift_url'},
		{label: 'Request Quote', key: 'request_quote_url'},
		{label: 'Virtual Tour', key: 'virtual_tour_url'},
		{label: 'Book Limo', key: 'book_limo_url'},
		{label: 'Order', key: 'order_url'},

		/*
			{label: 'Custom', key: 'custom_link_1'},
			{label: 'Custom', key: 'custom_link_2'},
			{label: 'Custom', key: 'custom_link_3'},
			{label: 'Custom', key: 'custom_link_4'},
			{label: 'Custom Links', key: 'custom_links'},
		*/
	];

	urls.custom_links = urls.custom_links || [];
	urls.custom_links = urls.custom_links.concat([
		urls.custom_link_1,
		urls.custom_link_2,
		urls.custom_link_3,
		urls.custom_link_4,
	]);

	urls.custom_links = _.uniq(urls.custom_links)
	urls.custom_links = _.without(urls.custom_links, null);
;

 if (urls && _.isObject(urls) && !_.isEmpty(urls)) { ;
__p += ' <div id=place-urls> <ul class="nav nav-list"> ';
 _.each(urlsMeta, function(meta){ ;
__p += ' ';
 if (_.has(urls, meta.key) && !_.isEmpty(urls[meta.key])) { ;
__p += '  <li> <a itemprop=url href="' +
__e( urls[meta.key] ) +
'"> <i class="fa fa-external-link"></i> ' +
__e( meta.label ) +
' </a> </li> ';
 } ;
__p += ' ';
 }); ;
__p += ' ';
 _.each(urls.custom_links, function(link){ ;
__p += ' <li><a itemprop=url href="' +
__e( link ) +
'">' +
__e( link ) +
'</a></li> ';
 }); ;
__p += ' </ul> </div> ';
 } ;


}
return __p
}