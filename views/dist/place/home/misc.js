var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var moment = require('moment');

	var business_hours = props.business_hours;
	var business_operation_status = props.business_operation_status;
	var parking = props.parking;
	var years_in_business = props.years_in_business;
	var markets = props.markets;

	if (_.isNumber(years_in_business)) {
		var foundingDate = (moment().get('year') - years_in_business);
	}


	var last_update_time = moment(props.last_update_time);
;
__p += ' <dl> ';
 if (!_.isEmpty(business_hours)) { ;
__p += ' <dt>Business Hours</dt> <dd itemprop=openingHours style="white-space: pre-wrap">' +
__e( business_hours ) +
'</dd> ';
 } ;
__p += ' ';
 if (!_.isEmpty(business_operation_status)) { ;
__p += ' <dt>Business Operation Status</dt> <dd>' +
__e( business_operation_status ) +
'</dd> ';
 } ;
__p += ' ';
 if (!_.isEmpty(parking)) { ;
__p += ' <dt>Parking</dt> <dd>' +
__e( parking ) +
'</dd> ';
 } ;
__p += ' ';
 if (!_.isEmpty(years_in_business) || _.isNumber(years_in_business)) { ;
__p += ' <dt>Years In Business</dt> ';
 if (_.isNumber(years_in_business)) { ;
__p += ' <dd itemprop=foundingDate content="' +
__e( foundingDate ) +
'"> ';
 } else { ;
__p += ' </dd><dd> ';
 } ;
__p += ' ' +
__e( years_in_business ) +
' </dd> ';
 } ;
__p += ' ';
 if (last_update_time.isValid()) { ;
__p += ' <dt>Last Updated</dt> <dd itemprop=foundingDate content="' +
__e( last_update_time.format() ) +
'">' +
__e( last_update_time.format('MMMM Do, YYYY') ) +
'</dd> ';
 } ;
__p += ' ';
 if(markets && _.isArray(markets) && !_.isEmpty(markets)) { ;
__p += ' <dt>Service Area</dt> ';
 _.each(markets, function(market) { ;
__p += ' <dd itemprop=areaServed>' +
__e( market ) +
'</dd> ';
 }) ;
__p += ' ';
 } ;
__p += ' </dl>';

}
return __p
}