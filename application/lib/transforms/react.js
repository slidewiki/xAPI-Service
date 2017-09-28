'use strict';

const boom = require('boom');

const TinCan = require('tincanjs');
const Microservices = require('../../configs/microservices');

//var like = require('like')

const self = module.exports = {

  transform: function(activity) {
    // TODO support more reaction types ?
    //console.log('react.activity.react_type='+activity.react_type);
    var lrs;
    //if (activity.react_type !== null)
    //  lrs = require(`./${activity.react_type}`);
    //else if (activity.activity_type !== null)
    lrs = require(`./${activity}`);
    let statement = lrs.transform(activity);
    return statement;

  },


};
