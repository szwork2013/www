angular.module('prikl.controllers', [])
/*App controller, when menu is visible this controller is used*/
.controller('AppCtrl', function($scope,$rootScope,Modals,Cache,Camera,showMessage,$state,$timeout) {
 // $rootScope.userid=130;
 // $rootScope.groupid=69;
 // showMessage.notify("UserID:"+$rootScope.userid+",GroupID:"+$rootScope.groupid);


  //Logoutfunction for logout in menu
  $scope.logout = function(){
    var callback = function(answer){
      if(answer){
        showMessage.notify("Uitgelogd");
      //  DB.unregisterDevice()
        window.localStorage.removeItem('userdevice');
        $state.go('login');
      }
    }
   showMessage.confirm("Uitloggen","Weet je zeker dat je wilt uitloggen?",callback);
  }

  //Functions for new posts
  $scope.photo = function(){
   Camera.getPicture()
    .then(function(imageURI){ 
      $scope.imageURI = imageURI;
      Modals.createAndShow($scope,"photo");
    },function(error){
      console.log("Camera probleem:</br>"+error);
    });
  }

  $scope.text = function(){
    Modals.createAndShow($scope,"text");
  }

  
})

/*Controller with 4 important functions: checkToken, verifyAccount, activateAccount and registerDevice*/
.controller('LoginCtrl', function($scope,$rootScope,Cache,$state,$ionicActionSheet,$ionicModal, DB, FTP, showMessage,Camera,md5) {
  //Userform data
  var account = $scope.login = {};

  //Verify useraccount mail and passwordword
  $scope.verifyAccount = function(){
    //Hash PW
    var hashedpw = md5.createHash(account.pw);
    DB.verifyAccount(account.mail,hashedpw,function(response){
      if(response.status == "200")
      {
        registerDevice(response.data.iduser);
      }
      else if(response.status == "462")
      {
       $rootScope.mail = account.mail;
        showMessage.notify(response.statusText);
        $state.go("activate");
      }
      else 
      {
        showMessage.notify(response.statusText);
      }
    });
  }

  //Register device (when user login is OK)
  registerDevice = function(userid){
     //DeviceID from Apple's APNS or Google's GCM, requested in PushNotifcationsService in services.js 
     var deviceinfo = Cache.get('pushnotification');
     if(deviceinfo == undefined){
      //Browsers and devices won't get a DeviceID
        $state.go('app.allreactions');
        showMessage.notify("Geen PushID ontvangen");
     }else{
      //Registerdevice, send DeviceID(Google's or Apple's) to server and save it there, save the received
      //token from server in localstorage
  	  DB.registerDevice(userid,deviceinfo.device_id,deviceinfo.platform,function(response){
        if(response.status == "200"){
          window.localStorage.setItem('userdevice', JSON.stringify(response.data));
          var userdevice = angular.fromJson(window.localStorage.getItem('userdevice'));
          $rootScope.userid = userdevice.userid;
          $rootScope.groupid = userdevice.group_id;
          showMessage.notify("Apparaat geregistreerd");
          $state.go('app.allreactions');
        }else{
          showMessage.notify(response.statusText);
        }
        });
    }
  }


  //Activate account with new password and profilepic
  $scope.activateAccount = function(){

    var uploadProfilePic = function(){
             var hashedpw = md5.createHash(account.pw);
             DB.activateAccount($rootScope.mail,hashedpw,$scope.profilepic,function(response){
                 
                  showMessage.loadingHide();
                  
                  if(response.status == "200"){
                          showMessage.notify("Je account is geactiveerd, veel plezier!");
                          registerDevice(response.data);
                          $rootScope.mail = null;
                          $scope.profilepic = null;
                        }else{
                          showMessage.notify("Fout:<br/>"+response.statusText);
                        }
              });
           
    }

    //Check if user created profilepic
    if($scope.profilepic == "./img/dummy.png"){
      showMessage.popUp("Profielfoto","Je hebt nog geen profielfoto gemaakt,"+
      " weet je zeker dat je wilt doorgaan?",function(yes){
        if(yes){
          $scope.profilepic = "dummy.png";
          uploadProfilePic();
          }
      });
    }else{
       FTP.addFile(true,$scope.profilepic,"image/jpeg",function(filename){
            $scope.profilepic = filename;
            uploadProfilePic();
        });
    }

     
     
  }


      $scope.profilepic = "./img/dummy.png";
      //Create new profilephoto
      $scope.createProfilePic = function (){
               Camera.getPicture()
              .then(function(imageURI){ 
                $scope.profilepic = imageURI;
              },function(error){
                console.log("Camera probleem:</br>"+error);
              });
      } 
})

.controller('PrikLCtrl', function($state, DB, $scope, Camera, Modals,$timeout,$rootScope,showMessage,$ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicModal, $ionicGesture,$document) {
  $scope.slideHasChanged = function(index){
   $rootScope.prikldate =  $scope.prikls[index].prikl_date;
      for (var i = $scope.prikls.length - 1; i >= 0; i--) {
        if($scope.prikls[i].prikl_type == "youtube"){
          $scope.prikls[i].youtube.player.pauseVideo();
        }
      };
  }

    $scope.nextSlide = function(){
                $ionicSlideBoxDelegate.next();
              }

               $scope.previousSlide = function(){
                $ionicSlideBoxDelegate.previous();
              }

  $scope.viewPhoto = function(serverpath,filename){
      Modals.createAndShow($scope,"photoview");
      console.log($rootScope.server + serverpath + filename);
      $scope.photourl = $rootScope.server + serverpath + filename;
}


  $scope.playerVars = {
    controls: 1,
    autoplay: 0,
    modestbranding: 1,
    showinfo: 0,
    iv_load_policy: 3,
    cc_load_policy:0
};

  $scope.loading = false;
            

  $scope.loadPrikls = function(){

         //iOS youtubeplayer quickfix
        try{
        $scope.hidePlayButton = false;
        if(device.platform == "Android"){
            $scope.hidePlayButton = true;
        }
      }catch(ex){
        console.log(ex);
      }

  $scope.loading = true;
   // DB.getPrikls(12,done);
    DB.getPrikls($rootScope.groupid,function(prikls){

      $scope.loading = false;
      $scope.prikls = prikls;
      $rootScope.prikldate =  $scope.prikls[0].prikl_date;
      $ionicSlideBoxDelegate.update();
    });
  }


  $scope.hide = function(){
    $scope.iframemodal.hide();
    $rootScope.youtube.player.pauseVideo();
  }

   $scope.openlink = function(link){
    window.open(link, '_blank', 'location=yes');
  }

  
  $scope.react = function(reacttype,priklid){

    $scope.priklid = priklid;
    if(reacttype == "pic"){
        Camera.getPicture()
        .then(function(imageURI){ 
          $scope.imageURI = imageURI;
          Modals.createAndShow($scope,"photo");
        },function(error){
          console.log("Camera probleem:</br>"+error);
        });
      }
    else if(reacttype =="text"){
        Modals.createAndShow($scope,"text");
    }
    }
  
})


/*Controller for both private and group pinboards)*/
.controller('PinboardCtrl', function($scope,$state,$rootScope,$timeout,Modals,DB,Cache,showMessage) {
  $scope.noMoreItemsAvailable = false;
  $scope.noConnection = false;
  $scope.posts = [];
  $scope.loading = false;
  $scope.totalposts = 0; 

  $scope.$on('$stateChangeStart', 
      function(event, toState, toParams, fromState, fromParams){ 
      if(fromState.name == "app.myreactions"){
       Cache.put("private",$scope.posts);
      }else if(fromState.name == "app.allreactions"){
       Cache.put("group",$scope.posts);
      }
    });

  $scope.deletepost =function(postid){
  
   showMessage.confirm("Bericht verwijderen","Weet je zeker dat je je bericht wilt verwijderen?",function(answer){
    if(answer){
      DB.deletePost($rootScope.userid,postid,function(response){
        showMessage.notify(response.success);




        $timeout(function(){
          for (var i = $scope.posts.length - 1; i >= 0; i--) {
          for (var j = $scope.posts[i].posts.length - 1; j >= 0; j--) {
            if($scope.posts[i].posts[j].idposts == postid){
              $scope.posts[i].posts.splice(j, 1);
            }
          };
        };

 //Groupposts uit cache verwijderen(moet nog anders)
        var groupposts = Cache.get("group");
        for (var i = groupposts.length - 1; i >= 0; i--) {
          for (var j = groupposts[i].posts.length - 1; j >= 0; j--) {
            if(groupposts[i].posts[j].idposts == postid){
              groupposts[i].posts.splice(j, 1);
            }
          };
        };
         Cache.put("group",groupposts);
        
        },500);
        
      });
    }
   });

  }
  
//If there are posts in cache load them
$scope.load = function(pinboard){
   if(Cache.get(pinboard) != null) {
      $scope.posts = Cache.get(pinboard);
      for (var i = $scope.posts.length - 1; i >= 0; i--) {
        $scope.totalposts += $scope.posts[i].posts.length;
      };
    } 
}

$scope.viewPhoto = function(serverpath,filename){
      Modals.createAndShow($scope,"photoview");
      console.log($rootScope.server + serverpath + filename);
      $scope.photourl = $rootScope.server + serverpath + filename;
}

    /*Refreshfunction(when user pulls to refresh) check if there are new posts with postid from the newest post, 
    if there are create new date object with date-month-year and check if an array exists with this date, if not
    create an new array for these or this post and put it in front of the array(unshift)*/
     $rootScope.refresh = function(pinboard){    
      $scope.loading = true;
      if(pinboard == "group"){var id = $rootScope.groupid;}else if(pinboard == "user"){var id = $rootScope.userid;}
      DB.getNewPosts(pinboard,$scope.posts[0].posts[0].idposts,id,function(posts){
        if(posts == "NOPOSTS"){ 
          showMessage.notify("Niets nieuws");
        }else{
          showMessage.notify(posts.length + " nieuw");
            
          for (var i = 0; i < posts.length; i++){
              var date = new Date(posts[i].post_date);
              date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
              var firstdate = $scope.posts[0].date;
          
                if(firstdate.toString() == date.toString()){
                  $scope.posts[0].posts.unshift(posts[i]);
                }else{
                  var newarr = [posts[i]];
                  var datePosts = {'date':date,'posts':newarr};
                  $scope.posts.unshift(datePosts);    
                }
              $scope.totalposts++; 
          }
           $state.go('app.prikls');
           $timeout(function(){
            if(pinboard == "group"){
           $state.go('app.allreactions');
            }else{
           $state.go('app.myreactions');

            }
           },200);


        }
        $scope.loading = false;
        $scope.$broadcast('scroll.refreshComplete');
     });              
    }


  /*Loadmore function(when user scrolls to bottom of pinboard) call for 5 new posts*/
  $scope.loadMore = function(pinboard) {


                      if(!$scope.noMoreItemsAvailable && !$scope.loading && !$scope.noConnection){
                       $scope.loading = true;

                      if(pinboard == "group"){var id = $rootScope.groupid;}else if(pinboard == "user"){var id = $rootScope.userid;}
                   

                      DB.getPosts(pinboard,$scope.totalposts,5,id,function(posts) {
                          $scope.loading = false;
                          //Loop trough posts to sort by date; check if array with posts for specific date is present, if not create new 
                          //object with date and postsarray. Push these objects to $scope.posts
                          if(posts == "NOPOSTS"){ 
                             $scope.noMoreItemsAvailable = true;
                          }else if(posts == "NOCONNECTION"){
                            $scope.noConnection = true;
                          }else{
                          for (var i = 0; i < posts.length; i++){
                            //Dateformatting anders doen? nu eerst nieuw dateobject aanmaken met tijd op 0 om te sorteren,
                            //kan misschien sneller
                              var date = new Date(posts[i].post_date);
                              date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
                              var lastdate;
                              if($scope.posts.length >0){
                              lastdate = $scope.posts[$scope.posts.length-1].date;
                              }
                              if(lastdate == date.toString()){
                                $scope.posts[$scope.posts.length-1].posts.push(posts[i]);
                              }else{
                                var newarr = [];
                                newarr.push(posts[i]);
                                var datePosts = {'date':date,'posts':newarr};
                                $scope.posts.push(datePosts);    
                              }
                               $scope.totalposts++;
                             
                          }
                          $scope.$broadcast('scroll.infiniteScrollComplete');
                          $scope.$broadcast('scroll.resize');
                        }
                        });
            }
  }

   //Count chars for fontsize
      $scope.countchars = function(textlength) {
          var s = 70 - (textlength*3);
          return s + "px";
      };
  })

  .controller('PhotoPostCtrl', function($scope,$state,$rootScope,showMessage,DB,FTP){

   $scope.post = function(){
     showMessage.popUp("Fotobericht","Wil je de fotobericht publiek plaatsen?",function(publica){
      showMessage.loading("Fotobericht uploaden");

         FTP.addFile(false,$scope.photomodal.photo,"image/jpeg",function(filename){
         
            if($scope.priklid == undefined){$scope.priklid = 0;}
            if($scope.photomodal.posttext == undefined){$scope.photomodal.posttext = "";}

             DB.addPost($rootScope.userid,$rootScope.groupid,$scope.priklid,$scope.photomodal.posttext,"pic",filename,publica,function(returned){
                  
                  if(returned.success){
                    showMessage.loadingHide();
                  $scope.photomodal.remove();

                   if(publica){
                    $state.go('app.allreactions');  $timeout(function(){
                    $rootScope.refresh("group");
                      showMessage.notify("Fotobericht succesvol toegevoegd");
                    },500);
                  }else{
                    $state.go('app.myreactions');
                    $timeout(function(){
                    $rootScope.refresh("user");
                      showMessage.notify("fotobericht succesvol toegevoegd");
                    },500);
                  }


                  }else{
                    showMessage.notify("Er is iets fout gegaan");
                  }
              });

            });   
        }); 
   }
       
  })


 .controller('FeedbackCtrl', function($scope,$state,$rootScope,showMessage,DB,FTP){

    $scope.post = function(){
             DB.addFeedback($rootScope.userid,$rootScope.groupid,$scope.feedbackmodal.posttext, function(returned){
                  if(returned.success){
                    showMessage.notify("Bedankt voor je feedback. Je bericht wordt zo spoedig mogelijk in behandeling genomen.");
                    $scope.feedbackmodal.remove();
                  }else{
                    showMessage.notify("Er is iets fout gegaan");
                  }
              });
             
            }
  })

 .controller('BugCtrl', function($scope,DB,Modals){

    $scope.feedback = function(){
    Modals.createAndShow($scope,"feedback");
  }

    $scope.bugs = function(){
      console.log('indefucniot');
             DB.getBugs(function(data){
                  $scope.bugs = data;
              });
             
            }
  })

  .controller('TextPostCtrl', function($scope,$timeout,$state,$rootScope,showMessage,DB){
       $scope.post = function(){
            showMessage.popUp("Tekstbericht","Iedereen mag het zien",function(publica){
              if($scope.priklid == undefined){$scope.priklid = 0;}
              DB.addPost($rootScope.userid,$rootScope.groupid,$scope.priklid,
                $scope.textmodal.posttext,"text","",publica,function(returned){
                if(returned.success){
                  $scope.textmodal.remove();

                  if(publica){
                    $state.go('app.allreactions');  $timeout(function(){
                    $rootScope.refresh("group");
                      showMessage.notify("Tekstbericht succesvol toegevoegd");
                    },500);
                  }else{
                    $state.go('app.myreactions');
                    $timeout(function(){
                    $rootScope.refresh("user");
                      showMessage.notify("Tekstbericht succesvol toegevoegd");
                    },500);
                  }

            
                }else{
                  showMessage.notify("Er is iets fout gegaan");
                }
            });
          });
         }
  })

.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});
