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
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
      passReqToCallback: true

    },
    async (
      req: any, 
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: any) => void
    ) => {
      try {
        // call a service to create/fetch the user from DB
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email in Google profile"), null);
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });
        const state = req.query.state ? JSON.parse(req.query.state as string) : {};
        const role = state.role || "Admin";

        
        if(user) {
            console.log("User found:", user);
            return done(null, user);
        }

        // create new user
        const newUser = await userRepository.create_user({
          first_name: profile.name?.givenName || profile.displayName || "Unknown",
          last_name: profile.name?.familyName || "",
          user_name: profile.displayName || null,
          company_name: null,
          email: email,
          verified: false,
          status: "Pending",
          profile_image: profile.photos?.[0]?.value || null,
          password_hash: null,
          role: role
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
