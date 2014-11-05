
var ActivateScreen = function() {
  this.pw = element(by.model('credentials.pw'));
  this.pw2 = element(by.model('credentials.pw2'));
  this.submitbutton = element(by.buttonText('Aanmelden'));

  this.get = function() {
    browser.get('http://localhost:8100/#/login');
  }

  this.clearForm = function(){
    this.pw.clear();
    this.pw2.clear();
  }

   this.setPassword = function(pw){
    this.pw.sendKeys(pw);
  }

   this.setPassword2 = function(pw){
    this.pw2.sendKeys(pw);
  }
};

module.exports = ActivateScreen;