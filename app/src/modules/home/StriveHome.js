(function(){

	angular.module('Strive')

        .config(function($stateProvider, $httpProvider) {

            $stateProvider.state('home', {
                url: "/home",
                views: {
                    main: {
                        templateUrl: "home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

        })

        .controller('HomeCtrl', function($scope, $http, DOMAIN, SyncModel, $state, TipModel, $rootScope){

            var self = this;
            $scope.recipes = [];


            self._init = function(){

                TipModel.enable('home-tip');
                $rootScope.$on('$stateChangeSuccess', function(e, toState){
                    if(toState.name == 'home'){
                        fetch();
                    }
                })

                fetch();
            }


            function fetch(){

                // fetch all published recipes
                $http({
                    url: DOMAIN+'/api/recipe/published',
                    method: 'GET'
                }).then(function(res){

                    $scope.unAuthorized = false;
                    $scope.recipes = res.data;


                }, function(res){
                    if(res.status == 401){
                        $scope.unAuthorized = true;
                    }
                })
            }

            $scope.fork = function(recipe){

                // 1) send the request to fork - this will all be handled on the backend
                $http.post(DOMAIN+'/api/recipe/'+recipe.id+'/fork').then(function(){

                    // 2) Request a sync after the request is done
                    return SyncModel.sync();

                }, function(){

                }).then(function(){

                    // 3) The recipe should now be downsynced and ready
                    // Add a notifcation to tell the user
                    $state.transitionTo('recipes');
                })
            }

            self._init();
        })

})()