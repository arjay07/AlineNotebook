/* global $, luxon, Swal, jQuery, store */

// Views Module
import { API } from "./api.js";
import { AlineNotepad } from "./notepad.js";
import { func } from "./dom.js";
import { Note } from "./note.js";
import { Modal } from "./modal.js";
import { BindLog, Bind } from "./bindlog.js"
import { Callbacks, Callback } from "./callback.js"
var DateTime = luxon.DateTime;

const views = {};
const notes = [];
var selectedNotes = ["auto", "homeowners"];
const content = $(".content");
const dateFormat = {month: "2-digit", day: "2-digit", year: "numeric"};
views.contingents = [];

var goalsLoaded = false;
var goals={};

var settingsLoaded = false;

views.selectedQuote = "auto";

views.startSplash = (data) => {
    $(".splash").load("/views/splash.html", function(){
        var a = $("#logo-a");
        var l = $("#logo-l");
        var ine = $("#logo-ine");
        var notebook = $("#logo-notebook");
        var splash = $(".splash");
    
        a.add(ine).add(notebook).css("display", "none");
    
        if (!data.loggedin) {
            l.animateCSS("aline-l",
                function() {
                    a.add(ine).css("display", "block");
                    a.animateCSS("aline-a");
                    ine.animateCSS("aline-ine", function() {
                        notebook.css("display", "block");
                        notebook.animateCSS("flipInX", function() {
                            setTimeout(function() {
                                splash.animate({
                                    opacity: 0
                                }, 300, function() {
                                    splash.remove();
                                });
                            }, 1000);
                        });
                    });
                });
        } else {
            splash.remove();
        }
    });
}

views.displayUser = (data) => {
    var accountbtn = $("#accountbtn");
    var accountlabel = $("#accountlabel");

    accountbtn.hover(function() {
        accountlabel.css("max-width", accountlabel[0].scrollWidth);
    },
        function() {
            accountlabel.css("max-width", 0);
        });

    if (data.loggedin) {
        accountlabel.text(data.user.name);
        accountbtn.click(function() {
            views.openUserHubDialog(data);
        });
    } else {
        accountbtn.click(function() {
            views.openLoginDialog();
        });
    }
}

views.loadDrawer = data => {

    var drawer = $(".drawer .drawercontents");

    data.forEach(e => {
        var name = e.name;
        var items = e.items;

        drawer.append(`<a class='drawerlink'><h3>${name}</h3></a>`);

        items.forEach(i => {
            var name = i.name;
            var url = i.url;

            if (!i.onclick)
                drawer.append(`<a class='drawerlink' href='${url}' target='_blank'>${name}</a>`);
            else {
                var onclick = i.onclick;
                drawer.append(`<a class='drawerlink' onclick='${onclick}' target='_blank'>${name}</a>`);
            }
        });
    });

    API.readJSON("drawer.json", loadAppDrawer);
}

const loadAppDrawer = data => {
    var drawer = $(".drawer .drawercontents");

    data.forEach(e => {
        var name = e.name;
        var items = e.items;

        drawer.append(`<a class='drawerlink'><h3>${name}</h3></a>`);

        items.forEach(i => {
            var name = i.name;
            var url = i.url;
            
            var link = $(`<a class='drawerlink' target='_blank'>${name}</a>`);

            if(i.icon){
                link.append($(`<i class="${i.icon}"></i>`).css("margin-left", 10));
            }

            if (!i.onclick)
                drawer.append(link.attr("href", url));
            else {
                var onclick = i.onclick;
                drawer.append(link.attr("onclick", onclick));
            }
        });
    });
}

views.loadView = (data, viewClass, parent) => {
    var content = $(parent ? parent : ".content");
    data.layout.forEach(e => {
        var note = $("<div></div>");
        note.addClass(viewClass);
        if (e.type) note.attr("data-type", e.type);
        if (e.label && e.type) {
            note.attr("data-label", e.label);
            note.append("<h2>" + e.label + " Quote</h2>")
        } else if (e.label && !e.type) {
            note.attr("data-label", e.label);
            note.append("<h3>" + e.label + "</h3>")
        }
        e.sections.forEach(sec => {
            if (sec.label) note.append("<h3>" + sec.label + "</h3>");
            var section = $("<table></table>");
            (sec.table ? sec.table : sec).forEach(r => {
                var row = $("<tr></tr>");
                r.forEach(cname => {

                    var c = data.components.find(e => e.id === cname);
                    if (c !== undefined) {

                        var labelcell = $("<td></td>");
                        labelcell.text(c.label);
                        if (c.required) labelcell.addClass("required");
                        var inputcell = $("<td></td>");
                        var input = $("<input/>");
                        var sendBtn;

                        if (c.listeners)
                            c.listeners.forEach(listener => {
                                input.attr("on" + listener.on, listener.func);
                            });

                        switch (c.type) {
                            case "string" || "text":
                                input.attr("type", "text");
                                break;

                            case "number":
                                input.attr("type", "number");
                                break;

                            case "phonenumber":
                                input.blur(() => {
                                    if (input.val().length == 10) input.val(formatPhoneNumber(input.val()));
                                });
                                break;

                            case "date":
                                input.val(c.value ? c.value : DateTime.local().toLocaleString(dateFormat));
                                input.attr("data-date", true);
                                input.datepicker({
                                    date: c.value ? c.value : DateTime.local()
                                });
                                break;

                            case "select":
                                input = $("<select></select>");
                                input.attr("data-id", c.id);
                                c.options.forEach(o => {
                                    var option = $("<option></option>");
                                    option.text(o.label);
                                    if (o.value !== undefined) option.attr("value", o.value);
                                    else option.attr("value", o.label);
                                    input.append(option);
                                });
                                break;

                            case "checkbox":
                                labelcell.empty();
                                var label = $("<label></label>");
                                input.attr("type", "checkbox");
                                label.append(input, c.label);
                                labelcell.prepend(label);
                                break;

                            case "textarea":
                                input = $("<textarea></textarea>");
                                if (c.placeholder) input.attr("placeholder", c.placeholder);
                                break;
                                
                            case "email":
                                input.attr("type", "text");
                                sendBtn = $(`<td><div class="sendbtn"><i class="fas fa-envelope"></i></div></td>`);
                                sendBtn.click(function(){
                                    window.open("mailto:"+input.val()+encodeURI("?subject=Allstate POI [encrypted]"));
                                });
                                inputcell.append(input);
                                break;
                        }

                        if (c.contingent) {
                            inputcell.add(labelcell).css("display", "none");
                            views.addContingent(e.type, inputcell, labelcell, c.contingent.component, c.contingent.value);
                        }

                        input.attr("data-input", true);
                        input.attr("data-note-type", e.type);
                        if (c.id) input.attr("data-id", c.id);
                        if (c.placeholder) input.attr("placeholder", c.placeholder);
                        row.append(labelcell);
                        if (c.style) input.css(c.style);
                        if (c.type != "checkbox" || c.type != "email") {
                            inputcell.append(input);
                            row.append(inputcell);
                        }
                        
                        if(sendBtn){
                            sendBtn.insertAfter(inputcell);
                        }
                    } else {
                        row.append($("<td>"));
                    }
                });
                section.append(row);
            });
            note.append(section);
        });
        if (e.type) notes.push(note);
        content.append(note);

        views.initContingents();
    });
}

views.saveValues = ()=> {
    var values = [];
    $("[data-input]").each(function(i){
        if($(this).val()!=""){
            values.push({
                id: $(this).data("id"),
                value: $(this).val(),
                parent: $(this).data("note-type")
            });
        }
    });
    store.set("saved", values);
    
    return store.get("saved");
    
};

views.loadValues = () => {
    var values = store.get("saved");
    
    values.forEach(value => {
        var id = value.id;
        var val = value.value;
        var parent = value.parent;
        
        if(parent){
            $(`.note[data-type="${parent}"] [data-input][data-id="${id}"]`).val(val);
        }else{
            $(`.customerinfo [data-input][data-id="${id}"]`).val(val);
        }
    });
}

views.addContingent = (type, inputcell, labelcell, component, value) => {
    views.contingents.push({
        type: type,
        inputcell: inputcell,
        labelcell: labelcell,
        component: component,
        value: value
    });
}

views.initContingents = () => {
    views.contingents.forEach(
        function(e) {
            var elements = e.inputcell.add(e.labelcell);
            var component = $(`.note[data-type="${e.type}"] [data-input="true"][data-id="${e.component}"]`);
            var value = e.value;
            component.change(
                function(i) {
                    if ($(this).val() == e.value) {
                        elements.css("display", "table-cell");
                    } else {
                        elements.css("display", "none");
                    }
                }
            );
        }
    );
}

views.initAccountBtn = () => {
    var btn = $("#accountbtn");
    var label = $("#accountlabel");

    btn.on("mouseover", () => {
        label.animate({
            width: "auto",
            opacity: "1"
        });
    });

    btn.on("mouseout", () => {
        label.animate({
            width: "0px",
            opacity: "0"
        });
    });
}

views.initQuoteDropdown = () => {

    var btn = $('<div class="quotefilter">Quotes</div>');
    var dropdown = $('<div class="quotedropdown"></div>');

    notes.forEach(note => {
        var fbtn = $(`<div class="filterbtn"></dv>`);
        var label = $("<label></label>");
        label.css("width", "100%");
        label.css("box-sizing", "border-box");
        label.css("display", "block");
        label.css("cursor", "pointer");
        var cb = $(`<input type="checkbox" data-type="${note.data("type")}"/>`);

        if (selectedNotes.includes(cb.data("type"))) {
            cb.prop("checked", true);
        }

        cb.on("change", () => {
            if (cb.is(":checked")) {
                selectedNotes.push(cb.data("type"));
            } else if (cb.is(":not(:checked)")) {
                if (selectedNotes.length < 2) {
                    cb.prop("checked", true);
                } else {
                    selectedNotes = selectedNotes.filter(e => e != cb.data("type"));
                    if (cb.data("type") == views.selectedQuote) {
                        views.selectedQuote = selectedNotes[0];
                        views.switchTab(views.selectedQuote);
                    }
                }
            }
            views.updateFilters();
        });

        label.append(cb, note.data("label"));
        fbtn.append(label);

        dropdown.append(fbtn);
    });

    btn.add(dropdown).insertAfter($(".customerinfo").first());

    btn.on("click", () => {

        if (btn.hasClass("quotefilteractive")) {
            dropdown.one("transitionend", function() {
                btn.removeClass("quotefilteractive");
            })
        } else {
            btn.addClass("quotefilteractive");
        }

        var mh = dropdown.css("max-height");

        if (parseInt(mh.substring(0, mh.length - 2)) > 0) {
            dropdown.css("max-height", "0px");
        } else {
            dropdown.css("max-height", dropdown[0].scrollHeight + "px");
        }
    });
}

views.updateFilters = () => {
    $(".tabs").empty();
    selectedNotes.forEach(notename => {
        var note = notes.find(o => { return o.data("type") === notename });
        var tab = $(`<div class="tab" data-type="${note.data("type")}">${note.data("label")}</div>`);
        tab.on("click", e => views.switchTab(note.data("type")));
        $(".tabs").append(tab);
    });
    $(`.tab[data-type="${views.selectedQuote}"]`).attr("data-selected", true);
}

views.initTabs = () => {
    var tabs = $("<div class='tabs'></div>");
    tabs.insertBefore($(".note").first());
    $(".note").addClass("hidden");
    $(`.note[data-type="${views.selectedQuote}"]`).removeClass("hidden");
    selectedNotes.forEach(notename => {
        var note = notes.find(o => { return o.data("type") === notename });
        var tab = $(`<div class="tab" data-type="${note.data("type")}">${note.data("label")}</div>`);
        tab.on("click", e => views.switchTab(note.data("type")));
        $(".tabs").append(tab);
    });
    $(`.tab[data-type="${views.selectedQuote}"]`).attr("data-selected", true);
}

views.switchTab = quote => {
    var currentQuote = $(`.note[data-type="${views.selectedQuote}"]`);
    var currentTab = $(`.tab[data-type="${views.selectedQuote}"]`);
    var nextQuote = $(`.note[data-type="${quote}"`);
    var nextTab = $(`.tab[data-type="${quote}"`);

    if (views.selectedQuote != quote) {

        $(".note").addClass("hidden");

        $(".tab").removeAttr("data-selected");
        nextTab.attr("data-selected", true);

        currentQuote.add(nextQuote).removeClass("hidden");
        currentQuote.add(nextQuote).addClass("inlineslide");

        if (nextTab.isAfter(currentTab)) {
            currentQuote.animateCSS("slideOutLeft", () => {
                nextQuote.add(currentQuote).removeClass("inlineslide");
                currentQuote.addClass("hidden");
            });
            nextQuote.animateCSS("slideInRight");
        } else if (nextTab.isBefore(currentTab)) {
            currentQuote.animateCSS("slideOutRight", () => {
                nextQuote.add(currentQuote).removeClass("inlineslide");
                currentQuote.addClass("hidden");
            });
            nextQuote.animateCSS("slideInLeft");
        }

        views.selectedQuote = quote;

    }
}

views.loadNotepad = () => {
    var notepadDiv = $("<div class='notepadDiv'></div>");
    var notepad = new AlineNotepad();
    var fsbtn = $("<div class='fsbtn'><i class=\"fas fa-expand fa-lg\"></i></div>");
    var menu = $("<div class='fsnotemenu'></div>");
    var copy = $("<div class='btn'>Copy</div>");
    var exit = $("<div class='btn'>Exit <i class='fas fa-sign-out-alt'></i></div>");
    
    $("#suggestions").css({"display": "none"});
    
    fsbtn.click(function(){
        notepad.addClass("fs");
        menu.show();
    });
    
    exit.click(function(){
        notepad.removeClass("fs");
        menu.hide();
    });
    
    copy.click(function(){
        func.copyText(notepad.val());
        Swal.fire(
            {
                icon: "success",
                text: "Copied notes to clipboard!",
                timer: 1200,
                showConfirmButton: false
            });
    });
    
    menu.append(copy, exit);
    
    notepadDiv.append(notepad, fsbtn);
    content.append(notepadDiv, menu);
    menu.hide();
}

views.loadNoteMenu = () => {
    var notemenu = $("<div class='notemenu'></div>");
    var genbtn = $("<div class='btn'>Generate<i class='fas fa-cog'></i></div>");
    var resetbtn = $("<div class='btn'>Reset<i class='fas fa-undo'></i></div>");

    genbtn.on("click", () => {
        var notes = [];
        Note.getActiveNotes().forEach(e => { notes.push(new Note(e).gatherInfo()); });

        if (notes.length > 0) {
            var customer = new Note.Customer(notes).gatherInfo();
            views.openNotePreview(customer);
        } else {
            Swal.fire({
                position: "bottom-end",
                icon: "warning",
                text: "No notes filled out!",
                toast: true,
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    resetbtn.click(() => {
        Swal.fire({
            title: "Are you sure?",
            text: "Your notes cannot be recovered.",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: '#d33'
        })
            .then(willDelete => {
                if (willDelete.value) {
                    $("[data-input='true']").each(
                        function(i) {
                            var e = $(this);
                            if (e.attr("type") == "checkbox") {
                                e.prop("checked", false);
                            } else if (e.data("date") == true) {
                                e.val(DateTime.local().toLocaleString(DateTime.DATE_SHORT));
                            } else if (e.is("select")) {
                                e.find('option:eq(0)').prop('selected', true);
                            } else {
                                e.val("");
                            }
                        }
                    );
                    Swal.fire({
                        text: "Notes successfully reset!",
                        icon: "success",
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            });
    });

    notemenu.append(genbtn, resetbtn);
    content.append(notemenu);
}

views.openNotePreview = (customer) => {

    var generatedNote = Note.generate(customer);

    var previewNote = $("<textarea></textarea>");
    previewNote.css({
        width: "100%",
        height: "calc(100% - 55px)",
        padding: "5px",
        resize: "none",
        boxSizing: "border-box",
        border: "none",
        outline: "none",
        display: "block"
    });
    previewNote.text(generatedNote);

    var copy = $("<div class='btn'>Copy</div>");
    copy.on("click", () => {
        func.copyText(previewNote.val());
        Swal.fire(
            {
                icon: "success",
                text: "Copied notes to clipboard!",
                timer: 1200,
                showConfirmButton: false
            });
    });

    var addToBindLog = $("<div class='btn'>Add to Bindlog</div>");
    addToBindLog.on("click", () => {
        BindLog.addFromCustomer(customer,
            function(){
                Swal.fire(
                {
                    icon: "success",
                    text: "Added to Bind Log!",
                    timer: 1200,
                    showConfirmButton: false
                });
            },
            function(invalidProperties){
                var msg = "";
                
                invalidProperties.forEach(
                    function(invalidProperty){
                        msg+="<p>"+invalidProperty+" is invalid.</p>";
                    });
                msg = msg.trim();
                
                Swal.fire({
                    title: "Error Adding Bind!",
                    icon: "error",
                    html: msg
                });
            });
    });

    var options = {
        content: [previewNote, copy, addToBindLog],
        style: {
            padding: 0
        }
    }
    var previewDialog = new Modal("Preview/Edit Note", options);
    previewDialog.show();

}

views.openLoginDialog = () => {
    var username = $("<input name='username' placeholder='Username'>");
    var password = $("<input name='password' placeholder='Password'>");
    var loginBtn = $("<input type='submit' class='btn' value='Login'>");
    var remember = $("<input type='checkbox'>");
    var createAccount = $("<a>Create an Account</a>");
    password.attr("type", "password");

    loginBtn.click(function() {
        if (remember.is(":checked")) {
            var un = username.val();
            var pw = password.val();
            $.cookie('username', un, { expires: 14 });
            $.cookie('password', pw, { expires: 14 });
            $.cookie('remember', true, { expires: 14 });
        } else {
            $.removeCookie('username');
            $.removeCookie('password');
            $.removeCookie('remember');
        }
    });

    var form = $("<form method='post' action='/login'>");
    form.append(
        $("<div>Username: </div>"), username,
        $("<div>Password: </div>"), password,
        $("<label>Remember Me: </label>").css({ fontSize: ".8em", display: "block" }).append(remember),
        $("<div>").append(loginBtn).css({ textAlign: "center" }));
    form.css({
        margin: "auto",
        width: "50%",
        textAlign: "left"
    });

    var dialog = new Modal("Login", {
        content: [form, $("<div>Don't have an account? </div>").append(createAccount).css({
            width: "70%",
            margin: "auto"
        })],
        style: {
            width: "350px",
            height: "auto",
            padding: "15px",
            fontSize: "1.2em",
            borderRadius: "5px"
        }
    });

    createAccount.click(function() {
        views.openRegisterDialog();
        dialog.close();
    });

    dialog.show(function(modal) {
        var r = $.cookie('remember');
        if (r) {
            console.log("Oh I remember you!");
            username.val($.cookie('username'));
            password.val($.cookie('password'));
            remember.attr("checked", true);
        }
    });
}

views.openRegisterDialog = () => {
    var name = $("<input name='name' placeholder='John Smith'>");
    var email = $("<input name='email' placeholder='johnsmith@email.com'>");
    var username = $("<input name='username' placeholder='Username'>");
    var password = $("<input type='password' name='password' placeholder='Password'>");
    var password2 = $("<input type='password' name='password2' placeholder='Confirm Password'>");
    var regBtn = $("<div class='btn'>Create Account</div>");

    password.attr("type", "password");

    var form = $("<form method='post' action='/register'>");
    form.append(
        $("<div>Name: </div>"), name,
        $("<div>Email: </div>"), email,
        $("<div>Username: </div>"), username,
        $("<div>Password: </div>"), password,
        $("<div>Confirm Password: </div>"), password2,
        $("<div>").append(regBtn).css({ textAlign: "center" }));
    form.css({
        margin: "auto",
        width: "50%",
        textAlign: "left"
    });
    
    function errorAlert(msg){
        Swal.fire({
            text: msg,
            icon: "error"
        });
    }
    
    function emailIsValid (email) {
        return /\S+@\S+\.\S+/.test(email)
    }
    
    function passwordIsValid(password){
        return /^[a-zA-Z]\w{3,14}$/.test(password)
    }
    
    regBtn.click(function(){
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

    var dialog = new Modal("Create an Account", {
        content: [form],
        style: {
            width: "400px",
            height: "auto",
            padding: "15px",
            fontSize: "1.2em",
            borderRadius: "5px"
        }
    });
    dialog.show();
}

views.openUserHubDialog = (data) => {


    var header = $(`<h1>Hello, ${data.user.name.split(" ")[0]}!</h1>`);
    var subheader = $(`<h3>Welcome to your HUB</h3>
    <p>Keep track of your goals and manage your account.</p>`);
    var goalsDiv = $("<div class='goals'></div>");
    var logout = $("<div class='btn'>Logout</div>");
    
    logout.click(function(){
        window.open("/logout", "_self");
    });
    
    goalsDiv.load("/views/goalstable.html", function(){
        $("#goalstable").css({
            margin: "auto",
            textAlign: "center"
        });
        
        $("#goalstable td").css({
            paddingLeft: "10px",
            paddingRight: "10px"
        });
        
        
        var goalNames = ["dig", "dbg", "mig", "mbg"];
        
        if(!goalsLoaded)API.userAPI("READ", ["goals"], function(data){goals = data; goalsLoaded=true}, false);
        
        function updateGoalsView(goal){
            var filteredGoals = {
                dig: BindLog.items(BindLog.filter("TODAY")),
                dbg: BindLog.bundles(BindLog.filter("TODAY")),
                mig: BindLog.items(BindLog.filter("MTD")),
                mbg: BindLog.bundles(BindLog.filter("MTD"))
            };
            
            var updateGoal = [];
            
            switch(goal){
                case "dig":
                    updateGoal= ["goals.daily.items", JSON.stringify($("#dig").val())];
                    break;
                case "mig":
                    updateGoal= ["goals.monthly.items", JSON.stringify($("#mig").val())];
                    break;
                case "dbg":
                    updateGoal= ["goals.daily.bundles", JSON.stringify($("#dbg").val())];
                    break;
                case "mbg":
                    updateGoal= ["goals.monthly.bundles", JSON.stringify($("#mbg").val())];
                    break;
            }
            
            var percent = (filteredGoals[goal]/parseInt($("#"+goal).val()))*100||0;
            var newCirc = $("<div></div>");
            newCirc.css({
                textAlign: "center",
                margin: "auto",
                width: "100%",
                marginLeft: "10px"
            });
            API.userAPI("READ", ["goals"], function(data){goals = data; goalsLoaded=true});
            newCirc.attr("id", goal+"circ");
            newCirc.attr("data-percent", percent);
            $("#"+goal+"circ").replaceWith(newCirc);
            $("#"+goal+"circ").percentcircle();
            
            //console.log(goal, filteredGoals[goal], parseInt($("#"+goal).val()), (filteredGoals[goal]/parseInt($("#"+goal).val()))*100);
            
            if(updateGoal.length>0)API.userAPI("WRITE", updateGoal);
        }
        
        $("#dig")
            .val(goals.daily.items);
        
        $("#dbg")
            .val(goals.daily.bundles);
            
        $("#mig")
            .val(goals.monthly.items);
            
        $("#mbg")
            .val(goals.monthly.bundles);
            
        $("#di")
            .text(BindLog.items(BindLog.filter("TODAY"))||0);
        
        $("#db")
            .text(BindLog.bundles(BindLog.filter("TODAY"))||0);
            
        $("#mi")
            .text(BindLog.items(BindLog.filter("MTD"))||0);
            
        $("#mb")
            .text(BindLog.bundles(BindLog.filter("MTD"))||0);
            
        $("#di, #db, #mi, #mb").css({
            fontWeight: "bold",
            fontSize: "1.2em"
        })
            
        $("#dig, #dbg, #mig, #mbg").css({
            width: 50,
            backgroundColor: "transparent",
            fontWeight: "bold",
            fontSize: "1.2em",
            border: "none",
            borderBottom: "2px solid black"
        }).on("change", function(){
            goalsLoaded=false;
            updateGoalsView($(this).attr("id"));
        });
        
        goalNames.forEach(goal => updateGoalsView(goal))
        
        $("#digcirc, #dbgcirc, #migcirc, #mbgcirc")
        .css({
            textAlign: "center",
            margin: "auto",
            width: "100%",
            marginLeft: "10px"
        })
    });
    
    var content = [header, subheader, goalsDiv, logout];
    
    var dialog = new Modal("Profile", {
        content: content,
        style: {
            borderRadius: "5px",
            textAlign: "center",
            overflow: "auto"
        }
    });
    dialog.show();

}

views.openSettings = (settings) => {
    var dialog = new Modal("Settings", {
        keep: true
    }).show();
    
    const loadSettingPage = () => {
        // For each input change
        // Save to settings
        // Load from settings on open
        $("[data-setting]").each(function(i){
            var setting = {key: $(this).attr("id"), value:$(this).val()};
            if($(this).attr("type")=="checkbox")setting.value = $(this).is(":checked");
            
            if(settings[settings.key]!=undefined){
                API.userAPI("WRITE", ["settings."+setting.key, JSON.stringify(setting.value)]);
            }else{
                if($(this).attr("type")=="checkbox")
                    $(this).prop("checked", settings[setting.key]);
                else $(this).val(settings[setting.key]);
            }
            
            $(this).on("change", function(){
                if($(this).attr("type")=="checkbox")API.userAPI("WRITE", ["settings."+setting.key, JSON.stringify($(this).is(":checked"))]);
                else API.userAPI("WRITE", ["settings."+setting.key, JSON.stringify($(this).val())]);
            });
        });
        
        $("#importdata").click(function(){
            Swal.fire({
                title: "Import Data",
                text: "Import bind log data from Sales Notebook.",
                input: "text",
                showCancelButton: true
            }).then(function(data){
                if(data.value){
                    Swal.fire({
                        title: "Are you sure?",
                        text: "If the text you've entered is invalid, your bind log may be corrupted.",
                        showCancelButton: true,
                        cancelButtonColor: "#d33",
                        icon: "warning"
                    }).then(function(result){
                        if(result.value){
                            var bindlogData = JSON.parse(data.value);
                            
                            bindlogData.forEach((row, index) => {
                                if(index>0){
                                    BindLog.push(new Bind(row[1].value, row[2].value, row[3].value, row[4].value, row[5].value, row[6].value, row[0].value));
                                }
                            });
                            Swal.fire({
                                text: "Successfully imported bind log!",
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    });
                }
            });
            
        });
    };
    
    dialog.loadIntoContent("/views/settings.html", loadSettingPage);
};

// Misc Functions
function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return null
}

// jQuery custom methods
(function($) {
    $.fn.isAfter = function(sel) {
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore = function(sel) {
        return this.nextAll().filter(sel).length !== 0;
    };

    $.fn.animateCSS = function(animationName, callback) {
        $(this).addClass(`animated ${animationName}`);

        function handleAnimationEnd() {
            $(this).removeClass(`animated ${animationName}`);
            $(this).off('animationend', handleAnimationEnd);

            if (typeof callback === 'function') callback();
        }

        $(this).on('animationend', handleAnimationEnd);
    }
})(jQuery);

export { views };