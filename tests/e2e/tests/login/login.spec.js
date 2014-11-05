//LOGINVIEW
var LoginScreen = require('./login.po.js');
describe('LoginScreen Tests', function(){
   var loginScreen = new LoginScreen();
   loginScreen.get();
   var params = browser.params;

     beforeEach(function() {
    // before function
    loginScreen.clearForm();
     });

   it('should disable loginbutton when mail input is empty', function() {
    loginScreen.setMail("protractor@protactor.nl");
    loginScreen.setPassword("");
    expect(loginScreen.submitbutton.isEnabled()).toBe(false);
  });

  it('should disable loginbutton when mail input is not OK', function() {
    loginScreen.setMail("protractor@@protractor.nl");
    loginScreen.setPassword("protractor");
    expect(loginScreen.submitbutton.isEnabled()).toBe(false);
    loginScreen.clearForm();

    loginScreen.setMail("(@*&#&(*@&(*&#(!@)(!*)@");
    loginScreen.setPassword("protractor");
    expect(loginScreen.submitbutton.isEnabled()).toBe(false);
  });


   it('should disable loginbutton when password input is empty', function() {
    loginScreen.setMail("");
    loginScreen.setPassword("protractor");
    expect(loginScreen.submitbutton.isEnabled()).toBe(false);
   });

  it('should disable loginbutton when password input is not OK', function() {

    loginScreen.setMail("protractor@protractor.nl");
    loginScreen.setPassword("longpasswordasdjofjasodjfojasodfijasojdfojsaodfjaosijfojaaiosoaifjsasafdfasd"+
     "asfdasdjfoaijsofjoiajsdoifjoasijdfoijaoidjsfoijasd");
    expect(loginScreen.submitbutton.isEnabled()).toBe(false);
  });

  it('should display error message when mail is not found', function() {
    loginScreen.setMail("emailadreswatnietbestaat@bestaatniet.nl");
    loginScreen.setPassword(params.login.password);
    loginScreen.submitbutton.click();
    expect(loginScreen.messagebox.getInnerHtml()).toContain("account is niet gevonden");
  });   
 
  it('should display error message when password is wrong', function() {
    loginScreen.setMail(params.login.mail);
    loginScreen.setPassword("ditiseenfoutiefwachtwoord");
    loginScreen.submitbutton.click();
    expect(loginScreen.messagebox.getInnerHtml()).toContain("Verkeerd");
  });

  it('should deactivate protractor@protractor.nl',function(){
    loginScreen.resetTestAccount();
  });

   it('should login protractor@protractor.nl and go to activatescreen',function(){
    loginScreen.setMail(params.login.mail);
    loginScreen.setPassword(params.login.password);
    loginScreen.submitbutton.click();
  });
});


//ACTIVATEVIEW
var ActivateScreen = require('./activate.po.js');
describe('ActivateScreen Tests', function(){
  var activateScreen = new ActivateScreen();
   var params = browser.params;

  it('should disable loginbutton when password1 input is empty', function() {
    activateScreen.setPassword("protractor");
    activateScreen.setPassword2("");
    expect(activateScreen.submitbutton.isEnabled()).toBe(false);
    activateScreen.clearForm();
  });


  it('should disable loginbutton when password2 input is empty', function() {
    activateScreen.setPassword("");
    activateScreen.setPassword2("protractor");
    expect(activateScreen.submitbutton.isEnabled()).toBe(false);
    activateScreen.clearForm();
   });

  it('should disable activatebutton when passwords are not the same', function() {
      activateScreen.setPassword("baldr");
      activateScreen.setPassword2(params.login.password);
      expect(activateScreen.submitbutton.isEnabled()).toBe(false);
    activateScreen.clearForm();
  });

  it('should display question when user has no profilephoto', function() {
      activateScreen.setPassword(params.login.password);
      activateScreen.setPassword2(params.login.password);
      expect(activateScreen.submitbutton.isEnabled()).toBe(true);
      activateScreen.submitbutton.click();
  });

  it('should activate and go to group messages',function() {
      element(by.cssContainingText('.button-energized', 'Ja')).click();
      expect(browser.getCurrentUrl()).toContain('/allreactions');
  });

});