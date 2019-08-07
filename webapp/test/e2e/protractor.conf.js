exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',

  capabilities: {
    'browserName': 'chrome'
  },

  specs: ['user-spec.js'],

  jasmineNodeOpts: {
    showColors: true
  }
};