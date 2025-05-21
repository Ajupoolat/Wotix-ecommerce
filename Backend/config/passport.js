const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");
const crypto = require("crypto");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/userapi/user/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      passReqToCallback: true,
      scope: ["profile", "email"],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const generatedReferralId = crypto.randomBytes(6).toString("hex");

        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        const profilePicture =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null;
        const firstName = profile.name?.givenName || "User";
        const lastName = profile.name?.familyName || "User";

        if (!email) {
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: email }],
        });

        if (!user) {
          user = new User({
            googleId: profile.id,
            email: email,
            profilePicture: profilePicture,
            firstName: firstName,
            lastName: lastName,
            refferalId: generatedReferralId,
          });
          await user.save();
        } else if (!user.googleId) {
          user.googleId = profile.id;
          if (!user.profilePicture && profilePicture) {
            user.profilePicture = profilePicture;
          }
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
