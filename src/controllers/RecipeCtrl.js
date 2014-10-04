(function(){

	angular.module('Strive')
	
	.controller('RecipeCtrl', function($scope, HabitModel, MonitorModel, RecipeModel, $state){
		
		var self = this;
		
		$scope.HabitModel = HabitModel;
		$scope.MonitorModel = MonitorModel;
		$scope.RecipeModel = RecipeModel;
		$scope.editableRecipe;

		self._init = function(){
				
		}

		$scope.showCreateRecipe = function(){
			$state.transitionTo('recipecreate');
		}
		
		$scope.editRecipe = function(recipe){
			$scope.editableRecipe = recipe;
			$state.transitionTo('recipeupdate', {recipeId: recipe.id});
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

	.controller('UpdateRecipeCtrl', function($scope, $stateParams, RecipeModel, MonitorModel, HabitModel){
		
		$scope.HabitModel = HabitModel;
		$scope.MonitorModel = MonitorModel;

		$scope.recipe = RecipeModel.getLocalRecipe($stateParams.recipeId);
		
	})
	
	
})()