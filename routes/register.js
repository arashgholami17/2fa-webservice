const express = require('express');
const commons = require('./commons');
const router = express.Router();

router.post('/register', (req, res) => {

    const result = req.body;

    if ((!result.uname && !result.upass) || (result.uname.trim() == "" || result.upass.trim() == "")) {
        return res.send({
            "status": 400,
            "message": "Username/ password is required"
        });
    }

    commons.userObject.set(result.uname,{'userPass': result.upass});

    return res.send({
        "status": 200,
        "message": "User is successfully registered"
    });
});

module.exports = router;