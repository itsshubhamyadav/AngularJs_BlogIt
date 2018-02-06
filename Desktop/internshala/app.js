
var app = angular.module('MyApp', ["ui-router"]);


app.config(function($stateProvider , $urlRouterProvider){
	
	Stamplay.init("shubham1997");
	
	$locationProvider.hashPrefix('');
	$urlRouterProvider.otherwise("/");
	$stateProvider
	.state('home',{
		url : '/',
		templateUrl : 'template/home.html',
		controller : "HomeCtrl"
	})

	.state('login',{
		url:'/login',
		templateUrl : 'template/login.html' ,
		controller : "LoginCtrl" 
	})
	.state('signup',{
		url : '/signup',
		templateUrl : 'template/signup.html',
		controller : "SignUpCtrl"
	})
	
});

app.controller('MyCtrl', function($scope) {	

})

app.controller('MyBlogsCtrl', function($scope) {	

})

app.controller('HomeCtrl', function($scope) {
	
});

app.controller('LoginCtrl', function($scope) {
	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(res){
			console.log(res);
			
			if(res.user){
				$timeout(function(){
					$location.path("/viewBlogs");
				});
			}
			else{
				Stamplay.User.login($scope.user)
				.then(function(res){
					console.log("logged In "+res);
					$timeout(function(){
						$location.path("/viewBlogs")
					});
				})
			}
		},function(error){
			console.log(error);
		})
	}
});

app.controller('SignUpCtrl', function($scope) {
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
