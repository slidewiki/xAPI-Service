/*
These are routes as defined in https://docs.google.com/document/d/1337m6i7Y0GPULKLsKpyHR4NRzRwhoxJnAZNnDFCigkc/edit#
Each route implementes a basic parameter/payload validation and a swagger API documentation description
*/
'use strict';

const Joi = require('joi'),
  handlers = require('./controllers/handler');

module.exports = function(server) {
  //Get slide with id id from database and return it (when not available, return NOT FOUND). Validate id
  server.route({
    method: 'GET',
    path: '/launch/{id}',
    handler: handlers.launchContent,
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().lowercase().required().description('Slidewiki deck id')
        },
        query: {
          endpoint: Joi.string().optional(),
          auth: Joi.string().alphanum().optional(),
          actor: Joi.string().optional(),
          registration: Joi.string().optional(),
          activity_id: Joi.string().optional(),
          activity_platform: Joi.string().optional(),
          'Accept-Language' : Joi.string().optional(),
          grouping: Joi.string().optional()
        }
      },
      tags: ['api'],
      description: 'Launch the given deck from a tincan.xml specification.'
    }
  });

  server.route({
    method: 'GET',
    path: '/getTinCanPackage/{id}',
    handler: handlers.getTinCanPackage,
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().lowercase().required().description('Slidewiki deck id')
        },
        query: {
          format: Joi.string().valid('xml' ,'zip').required().default('xml').description('Required format.'),//,
          offline: Joi.string().valid('true', 'false').description('Include deck content for offline use. Default is false').optional()//Joi.boolean().description('Include deck content for offline use. Default is false').optional()
        }
      },
      tags: ['api'],
      description: 'Get a TinCan API launch package containing the given deck.'
    }
  });

};
