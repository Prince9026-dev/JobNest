const LocalStrategy = require("passport-local").Strategy;

module.exports = function(passport) {

    passport.use(
        new LocalStrategy(
            { usernameField: "email" },

            function(email, password, done) {

                // Find user in MySQL
                // Check password
                // Return user
            }
        )
    );

    passport.serializeUser(function(user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function(id, done) {
        // Find user from MySQL
    });
};