'use strict';

var _ = require('lodash');

//var /*global*/require = require('..//*global*/require');
var $ = /*global*/require('jquery');

var templates = require('../../views/dist');
var libTemplates = require('../templates');
var templateRenderer = libTemplates(templates);

var currentPage;
var $pager;

var bbModel;


module.exports = function(model){
	bbModel = model;
	console.log('lib:client:pager');

	writePager();
}

function writePager() {
	console.log('lib:client:pager:writePager');
	$('.pager').replaceWith(getPager);
}


function getPager(){
	var html = templateRenderer('/util/pager', {});
	console.log('lib:client:pager:getPager'/*, html*/);
	return $(html).on('click', 'a', onClick);
}


function onClick(e){
	e.preventDefault();

	bbModel.set('page', $(this).data('page'));
}