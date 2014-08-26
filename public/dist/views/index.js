'use strict';
module.exports = {
  '/home': require('./home'),
  '/layout': require('./layout'),
  '/browse/city': require('./browse/city'),
  '/browse/options': require('./browse/options'),
  '/browse/place': require('./browse/place'),
  '/browse/places': require('./browse/places'),
  '/browse/state': require('./browse/state'),
  '/errors/generic': require('./errors/generic'),
  '/fragments/geo-list': require('./fragments/geo-list'),
  '/fragments/states': require('./fragments/states')
};