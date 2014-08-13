'use strict';


module.exports = function(app, req, res, next) {
	var robots = [];
	robots.push('# ' + req.headers.host);

	var devmode = (app.get('env') === 'development' && req.query.hasOwnProperty('dev'))
		? true
		: false;


	if (req.headers.host === 'local-dialysis.com' || devmode) {
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /api/');
		robots.push('');


		robots.push('');
		robots.push('Sitemap: http://local-dialysis.com/sitemaps/geo');
		robots.push('Sitemap: http://local-dialysis.com/sitemaps/providers');
		robots.push('');
	}
	else {
		robots.push('# Non-canonical domain');
		robots.push('# Use http://local-dialysis.com');
		robots.push('');
		robots.push('User-agent: *');
		robots.push('Disallow: /');
		robots.push('');
	}
	
	res.end(robots.join('\n'));
};