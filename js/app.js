angular.module('prikl', ['ionic', 'ngCordova', 'prikl.controllers', 'prikl.services'])

.run(function($ionicPlatform,$cordovaDevice,
  $rootScope,Message,PushProcessing,$state,$timeout) {
   //URL to servers' root
  $rootScope.server = "http://winspire01.windesheim.nl/";

  $ionicPlatform.ready(function() {
      //Hide splashscreen
        if(navigator.splashcreen){
          navigator.splashscreen.hide();
        }


  //Register back button
   $ionicPlatform.registerBackButtonAction(function (event) {
   Message.question("Afsluiten","Wilt u de app afsluiten",function(yes){
    if(yes){navigator.app.exitApp();}
   });
  }, 100);


   PushProcessing.register();

   //Get Appversion
    if(window.cordova){
      cordova.getAppVersion(function(version) {
        $rootScope.version = version;
      });
    }
   
   //Get deviceinfo
   try{
    if(device){
        $rootScope.device = {platform: device.platform, name: device.name, cordova:device.cordova, 
          uuid:device.uuid,model:device.model,version:device.version};
    }
  }catch(ex){
    console.log(ex);
  }


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
    }
  });
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
    }) 
    .state('app.bugs', {
      url: "/bugs",
       views: {
        'menuContent' :{
          templateUrl: "templates/postboards/bugs.html",
          controller: 'BugCtrl'
        }
      }
    })
    .state('app.account', {
      url: "/account",
       views: {
        'menuContent' :{
          templateUrl: "templates/account.html",
          controller: 'AccountCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/connecting');
});



