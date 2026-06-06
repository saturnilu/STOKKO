const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
require('dotenv').config();

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const username = profile.displayName;

      // cek udh pernah login make google blm
      const [rows] = await db.query(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [googleId, email]
      );

      if (rows.length > 0) {
        // kalo user udh ada, update google_id kalo belum ada
        const user = rows[0];
        if (!user.google_id) {
          await db.query(
            'UPDATE users SET google_id = ? WHERE id = ?',
            [googleId, user.id]
          );
        }
        return done(null, user);
      }

      // user baru simpen ke db
      // phone dikosongin dlu krn google ga ngasi hp
      const [result] = await db.query(
        `INSERT INTO users (username, email, phone, google_id, password_hash, role)
         VALUES (?, ?, '', ?, '', 'buyer')`,
        [username, email, googleId]
      );

      const [newUser] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      // Google OAuth default role = buyer
      // Kalau nanti role diupdate ke seller, store dibuat saat itu
      return done(null, newUser[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Tidak pakai session setelah dapat JWT, tapi passport butuh ini
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
