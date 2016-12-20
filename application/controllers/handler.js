/*
Handles the requests by executing stuff and replying to the client. Uses promises to get stuff done.
*/

'use strict';

const boom = require('boom'), //Boom gives us some predefined http codes and proper responses
  co = require('../common'),
  fs = require('fs'),
  rp = require('request-promise'),
  zip = require('adm-zip'),
  http = require('http'),
  Microservices = require('../configs/microservices');

module.exports = {
    launchContent: function(request, reply) {
      presentation_uri = Microservices.platform.uri + '/Presentation/' + request.params.id;
      return reply.redirect(presentation_uri);
    },
    getTinCanPackage: function(request, reply) {
      let offline = false;
      let format = 'xml';
      let id = 1;
      if (request.query) {
        offline = request.query.offline ? request.query.offline : false;
        format = request.query.format ? request.query.format : 'xml';
      }
      if (request.params) {
        id = request.params.id ? request.params.id : 1;
      }
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
      let req_url = Microservices.deck.uri + '/deck/' + id + '/revisionCount';

      rp(req_url).then(function(body) {
        let revision_count=body;
        let req_url = Microservices.deck.uri + '/deck/' + id;
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
          let presentation_uri = '';
          if (offline) {
            presentation_uri = 'index.html';
          } else {
            presentation_uri = Microservices.xapi.uri + '/launch/' + id; //Microservices.platform.uri + '/Presentation/' + id;
          }
          template = template.replace(/SLIDEWIKI_PRESENTATION_URL/g, presentation_uri).replace(/SLIDEWIKI_TITLE/g, title).replace(/SLIDEWIKI_DESCRIPTION/g, description);
          if (format === 'xml') {
            let outputFilename = 'tincan.xml';
            reply(template).header('Content-Disposition', 'attachment; filename=' + outputFilename).header('Content-Type', 'application/xml');
          } else if (format === 'zip') {
            let outputFilename = 'slidewiki-xapi-deck-' + id + '.zip';
            if (offline) {
              let zipURI = Microservices.pdf.uri + '/exportOfflineHTML/' + id;

              let file = fs.createWriteStream('temp' + outputFilename);
              let request = http.get(zipURI, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                  file.close(function() {
                    let zfile = new zip('temp' + outputFilename);
                    zfile.extractAllTo('exportedOfflineHTML-temp-' + id, true);

                    let zfile2 = new zip();
                    zfile2.addLocalFolder('exportedOfflineHTML-temp' + id);
                    zfile2.addFile('tincan.xml', template);
                    zfile.toBuffer( function(buffer) {
                      reply(buffer).header('Content-Disposition', 'attachment; filename=' + outputFilename).header('Content-Type', 'application/zip');
                    }, function(failure) {
                      reply(boom.badImplementation());
                    });
                  });  // close() is async, call cb after close completes.
                });
              }).on('error', function(err) { // Handle errors
                fs.unlink('temp' + outputFilename); // Delete the file async. (But we don't check the result)
                reply(boom.badImplementation());
              });
            } else {
              let zfile = new zip();
              zfile.addFile('tincan.xml', template);
              zfile.toBuffer( function(buffer) {
                reply(buffer).header('Content-Disposition', 'attachment; filename=' + outputFilename).header('Content-Type', 'application/zip');
              }, function(failure) {
                reply(boom.badImplementation());
              });
            }
          }
        }).catch(function(error) {
          request.log(error);
          reply(boom.badImplementation());
        })
      }).catch(function(error) {
        request.log(error);
        reply(boom.badImplementation());
      });
    },
    getRequestEnd: function(request) {
      if (request.params.id) {
        if (request.path.includes('getTinCanPackage')) {
          if (request.query.format && request.query.format === 'zip') {
            fs.unlinkSync('slidewiki-xapi-deck-' + id + '.zip');
            let offline = request.query.offline ? request.query.offline : false;
            if (offline) {
              fs.removeSync('exportedOfflineHTML-temp-' + id);
            }
          }
        }
      }
    }
};
