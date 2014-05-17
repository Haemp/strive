describe('Habits', function() {
   var scope, StriveModel;

   beforeEach(module('Strive'));
   beforeEach(angular.mock.inject(function($rootScope, $controller, _StriveModel_) {
      //create an empty scope
      StriveModel = _StriveModel_;
      scope = $rootScope.$new();
      //declare the controller and inject our empty scope
      $controller('HabitCtrl', {
         $scope: scope
      });
   }));

   describe('Habit Input', function() {

      it('should add a habit to the list', function() {
         scope.createHabit({ name: 'Test1'});
         expect(StriveModel.habits.length).toBe(1);
      });

      it('should show the habit details when a habit is clicked', function() {

      });

      it('should show the confirmation box when we click the delete button', function() {

      });
   });
});
