'use strict';

const { LRS: lrsOptions } = require('../configuration');
const transforms = require('../lib/transforms');

const self = module.exports = {

  saveActivity: function(activity) {

    return transforms.transform(activity).then((statement) => {

      return new Promise((resolve, reject) => {
        getLRS().saveStatement(statement, {
          callback: (err, xhr) => {
            if (err) {
              let errMessage = [];
              if (xhr) {
                let details;
                try {
                  details = JSON.parse(xhr.responseText);
                } catch (err) {}

                errMessage.push(details && details.message || xhr.responseText);
              } else {
                errMessage.push(err);
              }

              errMessage.push(JSON.stringify({activity, statement}));

              return reject(new Error(errMessage));
            }

            resolve(statement);
          }

        });

      });

    });

  },

};


// private members
const TinCan = require('tincanjs');

let lrs;
function getLRS() { 
  if (lrs) return lrs;

  try {
    lrs = new TinCan.LRS(lrsOptions);
  } catch (err) {
    // TODO log or throw ?
    console.log(`connection to the LRS is currently unavailable: ${err}`);

    throw new Error(`connection to the LRS is currently unavailable: ${err}`);
  }

  return lrs;
}
