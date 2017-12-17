var mongoose = require('mongoose');

// mongoose.connect('mongodb://sunka04-i5771.ca.com:27017/puhar-petti');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = function() {
  var UserFeedbacksSchema = new Schema({
    id       : ObjectId,
    user     : String,
    content  : String,
    date     : Date
  });

  mongoose.model('UserFeedbacks', UserFeedbacksSchema);
}
