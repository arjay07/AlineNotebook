/* Aline Notebook */
/* Copyright © 2019 Leandro Yabut. All rights reserved.*/

// Express Server
const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const session = require("express-session");

const app = express();
const port = 8080;
const address = "18.219.220.245";

const clientName="allstate";

var eagleEye = true;

// General
app.use(express.static(__dirname+"/app"));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 
app.use(session({
    "secret":"1uJOs0HcQs",
    saveUninitialized: false,
    resave: false
}));

// Setup JSON DB
const adapter = new FileSync(`${__dirname}/app/db.json`);
const db = low(adapter);

db.defaults({
    users: []
}).write();

// Home Route
app.get("/",function(req, res){
    res.sendFile(path.join(__dirname,"app","app.html"));
});

// Login/Logout Route
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var auth=authenticate(username, password);

    if(auth.authenticated()){
        req.session.loggedin=true;
        req.session.user=auth.user;
        if(eagleEye)console.log(req.session.user.username + " logged in.");
    }

    res.redirect("/");
});

app.get("/logout", function(req, res){
    if(eagleEye)console.log(req.session.user.username + " logged out.");
    req.session.destroy();
    res.redirect("/");
});

// Register Route
app.post("/register",function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.password2;

    registerAccount(name, email, username, password);
    var auth=authenticate(username, password);

    if(auth.authenticated()){
        req.session.loggedin=true;
        req.session.user=auth.user;
        if(eagleEye)console.log(req.session.user.username + " registered.");
    }
    
    res.redirect("/");

});

function registerAccount(name, email, username, password){
    var user = {
        name: name,
        email: email,
        username: username,
        password: password
    }

    var hash = bcrypt.hashSync(password, 10);
    user.password = hash;
    db.get("users").push(user).write();
}

function authenticate(username, password){
    var query = {
        username: username,
        password: password
    }

    var users = db.get("users").value();

    var user = users.filter(
        u => u.username == query.username
    )[0];

    return {authenticated: () => bcrypt.compareSync(query.password, user.password), user: user};
    
}

// API
app.post("/clientapi", function(req, res){
    switch(req.body.functionname){
        case "READ_CLIENT_JSON":
            var clientData=fs.readFileSync(__dirname+"/app/client-data/"+clientName+"/"+req.body.arguments[0]);
            res.json(JSON.parse(clientData));
        break;
        case "READ_CLIENT_TXT":
            res.sendFile(__dirname+"/app/client-data/"+clientName+"/"+req.body.arguments[0]);
        break;
        default:
            console.log("No such function: " + req.body.functionname);
            res.send("No such function: " + req.body.functionname);
        break;
    };
});

app.post("/api", function(req, res){
    switch(req.body.functionname){
        case "READ_APP_JSON":
            var data=fs.readFileSync(__dirname+"/app/data/"+req.body.arguments[0]);
            res.json(JSON.parse(data));
        break;
        case "READ_APP_TXT":
            res.sendFile(__dirname+"/app/data/"+req.body.arguments[0]);
        break;
        case "WRITE_FILE":
            fs.writeFile(req.body.arguments[0], req.body.arguments[1], err => {
                if(err)throw err;

                else console.log("File was successfully written");
            });
        break;
        default:
            console.log("No such function: " + req.body.functionname);
            res.send("No such function: " + req.body.functionname);
        break;
    };
});

app.post("/userapi", function(req, res){

    if(req.session.loggedin){

        var user = req.session.user;
        var username = user.username;

        fs.mkdirSync(path.join(__dirname, `app/users/${username}`), { recursive: true });

        const adapter = new FileSync(`${__dirname}/app/users/${username}/db.json`);
        const db = low(adapter);

        db.defaults({
            user: {
                name: user.name,
                username: user.username,
                email: user.email
            },
            bindlog: [],
            goals: {
                daily: {
                    items: 5,
                    bundles: 2
                },
                monthly: {
                    items: 50,
                    bundles: 10
                }
            },
            callbacks: [],
            notes: [],
            settings: {},
        }).write();
        
        var args = req.body.arguments;
        
        switch(req.body.functionname){
            case "READ":
                var data = db.get(args[0]).value();
                res.json(data);
            break;
            
            case "WRITE":
                db.set(args[0], JSON.parse(args[1])).write();
                res.end();
            break;
            
            case "PUSH":
                db.get(args[0]).push(JSON.parse(args[1])).write();
                res.end();
            break;
            
            case "REMOVE":
                db.get(args[0]).remove(JSON.parse(args[1])).write();
                res.end();
            break;
        }

    }else{
        res.end();
    }
});

app.post("/db", function(req, res){

    var args = req.body.arguments;
    
    switch(req.body.functionname){
        case "READ":
            var data = db.get(args[0]).value();
            res.json(data);
        break;
        
        case "WRITE":
            db.set(args[0], JSON.parse(args[1])).write();
            res.end();
        break;
        
        case "PUSH":
            db.get(args[0]).push(JSON.parse(args[1])).write();
            res.end();
        break;
        
        case "REMOVE":
            db.get(args[0]).remove(JSON.parse(args[1])).write();
            res.end();
        break;
    }
});

app.post("/session", function(req, res){
    res.json(req.session);
});

// Start App
app.listen(port, function(){
    console.log("Running app at http://" + address + ":" + port + "/...");
});