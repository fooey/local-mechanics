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
  '/fragments/states': require('./fragments/states'),
  '/browse/options/offers': require('./browse/options/offers'),
  '/browse/options/pager': require('./browse/options/pager'),
  '/browse/options/pagination': require('./browse/options/pagination'),
  '/browse/options/radius': require('./browse/options/radius'),
  '/browse/options/rpp': require('./browse/options/rpp'),
  '/browse/options/sort': require('./browse/options/sort')
};