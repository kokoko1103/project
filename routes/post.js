const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { isLoggedIn } = require('./middlewares');
const admin = require('firebase-admin');
const db = admin.firestore();

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, 'uploads');
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            done(null, basename + Date.now() + ext);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024},
});


let Userinfo = '';
const today =  Date();
const uploadDay =  Date();

router.post('/images', isLoggedIn , upload.array('image') , (req,res) => {
    console.log(req.files);
    res.json(req.files.map(v => v.filename));
});
router.post('/', isLoggedIn , async (req,res,next) => {
    try{
        const hashtag = req.body.content.match(/#[^\s#]+/g);
        const setPost = {
            content : req.body.content,
            eut_id : req.user.eut_id,
            post_id : req.body.post_id,
            nickname: '',
            createdAt :  today,
            updatedAt :  uploadDay
        };
        console.log(setPost);
        if(hashtag){
            for(let i = 0; i<hashtag.length;i++){
                const exist =  await db.collection('hashtag').where('tag','==',hashtag[i].slice(1).toLowerCase()).get();
                if(exist.empty){
                    await db.collection('hashtag').doc(hashtag[i].slice(1).toLowerCase()).set({
                        tag: hashtag[i].slice(1).toLowerCase(),
                        post_id: admin.firestore.FieldValue.arrayUnion(req.body.post_id),
                    });
                } else{
                    await db.collection('hashtag').doc(hashtag[i].slice(1).toLowerCase()).update({
                        post_id: admin.firestore.FieldValue.arrayUnion(req.body.post_id)
                    });
                }
            }
        }
        let userPhone = '';
        const userinfo = await db.collection('user').where('eut_id', '==', req.user.eut_id).get();
        userinfo.forEach((doc) => {
            setPost.nickname = doc.data().nickname,
            userPhone = doc.data().phone
        });
        await db.collection('user').doc(userPhone).update({
            post_id : admin.firestore.FieldValue.arrayUnion(req.body.post_id)
        })
        await db.collection('post').add(setPost);
        return res.json(setPost);
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.get('/:postId/comment', async (req, res, next) => {
    try{
        const comment = await db.collection('post').where('post_id','==',req.params.postId).get();
        if(comment.empty){
            return res.status(404).send('게시물이 존재하지 않습니다.');
        }
        const commentAll = await db.collection('commnet').where('post_id','==',req.params.postId).get();
        let allUser = [];
        commentAll.forEach((doc) => {
            allUser = doc.data().eut_id
        })
        let information = [{
            user_id : 0,
            nickname : '',
            createdAt : today
        }];
        for(var v = 0; v<allUser.length; v++){
            const User = await db.collection('user').where('eut_id','==',allUser).get();
            User.forEach((doc) => {
                information[v].user_id = doc.data().eut_id,
                information[v].nickname = doc.data().nickname,
                information[v].createdAt = doc.data().createdAt
            })
        }
        information.sort(desc);
        function desc(a, b){
            var dataA = new Date(a['createdAt']).getTime;
            var dataB = new Date(b['createdAt']).getTime;
            return dataA > dataB ? 1 : -1;
        }
        return res.json(information);
    }catch(err){
        console.error(err);
        next(err);
    }
})

let index = 1;
router.post('/:postId/comment', isLoggedIn ,async (req, res, next) => {
    try{
        const comment = await db.collection('post').where('post_id','==',req.params.postId).get();
        if(comment.empty){
            return res.status(404).send('게시물이 존재하지 않습니다.');
        }
        const newcomment = {
            comment_id : String(index),
            post_id : req.params.post_id,
            eut_id : req.user.eut_id,
            content : req.body.content,
            nickname:'',
            createdAt : today,
            updatedAt : uploadDay
        };
        let content_id = '';
        comment.forEach((doc)=>{
            newcomment.post_id = doc.data().post_id,
            content_id = doc.id
        });
        index++;
        await db.collection('post').doc(content_id).update({
            comment_id : admin.firestore.FieldValue.arrayUnion(newcomment.comment_id)
        })
        let ucomment = '';
        const userinfo = await db.collection('user').where('eut_id', '==', req.user.eut_id).get();
        userinfo.forEach((doc) => {
            newcomment.nickname = doc.data().nickname
            ucomment = doc.id
        });
        await db.collection('user').doc(ucomment).update({
            comment_id : admin.firestore.FieldValue.arrayUnion(newcomment.comment_id)
        })
        await db.collection('comment').add(newcomment);
        return res.json(newcomment);
    }catch(err){
        next(err);
    }
});

module.exports = router;