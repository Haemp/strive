/**
 * Recipe model and directives
 */
(function(){

	angular.module('Recipe', [])


	.service('RecipeModel', function($q, rfc4122, JsonStorage, $rootScope, SyncModel, HabitModel, MonitorModel){
		var self = this;
		self.recipes = [];
		self.initiated = false;
		
		self._init = function(){

			// we have to make sure that before we load our recipes
			// the Habit and Monitor model are both loaded
			$q.all([HabitModel.isInitiated(), MonitorModel.isInitiated()]).then(function(){
				self.loadRecipes();
			})

			SyncModel.registerPlayback('createRecipe', self.createRecipePlayback);
			SyncModel.registerPlayback('updateRecipe', self.updateRecipePlayback);
			SyncModel.registerPlayback('removeRecipe', self.removeRecipePlayback);
		}
		
		self.loadRecipes = function(){
			var d = $q.defer();
			JsonStorage.serial_get('recipes').then(function(recipes){
				self.recipes = recipes || [];
				self.initiated = true;
				d.resolve();
			},function(error){
				self.initiated = false;
				d.reject(error)
			}).then(function(){
				self.objectPairRecipes(self.recipes);
			})
		}

		self.isInitiated = function(){
			var d = $q.defer();

			var f = $rootScope.$watch(function(){
				return self.initiated;
			}, function(newVal){
				if(newVal == true){
					d.resolve();

					// no need to watch this more
					f();
				}
			})

			return d.promise;
		}
			
		/**
		 * This step is needed to fit into the sync model
		 * We can't send the entire nested object through 
		 * the transaction - so we need to serialize it
		 * before we trigger the save function to 
		 */
		self.createRecipe = function(recipe){
			recipe.id = rfc4122.v4();
			recipe.createdAt = new Date();
			self.recipes.push(recipe);
			
			// prepare to record
			var serializedRecipe = self.preSerializeRecipe(recipe);
			SyncModel.recordManual('createRecipe', serializedRecipe);
			
			// save to localstorage
			self._save();
		}
		self.createRecipePlayback = function(recipe, done){

			self.objectPairRecipe(recipe, HabitModel.habits, MonitorModel.monitors);
			self.recipes.push(recipe);
			self._save();		
		}	

		/**
		 * The local recipe is already updated in memory since we
		 * edit directly on the active recipe
		 * So here we just save the localStorage and create a transaction
		 */
		self.updateRecipe = function(recipe){
			var serializedRecipe = self.preSerializeRecipe(recipe);
			SyncModel.recordManual('updateRecipe', serializedRecipe);
			self._save();
		}

		self.updateRecipePlayback = function(recipe){

			var localRecipe = self.getLocalRecipe(recipe.id);

			if(!localRecipe) return;

			// Otherwise we go ahead and update the local
			// version of the recipe - the usecase here is
			// playback from server sync
			localRecipe.name = recipe.name;
			localRecipe.description = recipe.description;
			localRecipe.habits = recipe.habits;
			localRecipe.monitors = recipe.monitors;

			self.objectPairRecipe(localRecipe)
		}

		/**
		 * Removing a recipe
		 */
		self.removeRecipe = function(recipe){
			
			self._removeLocalRecipe(recipe);

			var serializedRecipe = self.preSerializeRecipe(recipe);
			SyncModel.recordManual('removeRecipe', serializedRecipe);

			self._save();
		}
		self.removeRecipePlayback = function(recipe){

			self._removeLocalRecipe(recipe);
			self._save();
		}
		self._removeLocalRecipe = function(recipe){
			for (var i = 0; i < self.recipes.length; i++) {
				if( self.recipes[i].id == recipe.id ){
					self.recipes.splice(i, 1);
				}
			}
		}

		self.getLocalRecipe = function(id){
			for (var i = 0; i < self.recipes.length; i++) {
				if( self.recipes[i].id == id ) return self.recipes[i];
			}
		}

		/**
		 * Pairs up the recipie to habtis and monitors and
		 * then cleans up the selected properties 
		 */
		self.pairRecipe = function(recipe, habits, monitors){
			recipe.monitors = [];
			recipe.habits = [];

			for (var i = 0; i < monitors.length; i++) {
				if(monitors[i].recipeSelected){
					recipe.monitors.push(monitors[i]);
					monitors[i].recipeSelected = undefined;
				}
			}

			for (var i = 0; i < habits.length; i++) {
				if(habits[i].recipeSelected){
					recipe.habits.push(habits[i]);
					habits[i].recipeSelected = undefined;
				}
			}
		}

		/**
		 * Recipes are stores with references to habits and monits
		 * we need to pair them up when we initiate a recipe
		 */
		self.objectPairRecipes = function(recipes){

			angular.forEach(recipes, function(recipe){
				self.objectPairRecipe(recipe);
			});
		}


		/**
		 * Recipes are stores with references to habits and monits
		 * we need to pair them up when we initiate a recipe
		 */
		self.objectPairRecipe = function(recipe){

			var objectHabits = [];
			var objectMonitors = [];

			angular.forEach(recipe.habits, function(habitId){
				var habit = HabitModel.getHabit(habitId);
				if(habit)
					objectHabits.push(habit);
			}) 
			angular.forEach(recipe.monitors, function(monitorId){
				var monitor = MonitorModel.getMonitor(monitorId);
				if(monitor)
					objectMonitors.push(monitor);
			}) 

			recipe.monitors = objectMonitors;
			recipe.habits = objectHabits;
		}

		/**
		 * When saving recipes we need to serialize the habits and monitors 
		 * connected down to referencing the ids.
		 */
		self.preSerializeRecipes = function(recipes){
			
			var serializedRecipes = [];
			
			angular.forEach(recipes, function(recipe){
				serializedRecipes.push(self.preSerializeRecipe(recipe));
			})

			return serializedRecipes;
		}
		
		self.preSerializeRecipe = function(tRecipe){
			var recipe = angular.copy(tRecipe);
			var idsHabits = [];
			var idsMonitors = [];
			
			angular.forEach(recipe.habits, function(habit){
				idsHabits.push(habit.id);
			}) 
			angular.forEach(recipe.monitors, function(monitor){
				idsMonitors.push(monitor.id);
			}) 
			recipe.habits = idsHabits;
			recipe.monitors = idsMonitors;
			
			return recipe;
		}

		/** 
		 * 
		 */
		self.reversePairHabits = function(recipe, habits){
			var habit;

			angular.forEach(recipe.habits, function(habitId){
				habit = _.findWhere({id: habitId});
				habit.recipeSelected = true;
			})
		}
		/** 
		 * Taking habits id and selecting the equivalent habit
		 * in the habits model list of habits
		 */ 
		self.reversePairMonitors = function(recipe, monitors){
			var monitor;

			angular.forEach(recipe.monitors, function(monitorId){
				monitor = _.findWhere({id: monitorId});
				monitor.recipeSelected = true;
			})
		}
			
		/**
		 * When saving recipes we make sure to first serialize them down
		 * to the ID references to make sure the data only has one representation.
		 * New recipes will be added with the objects as refrences - this strips 
		 * them down to refrence id's instead.
		 */
		self._save = function(){

			// copy to not unset the view model data
			var recipes = self.preSerializeRecipes(self.recipes);
			return JsonStorage.serial_save('recipes', recipes).then(function(){
				console.log('Recipes saved!');
			}, function(){
				console.log('Recipes could not be saved!');
			})
		}

		self.clear = function(){
			self.recipes.length = 0;
			self._save();
		}

		self._init();
	})


	/**
	 * Render and edit a recipe
	 * tag: <recipe source="Recipe">
	 */
	.directive('recipe', function( RecipeModel ){
		return {
			restrict: 'E',
			scope: {
				recipe: '=?',
				editRecipe: '&'
			},
			templateUrl: 'src/modules/recipe/recipe.html',
			link: function(scope){

				// When initiating a recipe we need to pair the 
				scope.edit = scope.editRecipe();
				scope.toggleDescription = function(){
					scope.recipe.selected = !scope.recipe.selected;
				}

				scope.publish = function(recipe){
					recipe.published = true;

					RecipeModel.updateRecipe(recipe);
				}
				
				scope.unPublish = function(recipe){
					recipe.published = false;

					RecipeModel.updateRecipe(recipe);
				}
				
				scope.removeRecipe = RecipeModel.removeRecipe;
			}
		}
	})

	
	/**
	 * Creating a recipe 
	 * tag: <create-recipe recipe="Optional" habits="Array" monitors="Array">
	 */	
	.directive('createRecipe', function(RecipeModel){
		return {
			restrict: 'E',
			scope:{
				recipe: '=?',
				habits: '=?',
				monitors: '=?'
			},
			templateUrl: 'src/modules/recipe/create-recipe.html',
			link: function(scope){

				self._init = function(){
					scope.submitLabel = 'Create';
					// whenever we bind to a new recipe
					// we must check if it is a null (to be crated)
					// recipe or an already existing recipe
					// that should be edited.
					// If it should be edited, we need to apply
					// selections to the habits and monitors
					// to be reflected in the selection UI
					if(scope.recipe && scope.recipe.id){
						scope.submitLabel = 'Update';
						self._startReversePairing();
					}
				}
				
				scope.saveRecipe = function(recipe){
					var p;

					// How to handle pairing?
					// We pair by putting ids of habtis and monitors
					// into the recipe. When showing each habit we
					// fetch them based on that id
					RecipeModel.pairRecipe(recipe, scope.habits, scope.monitors);

					// if the recipe already have an id we
					// update it, otherwise we create a new one
					if(recipe.id){
						RecipeModel.updateRecipe(recipe);
						scope.recipe = undefined;
					}else{
						RecipeModel.createRecipe(recipe);
						scope.recipe = undefined;
					}
				}

				/** 
				 * Since this might be instantiated before 
				 * we have our loaded h&m we set one time watchers
				 * to handle proper reverse pairing. 
				 */
				self._startReversePairing = function(){
					RecipeModel.reversePairHabits(scope.recipe, scope.habits);
					RecipeModel.reversePairMonitors(scope.recipe, scope.habits);
				}
				
				self._init();
			}
		}
	})
})()