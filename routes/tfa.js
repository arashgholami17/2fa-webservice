const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const commons = require('./commons');
const router = express.Router();

router.post('/tfa/setup', (req, res) => {

    const secret = speakeasy.generateSecret({
        length: 10,
        name: req.body.uname,
        issuer: 'SahandSamanehPortal'
    });
    var url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: req.body.uname,
        issuer: 'SahandSamanehPortal',
        encoding: 'base32'
    });
    QRCode.toDataURL(url, (err, dataURL) => {
        commons.userObject.get(req.body.uname).tfa  = {
            secret: '',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: url
        };
        return res.json({
            message: 'TFA Auth needs to be verified',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url
        });
    });
});

router.get('/tfa/setup', (req, res) => {
    res.json(commons.userObject.tfa ? commons.userObject.tfa : null);
});

router.delete('/tfa/setup', (req, res) => {
    delete commons.userObject.tfa;
    res.send({
        "status": 200,
        "message": "success"
    });
});

router.post('/tfa/verify', (req, res) => {
    if (commons.userObject.has(req.body.user)){

        let isVerified = speakeasy.totp.verify({
            secret: commons.userObject.get(req.body.user).tfa.tempSecret,
            encoding: 'base32',
            token: req.body.token
        });
    
        if (isVerified) {
            commons.userObject.get(req.body.user).tfa.secret = commons.userObject.get(req.body.user).tfa.tempSecret;
            return res.send({
                "status": 200,
                "message": "Two-factor Auth is enabled successfully"
            });
        }
    
        return res.send({
            "status": 403,
            "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
        });
    }
    else{
        return res.send({
            "status": 111,
            "message": "Invalid userName, verification failed. User has not registered for authentication."
        });
    }
});

module.exports = router;