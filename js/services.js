angular.module('prikl.services', [])

  .factory('Cache', function($cacheFactory){
        return $cacheFactory('Cache', {
    storageMode: 'localStorage', // cache will sync itself to localStorage
    verifyIntegrity: false
      })
    })

  .factory('DB', function($http,$timeout,$rootScope,showMessage,transformRequestAsFormPost) {

    var jsonpRequest = function(url,cb){
                 $http.jsonp(url)
                .success(function(data) {
                  console.log(data);
                   cb(data);
                })
                .error(function(err){
                  console.log(err);
                   cb("NOCONNECTION");
                })
    }

    var postRequest = function(url,data,cb){
      if(navigator.connection != undefined){
                      if(checkConnection() == "Geen netwerk")
                      {
                        showMessage.notify(checkConnection());
                      }
                    }else{
                       showMessage.notify("Geen netwerkplugin");
                    }

      $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            console.log(url);
            $http({
                url: url,
                method: "POST",
                transformRequest: transformRequestAsFormPost,
                data: data
            })
            .then(function(response) {
                    // success
                    cb(response);
                }, 
                function(error) { // optional
                    // failed
                    cb(error);
                });
    }


    var getPrikls = function (groupid,callback){
      var url = $rootScope.server + "index.php/serve/getPrikls?groupid="+groupid+"&callback=JSON_CALLBACK";
      jsonpRequest(url,callback);
    }

    var getNewPosts = function (pinboard,lastpostid,id,callback) {

      if(pinboard == "user"){
        var url = $rootScope.server + "index.php/serve/getNewUserPosts?lastpostid="+lastpostid+"&userid="+id+"&callback=JSON_CALLBACK";    
        jsonpRequest(url,callback);
      }else if(pinboard == "group"){
        var url = $rootScope.server + "index.php/serve/getNewGroupPosts?lastpostid="+lastpostid+"&groupid="+id+"&callback=JSON_CALLBACK";    
        jsonpRequest(url,callback);
      }else{
        callback("Pinboard unknown");
      }
    }

    var getPosts = function(pinboard,start,limit,id,callback) {

      if(pinboard == "user"){
        var url = $rootScope.server + "index.php/serve/getUserPosts?start="+start+"&limit="+limit+"&userid="+id+"&callback=JSON_CALLBACK";
        jsonpRequest(url,callback);
      }else if(pinboard == "group"){
        var url = $rootScope.server + "index.php/serve/getGroupPosts?start="+start+"&limit="+limit+"&groupid="+id+"&callback=JSON_CALLBACK";    
        jsonpRequest(url,callback);
      }else{
        callback("Pinboard unknown");
      }
    }

    var deletePost = function(userid,postid,callback){
        var url = $rootScope.server + "index.php/serve/deletePost?userid="+userid+"&postid="+postid+"&callback=JSON_CALLBACK";
      jsonpRequest(url,callback);
    }

  //LOGIN (Functies moeten voor veiligheid met POST aangeroepen worden, na/tjidesn alphafase)
  var verifyAccount = function(mail,pw,callback){
     var url = $rootScope.server + "index.php/serve/verifyAccount";
     var data= {"mail":mail,"pw":pw};
    postRequest(url,data,callback);
  }
  
  var activateAccount = function(mail,pw,pic,callback){
      var url = $rootScope.server + "index.php/serve/activateAccount";
      var data = {"mail":mail,"pic":pic,"pw":pw};
      postRequest(url,data,callback);
    }

  var registerDevice = function(userid,pushid,platform,callback){
     var url = $rootScope.server + "index.php/serve/registerDevice";
       var data = {"userid":userid,"pushid":pushid,"platform":platform};
       postRequest(url,data,callback);
  }

  var unregisterDevice = function(userid,token,platform,callback){
      var url = $rootScope.server + "index.php/serve/unregisterDevice";
      var data = {"userid":userid,"token":token,"platform":platform};
      postRequest(url,data,callback);
  }

   var checkToken = function(userid,token,callback){
     var url = $rootScope.server + "index.php/serve/checkToken";
      var data= {"userid":userid,"token":token};
       postRequest(url,data,callback);
  }

  //Posten
   var addPost = function(userid,groupid,priklid,text,type,filename,pub,callback) {
    //$teruggave = $this->base_model->addpost($userid,$groupid,$priklid,$text,$type,$filename,$pub);
    var url = $rootScope.server + "index.php/serve/addPost?userid="+userid+"&groupid="+groupid+"&priklid="+priklid+
    "&text="+text+"&type="+type+"&filename="+filename+"&pub="+pub+"&callback=JSON_CALLBACK";
    jsonpRequest(url,callback);
    }

    var addFeedback = function(userid,groupid,text,callback) {
    //$teruggave = $this->base_model->addpost($userid,$groupid,$priklid,$text,$type,$filename,$pub);
    var url = $rootScope.server + "index.php/serve/addFeedback?userid="+userid+"&groupid="+groupid+
    "&feedback="+text+"&callback=JSON_CALLBACK";
    console.log(url);
    jsonpRequest(url,callback);
    }

   return {
      verifyAccount: verifyAccount,
      registerDevice: registerDevice,
      unregisterDevice: unregisterDevice,
      activateAccount: activateAccount,
      checkToken: checkToken,
      getNewPosts: getNewPosts,
      getPosts: getPosts,
      getPrikls: getPrikls,
      addPost:addPost,
      deletePost:deletePost,
      addFeedback:addFeedback
    }
})


.service('Modals',function($ionicModal){

  this.createAndShow = function(scope,modal){
    //Create modals from template put them in rootscope
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
                                      scope.photoviewmodal.show();
                                    });
                              
                        break;

                        default:
                        break;

     }
   }
})

.service('showMessage', function($ionicPopup, $ionicLoading, $ionicActionSheet, Camera, $timeout) {
  this.loading = function(text){
      $ionicLoading.show({
                    template: text+"</br><i class='icon ion-loading-a'></i>",
                    showBackdrop: true,
                    animation: 'fade-in'
          });
  }

  this.loadingHide = function(){
    $ionicLoading.hide();
  }

    this.notify = function(message){
      
          $ionicLoading.show({
                    template: message,
                    showBackdrop: true,
                    animation: 'fade-in'
          });
          $timeout(function() {
                         $ionicLoading.hide();
                    }, 1500);  
  }

   this.confirm = function(title,question,callback) {
     var confirmPopup = $ionicPopup.confirm({
       title: title,
       template: question
     });
     confirmPopup.then(function(res) {
       callback(res);
     });
   }
   

     this.popUp = function(title,body,callback){
      var popUp = $ionicPopup.show({
  title: title, // String. The title of the popup.
  template: body, // String (optional). The html template to place in the popup body.
  buttons: [{
    text: "<i class='icon ion-thumbsdown'></i>",
    type: 'button-assertive',
    onTap: function(e) {
      // Returning a value will cause the promise to resolve with the given value.
      return 0;
    }
  },
  { //Array[Object] (optional). Buttons to place in the popup footer.
    text: "<i class='icon ion-thumbsup'></i>",
    type: 'button-energized',
    onTap: function(e) {
      // e.preventDefault() will stop the popup from closing when tapped.
      return 1;
    }
  }]
});

  popUp.then(function(res) {
    callback(res);
  });
     

   }
})

.service('FTP', function($rootScope,showMessage) {
     

                this.addFile = function(profilepic,fileURI, mimeType,callback) {
     
                   if(navigator.connection != undefined){
                      if(checkConnection() == "Geen netwerk")
                      {
                        showMessage.notify(checkConnection());
                        return false;
                      }
                    }else{
                       showMessage.notify("Geen netwerkplugin");
                    }
               
                //Upload as profilepic or photo
                if(profilepic){var uploadfile = "profilepic.php";}else{var uploadfile = "upload.php";}

                //Voor het uploaden van een bestand naar FTP wordt cordova filetransfer plugin gebruikt.
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.chunkedMode = false;
                
                //Quickfix, Android album geeft geen jpg extensie
                if(mimeType=="image/jpeg" && fileURI.substr(fileURI.length-3,fileURI.length) != "jpg")
                {
                    fileURI += ".jpg";
                }

                options.mimeType = mimeType;
                options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);

                //FileTransfer
                var ft = new FileTransfer();
                ft.upload(fileURI, $rootScope.server + uploadfile, uploadSuccess, uploadError, options);

                function uploadSuccess(r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response(filename) = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    callback(r.response);
                }

                function uploadError(error) {
                  alert("ERROR");
                  callback(error);
                   showMessage.notify("Probleem " + error.code);
                  showMessage.notify("Bestand niet geupload");
                } 

        }

})


//Camerafactory, asks user for source(camera or album) and returns the url of image
.factory('Camera', function($q,$ionicActionSheet) {
  return {
    getPicture: function(source) {

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
                       var options = { 
                                  quality: 100,
                                  destinationType: 1, //0:DATA_URL,1:FILE_URI,2:NATIVE_URI
                                  sourceType: source, // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                                  allowEdit: false,
                                  encodingType: 0,// 0=JPG 1=PNG
                                  saveToPhotoAlbum: false,
                                  correctOrientation: true,
                                  targetWidth:1000,
                                  targetHeight:1000
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


.factory('PushProcessingService', function(DB,Cache) {
        function onDeviceReady() {
            console.info('NOTIFY  Device is ready.  Registering with GCM server');
            var pushNotification = window.plugins.pushNotification;
            if(device.platform == "Android")
            {
            pushNotification.register(gcmSuccessHandler, errorHandler, {"senderID":"10154189285","ecb":"onNotificationGCM"});
            }
            else if (device.platform == "iOS")
            {
            pushNotification.register(tokenHandler, errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
            }                
        }
        function gcmSuccessHandler(result) {
            //android
            console.info('NOTIFY  pushNotification.register succeeded.  Result = '+result);
        }
        function tokenHandler(result) {
            var deviceinfo = JSON.parse('{"device_id":"'+result+'", "platform":"iOS"}');
            Cache.put('pushnotification', deviceinfo);
        }
        function errorHandler(error) {
            console.error('NOTIFY  '+error);
            alert("error:"+error);
        }
        return {
            initialize : function () {
                console.info('NOTIFY  initializing');
                document.addEventListener("deviceready", onDeviceReady, true);
            },
            registerID : function (regid) {
                //Sla deviceid op in cache
                var deviceinfo = JSON.parse('{"device_id":"'+regid+'", "platform":"android"}');
                Cache.put('pushnotification', deviceinfo);
            }, 
            //unregister evt later nog aanroepen bij deinstallatie app of instellingen menu
            unregister : function () {
                console.info('unregister')
                var push = window.plugins.pushNotification;
                if (push) {
                    push.unregister(function () {
                        console.info('unregister success')
                    });
                }
            }
        }
})

.factory("transformRequestAsFormPost",function() {
// I prepare the request data for the form post.
function transformRequest( data, getHeaders ) {
 
var headers = getHeaders();
 
headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
 
return( serializeData( data ) );
 
}
 
 
// Return the factory value.
return( transformRequest );
 
 
// ---
// PRVIATE METHODS.
// ---
 
 
// I serialize the given Object into a key-value pair string. This
// method expects an object and will default to the toString() method.
// --
// NOTE: This is an atered version of the jQuery.param() method which
// will serialize a data collection for Form posting.
// --
// https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
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
encodeURIComponent( name ) +
"=" +
encodeURIComponent( ( value == null ) ? "" : value )
);
 
}
 
// Serialize the buffer and clean it up for transportation.
var source = buffer
.join( "&" )
.replace( /%20/g, "+" )
;
 
return( source );
 
}
 
});


// ALL GCM notifications come through here. 
function onNotificationGCM(e) {
    console.log('EVENT -> RECEIVED:' + e.event + '');
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log('REGISTERED with GCM Server -> REGID:' + e.regid + "");
          
                //call back to web service in Angular.  
                //This works for me because in my code I have a factory called
                //      PushProcessingService with method registerID
                var elem = angular.element(document.querySelector('[ng-app]'));
                var injector = elem.injector();
                var myService = injector.get('PushProcessingService');
                myService.registerID(e.regid);
            }
            break;
 
        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //we're using the app when a message is received.
                console.log('--INLINE NOTIFICATION--' + '');
 
                // if the notification contains a soundname, play it.
                //var my_media = new Media("/android_asset/www/"+e.soundname);
                //my_media.play();
                alert(e.payload.message);
            }
            else
            {   
                // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    console.log('--COLDSTART NOTIFICATION--' + '');
                else
                    console.log('--BACKGROUND NOTIFICATION--' + '');

                 
                window.location = "#/app/prikls";
            }
 
            console.log('MESSAGE -> MSG: ' + e.payload.message + '');
            console.log('MESSAGE: '+ JSON.stringify(e.payload));
            break;
 
        case 'error':
            console.log('ERROR -> MSG:' + e.msg + '');
            break;
 
        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
    }
}

//Apple notificationevents
onNotificationAPN  = function(event) {
    window.location = "#/app/prikls";

    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
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

checkConnection = function() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'Geen netwerk';

    return states[networkState];
    };



