var request = require('request');

var LoginScreen = function() {
  this.mail = element(by.model('credentials.mail'));
  this.pw = element(by.model('credentials.pw'));
  this.submitbutton = element(by.buttonText('Log in'));
  this.messagebox = element(by.css('.loading'));

  this.clearForm = function(){
    this.mail.clear();
    this.pw.clear();
  }

  this.setMail = function(mail){
    this.mail.sendKeys(mail);
  }

   this.setPassword = function(pw){
    this.pw.sendKeys(pw);
  }

   this.get = function() {
    browser.get('http://localhost:8100/#/login');
  }


  this.resetTestAccount = function(){
        request('http://winspire01.windesheim.nl/index.php/serve/resetTestAccount', function (error, response, body) {
          if (!error && response.statusCode == 200) {
          }
        });       
  }
};

module.exports = LoginScreen;




