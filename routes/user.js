const express = require('express');
const passport = require('passport');
const admin = require('firebase-admin');
const db = admin.firestore();
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.post('/', isNotLoggedIn , async(req,res,next)=> {
    try{
        const exUser = await db.collection('user').get();
        exUser.forEach((doc)=> {
            if(doc.id === req.body.phone){
                return res.status(400).json({
                    errorCode: 1,
                    message : '이미 회원가입되어있습니다.'
                })
            }
        });
        let User = {
            phone : req.body.phone,
            name : req.body.name,
            nickname : req.body.nickname,
            gender : req.body.gender,
            password: req.body.password,
            createdAt : req.body.createdAt,
            updatedAt : req.body.updatedAt,
            eut_id : req.body.eut_id,
        };
        const newUser = await db.collection('user').doc(User.phone).set(User);
        return res.status(201).send(newUser);
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.post('/login', isNotLoggedIn , async (req,res,next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err){
            console.error(err);
            return next(err);
        }
        if(info){
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (err) => { //세션에 사용자 저장
            if(err){
                console.error(err);
                return next(err);
            }
            return res.json(user);
        })
    })(req,res,next);
});

router.post('/logout', isLoggedIn , (req,res) => {
    if(req.isAuthenticated()){
        req.logout();
        req.session.destroy();
        return res.status(200).send('로그아웃되었습니다.');
    }
});

module.exports = router;