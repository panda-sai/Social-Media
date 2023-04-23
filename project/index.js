import express from 'express'
import hbs from 'hbs'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import { readUser, readPosts, likeFun, shareFun, insertPost, insertUser } from './operations.js'

const app = express()
app.set('view engine', 'hbs');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser())


app.get('/', (req, res) => {
    res.render("login")
})

app.get('/register', (req, res) => {
    res.render("register")
})

app.post('/like', async (req,res)=>{
    await likeFun(req.body.content)
    res.redirect('/posts')
})

app.post('/share', async (req,res)=>{
    await shareFun(req.body.content)
    res.redirect('/posts')
})

app.post('/login', async (req, res) => {
    console.log(req.body.profile)
    const output = await readUser(req.body.profile)

    const password = output[0].password
    if (password === req.body.password) {
        const secret = "00add12754fbacb38b0b7af94d74443666cf0dbfcba738d9e854e55f98c98ed511f753fbc94ceeb140f8a0e1df993fb029b0727e6a8bb4cef030c0f6f851dff9"

        const payload = { "profile": output[0].profile, "name": output[0].name, "headline": output[0].headline }
        console.log(payload)
        const token = jwt.sign(payload, secret)
        res.cookie("token", token)
        res.redirect("/posts")
    }
    else {
        res.send("No found")
    }
})

app.get('/register',async (req,res)=>{
    res.send('register')
})

app.get('/posts', verifyLogin, async (req, res) => {
    const output = await readPosts()
    console.log(req.payload)
    res.render("posts", {
        data: output,
        userInfo: req.payload
    })
})

function verifyLogin(req, res, next) {
    const secret = "00add12754fbacb38b0b7af94d74443666cf0dbfcba738d9e854e55f98c98ed511f753fbc94ceeb140f8a0e1df993fb029b0727e6a8bb4cef030c0f6f851dff9"
    const token = req.cookies.token
    jwt.verify(token, secret, (err, payload) => {
        if (err) return res.sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/addposts',async (req, res) => {
    await insertPost(req.body.profile,req.body.content)
    res.redirect("/posts")
})

app.post('/addusers',async (req, res) => {
    await insertUser(req.body.name,req.body.profile,req.body.password,req.body.headline)
    res.redirect("/")
})


app.listen(3000, () => {
    console.log("Listening...")
})