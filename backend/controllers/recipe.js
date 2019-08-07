var mongoose = require('mongoose');
require('date-utils');
var UUIDGenerator = require('node-uuid');
var User = mongoose.model('User');
var Recipe = mongoose.model('Recipe');
var Habit = mongoose.model('Habit');
var Monitor = mongoose.model('Monitor');
var q = require('q');

function getHabit(habitId){
  console.log('Getting habit');
  var d = q.defer();
  console.log('Habitid type', typeof habitId);
  Habit.findOne({id: habitId}, function(err, habit){
    if(err || !habit){
      console.log('rejected');
      return d.reject('Could not find habit');
    }
    d.resolve(habit);
  });
  return d.promise;
}

function getMonitor(id){
  var d = q.defer();
  Monitor.findOne({id: id}, function(err, monitor){
    if(err){
      return d.reject('Could not find monitor');
    }
    d.resolve(monitor);
  });
  return d.promise;
}

exports.getAllRecipes = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   /**
    * TODO: Here we can apply some sorting options
    */
}

/**
 * Forks a recipe by copying it leaving a reference back to the copied
 * recipes id. 
 */
exports.copyRecipe = function(req, res){

  if( !req.isAuthenticated() ){
    console.log('User is not Authenticated!');
    res.send(401);
    return;
  }

  console.log(Date(), 'Forking recipe', req.data);

  var recipeId = req.data.recipeId;
  
  Recipe.findOne({id: recipeId}, function(err, recipe){
    if(err){
      console.log('Could not find the recipe for forking: ', recipeId);
      return res.send(400, 'Could not find that recipe');
    }

    // 1) Create GUID
    var uuid = UUIDGenerator.v4();

    var newRecipe = {
      id: uuid,
      name: recipe.name,
      description: recipe.description,
      habits: recipe.habits,
      monitors: recipe.monitors,
      createdAt: new Date(),
      createdBy: req.user._id,
      copiedFrom: recipeId
    }    

    var recipe = new Recipe(newRecipe);

    recipe.save(function(err) {

      if (err) {
        console.log('Error saving recipe', err);
        res.send(500, 'There was an error saving the recipe');
        return;
      }

      console.log('Recipe saved!');
      res.send(200, uuid);
    });
  })   

  return d.promise;
}

exports.getPublishedRecipes = function(req, res){
  console.log(req.user);
  if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

  Recipe.find({published: true}, function(err, recipes){
    
    var promises = [];
    var result = [];

    recipes.forEach(function(recipe){
      
      var resultRecipe = {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        createdAt: recipe.createdAt,
        habits: [],
        monitors: []
      };

      recipe.habits.forEach(function(habitId){
        promises.push(getHabit(habitId).then(function(habit){
          console.log('Pushing habit', habit, 'Type', typeof habit);

          if(habit){
            habit.ticks = undefined;
            resultRecipe.habits.push(habit);
          }
        }));
      })
      
      recipe.monitors.forEach(function(monitorId){
        promises.push(getMonitor(monitorId).then(function(monitor){
          if(monitor){
            monitor.dataPoints = undefined;
            resultRecipe.monitors.push(monitor);
          }
        }));
      })
  
      result.push(resultRecipe);
    })

    q.all(promises).finally(function(){
      console.log();
      console.log('Sending!');
      res.send(200, result);
    });
  });
}

exports.getRecipe = function(req, res) {

   if( !req.isAuthenticated() ){
      console.log('User is not Authenticated!');
      res.send(401);
      return;
   }

   Recipe.find(params, function(err, habits){
      res.send(habits);
   });
}

/**
 * Trans: createRecipe with a recipe object and a list of habits
 * and monitors ids in an array.
 */
exports.createRecipe = function(data, req){
  console.log(Date(), 'Creating recipe', req.user);
  var d = q.defer();

  var newRecipe = {
    id: data.id,
    name: data.name,
    description: data.description,
    habits: data.habits,
    monitors: data.monitors,
    createdAt: data.createdAt,
    createdBy: req.user._id
  }
  
  var recipe = new Recipe(newRecipe);

  recipe.save(function(err) {

    if (err) {
      console.log('Error saving recipe', err);
      d.reject();
      return;
    }

    console.log('Recipe saved!');
    d.resolve();
  });

  return d.promise;
}

/**
* Accepted: Removing a habit that does not exist
*/
exports.removeRecipe = function(data, req) {
  console.log(Date(), 'Removing recipe', data);

  var d = q.defer();
  Recipe.findOne({
    id: data.id
  }, function(err, recipe) {

    if (err) {
      console.log(err);
      d.reject();
      return;
    }

    if(!recipe){
      console.log(Date(), 'Recipe not found');
      d.reject('Recipe not found');
      return;
    }

    recipe.remove(function(err) {
      if (err) {
        console.log(err);
        d.reject();
        return;
      }
      d.resolve();
    });
  });

  return d.promise;
}

exports.updateRecipe = function(data, req) {
 var d = q.defer();

  Recipe.findOne({
    id: data.id
  }, function(err, recipe) {

    if (err) {
      d.reject(err);
      return;
    }

    recipe.name = data.name;
    recipe.habits = data.habits;
    recipe.monitors = data.monitors;
    recipe.description = data.description;
    recipe.published = data.published;

    recipe.save(function(err) {
      if (err) {
        d.reject(err)
        return;
      }
      d.resolve();
    });
  });

  return d.promise;
}