'use strict';

const boom = require('boom');
const lrsService = require('../services/lrs');

module.exports = {

  processActivity: function(request, reply) {
    request.log('started', request.payload);

    // it's an array
    let activities = request.payload;
    activities.reduce((p, act) => {
      return p.then(() => {
        return lrsService.saveActivity(act);
      });

    }, Promise.resolve())
    .then((res) => {
      request.log('finished', res);
      reply();
    })
    .catch((err) => {
      request.log('error', err);
      if (!err.isBoom) err = boom.badImplementation();

      reply(err);
    });

  },

};

