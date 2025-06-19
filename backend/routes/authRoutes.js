// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { loginLdap } = require("../controllers/ldap/loginController");

router.post("/login", loginLdap);

router.get("/check-auth", (req, res) => {
  if (req.session.ldap) {
    const uid = req.session.ldap.dn.split(",")[0].replace("uid=", "");
    res.json({ authenticated: true, username: uid });
  } else {
    res.sendStatus(401);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

module.exports = router;
