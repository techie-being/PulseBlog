import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.models.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        
        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if they don't exist
          user = await User.create({
            fullname: profile.displayName,
            email: email,
            avatar: profile.photos[0].value,
            provider: "google",
            providerId: profile.id,
            // Simple username generator
            username: email.split("@")[0] + Math.floor(Math.random() * 1000),
          });
        }

        // Passes the user object to the next stage (the route handler)
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;