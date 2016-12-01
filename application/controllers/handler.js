/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  co = require('../common'),
  rp = require('request-promise'),
  zip = require('adm-zip'),
  Microservices = require('../configs/microservices');

module.exports = {
    launchContent: function(request, reply) {
      presentation_uri = Microservices.platform.uri + '/Presentation/' + request.params.id;
      return reply.redirect(presentation_uri);
    },
    getTinCanPackage: function(request, reply) {
      let template='<?xml version="1.0" encoding="utf-8" ?>\
                <tincan xmlns="http://projecttincan.com/tincan.xsd">\
                  <activities>\
                    <activity id="SLIDEWIKI_PRESENTATION_URL" type="http://adlnet.gov/expapi/activities/course">\
                      <name>SLIDEWIKI_TITLE</name>\
                      <description lang="en-US">SLIDEWIKI_DESCRIPTION</description>\
                      <launch lang="en-us">SLIDEWIKI_PRESENTATION_URL</launch>\
                    </activity>\
                  </activities>\
                </tincan>';
      let req_url = Microservices.deck.uri + '/deck/' + request.params.id + '/revisionCount';

      rp(req_url).then(function(body) {
        let revision_count=body;
        let req_url = Microservices.deck.uri + '/deck/' + request.params.id;
        rp(req_url).then(function(body) {
          let deck_metadata = JSON.parse(body);
          let description = deck_metadata.description;
          let revisions = deck_metadata.revisions;
          let title = '';
          for (let i = 0; i < revisions.length; i++) {
            if (revisions[i].id == revision_count) {
              title = revisions[i].title;
            }
          }
          let presentation_uri = Microservices.xapi.uri + '/launch/' + request.params.id; //Microservices.platform.uri + '/Presentation/' + request.params.id;
          template = template.replace(/SLIDEWIKI_PRESENTATION_URL/g, presentation_uri).replace(/SLIDEWIKI_TITLE/g, title).replace(/SLIDEWIKI_DESCRIPTION/g, description);
          if (request.query.format === 'xml') {
            let outputFilename = 'tincan.xml';
            reply(template).header('Content-Disposition', 'attachment; filename=' + outputFilename).header('Content-Type', 'application/xml');
          } else if (request.query.format === 'zip') {
            let zfile = new zip();
            zfile.addFile('tincan.xml', template);
            let buffer = zfile.toBuffer();
            let outputFilename = 'slidewiki-xapi-deck-' + request.params.id + '.zip';
            reply(buffer).header('Content-Disposition', 'attachment; filename=' + outputFilename).header('Content-Type', 'application/zip');
          }
        }).catch(function(error) {
          reply(boom.badImplementation());
        });
      }).catch(function(error) {
        reply(boom.badImplementation());
      });
    }
};
