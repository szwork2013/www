angular.module('prikl', ['ionic', 'ngCordova', 'prikl.controllers', 'prikl.services'])

.run(function($ionicPlatform,$cordovaDevice,
  $rootScope,Message,$state,$timeout,PushProcessing,$ionicNavBarDelegate) {
   //URL to servers' root
  $rootScope.server = "http://winspire01.windesheim.nl/";

  $ionicPlatform.ready(function() {
    
      PushProcessing.register();

      //Hide splashscreen
        if(navigator.splashcreen){

          navigator.splashscreen.hide();
        }

        // window.addEventListener("backbutton", function (event) {
          
            
        //     preventDefault();
        //   }, false);
           
  $ionicPlatform.on('resume', function(){
    $state.transitionTo($state.current, $stateParams, {
        reload: true,
        inherit: false,
        notify: true
    });
  });


  //Register back button
   $ionicPlatform.onHardwareBackButton(function (event) {
   var prev = $ionicNavBarDelegate.getPreviousTitle();
   alert(prev);
            if(prev != '' && prev != undefined && prev != 'Inloggen')
            {
              $ionicNavBarDelegate.back();
              event.preventDefault();
            }
            else
            {
              Message.question("Afsluiten","Wilt u de app afsluiten",function(yes){
                if(yes){navigator.app.exitApp();}
               });
            }
  }, 100);

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
      url: "/allreactions?type?postid?commentid",
      views: {
        'menuContent' :{
          templateUrl: "templates/postboards/allreactions.html",
          controller: 'PinboardCtrl',
          params: ['type','postid','commentid']
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



