import passport from "passport";
import { Strategy as googleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.models.js";

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    //this is callback runs immediately after google send user back to App.
    async (accessToken, refreshToken, profile, done) => {
      console.log("data sent by the google auth", profile);

      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar = profile.photos[0].value;

        const user = await User.findOne({ email: email });

        //if user found
        if (user) {
          return done(null, user);
        }

        //user not found
        // user not found
        else {
          const newUser = await User.create({
            // Assign to a variable
            fullname: name,
            email: email,
            avatar: avatar,
            provider: "google",
            providerId: googleId,
            // Don't forget 'username' if your schema requires it!
            username: email.split("@")[0] + Math.floor(Math.random() * 1000),
          });
          return done(null, newUser); // Return the newly created user
        }

      } 
      
      catch (error) {
        console.log("something went wrong while using google auth", error);
        return done(error, null);
      }
    },
  ),
);
