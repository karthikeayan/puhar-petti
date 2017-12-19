var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
require('../schema')();

/* Store new user keys to database */
router.post('/keys', function (req, res, next) {

  console.log(req.body.publicKey);

  var UserFeedbacks = mongoose.model('UserFeedbacks');

  try {
    mongoose.connect('mongodb://sunka04-i5771.ca.com:27017/puhar-petti', function (err) {
      if (err) {
        throw err;
      }

      UserFeedbacks.create({
          user: req.body.user,
          public_key: req.body.publicKey,
          date: new Date()
        },
        function (err, row) {
          if (err) {
            console.log(err);

            if (err.toString().includes("duplicate key error")) {
              res.status(409).send({
                duplicate: true
              })
            } else {
              console.log("Some issue with writing to database");
              res.status(500).send({ 
              })
            }
          } else {
            console.log('New table entry added to db: %s', row.toString());
            res.send({
              id: row._id
            })
          }
          mongoose.connection.close()
        }
      );

    });
  } catch (err) {
    console.log('Some issue with connecting to database, here it goes what node says!');
    console.log(err);
    mongoose.connection.close()
  }

});

module.exports = router;