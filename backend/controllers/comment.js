var mongoose = require('mongoose');
require('date-utils');
var UUIDGenerator = require('node-uuid');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
var q = require('q');


exports.getComments = function(req, res) {

  if (!req.isAuthenticated()) {
    console.log('User is not Authenticated!');
    res.send(401);
    return;
  }

  var id = req.query.id;
  var cat = req.query.category;
  Comment.find({
    id: id,
    category: cat
  }, function(err, comments) {
    if( err ) return err;

    return res.send(200, comments);
  })
}
/**
 * 
 * @param comment Object(id, category, )
 */
exports.postComment = function(req, res){
  if (!req.isAuthenticated()) {
    console.log('User is not Authenticated!');
    res.send(401);
    return;
  }
  var c = {
    id: req.data.id,
    category: req.data.category,
    text: req.data.text,
    createdBy: req.data.createdBy
  };
  Comment.insert(c, function(err) {
    if( err ) return err;

    return res.send(200, comments);
  })

}

