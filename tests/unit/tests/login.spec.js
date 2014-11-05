describe("controller: LoginCtrl", function () {

    beforeEach(function(){
        module("prikl");
    });

    beforeEach(inject(function($controller,$rootScope,$state,AuthenticationService,$httpBackend,Message){
        this.$state = $state;
        this.$httpBackend = $httpBackend;
        this.scope = $rootScope.$new();
      /* this.redirect = spyOn($state, 'go').andCallFake(function(state, params) {
            // This replaces the 'go' functionality for the duration of your test
        });*/
        $controller('LoginCtrl',{
            $scope: this.scope,
            $state: $state,
            Message: Message,
            AuthenticationService: AuthenticationService,
        })
    }));

           
});

/*
    var $scope, ctrl, $timeout;

    beforeEach(function () {

        module('prikl');

        // INJECT! This part is critical
        // $rootScope - injected to create a new $scope instance.
        // $controller - injected to create an instance of our controller.
        // $q - injected so we can create promises for our mocks.
        // _$timeout_ - injected to we can flush unresolved promises.
        inject(function ($rootScope, $controller, $q, _$timeout_) {

            // create a scope object for us to use.
            $scope = $rootScope.$new();

            // assign $timeout to a scoped variable so we can use
            // $timeout.flush() later. Notice the _underscore_ trick
            // so we can keep our names clean in the tests.
            $timeout = _$timeout_;

            // now run that scope through the controller function,
            // injecting any services or other injectables we need.
            // **NOTE**: this is the only time the controller function
            // will be run, so anything that occurs inside of that
            // will already be done before the first spec.
            ctrl = $controller("LoginCtrl", {
                $scope: $scope
            });
        });

    });


    // Test 1: The simplest of the simple.
    // here we're going to make sure the $scope variable 
    // exists evaluated.
    it("should have a login object", function() {
        expect($scope.login).toBeDefined();
    });

     it("should have credentials variable", function() {
        expect($scope.credentials).toBeDefined();
    });

     it("should have a profilepic set as dummy.png", function() {
        expect($scope.profilepic).toBe("./img/dummy.png");
    });

    it("should have a function verifyAccount", function() {
        expect($scope.profilepic).toBe("./img/dummy.png");
    });



});*/