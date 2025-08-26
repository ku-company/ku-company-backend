import passport from "passport";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import type { Profile } from "passport-google-oauth20";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { UserRepository } from "../repository/userRepository.js";

const prisma = PrismaDB.getInstance();
const userRepository = new UserRepository();    

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,  
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
      callbackURL: process.env.GOOGLE_REDIRECT_URL ! 
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: any) => void
    ) => {
      try {
        // call a service to create/fetch the user from DB
        const user = await prisma.user.findFirst({
            where: {
                email: Array.isArray(profile.emails) && profile.emails.length > 0 && profile.emails[0]?.value ? profile.emails[0].value : undefined,
            },
        });
        
        if(user) {
            console.log("User found:", user);
            return done(null, user);
        }

        // create new user
        const newUser = await userRepository.create_user({
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        first_name: profile.name?.givenName || profile.displayName || "Unknown",
        last_name: profile.name?.familyName || "",
        user_name: profile.displayName || null,
        verified: false,
        profile_image: profile.photos?.[0]?.value,
        });


        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});
