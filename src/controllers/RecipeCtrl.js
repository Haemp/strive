(function(){

	angular.module('Strive')
	
	.service('RecipeModel', function($q, rfc4122, JsonStorage, SyncModel){
		var self = this;
		self.recipes = [];
		self.initiated = false;
		
		self._init = function(){
			self.loadRecipes();

			SyncModel.record(this, ['removeRecipe', 'editRecipe', 'createRecipe']);
		}
		
		self.loadRecipes = function(){
			var d = $q.defer();
			JsonStorage.serial_get('recipes').then(function(recipes){
				self.recipes = recipes;
				self.initiated = true;
				d.resolve();
			},function(error){
				self.initiated = false;
				d.reject(error)
			})
		}

		self.createRecipe = function(recipe, done){

			recipe.id = rfc4122.v4();
			recipe.createdAt = new Date();
			self.recipes.push(recipe);

			self._save();
			done(true);
		}	

		self.updateRecipe = function(recipe, done){
			
			var localRecipe = self.getLocalRecipe(recipe.id);
			// if the target recipe exists and is equivalent
			// to the one we've been updated with we go ahead
			// and ignore the changes - the came from that recipe
			if( localRecipe === recipe || localRecipe == undefined ){
				return done(true);
			}

			// Otherwise we go ahead and update the local
			// version of the recipe - the usecase here is
			// playback from server sync
			localRecipe.name = recipe.name;
			localRecipe.description = recipe.description;
			localRecipe.habits = recipe.habits;
			localRecipe.monitors = recipe.monitors;

			self._save();
			done(true)
		}

		self.removeRecipe = function(recipe, done){
			var found = false;

			for (var i = 0; i < self.recipes.length; i++) {
				if( self.recipes[i].id == recipe.id ){

					self.recipes.splice(i, 1);
					found = true;
				}
			};

			self.save();
			done(found);
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
			recipe.monitors = recipe.habits = [];

			for (var i = 0; i < monitors.length; i++) {
				if(monitors[i].recipeSelected){
					recipe.monitors.push(monitors[i].id);
					monitors[i].recipeSelected = undefined;
				}
			}

			for (var i = 0; i < habits.length; i++) {
				if(habits[i].recipeSelected){
					recipe.habits.push(habits[i].id);
					habits[i].recipeSelected = undefined;
				}
			}
		}

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
		
		self._save = function(){
			return JsonStorage.serial_save('recipes', self.recipes).then(function(){
				console.log('Recipes saved!');
			}, function(){
				console.log('Recipes could not be saved!');
			})
		}
		
		self._init();
	})
	
	.controller('RecipeCtrl', function($scope, HabitModel, MonitorModel, RecipeModel){
		
		var self = this;
		
		$scope.HabitModel = HabitModel;
		$scope.MonitorModel = MonitorModel;
		$scope.RecipeModel = RecipeModel;


		self._init = function(){
				
		}
		
		self._init();	
	})

	.controller('CreateRecipeCtrl', function($scope, HabitModel, MonitorModel){
		
		var self = this;
		
		$scope.HabitModel = HabitModel;
		$scope.MonitorModel = MonitorModel;
		$scope.newRecipe = {};
		
		self._init = function(){
			
		}
		
		self._init();	
	})
	
	.directive('createRecipe', function(RecipeModel){
		return {
			restrict: 'E',
			scope:{
				recipe: '=?',
				habits: '=?',
				monitors: '=?'
			},
			templateUrl: 'src/modules/create-recipe.html',
			link: function(scope){

				self._init = function(){

					// whenever we bind to a new recipe
					// we must check if it is a null (to be crated)
					// recipe or an already existing recipe
					// that should be edited.
					// If it should be edited, we need to apply
					// selections to the habits and monitors
					// to be reflected in the selection UI
					if(scope.recipe && scope.recipe.id){
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
					}else{
						RecipeModel.createRecipe(recipe);
					}
					
				}

				/** 
				 * Since this might be instantiated before 
				 * we have our loaded h&m we set one time watchers
				 * to handle proper reverse pairing. 
				 */
				self._startReversePairing = function(){

					var nh = scope.$watch('habits', function(n){
						if(n){
							RecipeModel.reversePairHabits(scope.recipe, scope.habits);
							nh();
						}
					})
					var nm = scope.$watch('monitors', function(n){
						if(n){
							RecipeModel.reversePairHabits(scope.recipe, scope.monitors);
							nm();
						}
					})
				}

				self._init();
			}
		}
	})
})()