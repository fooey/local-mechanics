'use strict';

module.exports = (new ProgressBar());


function ProgressBar(){
	var self = this;
	var $container = $('#nav-progress');
	var $bar = $container.find('.progress-bar');


	self.init = function() {
		self.tasksComplete = 0;
		self.numTasks = 0;

		$bar.trigger('init');

		// console.log('progressBar::init()', self.tasksComplete, self.numTasks);
		return self;
	}

	self.done = function() {
 		self.tasksComplete = self.numTasks;

		$bar.trigger('done');
		// console.log('progressBar::done()', self.tasksComplete, self.numTasks);
	}


	self.addTask = function() {
		self.numTasks++;
		$bar.trigger('addTask');
		// console.log('progressBar::addTask()', self.tasksComplete, self.numTasks);
	}

	self.taskComplete = function() {
		self.tasksComplete++;
		$bar.trigger('taskComplete');
		// console.log('progressBar::taskComplete()', self.tasksComplete, self.numTasks);
	}


	self.getCompletion = function() {
		// console.log('getCompletion()', self.tasksComplete, self.numTasks, self.tasksComplete / self.numTasks);
		var completion = self.tasksComplete / self.numTasks;

		completion = (!_.isNaN(completion)) ? completion * 100 : 0;

		return completion;
	}

	self.getCompletionInt = function() {
		return Math.round(self.getCompletion());
	}



	/*
	*	DOM Behavior
	*/

	$bar.on('init', function(){
		// console.log('progressBar::init');

		$container.addClass('notransition');
		$bar.addClass('notransition');

		$bar
			.css({width: 0})
			// .text('')
			.data('pct', 0);

		$container.stop().fadeIn(10, function(){
			$container.removeClass('notransition');
			$bar.removeClass('notransition');
		});
	});

	$bar.on('done', function(){
		// console.log('progressBar::done');

		$bar
			.css({width: '100%'})
			// .text('100%')
			.data('pct', 100);

		setTimeout($container.stop().fadeOut.bind($container, 'fast'), 400);

		$bar.off();
	});


	$bar.on('addTask taskComplete', function(){
		var pct =  self.getCompletionInt(self.pctComplete);
		var curPct = _.parseInt($bar.data('pct'));

		// console.log('progressBar::main trigger', self.tasksComplete, self.numTasks);
		// console.log(pct, curPct);

		// don't allow progress bar to retreat
		pct = Math.max(pct, curPct);

		$bar
			.css({width: pct + '%'})
			// .text(pct + '%')
			.data('pct', pct);
	});


	return self.init();
}