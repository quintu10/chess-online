import { Router } from "express";
import { register,login,me, logout, googleCallback,getGooglePending, completeGoogleRegister } from "../controllers/authController";
import passport from "passport";
import { getGooglePendingUser } from "../services/userService";


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/logout', logout);
router.get(
    '/google',
    passport.authenticate('google',{
        scope:['profile','email']
    })
);
router.get(
    '/google/callback',
    passport.authenticate('google',{
        session: false
    }),
    googleCallback
);

router.get('/google/pending', getGooglePending);
router.post('/google/register', completeGoogleRegister);

export default router;