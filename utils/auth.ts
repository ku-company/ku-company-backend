import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile } from "passport-google-oauth20";
import { PrismaDB } from "../helper/prismaSingleton.js";
import { UserRepository } from "../repository/userRepository.js";
import { getValidRoles } from "./roleUtils.js";
import { logAuthEvent } from "../utils/logger.js";
import { Role } from './enums.js';

const prisma = PrismaDB.getInstance();
const userRepository = new UserRepository();
const validRoles = getValidRoles();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: any) => void,
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
        if (user) {
          logAuthEvent({
            event: "auth.login",
            userId: user.id,
            email: user.email,
            success: true,
            ip:
              (req.headers && (req.headers["x-forwarded-for"] as string)) ||
              req.ip,
            correlationId: (req as any).correlationId || "oauth",
          });
          return done(null, user); // finishes the authentication
        }

        // signup flow
        // Extract role from state (for new signup)
        const state = req.query.state ? JSON.parse(req.query.state as string) : {};
        let role: string;
        let stdId: string | null = null;
        if (!state.role || !validRoles.includes(state.role)) {        
          role = "Unknown";
        } else {
          role = state.role; // attach role from state
          if ((role === Role.Student || role === Role.Alumni) && state.stdId) {
            stdId = state.stdId;
          }
        }


        // Validation — make sure student/alumni has stdId
        if ((role === Role.Student || role === Role.Alumni) && !stdId) {
          console.error("[Google OAuth] Missing student ID for student/alumni signup:", email);
          return done(new Error("Missing student ID for student/alumni role"), false);
        }

        console.log("[Google OAuth] Signup flow detected for role:", role, "stdId:", stdId);
        
        // create new user
        const newUser = await userRepository.create_user({
          first_name:
            profile.name?.givenName || profile.displayName || "Unknown",
          last_name: profile.name?.familyName || "",
          user_name: profile.displayName || null,
          stdId: stdId,
          is_consent: true,
          company_name: null,
          email: email,
          verified: false,
          status: "Pending",
          profile_image: profile.photos?.[0]?.value || null,
          password_hash: null,
          role: role,
        });

        logAuthEvent({
          event: "auth.signup",
          userId: newUser.id,
          email: email,
          success: true,
          ip:
            (req.headers && (req.headers["x-forwarded-for"] as string)) ||
            req.ip,
          correlationId: (req as any).correlationId || "oauth",
        });
        return done(null, newUser); // finishes the authentication
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);
