angular.module('prikl.controllers', ['youtube-embed'])


.controller('AppCtrl', function($scope,$rootScope, $state, Modals, Camera,Message, 
  $stateParams,$ionicPlatform,PushProcessing,AuthenticationService) {

   if($rootScope.userid == undefined && $rootScope.groupid == undefined){
    $rootScope.userid = 213;
    $rootScope.groupid = 86;
  }

  $scope.go = function(string)
  {
    $state.go(string);
  }

    //Logoutfunction for logout in menu
    $scope.logout = function(){
        Message.question("Uitloggen","Weet je zeker dat je wilt uitloggen?",function(answer){
             if(answer){
          
                  if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()){

                  //Unregisterdevice from DB
                  var token = angular.fromJson(window.localStorage.getItem('userdevice')).token;
                  AuthenticationService.unregisterDevice(token);

                  //Unregister Push
                  PushProcessing.unregister();

                  //Remove Cache
                  window.localStorage.removeItem('userdevice');
                  window.localStorage.removeItem('group');
                  window.localStorage.removeItem('private');
                  }

                  Message.notify("Uitgelogd");
                  $state.go('login');
                }
        });
      }

   //Functions for new posts
  $scope.photo = function(){
   Camera.getPicture(0)
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

//Controller for Login/Activate/RegisterDevice/Tokencheck
.controller('LoginCtrl', function($scope,Modals,$timeout,$rootScope,$state,$ionicLoading,
  AuthenticationService,FileTransferService,PushProcessing,Camera,Message,$stateParams) {
  
  $scope.credentials = AuthenticationService.credentials;
  $scope.userinfo = AuthenticationService.userinfo;
  $scope.noConnection = false;

  $scope.checkToken = function(){
    var userdevice = window.localStorage.getItem('userdevice');
     $scope.noConnection = false;

    if(userdevice != undefined){
      //If token-userid pair matches DB, go to pinboard and set userid + groupid
      //If token mismatches remove it from localstorage and go to login
      userdevice = angular.fromJson(userdevice);
      AuthenticationService.checkToken(userdevice.userid,userdevice.token)
      .then(function(response){
        $rootScope.userid = userdevice.userid;
        $rootScope.groupid = userdevice.group_id;
         $state.go('app.allreactions');
       // $state.go('app.allreactions/:idpost',{idpost:'xdfvbfgbfg'});
        // window.location = "#/app/allreactions/dbvdf";
      },function(error){
        //token mismatch
        if(error == 467){
          $ionicLoading.show({template:"Tokenfout</br>Log opnieuw in",duration:3000});
          window.localStorage.removeItem('userdevice');
          $state.go('login');
        }else{
          $scope.noConnection = true;
          $ionicLoading.show({template:error,duration:3000});
        }
      });
    }else{
      $state.go('login');
    }
  }

  //Verify useraccount mail and password
  $scope.verifyAccount = function(){
    $ionicLoading.show({template:"Inloggen"});
    AuthenticationService.verifyAccount($scope.credentials)
    .then(function(response){
    
     $ionicLoading.hide();

      AuthenticationService.userinfo.userid = response.data.iduser;
      AuthenticationService.userinfo.groupid = response.data.groupid;
      AuthenticationService.userinfo.userfirstname= response.data.firstname;
      AuthenticationService.userinfo.userlastname = response.data.lastname;

      if(response.status == "200"){
          //Account already activated -> register device
          $scope.registerDevice();
        }else{
          //Account not activated -> activate
          $scope.credentials.pw = "";
          $state.go('activate');
        }
    

   }, function(error){
    console.log(error);
    $ionicLoading.hide();
    $ionicLoading.show({template:error,duration:2000});
  });
  }

  $scope.registerDevice = function(){
      $rootScope.userid = AuthenticationService.userinfo.userid;
      $rootScope.groupid = AuthenticationService.userinfo.groupid;

   //Register device for pushNotifications
   if(ionic.Platform.isIOS() || ionic.Platform.isAndroid()){
     
      //Registerdevice, send DeviceID(From Googles/Apples Cloud Messaging Service) to server,
      //server generates token, device stores this token in localstorage
      $ionicLoading.show({template:"Apparaat registreren"});

          AuthenticationService.registerDevice($scope.userinfo)
              .then(function(response){
                $ionicLoading.hide();
                $ionicLoading.show({template:"Apparaat geregistreerd",duration:500});
                window.localStorage.setItem('userdevice', JSON.stringify(response.data));
                $state.go('app.allreactions');
              },function(error){
                $ionicLoading.hide();
                $ionicLoading.show({template:error,duration:3000});
              });
     
    }else{ 
      //Browsers and devices won't get a DeviceID
      $ionicLoading.show({template:"Geen Android of iOS",duration:1000});
      
      //$state.go('app.allreactions');
      $state.go('app.allreactions', { 'type':'comment','commentid':'500','postid':'0' });
    }
  }

  //Activate account with new password and profilepic
  $scope.activateAccount = function(){
    var activate = function(profilepic){
      $ionicLoading.show({template:"Account activeren"});
      AuthenticationService.activateAccount($scope.credentials,profilepic)
      .then(function(response){
        $ionicLoading.hide();
        //Account activated -> register device
        AuthenticationService.userinfo.userid = response.data.iduser;
        AuthenticationService.userinfo.groupid = response.data.groupid;
        $scope.registerDevice();
 
     }, function(error){
        $ionicLoading.hide();
        $ionicLoading.show({template:error,duration:3000});
    });
    }

    //Check if user created profilepic
    if($scope.userinfo.profilepic == "./img/dummy.png"){
      Message.question("Profielfoto","Je hebt nog geen profielfoto gemaakt,"+
        " weet je zeker dat je wilt doorgaan?",function(answer){
          if(answer){
            activate("dummy.png");
          }
        });
    }else{
      $ionicLoading.show({template:"Profielfoto uploaden"});
      FileTransferService.uploadProfilePic($scope.userinfo.profilepic)
      .then(function(filename){
        $ionicLoading.hide();
        activate(filename);
      },function(error){
        $ionicLoading.hide();
        $ionicLoading.show({template:error,duration:3000});
        console.log(error);
      });
    }  
  }

  //Forgot password
  $scope.forgotPassword = function(){
    Modals.createAndShow($scope, "newpassword");
  }

  $scope.requestPassword = function(){
    $ionicLoading.show({template:"Wachtwoordreset aanvragen"});
    AuthenticationService.resetPassword($scope.credentials.accountmail)
    .then(function(response){
      $ionicLoading.hide();
      if(response.status == 201){
      $ionicLoading.show({template:response.statusText,duration:3000}); 
      }else{
      $ionicLoading.show({template:"Je wachtwoord is gereset, je ontvangt een mail met je nieuwe wachtwoord",duration:3000});  
      }
    },function(error){
      $ionicLoading.hide();
      $ionicLoading.show({template:error,duration:1500});
    });
    $scope.newpasswordmodal.remove();
  }


  //Create new profilephoto
  $scope.getPhoto = function (){
   Camera.getPicture(1)
   .then(function(imageURI){ 
    $scope.userinfo.profilepic = imageURI;
  },function(error){
    console.log("Camera probleem:</br>"+error);
  });
 } 
})

.controller('PinboardCtrl',function($scope,$rootScope,$stateParams,Camera,
  $timeout,$ionicScrollDelegate,Modals,PostService,PushProcessing,$ionicPlatform,$state){

$scope.posts = [];
$scope.itemsAvailable = true;
$scope.loadingMessage = "";
$rootScope.newMessage = "";
$scope.loadMoreCounter = 0;

//When app opens from notification in coldstart, pinboardctrl is loaded before PushProcessing.notification is set
  if(PushProcessing.notification.commentid != '')
  {
    $scope.commentPostID = PushProcessing.notification.commentid;
    PushProcessing.notification.commentid = '';
    PushProcessing.notification.type = '';
    $timeout(function(){
      Modals.createAndShow($scope,"comments");
    },500);
  }

$rootScope.$watch('newMessage', function(){
   if($rootScope.newMessage != ""){
         $timeout(function(){
           $rootScope.newMessage = "";
         },7000);   
      }
});

$scope.$watch('loadingMessage', function() {
      if($scope.loadingMessage != ""){
         $timeout(function(){
            $scope.loadingMessage = "";
         },5000);   
      }
   });

//Refresh
$scope.doRefresh = function(pinboard){
    
      if($scope.posts.length==0){var lastpostid=0;}
      else if(pinboard == 'prikl'){
        var lastpostid = $scope.posts[0].idprikl;
      }else{
        var lastpostid = $scope.posts[0].idposts;
      }
      
      PostService.getNewPosts(pinboard,lastpostid)
      .then(function(posts){   
        if(posts == "NOPOSTS"){
          if(pinboard == 'prikl'){$scope.loadingMessage = "Er zijn geen nieuwe PrikLs beschikbaar";}
          else{$scope.loadingMessage = "Er zijn geen nieuwe posts beschikbaar";}
        }else{
          $scope.loadingMessage = posts.length + " nieuw";
          for(var i = 0;i<posts.length;i++){
            $scope.posts.unshift(posts[i]);
          }
        }
      },function(error){
        $scope.loadingMessage = error;
      })
      .finally(function(){
       $scope.$broadcast('scroll.refreshComplete');
      })

}

  //Infinite Scrolling
  $scope.loadMore = function(pinboard) { 
      PostService.getPosts(pinboard,$scope.posts.length,12)
         .then(function(posts){

          if(posts == "NOPOSTS"){
            $scope.itemsAvailable = false;
            if(pinboard == 'prikl'){$scope.loadingMessage = "Er zijn geen oudere PrikLs beschikbaar";}
            else{$scope.loadingMessage = "Er zijn geen oudere berichten beschikbaar";}
          }

          else{ 

            for (var i = 0; i < posts.length; i++)
            {              
              $scope.posts.push(posts[i]);
            }
              console.log('LAADMEER:');
          }

        },
        function(error){
          $scope.loadingMessage = error;
        })
         .finally(function(){
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.$broadcast('scroll.resize');
        });        
}

 $scope.getDynamicWidth = function(){
    if(window.innerWidth <= 650){
      return "100%";
    }
    else if(window.innerWidth <= 950){
      return "50%";
    }else if (window.innerWidth <= 1250){
      return "33%";
    }else{
      return "25%";
    }
 }

 $scope.photoprev = function(photo){
    $scope.photofile = $rootScope.server+"/posts/images/"+photo;
    Modals.createAndShow($scope,"photoview");
 }

 $scope.openprikl = function(prikl){
    $scope.prikl = prikl;
    switch(prikl.prikl_type){
      case "pic":
        $scope.photofile = $rootScope.server+"/images/prikls/"+prikl.prikl_file;
         Modals.createAndShow($scope,"photoview");
      break;
      case "youtube":
          $scope.youtubeid = prikl.prikl_url + "?rel=0";
          Modals.createAndShow($scope,"youtube");
      break;
      case "url":
          window.open(prikl.prikl_url, '_blank', 'location=yes');
      break;
      case "text":
      break;
    }
 }

 $scope.priklprev = function(priklid){
  PostService.getSinglePrikl(priklid)
  .then(function(prikl){
  Modals.createAndShow($scope,"priklview");
    $scope.prikl = prikl[0];
  },function(err){
    alert(err);
  });
 }

 $scope.react = function(postid){
    $scope.commentPostID = postid;
    $rootScope.newMessage = "";
    Modals.createAndShow($scope,"comments");
 }

 $scope.reactprikl = function(prikl){

   try{
    if($scope.youtubemodal){
      $scope.youtubemodal.youtube.player.pauseVideo();
    }}catch(ex){console.log(ex);}

    $scope.priklid = prikl.idprikl;

    switch(prikl.prikl_react_type)
    {
      case "pic":
        Camera.getPicture(0)
        .then(function(imageURI){ 
          $scope.imageURI = imageURI;
          Modals.createAndShow($scope,"photo");
        },function(error){
          console.log("Camera probleem:</br>"+error);
        });
      break;
      case "text":
        Modals.createAndShow($scope,"text");
      break;
    }
 }

 $scope.delete = function(post){
    PostService.deletePost(post.idposts).then(function(posts){
      
    },function(error){
      $scope.loadingMessage = error;
    });
 }

})

.controller('CommentCtrl',function($scope,PostService,Message){

$scope.data = {showDelete:false};

  $scope.loadComments = function(){
      PostService.getComments($scope.commentPostID).then(function(comments){
        $scope.postComments = comments;
      },function(error){
        Message.notify(error);
     }); 
  }

 $scope.deleteComment = function(commentid)
 {
    Message.question("Reactie verwijderen","Weet je zeker dat je je reactie wilt verwijderen?",function(answer){
      if(answer){
        PostService.deleteComment(commentid)
        .then(function(){

          $scope.loadComments();

          },function(error){
            Message.notify(error);
          });
      }
    });
 }

 $scope.comment_on_post = function()
 {
        Message.loading("Reactie versturen");
        PostService.addComment($scope.commentPostID, $scope.commentModal.commenttext)
          .then(function(){

            $scope.loadComments();
            $scope.commentModal.commenttext = "";
            
            Message.loadingHide();
          },function(error){
            Message.notify(error);
          });
 }

})

.controller('AccountCtrl',function($scope,$rootScope,PostService,FileTransferService,$ionicLoading,PostService,Message,Camera){

  $scope.newProfilePicSet = false;
  $scope.settingsChanged = false;
  $scope.activateButton = false;
  $scope.checkboxes = {comm1:true,comm2:true};

   var token;

      $ionicLoading.show({template:"Wijzigingen opslaan..."});
      // var token = "1101dfc89053b7b3e99bb4815a66c0347956b89c";
     
        var userdevice = window.localStorage.getItem('userdevice');
        if(userdevice != undefined){
          //If token-userid pair matches DB, go to pinboard and set userid + groupid
          //If token mismatches remove it from localstorage and go to login
          userdevice = angular.fromJson(userdevice);
          token = userdevice.token + "";
          // alert(token);
        }
        else
        {
          token = "";
        }

  $scope.getNewProfilePic = function(){
    Camera.getPicture(1)
       .then(function(imageURI){ 
        $scope.account.user_pic = imageURI;
        $scope.newProfilePicSet = true;
        $scope.activateButton = true;
      },function(error){
        console.log("Camera probleem:</br>"+error);
      });
     } 

     $scope.changeSettings = function()
     {
      console.log();
        $scope.settingsChanged = true;
        $scope.activateButton = true;
     }

     $scope.saveSettings = function()
     {
        if  ($scope.newProfilePicSet === true) 
              {
                $scope.saveProfilePic();
              }
          
        if  ($scope.settingsChanged === true)
              {
                $scope.saveProfileSettings();
              }
     }

    $scope.saveProfileSettings = function()
    {
        PostService.changeSettings($scope.checkboxes.comm1, $scope.checkboxes.comm2, token)
                .then(function(){
                  $ionicLoading.hide();
                  // alert("comm1:" + $scope.checkboxes.comm1 + " comm2:" + $scope.checkboxes.comm2);
                  $ionicLoading.show({template:"Je wijzigingen zijn opgeslagen!",
                    duration:1500});
                  $scope.settingsChanged = false;
                },function(error){
                  $ionicLoading.show({template:error,duration:3000});
                });

    }

    $scope.saveProfilePic = function(){
      $ionicLoading.show({template:"Profielfoto uploaden"});
      FileTransferService.uploadProfilePic($scope.account.user_pic)
      .then(function(filename){
        PostService.addProfilePic(filename)
        .then(function(){  
          $ionicLoading.hide();
          $ionicLoading.show({template:"Je nieuwe profielfoto is opgeslagen",
            duration:1500});
          $scope.newProfilePicSet = false;
        },function(error){
          $ionicLoading.show({template:error,duration:3000});
        });
      },function(error){
        $ionicLoading.hide();
        $ionicLoading.show({template:error,duration:3000});
        console.log(error);
      });
    }

  $scope.loadAccountData = function(){
      $ionicLoading.show({template:"Accountgegevens laden"});
      PostService.getAccountData(token)
  .then(function(userdata){
    $scope.checkboxes.comm1 = userdata[0].notify_own_post;
    $scope.checkboxes.comm2 = userdata[0].notify_other_comments;
    $ionicLoading.hide();
    $scope.account = userdata[0];
    $scope.account.user_pic = $rootScope.server + "/images/users/" + $scope.account.user_pic;
  },function(error){
    $ionicLoading.hide();
    $ionicLoading.show({template:error,duration:3000});
  });
  }
})




.controller('PhotoPostCtrl', function( $ionicSideMenuDelegate,$scope,$timeout,$state,$rootScope,PostService,FileTransferService,Message){

 $scope.post = function(){
   Message.question("Fotobericht","Mag iedereen dit zien?",function(pblic){
    Message.loading("Fotobericht uploaden");
    FileTransferService.uploadPhoto($scope.photomodal.photo)
    .then(function(filename){
      if($scope.priklid == undefined){$scope.priklid = 0;}
      if($scope.photomodal.posttext == undefined){$scope.photomodal.posttext = "";}
      PostService.addPost($scope.priklid,$scope.photomodal.posttext,"pic",filename,pblic)
      .then(function(response){
        if($scope.youtubemodal){
        $scope.youtubemodal.remove();
      }

          $ionicSideMenuDelegate.canDragContent(true);
      
      //DIRTY QUICKFIX, DOM WON'T LOAD IMAGES PROPERLY ON ALLREACTIONS AFTER UPLOADING
      $state.go('app.account');
      $timeout(function(){
        if(pblic){
           Message.loading("Fotobericht uploaden");
        $state.go('app.allreactions');
          $timeout(function(){
            $state.go('app.account');
               $timeout(function(){
                      $state.go('app.allreactions');

                     Message.loadingHide();
                        

                    $scope.photomodal.remove();
                     Message.notify("Fotobericht opgeslagen");

                },300);
          },300);
      }else{
       Message.loadingHide();
       Message.notify("Fotobericht opgeslagen");
      $scope.photomodal.remove();
        $state.go('app.myreactions');
      }
      },100);

    },function(error){
      Message.notify(error);
    });
    },function(error){
      Message.notify(error);
    });
  }); 
 }

})


.controller('TextPostCtrl', function($ionicSideMenuDelegate,$scope,$timeout,$state,$rootScope,PostService,Message){
 $scope.post = function(){
  Message.question("Tekstbericht","Mag iedereen dit zien?",function(pblic){
    Message.loading("Tekstbericht versturen");
    if($scope.priklid == undefined){$scope.priklid = 0;}
    PostService.addPost($scope.priklid,$scope.textmodal.posttext,"text","",pblic)
    .then(function(){
      

          $ionicSideMenuDelegate.canDragContent(true);
      //Quickfix ga naar andere view om daarna refreshfunctie aan te roepen
      $state.go('app.account');
      $timeout(function(){
        if(pblic){
        $state.go('app.allreactions');
      }else{
        $state.go('app.myreactions');
      }
      if($scope.youtubemodal){
        $scope.youtubemodal.remove();
      }
       $scope.textmodal.remove();
       Message.loadingHide();
       Message.notify("Tekstbericht opgeslagen");
      },500);
      
    },function(error){
      Message.notify(error);
    });
  });
}
})

.controller('BugCtrl', function($scope,PostService,Modals,Message){

  $scope.post = function(){
    PostService.addFeedback($scope.feedbackmodal.posttext)
    .then(function(){
      Message.notify("Bedankt voor je feedback.<br> Je bericht wordt zo spoedig mogelijk in behandeling genomen.");
      $scope.feedbackmodal.remove();
    },function(error){
      Message.notify(error);
    });
  }

  $scope.feedback = function(){
    Modals.createAndShow($scope,"feedback");
  }

  $scope.bugs = function(){
   PostService.getBugs().then(function(bugs){
    $scope.bugs = bugs;
   },function(error){
    Message.notify(error);
   });  
 }
})

.controller('BugCtrl', function($scope,PostService,Modals,Message, $timeout){

  $scope.post = function(){
    PostService.addFeedback($scope.feedbackmodal.posttext)
    .then(function(){
      Message.notify("Bedankt voor je feedback.<br> Je bericht wordt zo spoedig mogelijk in behandeling genomen.");
      $scope.feedbackmodal.remove();
    },function(error){
      Message.notify(error);
    });
  }

  $scope.feedback = function(){
    Modals.createAndShow($scope,"feedback");
  }

  $scope.bugs = function(){
   PostService.getBugs().then(function(bugs){
    $scope.bugs = bugs;
   },function(error){
    Message.notify(error);
   });  
 }
})

.filter('timeAgo', function() {
      return function(date) {
        return moment(date).fromNow(); 
      };
})

.filter('momentDate', function() {
      return function(date) {
        return moment(date).format("dddd D MMMM"); 
      };
})


