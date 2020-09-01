const router = require("express").Router();
const verify = require("../middleware/tokenVerification");
const Team = require("../models/Team");

router.post("/attack", verify, async (req, res) => {
  const totalAttack =
    req.body.soldier * 100 + req.body.aircraft * 300 + req.body.tank * 400;
  const defender = await Team.findOne({ school: req.body.defender });
  if (totalAttack - defender.dp >= 50) {
    Team.updateOne(
      { school: defender.school },
      {
        $set: { dp: defender.dp - totalAttack, fp: parseInt(defender.fp / 2) },
      },
      { multi: true },
      callback
    );
    function callback(err, num) {
      if (err) {
        console.log(err);
      }
    }
    Team.updateOne(
      { school: req.team.school },
      {
        $inc: {
          "troops.soldiers": -req.body.soldier,
          fp: parseInt(defender.fp / 2),
        },
      },
      { multi: true },
      attackcallback
    );
    function attackcallback(err, num) {
      if (err) {
        console.log(err);
      }
    }
    res.redirect("/dashboard/?success=true");
  } else {
    Team.updateOne(
      { school: req.team.school },
      { $inc: { "troops.soldiers": -req.body.soldier } },
      { multi: true },
      attackcallback
    );
    function attackcallback(err, num) {
      if (err) {
        console.log(err);
      }
      console.log(num);
    }
    Team.updateOne(
      { school: defender.school },
      {
        $set: { dp: defender.dp - totalAttack},
      },
      { multi: true },
      callback
    );
    function callback(err, num) {
      if (err) {
        console.log(err);
      }
    }
    res.redirect("/dashboard/?success=false");
  }
});

module.exports = router;