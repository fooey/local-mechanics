var _ = require('lodash');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {


	var breakpoints = [
		{size: 'xs', gap: 1},
		{size: 'sm', gap: 2},
		{size: 'md', gap: 5},
		{size: 'lg', gap: 7},
	];


	var getLink = function(pageNum) {
		return props.getLink({
			call_id: props.call_id,
			page: pageNum,
		});
	};

	var getGap = function(pageNum) {
		return Math.abs(pageNum - props.page);
	}

	var getClass = function(pageNum, gap) {
		var className = [];

		if (pageNum == props.page) {
			className.push('active');
		}

		if (pageNum !== 1 && pageNum !== props.numPages && pageNum !== props.page) {

			_.each(breakpoints, function(bp) {
				if (gap <= bp.gap) {
					className.push('visible-' + bp.size + '-inline');
				}
			});

			if (className.length === 0) {
				className.push('hide');
			}
		}
		
		return className.join(' ');
	}

	var getDividerClass = function(pageNum, gap) {
		var className = [];

		_.each(breakpoints, function(bp) {
			if (gap > bp.gap) {
				className.push('visible-' + bp.size + '-inline');
			}
		});

		if (className.length === 0) {
			className.push('hide');
		}

		return className.join(' ');
	}
;
__p += ' <div class=responsive-pagination> <ul class=pagination> <li class="' +
((__t = ( (props.page <= 1) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a href="' +
((__t = ( getLink(Math.max(1, props.page - 1)) )) == null ? '' : __t) +
'"> <i class="fa fa-angle-left"></i> </a> </li> ';
 for(var ixPage = 1; ixPage <= props.numPages; ixPage++) { ;
__p += ' ';
 var gap = getGap(ixPage) ;
__p += ' ';
 if (ixPage === 2) { ;
__p += ' <li class="' +
((__t = ( getDividerClass(ixPage, gap) )) == null ? '' : __t) +
'"><span>&hellip;</span></li> ';
 } ;
__p += ' <li class="' +
((__t = ( getClass(ixPage, gap) )) == null ? '' : __t) +
'"> <a href="' +
((__t = ( getLink(ixPage) )) == null ? '' : __t) +
'">' +
((__t = ( ixPage )) == null ? '' : __t) +
'</a> </li> ';
 if (props.numPages > 3 && ixPage === props.numPages - 1) { ;
__p += ' <li class="' +
((__t = ( getDividerClass(ixPage, gap) )) == null ? '' : __t) +
'"><span>&hellip;</span></li> ';
 } ;
__p += ' ';
 } ;
__p += ' <li class="' +
((__t = ( (props.page >= props.numPages) ? 'disabled' : '' )) == null ? '' : __t) +
'"> <a href="' +
((__t = ( getLink(Math.min(props.numPages, props.page + 1)) )) == null ? '' : __t) +
'"> <i class="fa fa-angle-right"></i> </a> </li> </ul> </div>';

}
return __p
}