import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

console.log('GOOGLE CLIENT ID:', process.env.GOOGLE_CLIENT_ID);
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'http://localhost:3000/auth/google/callback'
        },
        (accesToken, refreshToken, profile, done) =>{
            
            console.log('Usuario de Google', profile);
            return done(null,profile);
        }
    )    
);

export default passport;