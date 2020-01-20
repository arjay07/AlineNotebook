/* global $, Swal */
// Login Page

import { API } from "./modules/api.js"

const init = function(){
    API.getSession(function(session){
        console.log(session);
        if(session.loginErrorMessage){
            Swal.fire({
                text: session.loginErrorMessage,
                icon: "error",
                toast: true,
                position: "bottom-start"
            });
        }
    });
    
    $("#login").click(function(){
        $("#loginform").submit();
    });
    
    function emailIsValid (email) {
        return /\S+@\S+\.\S+/.test(email);
    }
    
    function passwordIsValid(password){
        return /^[a-zA-Z]\w{3,14}$/.test(password);
    }
    
    var name = $("#name");
    var email = $("#email");
    var username = $("#username");
    var password = $("#password");
    var password2 = $("#password2");
    
    function errorAlert(msg){
        Swal.fire({
            text: msg,
            icon: "error"
        });
    }
    
    $("#register").click(function(){
        if(name.val()!="")
            if(emailIsValid(email.val())){
                var emails = [];
                API.db("READ", ["users"], function(data){
                    data.forEach(function(user){
                        emails.push(user.email);
                    });
                }, false);
                if(!emails.includes(email.val())){
                    if(username.val()!=""){
                        var usernames = [];
                        API.db("READ", ["users"], function(data){
                            data.forEach(function(user){
                                usernames.push(user.username);
                            });
                        }, false);
                        if(!usernames.includes(username.val())){
                            if(passwordIsValid(password.val()))
                                if(password.val() === password2.val())
                                    $("#registerform").submit();
                                else errorAlert("Passwords do not match!");
                            else errorAlert("Please is invalid. Password must be at least 4 characters long, no more than 15 characters. Letters, numbers, and the underscore may be used.")
                        }else errorAlert("Username is already taken!");
                    }else errorAlert("Please enter a username.");
                }else errorAlert("Email is already registered!");
            }else errorAlert("Email is invalid!");
        else errorAlert("Please enter your name.");
    });
}

$(document).ready(init);