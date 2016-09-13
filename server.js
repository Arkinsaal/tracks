'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const app         = express();
const router      = express.Router();
const Events      = require('./server/database.js');

app.use('', router);

const PORT = process.env.PORT || 4000;

const EventsDatabase = new Events();

router.use(bodyParser.json());

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function indexOfDeep(array, check) {
  const checkString = check.toString();
  for (let i = 0; i < array.length; i++) {
    if (array[i].toString() == checkString) return i;
  }
  return -1;
}

function sortTags(events) {

  let addToList = function(list, tags) {
    if (indexOfDeep(list, tags) == -1) list.push(tags);
  };
  return events.reduce((prev, curr, i) => {
    if (!curr.tags) return;
    let tagList = curr.tags.sort((a, b) => a < b ? -1 : 1);
    if (tagList.length == 0) return prev;

    let list = (tagList.length > 1) ? 'combos' : 'singles';
    addToList(prev[list], tagList);

    return prev;
  }, { singles: [], combos: [] });
}

router.route('/event')
  .post((req, res) => {

    let event = {
      "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      "timestamp": req.body.timestamp,
      "value": req.body.value || null,
      "tags": req.body.tags
    }

    EventsDatabase.addEvent(event, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  });

router.route('/tags')
  .get((req, res) => {
    EventsDatabase.getTags((err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(sortTags(response));
      }
    });
  });

app.listen(PORT, function() {
  console.log(`listening on port ${ PORT }`);
});
