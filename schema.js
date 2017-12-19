var mongoose = require('mongoose');

// mongoose.connect('mongodb://sunka04-i5771.ca.com:27017/puhar-petti');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = function() {
  var UserFeedbacksSchema = new Schema({
    id          : ObjectId,
    user        : {
      type   : String,
      unique : true
    },
    public_key  : String,
    date        : Date
  });

  mongoose.model('UserFeedbacks', UserFeedbacksSchema);
}
