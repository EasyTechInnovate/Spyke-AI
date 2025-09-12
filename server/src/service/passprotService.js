import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import logger from "../util/logger.js";
import config from "../config/config.js";
import { EAuthProvider, EUserRole } from "../constant/application.js";
import quicker from "../util/quicker.js";
import userModel from "../model/user.model.js";

class PassportService {
    passport;
    constructor() {
        this.passport = passport;
        this.initializeStrategies();
    }

    initializeStrategies() {
        // Google Strategy
        this.passport.use(
            new GoogleStrategy(
                {
                    clientID: config.google.GMAIL_CLIENT_ID,
                    clientSecret: config.google.GMAIL_CLIENT_SECRET,
                    callbackURL: config.google.GMAIL_CALLBACK_URL,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        let user = await userModel.findOne({ "googleAuth.googleId": profile.id });

                        if (!user && profile.emails) {
                            user = await userModel.findOne({ emailAddress: profile.emails[0].value });

                            if (user) {
                                user.googleAuth = {
                                    googleId: profile.id,
                                    profile: {
                                        name: profile.displayName,
                                        picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                                        email: profile.emails[0].value,
                                    },
                                };
                                user.accountConfirmation.status = true;
                                user.accountConfirmation.timestamp = new Date();
                                await user.save();
                            } else {
                                const token = quicker.generateRandomId();
                                const code = quicker.generateOtp(6);

                                user = new userModel({
                                    name: profile.displayName || (profile.name?.givenName + ' ' + profile.name?.familyName) || 'Google User',
                                    emailAddress: profile.emails[0].value,
                                    googleAuth: {
                                        googleId: profile.id,
                                        profile: {
                                            name: profile.displayName,
                                            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                                            email: profile.emails[0].value,
                                        },
                                    },
                                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                                    accountConfirmation: {
                                        status: true,
                                        token,
                                        code,
                                        timestamp: new Date(),
                                    },
                                    passwordReset: {
                                        token: null,
                                        expiry: null,
                                        lastResetAt: null,
                                    },
                                    consent: true,
                                    timezone: 'UTC',
                                    isActive: false,
                                    loginInfo: {
                                        lastLogin: new Date(),
                                        loginCount: 0,
                                        lastLoginIP: null,
                                        registrationIP: null,
                                    },
                                    phoneNumber: {
                                        isoCode: null,
                                        countryCode: null,
                                        internationalNumber: null,
                                    },
                                    userLocation: {
                                        lat: null,
                                        long: null,
                                    },
                                    roles: [EUserRole.USER],
                                    notifications: [],
                                });

                                await user.save();
                            }
                        }

                        return done(null, user);
                    } catch (error) {
                        logger.error("Google strategy error:", error);
                        return done(error);
                    }
                }
            )
        );

        this.passport.serializeUser((user, done) => {
            done(null, user.emailAddress);
        });

        this.passport.deserializeUser(async (emailAddress, done) => {
            try {
                const user = await userModel.findOne({ emailAddress });
                done(null, user);
            } catch (error) {
                logger.error("Deserialize user error:", error);
                done(error);
            }
        });
    }

    initialize() {
        return this.passport.initialize();
    }

    session() {
        return this.passport.session();
    }
}

const passportService = new PassportService();
export { passportService };