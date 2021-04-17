const express = require("express");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    // projects router
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
