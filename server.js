'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const app         = express();
const router      = express.Router();

app.use('', router);

const PORT = process.env.PORT || 4000;

const eventsConnector = require('./server/database.js');

router.use(bodyParser.json());

router.route('/event')
  .post((req, res) => {
    const extras = {
      "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      "timestamp": Date.now()
    };

    eventsConnector.init(req.body, extras, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  });

app.listen(PORT, function() {
  console.log(`listening on port ${ PORT }`);
});
