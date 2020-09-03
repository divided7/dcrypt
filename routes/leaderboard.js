const router = require("express").Router();
const verify = require("../middleware/tokenVerification");
const contentSecurity = require("../middleware/contentSecurity");
const Team = require("../models/Team");

router.get("/leaderboard", contentSecurity, verify, (req, res) => {
  Team.find({})
    .sort({ fp: "desc" })
    .exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      res.render("leaderboard.ejs", { team: req.team, allteams: docs });
    });
});

module.exports = router;
