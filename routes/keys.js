var express = require('express');
var router = express.Router();
var BSON = require('bson')

var mongoose = require('mongoose');
require('../schema')();

var UserFeedbacks = mongoose.model('UserFeedbacks');

/* Store new user keys to database */
router.post('/keys', function (req, res, next) {

  console.log(req.body.publicKey);

  try {
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
            res.status(500).send({})
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

  } catch (err) {
    console.log('Some issue with connecting to database, here it goes what node says!');
    console.log(err);
  }

});

router.get('/keys/:user', function (req, res, next) {
  console.log('Fetching public key of user ' + req.params.user);
  var bson = new BSON();

  UserFeedbacks.findOne({
      user: req.params.user
    })
    .then((row) => {
      console.log("feedback while fetching public key: " + row.feedback);
      var temp = bson.deserializeStream(row.feedback);
      console.log(temp);
      res.send({
        key: row.public_key,
        // encrypted: bson.deserialize(row.feedback)
        encrypted: row.feedback
      })
    })
    .catch(() => {
      console.log("Some issue in fetching the public key for user " + req.params.user)
    });
});

/* Store sent feedback in database */
router.post('/keys/:user', function (req, res, next) {
  console.log(req.body);
  var bson = new BSON();

  console.log('encrypted text format is ' + req.body.encrypted);
  UserFeedbacks.findOne({
    user: req.params.user
  })
  .then((row) => {
    row.feedback = bson.serialize(req.body.encrypted);
    console.log(row.feedback);

    row.save((err, row) => {
      if (err){
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(202).send(row);
      }
    })
  })
})

module.exports = router;