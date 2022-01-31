import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import passwordValidator from 'password-validator';
// import passport from 'passport';
// import strategy from 'passport-facebook';

import { UserModel } from "../../models/user";
import connect from '../../config/db';
// import { env } from '../../config/env';

const schema = new passwordValidator();
schema
    .is().min(8)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces();

// const FacebookStrategy = strategy.Strategy;

// const { Facebook } = env;

// passport.use(
//     new FacebookStrategy(
//         {
//             clientID: Facebook.ClientId,
//             clientSecret: Facebook.ClientSecret,
//             callbackURL: Facebook.CallbackUrl,
//             profileFields: ["email", "name"]
//         },
//         function (accessToken, refreshToken, profile, done) {
//             const { email, first_name, last_name } = profile._json;
//             const userData = {
//                 email,
//                 firstName: first_name,
//                 lastName: last_name
//             };
//             done(null, profile);
//         }
//     )
// );

const router = Router();

// TODO: will implement if time permits
// router.post('/google', (req: Request, res: Response) => {
//     // login with google
// });

// TODO: will implement if time permits
// router.post('/facebook', passport.authenticate("facebook"));


router.post('/email', async (req: Request, res: Response) => {
    if (req.body.email && req.body.password) {
        const errorDetails = schema.validate(req.body.password, { details: true });
        if ((errorDetails as []).length === 0) {
            const saltRounds = 10;
            await bcrypt.genSalt(saltRounds, async function (err, salt) {
                await bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    await connect();
                    const userModel = mongoose.model('UserModel', UserModel);
                    userModel.findOne({ email: req.body.email }, function (err, existingUser) {
                        if (existingUser) {
                            res.status(500).send({
                                error: '500: Email already exists!'
                            });
                        } else {
                            const user = new userModel({
                                email: req.body.email,
                                password: hash,
                            });
                            user.save(function (err, result) {
                                if (err) console.log(err);
                                else res.status(200).send();
                            });
                        };
                    });
                });
            });
        } else {
            res.status(500).send({
                error: '500: Invalid password!',
                details: errorDetails,
            });
        }
    } else {
        res.status(500).send({
            error: "500: Missing Email or Password"
        })
    }
});

export default router;