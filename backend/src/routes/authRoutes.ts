import { Router } from "express";
import { register,login,me, logout, googleCallback,getGooglePending, completeGoogleRegister } from "../controllers/authController";
import passport from "passport";
import { getGooglePendingUser } from "../services/userService";
import { upload } from "../middleware/upload";


const router = Router();

router.post('/register', upload.single('avatar'), register);
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