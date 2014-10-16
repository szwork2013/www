// angular.module is a global place for creating, registering and retrieving Angular modules
// 'prikl' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('prikl', ['ionic', 'prikl.services', 'prikl.controllers', 'angular-md5','youtube-embed'])

.run(function($ionicPlatform,$rootScope,$timeout,$state,PushProcessingService,DB,showMessage) {
  //URL to servers' root
  $rootScope.server = "http://winspire01.windesheim.nl/";

  $ionicPlatform.ready(function() {
    
    //App starts in connecting.html view with LoginCtrl from controller.js where token is checked
    /*Check token when this controller is initialized*/
    //Check localstorage for userid,groupid and token if this is not present go directly to login
    var userdevice = window.localStorage.getItem('userdevice');
    if(userdevice != undefined){
      //If token-userid pair matches DB, go to pinboard and set userid + groupid
      //If token mismatches remove it from localstorage and go to login
      userdevice = angular.fromJson(userdevice);

      DB.checkToken(userdevice.userid,userdevice.token,function(response){
      
        if(response.status == "200"){
          $rootScope.userid = userdevice.userid;
          $rootScope.groupid = userdevice.group_id;
          $state.go('app.allreactions');
        }else{ 
          showMessage.notify("Token onjuist, log opnieuw in");
          window.localStorage.removeItem('userdevice');
          $state.go('login');
        }

        //Hide splashscreen
        if(navigator.splashcreen){
          navigator.splashscreen.hide();
        }
      });
    }else{
     // $state.go('login');
       
        //Hide splashscreen
      if(navigator.splashcreen){
        navigator.splashscreen.hide();
      }
    }

//Register back button
   $ionicPlatform.registerBackButtonAction(function (event) {
   showMessage.confirm("Afsluiten","Wilt u de app afsluiten",function(yes){
    if(yes){navigator.app.exitApp();}
   });
  }, 100);


    //Initialize PushProcessingservice for both Apple or Google
    PushProcessingService.initialize();

    //Get Appversion
    if(window.cordova){
      cordova.getAppVersion(function(version) {
        $rootScope.version = version;
      });
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      //Light statusbarfont for dark background
      StatusBar.styleLightContent();
    }
  });
})

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
     .state('login', {
      url: "/login",
      templateUrl: "templates/login/login.html",
      controller: 'LoginCtrl'
    })
    .state('activate', {
      url: "/activate",
      templateUrl: "templates/login/activate.html",
      controller: 'LoginCtrl'
    })
    .state('connecting', {
      url: "/connecting",
      templateUrl: "templates/login/connecting.html",
      controller: 'LoginCtrl'
    })

     .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
    .state('app.prikls', {
      url: "/prikls", 
      views: {
        'menuContent' :{
          templateUrl: "templates/postboards/prikls.html",
          controller: 'PrikLCtrl'
        }
      }
    })

    .state('app.myreactions', {
      url: "/myreactions",
       views: {
        'menuContent' :{
          templateUrl: "templates/postboards/myreactions.html",
          controller: 'PinboardCtrl'
        }
      }
    })

    .state('app.allreactions', {
      url: "/allreactions",
      views: {
        'menuContent' :{
          templateUrl: "templates/postboards/allreactions.html",
          controller: 'PinboardCtrl'
        }
      }
    });
  // if none of the above states are matched, use this loadscreen as fallback
  $urlRouterProvider.otherwise('/app/prikls');
});
