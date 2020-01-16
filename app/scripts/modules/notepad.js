/*global $*/
// Aline Notepad
// AutoComplete for quicker notetaking

import { API } from "./api.js"

function AlineNotepad(){
    var list = [];
    var fired = false;
    var suggestions = [];
    
    API.readClientJSON("data/autocomplete.json", function(data){
        list = data.list;
    });
    
    var notepad = $("<textarea placeholder='Notes...' data-input='true' class='notepad'></textarea>");
    var suggestionsView = $("<div id='suggestions'>Suggestion</div>");
    
    $(document.body).append(suggestionsView);
    suggestionsView.hide();
    
    notepad.on("keyup paste cut mouseup", 
        function(){
            suggestionsView.hide();
            suggestionsView.empty();
            
            suggestions = [];
            
            var currentWord = getCurrentWord($(this)).toLowerCase();
            
            if(currentWord.length>1){
                list.forEach(
                    suggestion => {
                        if(suggestion.toLowerCase().startsWith(currentWord))
                            if(!suggestions.includes(suggestion))
                                suggestions.push(suggestion);
                    });
            }
            
            suggestions.forEach(
                (suggestion, i) => {
                    if(notepad.hasClass("fs"))suggestionsView.show();
                    var suggestionView = $(`<div class='suggestion'>${suggestion}</div>`);
                    if(i==0){
                        var tab = $('<span>Tab<i class="far fa-keyboard"></i></span>');
                        tab.css({
                            opacity: "0.4",
                            float: "right"
                        });
                        suggestionView.append(tab);
                    }
                    suggestionView.on("click", 
                        function(){
                            replaceCurrentWord(notepad, suggestion);
                            notepad.focus();
                            suggestionsView.hide();
                        });
                    suggestionsView.append(suggestionView);
                });
                
            fired=false;
            suggestionsView.css($(this).textareaHelper("caretPos"));
        });
        
    notepad.keydown(function(e) {
        var code = e.keyCode || e.which;
    
        if (code === 9 && !fired && suggestions.length>0) {  
            e.preventDefault();
            replaceCurrentWord(notepad, suggestions[0]);
            suggestionsView.hide();
            fired=true;
        }
    });
    
    return notepad;
}

function getCurrentWord(textarea){
    var stopCharacters = [' ', '\n', '\r', '\t'];
    var text = textarea.val();
    var start = textarea[0].selectionStart;
    var end = textarea[0].selectionEnd;
    while (start >= 0) {
        if (stopCharacters.indexOf(text[start]) == -1) {
            --start;
        } else {
            break;
        }                        
    };
    ++start;
    while (end <= text.length) {
        if (stopCharacters.indexOf(text.split("")[end]) == -1) {
            ++end;
        } else {
            break;
        }
    }
    var currentWord = text.substr(start, end-start);
    return currentWord;
}

function replaceCurrentWord(textarea, replacement){
    var stopCharacters = [' ', '\n', '\r', '\t'];
    var text = textarea.val();
    var start = textarea[0].selectionStart;
    var end = textarea[0].selectionEnd;
    while (start >= 0) {
        if (stopCharacters.indexOf(text[start]) == -1) {
            --start;
        } else {
            break;
        }                        
    };
    ++start;
    while (end <= text.length) {
        if (stopCharacters.indexOf(text[end]) == -1) {
            ++end;
        } else {
            break;
        }
    }
    var replaceText = text.substr(0, start) + replacement + text.substr(end, text.length);
    textarea.val(replaceText);
}

export { AlineNotepad };