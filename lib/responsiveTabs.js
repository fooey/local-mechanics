
var globalRequire = require('./globalRequire');
var $ = globalRequire('jquery');
var async = globalRequire('async');

var responsiveMin = 10;


module.exports = function(){
	var $responsiveCols = $('ul.responsive-cols');
	var $responsiveColTabs = $('ul.responsive-col-tabs');

	if($responsiveCols.length && $responsiveColTabs.length) {
		var $tabs = $responsiveColTabs.find('li');
		var $items = $responsiveCols.find('li');
		var $links = $items.find('a');


		initTabs($tabs, $items);
		smartResponsive($items, $responsiveCols);

		$responsiveColTabs.on('click', 'a', function(e){
			e.preventDefault();
			var $tabAnchor = $(this);
			onTabClick($tabAnchor, $items, $responsiveCols);
			smartResponsive($items, $responsiveCols);
		});
	}
};





function initTabs($tabs, $items){
	// default tabs to disabled except the "All" tab
	$tabs.filter(':gt(0)').addClass('disabled');

	// enable tabs for which there is an associated list item
	async.forEach(
		$items,
		function(item, next){
			var initial = $(item).data('initial');
			var tabSelector = '.disabled.tab-' + initial;

			$tabs.filter(tabSelector).removeClass('disabled');
		}
	);
}



function smartResponsive($items, $responsiveCols){
	var numVisible = $items.filter(':visible').length;

	if (numVisible > responsiveMin) {
		$responsiveCols.addClass('responsive-cols');
	}
	else {
		$responsiveCols.removeClass('responsive-cols');
	}
}



function onTabClick($tabAnchor, $items, $responsiveCols){
	var $tab = $tabAnchor.closest('li');

	if($tab.hasClass('disabled')){
		return;
	}

	$responsiveCols.fadeOut(150, function(){
		var initial = $tabAnchor.text();
		$tab.addClass('active').siblings().removeClass('active');

		if (initial === 'All') {
			$items.show();
		}
		else {
			var selector = '.list-' + initial;

			$items
				.not(selector).hide().end()
				.filter(selector).show().end()
		}


		$responsiveCols.fadeIn(300);
	});

}