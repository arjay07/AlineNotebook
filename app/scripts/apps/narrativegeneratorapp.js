/* global $, Swal */

// Narrative Generator App
import { Modal } from "../modules/modal.js"
import { func } from "../modules/dom.js"

var NarrativeGeneratorApp = {};

NarrativeGeneratorApp.open = function(){
    
    var menu = $("<div><strong>Narrative Type: </strong></div>");
    
    var narratives = [
            {text: "--", value: "narrativegenerator.html"},
            {text: "Short Rate", value: "shortrate.html"}
        ];
    
    var narrativeselector = $("<select id='narrativeselector'></select>");
    
    narratives.forEach(narrative => {
        var option = `<option value="${narrative.value}">${narrative.text}</option>`;
        narrativeselector.append(option);
    });
    
    var narrativeview = $("<div class='narrativeview'></div>");
    
    narrativeselector.change(function(){
        narrativeview.empty();
        narrativeview.load("/views/" + $("#narrativeselector option:selected").val(), NarrativeGeneratorApp.initNarrativeView);
    });
    
    menu.append(narrativeselector);
    
    var dialog = new Modal("Narrative Generator",
    {
        content: [
                menu,
                narrativeview
            ]
    });
    dialog.show();
    
    $("#narrativeselector option[value='narrativegenerator.html']").prop("selected", true);
    narrativeselector.change();
};

NarrativeGeneratorApp.initNarrativeView = function(){

    // Short Rate Generator
    var shortrated = $("#shortrated");
    var notshortrated = $("#notshortrated");
    var njref = $("#njref");
    
    var state = $("#states option:selected").val();
    var miles = parseInt($("#miles").val());
    var shortrate = false;
    
    shortrated.hide();
    notshortrated.hide();
    njref.hide();
    
    $("#states").add("#miles").change(NarrativeGeneratorApp.initNarrativeView);
    
    if (state == "ca") {
        if (miles < 12000) shortrate = true;
    } else if (state == "fl") {
        if (miles < 14000) shortrate = true;
    } else if (state == "nj") {
        njref.show();
    } else {
        if (miles < 8000) shortrate = true;
    }
    
    if(shortrate){
        shortrated.show();
    }
    
    if(!shortrate && $("#miles").val()!=""){
        notshortrated.show();
    }
    
    $("#generateshortrate").click(function(){
        
        var vehicle = $("#shortratedvehicle").val();
        var driver = $("#shortrateddriver").val();
        var reason = $("#shortratereason").val();
        
        var note = `Short rated. Est. annual mileage is ${miles} mi. on ${vehicle}. ${driver} ${reason}.`;
        $("#shortratenote").val(note);
    });
    
    $("#copyshortrate").click(function(){
        func.copyText($("#shortratenote").val());
        Swal.fire(
            {
                icon: "success",
                text: "Copied narrative to clipboard!",
                timer: 1200,
                showConfirmButton: false
            });
    });
   
}

export {NarrativeGeneratorApp}