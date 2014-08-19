'use strict';

var globalRequire = require('../globalRequire');
var $ = globalRequire('jquery');
var async = globalRequire('async');

var responsiveMin = 10;


module.exports = init;



/*
*	Module 'Globals'
*/

var $responsiveColTabs;
var $tabs;

var $responsiveCols;
var $items;
var $links;

function init() {
	$responsiveColTabs = $('ul.responsive-col-tabs')
	$tabs = $responsiveColTabs.find('li');

	$responsiveCols = $('ul.responsive-cols');
	$items = $responsiveCols.find('li');
	$links = $items.find('a');

	if($responsiveCols.length && $responsiveColTabs.length) {

		/*
		*	Init
		*/

		async.series([
			initTabs,
			smartResponsive.bind(null, 'All'),
		]);



		/*
		*	Behaviors
		*/

		$responsiveColTabs.on('click', 'a', function(e){
			e.preventDefault();
			var $tabAnchor = $(this);

			async.series([
				setTab.bind(null, $tabAnchor),
				smartResponsive.bind(null, $tabAnchor.text()),
			]);
		});
	}
}







/*
*	Private Methods
*/

function initTabs(fnCallback){
	// default tabs to disabled except the "All" tab
	$tabs.filter(':gt(0)').addClass('disabled');

	// enable tabs for which there is an associated list item
	async.forEach(
		$items,
		function(item, next){
			var initial = $(item).data('initial');
			var tabSelector = '.disabled.tab-' + initial;

			$tabs.filter(tabSelector).removeClass('disabled');
		},
		fnCallback
	);
}



function smartResponsive(selectedTab, fnCallback){
	var numVisible = (selectedTab === 'All')
		? $items.length
		: $items.filter('.list-' + selectedTab).length;

	if (numVisible > responsiveMin) {
		$responsiveCols.addClass('responsive-cols');
	}
	else {
		$responsiveCols.removeClass('responsive-cols');
	}


	$responsiveCols.fadeIn(300, fnCallback);
}



function setTab($tabAnchor, fnCallback){
	var $tab = $tabAnchor.closest('li');

	$responsiveCols.fadeOut(150, function(){
		var initial = $tabAnchor.text();
		$tab.addClass('active').siblings().removeClass('active');

		if($tab.hasClass('disabled')){
			fnCallback(1);
		}

		if (initial === 'All') {
			$items.show();
		}
		else {
			var selector = '.list-' + initial;

			$items
				.not(selector).hide().end()
				.filter(selector).show().end()
		}


		fnCallback(null);
	});

}