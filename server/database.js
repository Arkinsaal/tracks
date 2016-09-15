'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = class Events {
  constructor() {
    this.database = null;
    this.collections = {};
  }

  getDatabase(callback) {
    if (this.database) {
      callback(this.database);
    } else {
      MongoClient.connect('mongodb://writer:writer@ds017584.mlab.com:17584/events', (err, db) => {
        if (!err) {
          console.log('connected to database!');
          this.database = db;
          callback(this.database);
        } else {
          console.log(err);
        }
      });
    }
  }

  getCollection(collection, callback) {
    if (this.collections[collection]) {
      callback(this.collections[collection]);
    } else {
      this.getDatabase(database => {
        this.collections[collection] = database.collection(collection);
        callback(this.collections[collection]);
      });
    }
  }

  addEvent(event, callback) {
    this.getCollection('events', collection => {
      collection.insertOne(event, callback);
    });
  }

  getTags(callback) {
    this.getCollection('events', collection => {
      //collection.find().toArray(callback);
      collection.aggregate([
        { "$group": { "_id": "$tags", "count": { $sum: 1 } } }
      ], callback);
    });
  }
}
