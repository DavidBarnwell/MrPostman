// expose our config directly to our application using module.exports
module.exports = {

    // connecting to the facebook app
    'facebookAuth' : {
        'clientID'      : '541988022610132', // your App ID
        'clientSecret'  : '61ae9f32439a3b5a8d3f7b766bfad3bd', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    // connecting to the twitter app
    'twitterAuth' : {
        'consumerKey'       : 'L1kkgfxSNhsK0xUIhcd0kPOMA',
        'consumerSecret'    : 'QFuY2BOvRcY371vIQpIwkGQRbQIUDlak00oX6sZuPQVac1RorV',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    // connecting to the google app
    'googleAuth' : {
        'clientID'      : '830755270512-ppkdj49nlj6mme45qa98svf20a55u7lg.apps.googleusercontent.com',
        'clientSecret'  : 'joLc5FE7AesVTIC8NRXferwF',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    },

    // connecting to the instagramw app
    'instagramAuth' : {
        'clientID'      : 'ba122b81148b4269baa75b2fe8380aa0',
        'clientSecret'  : '001c41ded61548e28afd8d3126523579',
        'callbackURL'   : 'http://localhost:3000/auth/instagram/callback'
    },

};