const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('./middlewares');


var listeners = [];
var start = null;
var end = null;
var lengths = null;

router.get('/', async(req, res, next) =>{ // POST /posts?offset=10&limit=10
    try{
        let first = db.collection('post');
        first.orderBy('createdAt','desc').limit(10).get().then((snapshot) => {
            start = snapshot.docs[snapshot.docs.length -1];
            first.orderBy('createdAt').startAt(start).onSnapshot((dash) => {
                dash.forEach((doc) => {
                    listeners.push({
                        post_id : doc.data().post_id,
                        content : doc.data().content,
                        eut_id : doc.data().eut_id,
                        createdAt : doc.data().createdAt,
                        updatedAt : doc.data().updatedAt,
                        nickname : doc.data().nickname
                    })
                })
            })
        })
        //     if(lengths == 10){
        //         let second = db.collection('post');
        //         second.orderBy('createdAt','desc').startAt(start).limit(10).get().then((snapshot) => {
        //             end = start
        //             start = snapshot.docs[snapshot.docs.length -1]
        //             lengths = snapshot.docs.length
        //             second.orderBy('createdAt').startAt(start).endBefore(end).onSnapshot((dash) => {
        //                 dash.forEach((doc) => {
        //                     listeners.push({
        //                         post_id : doc.data().post_id,
        //                         content : doc.data().content,
        //                         eut_id : doc.data().eut_id,
        //                         createdAt : doc.data().createdAt,
        //                         updatedAt : doc.data().updatedAt,
        //                         nickname : doc.data().nickname
        //                     })
        //                 })
        //             })
        //         })
        //     } else if(lengths < 10){
        //         let third = db.collection('post');
        //         third.orderBy('createdAt','desc').startAt(start).limit(10).get().then((snapshot) => {
        //             end = start
        //             start = snapshot.docs[snapshot.docs.length -1]
        //             lengths = snapshot.docs.length
        //             third.orderBy('createdAt').startAt(start).endBefore(end).onSnapshot((dash) => {
        //                 dash.forEach((doc) => {
        //                     listeners.push({
        //                         post_id : doc.data().post_id,
        //                         content : doc.data().content,
        //                         eut_id : doc.data().eut_id,
        //                         createdAt : doc.data().createdAt,
        //                         updatedAt : doc.data().updatedAt,
        //                         nickname : doc.data().nickname
        //                     })
        //                 })
        //             })
        //         })
        // }
        return res.json(listeners);
    }catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;