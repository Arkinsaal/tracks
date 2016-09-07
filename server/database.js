'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = {
  init: (event, extras, callback) => {
    if (!event) {
      callback('Request body missing');
      return;
    }

    MongoClient.connect('mongodb://writer:writer@ds017584.mlab.com:17584/events', (err, db) => {
      const collection = db.collection(`${event.collection}`);

      if (!collection) {
        callback('Collection not found, check body.');
        return;
      }

      collection.insertOne(event.body, callback);

    });

  }
};
