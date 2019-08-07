var mongoose = require('mongoose');
require('date-utils');
var User = mongoose.model('User');
var Habit = mongoose.model('Habit');


exports.create = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   console.log(Date(), 'Creating habit');
   var habitData = {
      id: req.body.id,
      name: req.body.name,
      description: req.body.description,
      ticks: [],
      createdAt: req.body.createdAt,
      createdBy: req.user._id
   }


}

exports.get = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   var params = {};
   params.createdBy = req.user._id;
   if( req.query.id ){
      params.id = req.query.id;
   }

   Habit.find(params, function(err, habits){
      res.send(habits);
   });
}

/**
 * Accepted: If already ticked today
 */
exports.tick = function( req, res ){

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   console.log(Date(),'Ticking habit', req.body.habitId);
   Habit.findOne({id: req.body.habitId}, function(err, habit){

      if( !habit ){
         res.send(500, 'Could not find habit'); return;
      }

      console.log('Habit: ', habit);
      if( req.user._id != habit.createdBy ){
         res.send(401, 'You dont own that habit sir!'); return;
      }

      if( err ) res.send(500, {error: err});

      // make sure the habit has not been ticked
      // today - incase of sync duplication
      var start = new Date(req.body.createdAt);
      start.clearTime();
      var end = start.clone();
      end.add({
         milliseconds: 999,
         seconds: 59,
         minutes: 59,
         hours:  23
      });

      console.log('Checking between', start, end);

      // TODO: if user ticks exactly at 00:00:00 it's not
      // going to prevent double ticks
      Habit.findOne({
         'ticks.createdAt': {$gt: start, $lt: end},
         id: req.body.habitId

      }, function(err, wasTickedToday){
         if(err){
            res.send(500, err); return;
         }

         if(!wasTickedToday){
            console.log('was not ticked today');
            // no previous ticks - go ahead and
            // tick
            habit.ticks.push({
               id: req.body.id,
               createdAt: req.body.createdAt
            });

            habit.save(function(err){
               if(err){
                  console.log(err);
                  res.send(500, {error: err} );
                  return;
               }
               res.send(200, {statusDescription: 'Habit ticked'});
            });

         }else{
            console.log('WAS ticked today');
            res.send(202, 'Habit was already ticked today');
         }
      });

   });
}

/**
 * Accepted: Removing a habit that does not exist
 */
exports.remove = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }
   console.log('DELETING ', req.query);
   Habit.findOne({id: req.query.id}, function(err, habit){

      if(err){
         res.send(500, err); return;
      }

      if(!habit){
         res.send(202, 'Habit not found'); return;
      }

      habit.remove(function(err){
         if(err){
            res.send(500, err); return;
         }
         res.send(200, {statusDescription: 'Habit removed'});
      });
   });
}

exports.update = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   var name = req.body.name;
   Habit.findOne({id: req.body.id}, function(err, habit){
   	  if( !habit ){
   	  	res.send(202, {statusDescription: 'Habit not found'});	return;
   	  }
      habit.name = req.body.name;
      habit.description = req.body.description;
      habit.isArchived = req.body.isArchived;

      habit.save();
      res.send(200, {statusDescription: 'Habit updated'});
   });
}
