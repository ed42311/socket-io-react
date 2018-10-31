const express = require("express");
const router = express.Router();
const backend = async (socket) => {}
router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});
module.exports = router;