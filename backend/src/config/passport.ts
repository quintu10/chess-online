import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'http://127.0.0.1:3000/auth/google/callback'
        },
        (accesToken, refreshToken, profile, done) =>{
            
            console.log('Usuario de Google', profile);
            return done(null,profile);
        }
    )    
);

export default passport;