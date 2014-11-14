
angular.module('prikl.services', ['angular-md5'])

.factory('AuthenticationService', function ($q,$http,$rootScope,transformAsPost,md5,$cordovaDevice) {
      $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
      var credentials = {};

      var postrequest = function(data,url){
        return $http({
                url: url,
                method: "POST",
                transformRequest: transformAsPost,
                data: data,
                timeout: 5000
              })
                  .then(function(response) {
                    console.log(response);
                    return response;

                  }, function(response) {
                    if(response.status == 0){
                      return $q.reject("Kan niet verbinden met server");
                    }
                    else if(response.status == 467){
                      return $q.reject(response.status);
                    }else if(response.status < 600){
                      return $q.reject(response.statusText);
                    }else{
                      return $q.reject("Serverfout:<br>"+response.status+", "+response.statusText);
                    }
                });
      }

      var verifyAccount = function(credentials){
        var data = {"mail":credentials.mail,"pw":md5.createHash(credentials.pw)};
        var url = $rootScope.server + "index.php/serve/verifyAccount";
        return postrequest(data, url);
      }

      var activateAccount = function(credentials,profilepic){
        var data = {"mail":credentials.mail,"pw":md5.createHash(credentials.pw),"pic":profilepic};
        var url = $rootScope.server + "index.php/serve/activateAccount";
        return postrequest(data, url);
      }

       var resetPassword = function(mail){
        var data = {"mail":mail};
        var url = $rootScope.server + "index.php/serve/resetPassword";
        return postrequest(data, url);
      }

      var registerDevice = function(userinfo){
          var data = {"userid":userinfo.userid,"pushid":device.pushID,
          "platform":$cordovaDevice.getPlatform(),"uuid":$cordovaDevice.getUUID()};
          var url = $rootScope.server + "index.php/serve/registerDevice";
          return postrequest(data, url);
      }

      var unregisterDevice = function(token){
        var data = {"token":token};
        var url = $rootScope.server + "index.php/serve/unregisterDevice";
        return postrequest(data,url);
      }

      var checkToken = function(userid,token){
        var data = {"userid":userid,"token":token};
        var url = $rootScope.server + "index.php/serve/checkToken";
        return postrequest(data,url);
      }

      var credentials = {mail:"",pw:"",pw2:""};
      var userinfo = {userid:'',userfirstname:'',userlastname:'',groupid:'',profilepic:'./img/dummy.png'};
      var device = {pushID:''};

      return {
        verifyAccount: verifyAccount,
        activateAccount: activateAccount,
        registerDevice: registerDevice,
        unregisterDevice: unregisterDevice,
        resetPassword: resetPassword,
        checkToken: checkToken,
        credentials:credentials,
        userinfo:userinfo,
        device:device
      };
  })

.factory('PostService', function ($q, $http, $rootScope){

  var jsonpRequest = function(url){
    var deferred = $q.defer();
          $http.jsonp(url,{timeout:5000})
                .success(function(data) {
                  deferred.resolve(data);
                })
                .error(function(data, status, headers, config){
                  console.log(data,status,headers);
                   if(status == 0){
                     deferred.reject("Kan niet verbinden met server");
                    }
                    else{
                     deferred.reject("Kan niet verbinden met server<br>Status:"+status);
                    }
                });
                return deferred.promise;
    }

    var getAccountData = function(token){
      var url = $rootScope.server + "index.php/serve/getAccountData?usid="+$rootScope.userid+"&token="+token+"&callback=JSON_CALLBACK";
      return jsonpRequest(url);
    }

     var getPrikls = function (){
      var url = $rootScope.server + "index.php/serve/getPrikls?groupid="+$rootScope.groupid+"&callback=JSON_CALLBACK";
      return jsonpRequest(url);
    }

    var getSinglePrikl = function(priklid){
      var url = $rootScope.server + "index.php/serve/getSinglePrikl?priklid="+priklid+"&callback=JSON_CALLBACK";
       return jsonpRequest(url)
    }

    var getBugs = function (){
      var url = $rootScope.server + "index.php/serve/getBugs?callback=JSON_CALLBACK";
      return jsonpRequest(url);
    }

    var getComments = function (postid){
      var url = $rootScope.server + "index.php/serve/getComments?postid="+postid+"&callback=JSON_CALLBACK";
      return jsonpRequest(url);
    }

    var getPosts = function(pinboard,start,limit) {
      if(pinboard == "user"){
        var url = $rootScope.server + "index.php/serve/getUserPosts?start="+start+"&limit="+limit+"&userid="+$rootScope.userid+"&callback=JSON_CALLBACK";
        return jsonpRequest(url);
      }else if(pinboard == "group"){
        var url = $rootScope.server + "index.php/serve/getGroupPosts?start="+start+"&limit="+limit+"&groupid="+$rootScope.groupid+"&callback=JSON_CALLBACK";    
        return jsonpRequest(url);
      }
    }

    var getNewPosts = function (pinboard,lastpostid) {
      if(pinboard == "user"){
        var url = $rootScope.server + "index.php/serve/getNewUserPosts?lastpostid="+lastpostid+"&userid="+$rootScope.userid+"&callback=JSON_CALLBACK";    
        return jsonpRequest(url);
      }else if(pinboard == "group"){
        var url = $rootScope.server + "index.php/serve/getNewGroupPosts?lastpostid="+lastpostid+"&groupid="+$rootScope.groupid+"&callback=JSON_CALLBACK";    
        return jsonpRequest(url);
      }
    }

    var addProfilePic = function(filename){
      var url = $rootScope.server + "index.php/serve/addProfilePic?filename="+
      filename+"&userid="+$rootScope.userid+"&callback=JSON_CALLBACK";
      return jsonpRequest(url);
    }

    var addPost = function(priklid,text,type,filename,pub) {
    var url = $rootScope.server + "index.php/serve/addPost?userid="+$rootScope.userid+"&groupid="+$rootScope.groupid+"&priklid="+priklid+
    "&text="+text+"&type="+type+"&filename="+filename+"&pub="+pub+"&callback=JSON_CALLBACK";
     return jsonpRequest(url);
    }

    //set commenttext from ng-bind
    // var commentText = {}

    var addComment = function(postid,text) {
    var url = $rootScope.server + "index.php/serve/addPostComment?userid="+$rootScope.userid+"&postid="+postid+"&text="+text+"&callback=JSON_CALLBACK";
    console.log(url);
    return jsonpRequest(url);
    }

    var deleteComment = function(commentid) {
    var url = $rootScope.server + "index.php/serve/deleteComment?commentid="+commentid+"&callback=JSON_CALLBACK";
    return jsonpRequest(url);
    }

    var addFeedback = function(text) {
    var url = $rootScope.server + "index.php/serve/addFeedback?userid="+$rootScope.userid+"&groupid="+$rootScope.groupid+
    "&feedback="+text+"&callback=JSON_CALLBACK";
  
    return jsonpRequest(url);
    }

    var changeSettings = function(comm1, comm2, token) {
    if (comm1 === true) {comm1 = 'true';};
    if (comm1 === false) {comm1 = 'false';};
    if (comm2 === true) {comm2 = 'true';};
    if (comm2 === false) {comm2 = 'false';};
    var url = $rootScope.server + "index.php/serve/changeSettings?token="+token+"&comm1="+comm1+"&comm2="+comm2+"&callback=JSON_CALLBACK";
    
    return jsonpRequest(url);
    }

    var deletePost = function(postid){
        var url = $rootScope.server + "index.php/serve/deletePost?userid="+$rootScope.userid+"&postid="+postid+"&callback=JSON_CALLBACK";
     return jsonpRequest(url);
    }

  
    return{
      getPosts: getPosts,
      getNewPosts: getNewPosts,
      getPrikls: getPrikls,
      getSinglePrikl:getSinglePrikl,
      getAccountData:getAccountData,
      getBugs: getBugs,
      addPost: addPost,
      addProfilePic: addProfilePic,
      addFeedback: addFeedback,
      deletePost: deletePost,
      getComments: getComments,
      addComment: addComment,
      deleteComment: deleteComment,
      changeSettings: changeSettings
    }

})

  .factory('Cache', function($cacheFactory){
        return $cacheFactory('Cache', {
    storageMode: 'localStorage', // cache will sync itself to localStorage
    verifyIntegrity: false
      })
    })


.factory('FileTransferService', function ($q,$rootScope) {


      var uploadProfilePic = function(fileURI){
        var deferred = $q.defer();

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.chunkedMode = false;
                
                //Quickfix, Android album geeft geen jpg extensie
                if(fileURI.substr(fileURI.length-3,fileURI.length) != "jpg")
                {
                    fileURI += ".jpg";
                }

                options.mimeType = "image/jpeg";
                options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);

                var ft = new FileTransfer();

                ft.upload(fileURI, $rootScope.server + "profilepic.php",
                  function(r){
                     deferred.resolve(r.response);
                }, function(error){
                   deferred.reject(error);
                }, options);

                return deferred.promise;
      }

       var uploadPhoto = function(fileURI){

                var deferred = $q.defer();
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.chunkedMode = false;
                
                //Quickfix, Android album geeft geen jpg extensie
                if(fileURI.substr(fileURI.length-3,fileURI.length) != "jpg")
                {
                    fileURI += ".jpg";
                }

                options.mimeType = "image/jpeg";
                options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);

                var ft = new FileTransfer();

                ft.upload(fileURI, $rootScope.server + "upload.php",
                  function(r){
                     deferred.resolve(r.response);
                }, function(error){
                   deferred.reject(error);
                }, options);

                return deferred.promise;
      }


      return {
          uploadProfilePic:uploadProfilePic,
          uploadPhoto:uploadPhoto
      };
  })



.factory('Message', function ($q,$ionicPopup, $ionicLoading, $ionicActionSheet, $timeout) {
    var loading = function(text){
    $ionicLoading.show({
      template: text+"<br><i class='icon ion-loading-b'></i>",
      showBackdrop: true,
      animation: 'fade-in'
    });
  }

  var loadingHide = function(){
    $ionicLoading.hide();
  }
  

  var notify = function(message){
    $ionicLoading.show({
      template: message,
      showBackdrop: true,
      animation: 'fade-in',
      duration: 1500
    }); 
  }

  //OERKEBOERKE

  var error = function(message){
    $ionicLoading.show({
      template: message,
      showBackdrop: true,
      animation: 'fade-in',
      duration: 3000
    }); 
  }

  var question = function(title,body,callback){
    $ionicPopup.show({
  title: '<p style = "width: 100%; text-align: center; font-weight: bold;">'+title+'</p>', // String. The title of the popup.
  template: '<p style = "width: 100%; text-align: center;">'+body+'</p>', // String (optional). The html template to place in the popup body.
  buttons: [{ //Array[Object] (optional). Buttons to place in the popup footer.
    text: "<b>Ja</b>",
    type: 'button-energized',
    onTap: function(e) {
      // e.preventDefault() will stop the popup from closing when tapped.
      return 1;
    }
  },{
    text: "<b>Nee</b>",
    type: 'button-stable',
    onTap: function(e) {
      // Returning a value will cause the promise to resolve with the given value.
      return 0;
    }
  }]
}).then(function(result){
  callback(result);
});


}

      return {
          question: question,
          loading: loading,
          loadingHide: loadingHide,
          notify: notify
      };
  })

.service('Modals',function($ionicModal){

  this.createAndShow = function(scope,modal){
    //Create modals from template put them in a scope
      switch(modal){
                        case "photo":
                          $ionicModal.fromTemplateUrl('templates/modals/photopost.html', {
                                scope: scope
                              }).then(function(modal) {
                                scope.photomodal = modal;
                                scope.photomodal.photo = scope.imageURI;
                                scope.imageURI = null;
                                scope.photomodal.show();
                              });
                     
                        break;
                        case "newpassword":
                            $ionicModal.fromTemplateUrl('templates/modals/newpassword.html', {
                                scope: scope
                              }).then(function(modal) {
                                scope.newpasswordmodal = modal;
                                scope.newpasswordmodal.show();
                              });
                        break;
                        case "youtube":
                          $ionicModal.fromTemplateUrl('templates/modals/youtube.html', {
                                scope: scope
                              }).then(function(modal) {
                                scope.youtubemodal = modal;
                                scope.youtubemodal.playervars = scope.playervars;
                                scope.youtubemodal.youtubeid = scope.youtubeid;
                                scope.youtubemodal.show();
                              });
                     
                        break;
                        case "text":
                           $ionicModal.fromTemplateUrl('templates/modals/textpost.html', {
                                  scope: scope, focusFirstInput: true
                                }).then(function(modal) {
                                  scope.textmodal = modal;
                                  scope.textmodal.show();
                                });

                        break;
                        case "feedback":
                          $ionicModal.fromTemplateUrl('templates/modals/feedback.html', {
                                scope: scope, focusFirstInput: true
                              }).then(function(modal) {
                                scope.feedbackmodal = modal;
                                scope.feedbackmodal.show();
                              });
                        break;
                        case "photoview":
                              $ionicModal.fromTemplateUrl('templates/modals/photoview.html', {
                                      scope: scope, focusFirstInput: true, animation: 'reverse'
                                    }).then(function(modal) {
                                      scope.photoviewmodal = modal;
                                      scope.photoviewmodal.photofile = scope.photofile;
                                      scope.photoviewmodal.show();
                                    });
                              
                        break;
                        case "comments":
                              $ionicModal.fromTemplateUrl('templates/modals/comments.html', {
                                      scope: scope
                                    }).then(function(modal) {
                                      scope.commentModal = modal;
                                      scope.commentModal.show();
                                    });
                              
                        break;

                        default:
                        break;

     }
   }
})

//Camerafactory, asks user for source(camera or album) and returns the url of image
.factory('Camera', function ($q, $ionicActionSheet) {
  return {
    getPicture: function(direction) {

      var q = $q.defer();

      if (!navigator.camera)
        {
          q.reject("Geen cameraplugin geladen");
          return q.promise;
        }

      $ionicActionSheet.show({
                    buttons: [ 
                    { text: 'Camera <i class="icon ion-camera"></i>' },
                    { text: 'Album <i class="icon ion-images"></i>' }
                     ],
                    cancelText: 'Annuleren',
                    buttonClicked: function(source) {
                      //source 0=Camera 1=Photoalbum
                      if(source==1){source=0;}else{source=1;}

                       var popover = new CameraPopoverOptions(0, 0, 300, 100, Camera.PopoverArrowDirection.ARROW_LEFT);
     
                       var options = { 
                                  quality: 100,
                                  destinationType: 1, //0:DATA_URL,1:FILE_URI,2:NATIVE_URI
                                  sourceType: source, // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                                  allowEdit: false,
                                  encodingType: 0,// 0=JPG 1=PNG
                                  saveToPhotoAlbum: false,
                                  correctOrientation: true,
                                  targetWidth:1000,
                                  targetHeight:1000,
                                  cameraDirection:direction,
                                  popoverOptions  : popover
                              };

                    navigator.camera.getPicture(function(result) {
                      q.resolve(result);
                    }, function(err) {
                      q.reject(err);
                    }, options);

                    return true;
                  }
       });  
      return q.promise;
    }
  }
})

//Transform request as form post
.factory("transformAsPost",function() {
// I prepare the request data for the form post.
function transformRequest( data, getHeaders ) {
  var headers = getHeaders();
  headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
  return( serializeData( data ) );
}
    // Return the factory value.
    return( transformRequest );
    function serializeData( data ) {
    // If this is not an object, defer to native stringification.
    if ( ! angular.isObject( data ) ) {
      return( ( data == null ) ? "" : data.toString() );
    }
    var buffer = [];
    // Serialize each key in the object.
    for ( var name in data ) {
      
      if ( ! data.hasOwnProperty( name ) ) {
        continue;
      }

      var value = data[ name ];
      buffer.push(
        encodeURIComponent( name ) + "=" + encodeURIComponent( ( value == null ) ? "" : value )
        );
    }

    // Serialize the buffer and clean it up for transportation.
    var source = buffer
    .join( "&" )
    .replace( /%20/g, "+" )
    ;

    return( source );
  }
})

.factory("PushProcessing",function($q,$cordovaPush,AuthenticationService,
  $state,$timeout,Modals) {
  var notification = {type:'',postid:'',commentid:''};
  return {  
    register : function(){
        //Register android GCM with senderID
        if(ionic.Platform.isAndroid()){
          return $cordovaPush.register({"senderID":"10154189285","ecb":"onNotificationGCM"})
          .then(function(result) {
              //Android's GCM returns OK if successfully registered
                  console.log("Succesfully registered android GCM");
                  return result;
                 }, function(err) {
                  console.log(err);
                  return $q.reject(err);
                });
        }else if(ionic.Platform.isIOS()){
          return $cordovaPush.register({"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"})
          .then(function(result) {
              //IOS APNS returns unique pushID for receiving pushnotifications
                AuthenticationService.device.pushID=result;
                console.log("Succesfully registered Apple APN");
                return "OK";
              }, function(err) {
                console.log(err);
                return $q.reject(err);
              });
        }
      },
    unregister: function(){
        $cordovaPush.unregister().then(function(result) {
            // Success!
            console.log(result);
        }, function(err) {
          console.log(err);
            // An error occured. Show a message to the user
        });
    },
    notification:notification,
    onNotification: function(notificationData){
        notification.type = notificationData.notificationType;

        switch(notificationData.notificationType)  {
          case 'comment':
              notification.commentid = notificationData.notificationContent;

              //PostID & CommentID meegeven
              //console.log("FROMPUSHPROCESSING"+JSON.stringify(notification));
             // $state.go('app.allreactions',notification);
          break;
          case 'prikl':
              $state.go('app.prikls');
          break;
          default:
              $state.go('app.allreactions');
          break;
        } 
  
    }
    }
  })

// ALL GCM notifications come through here. 
 var onNotificationGCM = function(e,$state) {

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                var elem = angular.element(document.querySelector('[ng-app]'));
                var authService = elem.injector().get('AuthenticationService');
                authService.device.pushID=e.regid;
            }
            break;
 
            case 'message':
                      //if(e.foreground || e.coldstart) Handle onNotification in PushProcessingservice
                      //to use angular
                      var elem = angular.element(document.querySelector('[ng-app]'));
                      var pushService = elem.injector().get('PushProcessing');
                      pushService.onNotification(e.payload.notificationData);
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
    }
}


//Apple notificationevents
var onNotificationAPN = function (event) {
    window.location = "#/app/prikls";

    if ( event.alert )
    {
       // navigator.notification.alert(event.alert);
    };

    if ( event.sound )
    {
        var snd = new Media(event.sound);

        snd.play();
    };

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    };
};

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Onbekende';
    states[Connection.ETHERNET] = 'Ethernet';
    states[Connection.WIFI]     = 'WiFi';
    states[Connection.CELL_2G]  = '2G';
    states[Connection.CELL_3G]  = '3G';
    states[Connection.CELL_4G]  = '4G';
    states[Connection.CELL]     = 'Mobiel';
    states[Connection.NONE]     = 'Geen';

    return states[networkState];
}

