import passport from "passport";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import type { Profile } from "passport-google-oauth20";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { UserRepository } from "../repository/userRepository.js";

const prisma = PrismaDB.getInstance();
const userRepository = new UserRepository();  
const validRoles = ["Alumni", "Professor", "Company", "Student"];  

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

        // login flow
        if(user) {
            console.log("User found:", user); // login
            return done(null, user); // finishes the authentication
        }
        
        // signup flow
        // Extract role from state (for new signup)
        let role: string
        const state = req.query.state ? JSON.parse(req.query.state as string) : {};
        if (!state.role || !validRoles.includes(state.role)) {        
          role = "Unknown";
        } else {
          role = state.role; // attach role from state
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

        return done(null, newUser); // finishes the authentication
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
