var app = angular.module('MyApp' , ['ui.router']);

app.run(function($rootScope){
    Stamplay.User.currentUser()
    .then(function(res){
        if(res.user){
            $rootScope.loggedIn = true;
            console.log($rootScope.loggedIn);
        }else{
            $rootScope.loggedIn = false;
            console.log($rootScope.loggedIn);
        }
    },function(err){
        console.log("An error occured while getting current user!")
    });
});

app.config(function($stateProvider , $urlRouterProvider, $locationProvider){
    $urlRouterProvider.otherwise("/");
    Stamplay.init("shubham1997");
    $locationProvider.hashPrefix("");

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'template/home.html',
            controller: "HomeCtrl"
        })
        .state('login', {
            url: '/login',
            templateUrl: 'template/login.html',
            controller: "LoginCtrl"
        })
        .state('MyBlogs', {
            url: '/myBlogs',
            templateUrl: 'template/myBlogs.html',
            controller: "MyBlogsCtrl"
        })
        .state('signup', {
            url: '/signup',
            templateUrl: 'template/signup.html',
            controller: "SignUpCtrl"
        });

    
});

app.controller('HomeCtrl',function($scope){
    
});

app.controller('MyBlogsCtrl',function($scope){
    
});

app.controller('LoginCtrl', function($scope , $state , $timeout , $rootScope) {
	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(res){
			console.log(res);
			
			if(res.user){
                $rootScope.loggedIn = true;
                $rootScope.displayName = res.user.firstName+" "+res.user.lastName; 
				$timeout(function(){
                    $state.go('MyBlogs');
                    
					
				});
			}
			else{
				Stamplay.User.login($scope.user)
				.then(function(res){
                    console.log("logged In "+res);
                    $rootScope.loggedIn = true;
                    $rootScope.displayName = res.user.firstName+" "+res.user.lastName;
					$timeout(function(){
                    $state.go('MyBlogs');	
					});
				})
			}
		},function(error){
            console.log(error);
            $rootScope.loggedIn = false;
		})
	}
});

app.controller('SignUpCtrl',function($scope){
    $scope.newUser = {};

    $scope.signup = function(){
        if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmpassword){
            console.log("All fields are valid!");

            if($scope.newUser.password == $scope.newUser.confirmpassword){
                console.log("All good! Let's sign up!");
                Stamplay.User.signup($scope.newUser)
                .then(function(response){
                    console.log(response);
                }, function(error){
                    console.log(error);
                });
            }
            else{
                console.log("Pasword do not match");
            }
        }
        else{
            console.log("Some fields are invalid!");
        }
    }
});

app.controller('MainCtrl',function($scope){
    $scope.logout = function(){
        console.log("Logout called");
        Stamplay.User.logout(true, function(){
            console.log("Logged out!");

            $timeout(function(){
                $rootScope.loggedIn = false;
            })
        });
    }
});

app.controller('MyBlogCtrl',function($scope){
    
});