var Staggolee = angular.module('Staggolee', []);

Staggolee.service('StaggoleeModel', function(){
	var self = this;
   self.elements = {};
});

Staggolee.directive('layout', function( StaggoleeModel ){


   return {

      link: function($scope, elem, attr, controller){

         // register ourselves
         StaggoleeModel.elements[attr.name] = elem;

         // if we have a relative mark
         // watch that elements top position

         if( attr.topRelative ){

            $scope.$watch(function(){

					//console.log($(StaggoleeModel.elements[attr.topRelative]));
               return $(StaggoleeModel.elements[attr.topRelative]).offset().top;
            }, function(newValue){
					$(elem).css('top', newValue);
            })
         }
      }
   };
});
