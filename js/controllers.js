angular.module('prikl.controllers', ['youtube-embed'])

.controller('AppCtrl', function($scope,$rootScope, $state, Modals, Camera,Message) {

  //  if($rootScope.userid == undefined && $rootScope.groupid == undefined){
  //   $rootScope.userid = 156;
  //   $rootScope.groupid = 69;
  // }

    //Logoutfunction for logout in menu
    $scope.logout = function(){
        Message.question("Uitloggen","Weet je zeker dat je wilt uitloggen?",function(answer){
             if(answer){
                  Message.notify("Uitgelogd");
                  //  DB.unregisterDevice()
                  window.localStorage.removeItem('userdevice');
                  window.localStorage.removeItem('group');
                  window.localStorage.removeItem('private');
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
.controller('LoginCtrl', function($scope,$rootScope,$state,$ionicLoading,AuthenticationService,FileTransferService,Camera,Message) {
  
  $scope.credentials = AuthenticationService.credentials;
  $scope.userinfo = AuthenticationService.userinfo;
  $scope.deviceinfo = AuthenticationService.deviceinfo;
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

   if(AuthenticationService.deviceinfo.pushid == ''){
      //Browsers and devices won't get a DeviceID

      $ionicLoading.show({template:"Geen Push ID verkregen",duration:1000});
      $state.go('app.allreactions');
    }else{
      //Registerdevice, send DeviceID(From Googles/Apples Cloud Messaging Service) to server,
      //server generates token, device stores this token in localstorage
 
      $ionicLoading.show({template:"Apparaat registreren"});
      AuthenticationService.registerDevice($scope.userinfo, $scope.deviceinfo)
      .then(function(response){
        $ionicLoading.hide();
        window.localStorage.setItem('userdevice', JSON.stringify(response.data));
        var userdevice = angular.fromJson(window.localStorage.getItem('userdevice'));
        $state.go('app.allreactions');
      },function(error){
        $ionicLoading.hide();
        $ionicLoading.show({template:error,duration:3000});
      });
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

.controller('PrikLCtrl', function($state, $scope, Cache, Camera, Modals,$timeout,PostService,
  $rootScope,Message, $ionicLoading, $ionicSideMenuDelegate,$ionicSlideBoxDelegate) {
   
   $scope.loading = false;
   $scope.prikls = [];

   $ionicSideMenuDelegate.canDragContent(false);
   $scope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){ 
      if(fromState.name == "app.prikls"){
         // Cache.put("prikls",$scope.prikls);
          $ionicSideMenuDelegate.canDragContent(true);
     }
   });


  $scope.slideHasChanged = function(index){
   $rootScope.prikldate =  $scope.prikls[index].prikl_date;
      for (var i = $scope.prikls.length - 1; i >= 0; i--) {
        if($scope.prikls[i].prikl_type == "youtube"){
          try{
          $scope.prikls[i].youtube.player.pauseVideo();
          }catch(ex){
          //console.log(ex);
          }
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
      //console.log($rootScope.server + serverpath + filename);
      $scope.photourl = $rootScope.server + serverpath + filename;
}

   $scope.openlink = function(link){
    window.open(link, '_blank', 'location=yes');
  }

  $scope.openyoutube = function(ytprikl){
      $scope.currentprikl = ytprikl;
      $scope.youtubeid = ytprikl.prikl_url + "?rel=0";
      Modals.createAndShow($scope,"youtube");
  }


  $scope.playerVars = {
    controls: 1,
    autoplay: 1,
    modestbranding: 1,
    showinfo: 0,
    iv_load_policy: 3,
    cc_load_policy:0
};


            

  $scope.loadPrikls = function(){


      //If there are prikls in cache load them
  /* if(Cache.get('prikls') != null) {
    $scope.prikls = Cache.get('prikls');
   } */


  $scope.loading = true;
    PostService.getPrikls().then(
      function(prikls){
       $scope.loading = false;
       $scope.prikls = prikls;
           if($scope.prikls[0] != undefined){
            $rootScope.prikldate =  $scope.prikls[0].prikl_date;
           }
       $ionicSlideBoxDelegate.update();
      },function(error){
       $scope.loading = false;
       $ionicLoading.show({template:error,duration:3000});
      }
    );
  }



  
  $scope.react = function(reacttype,priklid){
    if($scope.youtubemodal){
      $scope.youtubemodal.youtube.player.pauseVideo();
    }

    $scope.priklid = priklid;
    if(reacttype == "pic"){
        Camera.getPicture(0)
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

.controller('PinboardCtrl',function($scope,$state,$filter,$rootScope,$timeout,$ionicLoading,PostService,Cache,Message,Modals){
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
    $scope.loading = true;
    $scope.posts = Cache.get(pinboard);
    for (var i = $scope.posts.length - 1; i >= 0; i--) {
      $scope.totalposts += $scope.posts[i].posts.length;
    };
      $scope.loading = false;
  } 

//refreshpinboard
$scope.refresh(pinboard);
}
    /*Refreshfunction(when user pulls to refresh) check if there are new posts with postid from the newest post, 
    if there are create new date object with date-month-year and check if an array exists with this date, if not
      create an new array for these or this post and put it in front of the array(unshift)*/
    $scope.refresh = function(pinboard){
      //Moet anders
      if($scope.posts[0] == undefined){
        $scope.$broadcast('scroll.refreshComplete');
      }{
      
      var lastpostid = $scope.posts[0].posts[0].idposts;
      $scope.loading = true;
    
      PostService.getNewPosts(pinboard,lastpostid)
      .then(function(posts){
         $scope.loading = false;
       if(posts == "NOPOSTS"){ 
      // $ionicLoading.show({template:"Geen nieuwe posts",duration:500});
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
      }
      $scope.$broadcast('scroll.refreshComplete');
    },function(error){
       $scope.loading = false;
       $scope.noConnection = true;
       $ionicLoading.show({template:error,duration:3000});
    });

}
    
}

$scope.retry = function(pinboard){
  $scope.noConnection = false;
  $scope.loadMore(pinboard);
}

$scope.loadMore = function(pinboard) { 
  if(!$scope.noMoreItemsAvailable && !$scope.loading && !$scope.noConnection){
   $scope.loading = true;

   PostService.getPosts(pinboard,$scope.posts.total,5)
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
                        $scope.loading = false;
                        $scope.noConnection = true;
                        $ionicLoading.show({template:error,duration:3000});
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
        $ionicLoading.show({template:error,duration:3000});
      });
  }
});
}

  //Count chars for fontsize
  $scope.countchars = function(textlength) {
    var s = 70 - (textlength*2);
    return s + "px";
  };


  $scope.viewPhoto = function(serverpath,filename){
    Modals.createAndShow($scope,"photoview");
   // console.log($rootScope.server + serverpath + filename);
    $scope.photourl = $rootScope.server + serverpath + filename;
  }

  $scope.showPrikl = function(priklid){
    //Uitgebreider maken?
    PostService.getSinglePrikl(priklid)
    .then(function(prikl){

      var priklinfo = "PrikL van "+$filter('date')(prikl[0].prikl_date,'EEEE d MMMM')+ 
      ":<br><b>" +prikl[0].prikl_title + "</b><br>" + prikl[0].prikl_content;
        $ionicLoading.show({template:priklinfo,duration:3000});
    },function(error){
       $ionicLoading.show({template:error,duration:3000});
    });
  }
})

.controller('AccountCtrl',function($scope,$ionicLoading,PostService,Message){
 

  $scope.loadAccountData = function(){
      $ionicLoading.show({template:"Accountgegevens laden"});
      PostService.getAccountData()
  .then(function(userdata){
    $ionicLoading.hide();
    $scope.account = userdata[0];
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
             Message.loading("Fotobericht uploaden");
            $state.go('app.account');
               $timeout(function(){
                 Message.loading("Fotobericht uploaden");
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
