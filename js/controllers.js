angular.module('prikl.controllers', ['youtube-embed'])

.controller('AppCtrl', function($scope,$rootScope, $state, Modals, Camera,Message) {

   if($rootScope.userid == undefined && $rootScope.groupid == undefined){
    $rootScope.userid = 156;
    $rootScope.groupid = 69;
  }

    //Logoutfunction for logout in menu
    $scope.logout = function(){
        Message.question("Uitloggen","Weet je zeker dat je wilt uitloggen?",function(answer){
             if(answer){
                  Message.notify("Uitgelogd");
                  //  DB.unregisterDevice()
                  window.localStorage.removeItem('userdevice');
                  $state.go('login');
                }
        });
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

//Controller for Login/Activate/RegisterDevice/Tokencheck
.controller('LoginCtrl', function($scope,$rootScope,$state,AuthenticationService,FileTransferService,Camera,Message) {
  
  $scope.credentials = AuthenticationService.credentials;
  $scope.userinfo = AuthenticationService.userinfo;
  $scope.deviceinfo = AuthenticationService.deviceinfo;

  $scope.checkToken = function(){
    var userdevice = window.localStorage.getItem('userdevice');
    if(userdevice != undefined){
      //If token-userid pair matches DB, go to pinboard and set userid + groupid
      //If token mismatches remove it from localstorage and go to login
      userdevice = angular.fromJson(userdevice);
      AuthenticationService.checkToken(userdevice.userid,userdevice.token)
      .then(function(response){
        $rootScope.userid = userdevice.userid;
        $rootScope.groupid = userdevice.group_id;
        $state.go('app.allreactions');
      },function(error){
        //token mismatch 
        Message.notify("Error:</br>"+error);
        window.localStorage.removeItem('userdevice');
      });
    }else{
      $state.go('login');
    }
  }

  //Verify useraccount mail and password
  $scope.verifyAccount = function(){
    Message.loading("Inloggen");
    AuthenticationService.verifyAccount($scope.credentials)
    .then(function(response){
     Message.loadingHide().then(function(){

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
      });
   }, function(error){
    Message.loadingHide().then(function(){
      Message.notify(error);
    });
  });
  }

  $scope.registerDevice = function(){
   if(AuthenticationService.deviceinfo.pushid == ''){
      //Browsers and devices won't get a DeviceID
      $rootScope.userid = AuthenticationService.userinfo.userid;
      $rootScope.groupid = AuthenticationService.userinfo.groupid;
      Message.notify("No Push ID <br/> User:"+$rootScope.userid+",Group:"+$rootScope.groupid);
      $state.go('app.allreactions');
    }else{
      //Registerdevice, send DeviceID(From Googles/Apples Cloud Messaging Service) to server,
      //server generates token, device stores this token in localstorage
 
      AuthenticationService.registerDevice($scope.userinfo, $scope.deviceinfo)
      .then(function(response){
        window.localStorage.setItem('userdevice', JSON.stringify(response.data));
        var userdevice = angular.fromJson(window.localStorage.getItem('userdevice'));
        $state.go('app.allreactions');
      },function(error){
        Message.notify(error);
      });
    }
  }

  //Activate account with new password and profilepic
  $scope.activateAccount = function(){
    var activate = function(profilepic){
      Message.loading("Account activeren");

      AuthenticationService.activateAccount($scope.credentials,profilepic)
      .then(function(response){
       Message.loadingHide().then(function(){
        //Account activated -> register device
        AuthenticationService.userinfo.userid = response.data.iduser;
        AuthenticationService.userinfo.groupid = response.data.groupid;
        $scope.registerDevice();
      });
     }, function(error){
      Message.loadingHide().then(function(){
        Message.notify(error);
      });
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
      Message.loading("Profielfoto uploaden");
      FileTransferService.uploadProfilePic($scope.userinfo.profilepic)
      .then(function(filename){
        Message.loadingHide().then(function(){
          activate(filename);
        })
      },function(error){
        Message.loadingHide().then(function(){
          Message.notify(error);
        });
        console.log("uploaderror");
        console.log(error);
      });
    }  
  }


  //Create new profilephoto
  $scope.getPhoto = function (){
   Camera.getPicture()
   .then(function(imageURI){ 
    $scope.userinfo.profilepic = imageURI;
  },function(error){
    console.log("Camera probleem:</br>"+error);
  });
 } 
})

.controller('PrikLCtrl', function($state, $scope, Camera, Modals,$timeout,PostService,$rootScope,Message, $ionicSideMenuDelegate,$ionicSlideBoxDelegate) {
   
   $scope.prikls = [];
   $ionicSideMenuDelegate.canDragContent(false);
   $scope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      if(fromState.name == "app.prikls"){
          $ionicSideMenuDelegate.canDragContent(true);
     }
   });


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

  //iOS BUG Iframe hides when user changes slide -> Quickfix custom playbutton + youtubeimage as image background
        try{
        $scope.hidePlayButton = false;
        if(device.platform == "Android"){
            $scope.hidePlayButton = true;
        }
      }catch(ex){
        console.log(ex);
      }

  $scope.loading = true;
    PostService.getPrikls().then(
      function(prikls){
        console.log(prikls);
       $scope.loading = false;
       $scope.prikls = prikls;
       $rootScope.prikldate =  $scope.prikls[0].prikl_date;
       $ionicSlideBoxDelegate.update();
      },function(error){
        Message.notify(error);
      }
    );
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

.controller('PinboardCtrl',function($scope,$rootScope,$timeout,PostService,Cache,Message,Modals){
  $scope.noMoreItemsAvailable = false;
  $scope.noConnection = false;
  $scope.posts = [];
  $scope.loading = false;
  $scope.posts.total = 0; 

 

  
  $scope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      if(fromState.name == "app.myreactions"){
       Cache.put("private",$scope.posts);
     }else if(fromState.name == "app.allreactions"){
       Cache.put("group",$scope.posts);
     }
   });

  //If there are posts in cache load them
  $scope.load = function(pinboard){
   if(Cache.get(pinboard) != null) {
    $scope.posts = Cache.get(pinboard);
    for (var i = $scope.posts.length - 1; i >= 0; i--) {
      $scope.totalposts += $scope.posts[i].posts.length;
    };
  } 
}
    /*Refreshfunction(when user pulls to refresh) check if there are new posts with postid from the newest post, 
    if there are create new date object with date-month-year and check if an array exists with this date, if not
      create an new array for these or this post and put it in front of the array(unshift)*/
    $rootScope.refresh = function(pinboard){    
      $scope.loading = true;
      PostService.getNewPosts(pinboard,$scope.posts[0].posts[0].idposts)
      .then(function(posts){
       if(posts == "NOPOSTS"){ 
        Message.notify("Geen nieuwe posts");
      }else{
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
    },function(error){

      Message.notify(error);
    });
}

$scope.loadMore = function(pinboard) { 
  if(!$scope.noMoreItemsAvailable && !$scope.loading && !$scope.noConnection){
   $scope.loading = true;

   PostService.getPosts(pinboard,$scope.posts.total,10)
   .then(function(posts){
                        //Divide posts per date, for every post create new dateobject with time 00:00:00, check
                        //if there is a object with same date, if there is not create a object with an array for this date
                        //"posts":[ { date : "12 october 2014" , posts : [post,post,post,post] },
                        // { date : "13 october 2014" , posts : [post,post] }, { date : "14 october 2014" , posts : [post,post,post] } ]
                        if(posts == "NOPOSTS"){
                          $scope.noMoreItemsAvailable = true;
                        }
                        else{
                          for (var i = 0; i < posts.length; i++){
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
                              var newDateArray = {'date':date,'posts':newarr};
                              $scope.posts.push(newDateArray);    
                            }
                            $scope.posts.total++;
                          }
                        }
                        $scope.loading = false;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.resize');
                      },function(error){
                        Message.notify("Error:</br>"+error);
                      });
}
}

$scope.deletepost =function(postid){
 Message.question("Bericht verwijderen","Weet je zeker dat je je bericht wilt verwijderen?",function(answer){
  if(answer){
    PostService.deletePost(postid)
    .then(function(){
        //Delete from posts
        $timeout(function(){
          for (var i = $scope.posts.length - 1; i >= 0; i--) {
            for (var j = $scope.posts[i].posts.length - 1; j >= 0; j--) {
              if($scope.posts[i].posts[j].idposts == postid){
                $scope.posts[i].posts.splice(j, 1);
              }
            };
          };

        //Delete from groupposts in cache 
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
      },function(error){
        Message.notify(error);
      });
  }
});
}

  //Count chars for fontsize
  $scope.countchars = function(textlength) {
    var s = 70 - (textlength*4);
    return s + "px";
  };


  $scope.viewPhoto = function(serverpath,filename){
    Modals.createAndShow($scope,"photoview");
    console.log($rootScope.server + serverpath + filename);
    $scope.photourl = $rootScope.server + serverpath + filename;
  }

  $scope.showPrikl = function(priklid){
    PostService.getSinglePrikl(priklid)
    .then(function(prikl){
      console.log(prikl);
      Message.notify(prikl[0].prikl_date + "</br>" +prikl[0].prikl_title)
    },function(error){
      Message.notify(error);
    });
  }
})

.controller('AccountCtrl',function($scope,PostService,Message){
 $scope.loading=false;
  $scope.loadAccountData = function(){
     $scope.loading=true;
      PostService.getAccountData()
  .then(function(userdata){
    console.log(userdata);
    $scope.loading=false;
    $scope.account = userdata[0];
  },function(error){
    $scope.loading=false;
    Message.notify(error);
  });
  }



})

.controller('PhotoPostCtrl', function($scope,$state,$rootScope,PostService,FileTransferService,Message){

 $scope.post = function(){
   Message.question("Fotobericht","Iedereen mag het zien",function(pblic){
    Message.loading("Fotobericht uploaden");
    FileTransferService.uploadPhoto($scope.photomodal.photo)
    .then(function(filename){
      if($scope.priklid == undefined){$scope.priklid = 0;}
      if($scope.photomodal.posttext == undefined){$scope.photomodal.posttext = "";}
      PostService.addPost($scope.priklid,$scope.photomodal.posttext,"pic",filename,pblic)
      .then(function(response){
       $scope.photomodal.remove();
       Message.loadingHide();
       Message.notify("Fotobericht opgeslagen");
       if(pblic){
        $state.go('app.allreactions');
      }else{
        $state.go('app.myreactions');
      }
    },function(error){
      Message.notify(error);
    });
    },function(error){
      Message.notify(error);
    });
  }); 
 }

})


.controller('TextPostCtrl', function($scope,$timeout,$state,$rootScope,PostService,Message){
 $scope.post = function(){
  Message.question("Tekstbericht","Iedereen mag het zien",function(pblic){
    Message.loading("Tekstbericht versturen");
    if($scope.priklid == undefined){$scope.priklid = 0;}
    PostService.addPost($scope.priklid,$scope.textmodal.posttext,"text","",pblic)
    .then(function(){
      $scope.textmodal.remove();
      Message.loadingHide();
      Message.notify("Tekstbericht opgeslagen");
      if(pblic){
        $state.go('app.allreactions');
      }else{
        $state.go('app.myreactions');
      }
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
      Message.notify("Bedankt voor je feedback.</br> Je bericht wordt zo spoedig mogelijk in behandeling genomen.");
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
