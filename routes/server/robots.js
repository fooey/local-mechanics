'use strict';

const _ = require('lodash')


module.exports = function(app, req, res, next) {
	var robots = [];
	robots.push('# ' + req.headers.host);

	var devmode = (app.get('env') === 'development' && _.has(req.query, 'dev'))
		? true
		: false;


	if (req.headers.host === 'local-mechanics.com' || devmode) {
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /api/');
		robots.push('');
	}
	else {
		robots.push('# Non-canonical domain');
		robots.push('# Use http://local-mechanics.com');
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /');
		robots.push('');
	}
	
	res.end(robots.join('\n'));
};