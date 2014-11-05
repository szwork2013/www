/*describe("Midway: Testing Modules", function() {
  describe("App Module:", function() {
    var module = module("prikl");

    beforeEach(function() {
            var module = module("prikl");
    });

    it("should be registered", function() {
      expect(module).not.to.equal(null);
    });

    describe("Dependencies:", function() {

      var deps;
      var hasModule = function(m) {
        return deps.indexOf(m) >= 0;
      };
      beforeEach(function() {
        deps = module.value('prikl').requires;
      });

      //you can also test the module's dependencies
      it("should have App.Controllers as a dependency", function() {
        expect(hasModule('prikl.controllers')).to.equal(true);
      });

      it("should have App.Directives as a dependency", function() {
        expect(hasModule('prikl.services')).to.equal(true);
      });
    });
  });
});*/