import passport from "passport";
import { Strategy as googleStartegy } from "passport";
import {User} from "../models/user.models.js";

passport.use(
    new googleStrategy(
        {
            clientId:process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET,
            callbackUrl:"/auth/google/callback"
        },

        //this is callback runs immediately after google send user back to App.
        async (accessToken,refreshToken,profile,done) => {
            console.log("data sent by the google auth",profile);

            try {
                const googleId = profile.id;
                const email = profile.email[0].value;
                const name = profile.displayName;
                const avatar = profile.photos[0].value;

                const user = await user.findOne({Email:email});
                 
                //if user found
                if(user){
                    return done(null,user)
                }

                //user not found
                else{
                    User.create(
                        {
                            fullname:name,
                            email:email,
                            avatar:avatar,
                            provider:'google',
                            providerId:googleId,
                        }
                    )
                    return done("null",user)
                }

            } 
            catch (error) {
                console.log("something went wrong while using google auth",error);
                return done(error,null);
            }
        }
    )
)