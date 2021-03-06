var app = angular.module('MyApp', ['ui.router', 'ngToast', 'textAngular', 'ngSanitize']);

app.run(function ($rootScope, AuthService, $state, $transitions) {
    // $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //     if(toState.authenticate == true)
    //     {
    //         AuthService.isAuthenticated()
    //         .then(function(res){
    //             console.log(res);
    //             if(res == false)
    //             {
    //                 $state.go('login');
    //             }
    //         });
    //     }
    // })

    $transitions.onStart({}, function (transition) {
        if (transition.$to().self.authenticate == true) {
            AuthService.isAuthenticated()
                .then(function (res) {
                    console.log(res);
                    if (res == false) {
                        $state.go('login');
                    }
                });
        }
    })
});

app.factory('AuthService', function ($q, $rootScope) {
    return {
        isAuthenticated: function () {
            var defer = $q.defer();

            Stamplay.User.currentUser(function (err, res) {
                if (err) {
                    defer.resolve(false);
                    $rootScope.loggedIn = false;
                }
                if (res.user) {
                    defer.resolve(true);
                    $rootScope.loggedIn = true;
                }
                else {
                    defer.resolve(false);
                    $rootScope.loggedIn = false;
                    
                }
            });
            return defer.promise;
        }
    }
})

app.filter('htmlToPlainText', function () {
    return function (text) {
        return text ? String(text).replace(/<[^>]+/gm, '') : '';
    }
})

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
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
            controller: "MyBlogsCtrl",
            authenticate: true
        })
        .state('Create', {
            url: '/create',
            templateUrl: 'template/create.html',
            controller: "CreateCtrl",
            authenticate: true
        })
        .state('Edit', {
            url: '/edit/:id',
            templateUrl: 'template/edit.html',
            controller: "EditCtrl",
            authenticate: true
        })
        .state('signup', {
            url: '/signup',
            templateUrl: 'template/signup.html',
            controller: "SignUpCtrl"
        })
        .state('View', {
            url: '/view/:id',
            templateUrl: 'template/view.html',
            controller: 'ViewCtrl'
        });


});

app.controller('ViewCtrl', function($scope, $stateParams, $timeout, $state, ngToast){
    $scope.upVoteCount = 10;
    $scope.downVoteCount = 5;
    
    Stamplay.Object("blogs").get({_id: $stateParams.id})
    .then(function(response){
        console.log(response);
        $scope.blog = response.data[0];
        $scope.upVoteCount = $scope.blog.actions.votes.users_upvote.length;
        $scope.downVoteCount = $scope.blog.actions.votes.users_downvote.length;
        $scope.$apply();
        
    }, function(error){
        console.log(error);   
    })     
})

app.controller('CreateCtrl', function (taOptions, $state, $scope, $timeout, ngToast) {

    $scope.newPost = {};
    taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
    ];

    $scope.create = function () {
        Stamplay.User.currentUser()
            .then(function (res) {
                if (res.user) {
                    Stamplay.Object("blogs").save($scope.newPost)
                        .then(function (res) {

                            $timeout(function () {
                                ngToast.create("The post has been successfully created.");
                            })
                            $scope.go("MyBlogs");
                        }, function (err) {
                            $timeout(function () {
                                ngToast.create("An error has occured While creating an post. Please try later.");
                            });
                            console.log(err);
                        })
                } else {
                    $state.go("login");
                }
            }, function (err) {
                $timeout(function () {
                    ngToast.create("An error has occured. Please try later.");
                });
                console.log(err);
            })
    }
});

app.controller('EditCtrl', function (taOptions, $state, $scope, $stateParams, $timeout, ngToast) {

    $scope.Post = {};
    taOptions.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
    ];

    Stamplay.Object("blogs").get({ _id: $stateParams.id })
        .then(function (res) {
            console.log(res);
            $scope.Post = res.data[0];
            $scope.$apply();
            console.log($scope.Post);
        }, function (err) {
            console.log(err);
        });
    $scope.update = function () {
        Stamplay.User.currentUser()
            .then(function (res) {
                if (res.user) {
                    if (res.user._id == $scope.Post.owner) {
                        Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
                            .then(function (response) {
                                console.log("response");
                                $state.go("MyBlogs");
                            }, function (error) {
                                console.log(error);
                            });
                    }
                    else
                        $state.go("login");
                }
                else
                    $state.go("login");
            }, function (err) {
                console.log(err);
            });
    }

});

app.controller('HomeCtrl', function ($scope, $http) {
    Stamplay.Object("blogs").get({ sort: "-dt_create" })
        .then(function (res) {
            console.log(res);
            $scope.latestBlogs = res.data;
            $scope.$apply();
            console.log($scope.latestBlogs);
        }, function (err) {
            console.log(err);
        });
});

app.controller('MyBlogsCtrl', function ($scope, $state) {
    Stamplay.User.currentUser().then(function (res) {
        if (res.user) {
            Stamplay.Object("blogs").get({ owner: res.user._id, sort: "-dt_create" })
                .then(function (res) {
                    console.log(res);
                    $scope.userBlogs = res.data;
                    $scope.$apply();
                    console.log($scope.userBlogs);
                }, function (err) {
                    console.log(err);
                });
        }
        else {
            $state.go('login');
        }
    }, function (err) {
        console.log(err);
    })
});

app.controller('LoginCtrl', function ($scope, $state, $timeout, $rootScope, ngToast) {
    $scope.login = function () {
        Stamplay.User.currentUser()
            .then(function (res) {
                console.log(res);

                if (res.user) {
                    $rootScope.loggedIn = true;
                    $rootScope.displayName = res.user.firstName + " " + res.user.lastName;
                    $timeout(function () {
                        $state.go('MyBlogs');
                    });
                }
                else {
                    Stamplay.User.login($scope.user)
                        .then(function (res) {
                            $timeout(function () {
                                ngToast.create("Login successful !");
                            });
                            console.log("logged In " + res);
                            $rootScope.loggedIn = true;
                            $rootScope.displayName = res.user.firstName + " " + res.user.lastName;
                            $timeout(function () {
                                $state.go('MyBlogs');
                            });
                        }, function (err) {
                            $timeout(function () {
                                ngToast.create("Login Failed !");
                            });
                            console.log(err);
                            $rootScope.loggedIn = false;
                        })
                }
            }, function (error) {
                $timeout(function () {
                    ngToast.create("An error occured, Please try later!");
                });
                console.log(error);
            })
    }
});

app.controller('SignUpCtrl', function ($scope, ngToast) {
    $scope.newUser = {};

    $scope.signup = function () {
        if ($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmpassword) {
            
            $timeout(function(){
                ngToast.create("All fields are valid!");	
                });
            console.log("All fields are valid!");

            if ($scope.newUser.password == $scope.newUser.confirmpassword) {
                console.log("All good! Let's sign up!");
                Stamplay.User.signup($scope.newUser)
                    .then(function (response) {
                        $timeout(function(){
                            ngToast.create("Your account has been created. Please login !");	
                            });
                        
                        console.log(response);
                    }, function (error) {
                        $timeout(function(){
                            ngToast.create("An error occured please try later !");	
                            });
                        
                        console.log(error);
                    });
            }
            else {
                $timeout(function(){
                    ngToast.create("Passwords do not match");	
                    });
                
                console.log("Pasword do not match");
            }
        }
        else {
            $timeout(function(){
                ngToast.create("Some fields are invalid!");	
                });
            
            console.log("Some fields are invalid!");
        }
    }
});

app.controller('MainCtrl', function ($scope, $rootScope, $timeout) {
    $scope.logout = function () {
        console.log("Logout called");
        Stamplay.User.logout(true, function () {
            console.log("Logged out!");

            $timeout(function () {
                $rootScope.loggedIn = false;
            })
        });
    }
});
