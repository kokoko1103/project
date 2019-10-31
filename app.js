
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require("/Users/hyundong/Downloads/uritown-12c74-firebase-adminsdk-huox9-d7481dd445.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookie = require('cookie-parser');
const bcrypt = require('bcrypt');
const passportConfig = require('./passport');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');

const app = express();

passportConfig();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());//이게 있어야만 json을 해석할 수 있다.
app.use(express.urlencoded({ extended:false}));
//form을 통해서 전송 할때 그 데이터를 해석에서 req.body에 보내준다.

app.use('/', express.static('uploads'));
app.use(cookie('cookiesecret'));
app.use(session({
    resave:false,
    saveUninitialized: false,
    secret: 'cookiesecret',
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize());
app.use(passport.session());
//use는 미들웨어이다.
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
    res.status(200).send('기다려라 백엔드');
})

app.listen(3085, () =>{
    console.log('백앤드 서버 ${3085}번 포트 작용 중')
});


