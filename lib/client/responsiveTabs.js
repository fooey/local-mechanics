'use strict';

var $ = require('jquery');
var async = require('async');

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
		// console.log('lib:client:responsiveTabs');

		/*
		*	Init
		*/

		async.series([
			initTabs,
			smartResponsive.bind(null, $items.length),
		]);



		/*
		*	Behaviors
		*/

		$responsiveColTabs.on('click', 'a', onTabClick);
	}
}







/*
*	Private Methods
*/


function initTabs(fnCallback){
	// console.log('responsiveTabs:initTabs');

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



function onTabClick(e) {
	e.preventDefault();

	var $tabAnchor = $(this);
	var selectedTab = $tabAnchor.text();

	var $toShow = (selectedTab === 'All')
		? $items
		: $items.filter('.list-' + selectedTab);

	async.auto({
		'hide': function(fn){
			$responsiveCols.velocity('fadeOut', {duration: 50, complete: fn.bind(null, null)})
		},
		'setActiveTab': ['hide', setTab.bind(null, $tabAnchor)],
		'makeResponsive': ['hide', smartResponsive.bind(null, $toShow.length)],
		'toggleItems': ['makeResponsive', toggleItems.bind(null, $toShow)],
		'show': ['toggleItems',  function(fn){
			$responsiveCols.velocity('fadeIn', {duration: 300, complete: fn.bind(null, null)})
		}],
	}, function(err, result) {
		// console.log('tabclick complete');
	});
}



function smartResponsive(numVisible, fnCallback){
	// console.log('responsiveTabs:smartResponsive');

	if (numVisible > responsiveMin) {
		$responsiveCols.addClass('responsive-cols');
	}
	else {
		$responsiveCols.removeClass('responsive-cols');
	}

	fnCallback();
}



function setTab($tabAnchor, fnCallback){
	// console.log('responsiveTabs:setTab');
	var $tab = $tabAnchor.closest('li');

	if($tab.hasClass('disabled')){
		fnCallback('disabled');
	}
	else {
		$tab.addClass('active').siblings().removeClass('active');
		fnCallback();
	}
}



function toggleItems($toShow, fnCallback){
	// console.log('responsiveTabs:toggleItems');

	$toShow.show()
	$items.not($toShow).hide();

	fnCallback(null);
}