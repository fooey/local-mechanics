var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var moment = require('moment');

	String.prototype.trim = String.prototype.trim || function trim() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

	var reviewInfo = props.review_info;
	var reviews = _.map(reviewInfo.reviews, function(r) {
		r.review_text = cleanup(r.review_text);
		return r;
	});

	function cleanup(str) {
		var LF = String.fromCharCode(10);
		var _str = str;

		_str = _str.replace(/\\r/gi, '')
		_str = _str.replace(/\\n/gi, LF)
		_str = _str.trim()

		return _str;
	}
;
__p += ' <div id=reviews> ';
 if ((reviews && reviews.length) || (reviewInfo.overall_review_rating && _.isNumber(reviewInfo.overall_review_rating))) { ;
__p += ' <h3 class=section-header>User Reviews</h3> ';
 } ;
__p += ' ';
 if (reviewInfo.overall_review_rating && _.isNumber(reviewInfo.overall_review_rating)) { ;
__p += ' <h4 itemprop=aggregateRating itemscope itemtype=http://schema.org/AggregateRating> <meta itemprop=worstRating content=0> Average rating of <span itemprop=ratingValue>' +
__e( reviewInfo.overall_review_rating ) +
'</span> out of <span itemprop=bestRating>10</span> based on <span itemprop=reviewCount>' +
__e( reviewInfo.total_user_reviews ) +
'</span> user reviews </h4> ';
 } ;
__p += ' <ul> ';
 _.each(reviews, function(r) { ;
__p += ' <li title="Review provided by ' +
__e( r.attribution_text ) +
'" itemprop=review itemscope itemtype=http://schema.org/Review> <div class=review> <header> ';
 if (r.review_title && !_.isEmpty(r.review_title)) { ;
__p += ' <h5 class=review-title itemprop=headline> ' +
__e( r.review_title ) +
' </h5> ';
 } ;
__p += ' <div class=header-extra> ';
 if (r.helpfulness_total_count && _.isNumber(r.helpfulness_total_count)) { ;
__p += ' <meta itemprop=interactionCount content="' +
__e( r.helpfulness_total_count ) +
'"> ';
 } ;
__p += ' ';
 if (r.review_author && !_.isEmpty(r.review_author)) { ;
__p += ' <div class=author> Reviewed by <span itemprop=creator>' +
__e( r.review_author ) +
'</span> </div> ';
 } ;
__p += ' ';
 var reviewDate = moment(r.review_date) ;
__p += ' ';
 if (reviewDate.isValid()) { ;
__p += ' <span class=date><a href="' +
__e( r.review_url ) +
'"> Submitted on <span itemprop=dateCreated content="' +
__e( reviewDate.format() ) +
'">' +
__e( reviewDate.format('MMM DD YYYY') ) +
'</span> </a></span> ';
 } ;
__p += ' ';
 if (r.helpful_count && _.isNumber(r.helpful_count)) { ;
__p += ' <span class="helpful helpful-yes">' +
__e( r.helpful_count ) +
' <i class="fa fa-thumbs-o-up"></i></span> ';
 } ;
__p += ' ';
 if (r.unhelpful_count && _.isNumber(r.unhelpful_count)) { ;
__p += ' <span class="helpful helpful-no">' +
__e( r.unhelpful_count ) +
' <i class="fa fa-thumbs-o-down"></i></span> ';
 } ;
__p += ' ';
 if (r.review_rating && _.isNumber(r.review_rating)) { ;
__p += ' <div class=review-rating itemprop=reviewRating itemscope itemprop=http://schema.org/Rating> Rated <meta itemprop=worstRating content=0> <span itemprop=ratingValue>' +
__e( r.review_rating ) +
'</span> out of <span itemprop=bestRating>10</span> </div> ';
 } ;
__p += ' </div> </header> <div class=review-body itemprop=reviewBody>' +
__e( r.review_text ) +
'</div> </div> <div class=attribution> Review provided by <a href="' +
__e( r.attribution_url ) +
'">' +
__e( r.attribution_text ) +
'</a> </div> </li> ';
 }) ;
__p += ' </ul> </div>';

}
return __p
}