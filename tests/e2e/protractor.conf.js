exports.config = {

  capabilities : {
    browserName : 'chrome',
    'chromeOptions': {
        args: ['--test-type']
    }
},

 /* multiCapabilities : [
  {'browserName' : 'chrome',},
{'browserName': 'firefox'}
],*/

          suites: {
            login: 'tests/login/*.spec.js',
          },

          // This can be changed via the command line as:
          // --params.login.user 'ngrocks'
          params: {
            login: {
              mail: 'protractor@protractor.nl',
              password: 'protractor' 
            }
          },
          jasmineNodeOpts: {
                showColors: true,
                defaultTimeoutInterval: 30000,
                isVerbose: true,
          },
          allScriptsTimeout: 20000,
          onPrepare: function(){

            //Set browser window size
            browser.driver.manage().window().setSize(480, 852);

            //Reset test account
        //  browser.get('http://winspire01.windesheim.nl/index.php/serve/resetTestAccount')
          

            //Create Jasmine Reports
            /*var folderName = (new Date()).toString().split(' ').splice(1, 4).join(' ');
            var mkdirp = require('mkdirp');
            var newFolder = "./reports/" + folderName;
            require('jasmine-reporters');
            
            mkdirp(newFolder, function(err) {
              if (err) {
                console.error(err);
              } else {
                jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(newFolder, true, true));
              }
            });*/
        }
};