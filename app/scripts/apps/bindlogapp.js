/* global $, Swal, luxon */

// Bind Log App
import { Modal } from "../modules/modal.js"
import { BindLog, Bind } from "../modules/bindlog.js"
const DateTime = luxon.DateTime;

const dateFormat = {month: "2-digit", day: "2-digit", year: "numeric"};

var BindLogApp = {};

BindLogApp.constructBindLogTable = (filter) => {
    
    if(filter===undefined)filter = function(){return true};
    
    var logview = $(".logview");
    if($(".logview").length)
        logview.empty();
    else{
        logview = $("<div></div>");
        logview.addClass("logview");
    }
    
    var table = $("<table></table>");
    table.addClass("bindlog");
    
    var headerRow = $("<tr class='tableheader'></tr>");
    headerRow.append($("<td>Date</td>"));
    headerRow.append($("<td>Name</td>"));
    headerRow.append($("<td>Control #</td>"));
    headerRow.append($("<td>Premium</td>"));
    headerRow.append($("<td>Items</td>"));
    headerRow.append($("<td>Policy #</td>"));
    headerRow.append($("<td>Reference #</td>"));
    headerRow.css({
        "font-weight": "bold"
    });
    
    table.append(headerRow);
    logview.css({
        "width": "100%",
        "overflow": "auto"
    });
    
    var bindlog = BindLog.get();
    
    bindlog.forEach(
        bind => {
            
            if(filter(bind))addBindRow(table, bind);
            
        });
    
    logview.append(table);
    return logview;
}

BindLogApp.open = () => {
    var saveBtn = $("<div class='btn'>Save</div>");
    var addBtn = $("<div class='btn'>Add</div>");
    var dlBtn = $("<div class='btn'>Download</div>");
    var logview = BindLogApp.constructBindLogTable();
    //var table = logview.children(".bindlog").first();
    var menu = $("<div class='bindmenu'></div>");
    var itemsView = $("<span id='itemsview'></span>");
    var bundlesView = $("<span id='bundlesview'></span>");
    var options = ["All", "MTD", "Today", "Last 7 Days", "Last Month"];
    var filterSelect = $("<select></select>");
    options.forEach(function(option){
        filterSelect.append($(`<option value="${option}">${option}</option>`));
    });
    
    itemsView.html("<strong>Items: </strong>"+BindLog.items());
    bundlesView.html("<strong>Bundles: </strong>"+BindLog.bundles());
    
    itemsView.add(bundlesView).css({
        "padding": 10,
        "font-size": "1.2em"
    });
    
    filterSelect.on("change", function(){
        var selected = $(this).val();
        var filter;
        var currentDate = DateTime.local();
        switch(selected){
            case "MTD":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate.month == currentDate.month;
                }
                break;
            case "Last Month":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate.month == currentDate.minus({months: 1}).month;
                }
                break;
            case "Last 7 Days":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate>=currentDate.minus({days: 7})&&bindDate<=currentDate;
                }
                break;
            case "Today":
                filter = function(bind){
                    var currentDateString = currentDate.toLocaleString(dateFormat);
                    return bind.date == currentDateString;
                }
                break;
            case "All":
                filter = function(bind){return true;}
                break;
        }
        
        logview = BindLogApp.constructBindLogTable(filter);
        
        var currentBindLog;
        if(selected != "All"){
            currentBindLog = getBindLogFrom(logview.children(".bindlog").first());
        }else{
            currentBindLog = BindLog.get();
        }
        var currentItems = BindLog.items(currentBindLog);
        var currentBundles = BindLog.bundles(currentBindLog);
        
        itemsView.html("<strong>Items: </strong>"+currentItems);
        bundlesView.html("<strong>Bundles: </strong>"+currentBundles);
    });
    
    // Set default value
    filterSelect.val("MTD");
    filterSelect.change();
    
    menu.append($("<strong>Filter: </strong>"), filterSelect, itemsView, bundlesView);
    menu.css({
        padding: 5
    });
    
    addBtn.click(function(i){
        var bind = new Bind("", "", "", 1, "", "");
        if(filterSelect.val()!="All"){
            filterSelect.val("All");
            filterSelect.trigger("change");
        }
        addBindRow(logview.children(".bindlog").first(), bind);
    });
    
    saveBtn.click(function(i){
        Swal.fire({
            title: "Are you sure?",
            text: "This will overwrite your current bind log.",
            icon: "question",
            showCancelButton: true
        }).then((willDelete) => {
            if(willDelete.value){
                if(filterSelect.val()!="All"){
                    filterSelect.val("All");
                    filterSelect.trigger("change");
                }
                var bl = getBindLogFrom(logview.children(".bindlog").first());
                BindLog.overwrite(bl);
                Swal.fire({
                    text: "Saved bind log!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1200
                });
                
                updateStatsView(bl, itemsView, bundlesView);
            }
        });
    });
    
    dlBtn.click(function(){
        var bl = getBindLogFrom($(".bindlog"));
        downloadBindlog(bl);
    });
    
    var dialog = new Modal("Bind Log", {
        content: [
            menu,
            logview,
            saveBtn, addBtn, //dlBtn
            ],
        style: {
            "max-width": 600
        }
    });
    dialog.show();
}

// Bind Log Functions
function updateStatsView(currentBindLog, itemsView, bundlesView){
    var currentItems = BindLog.items(currentBindLog);
    var currentBundles = BindLog.bundles(currentBindLog);
    
    itemsView.html("<strong>Items: </strong>"+currentItems);
    bundlesView.html("<strong>Bundles: </strong>"+currentBundles);
}

function addBindRow(table, bind){
    var bindrow = $("<tr class='bindrow'></tr>");
    bindrow.css({margin: 0, padding: 0});
    
    for(const key in bind){
        var td = $("<td contenteditable></td>");
        td.attr("data-bindprop", key);
        td.text(bind[key]);
        switch(key){
            case "date":
                td.datepicker();
                break;
                
            case "premium":
                if(td.text().split("")[0]!="$" && td.text().length>0)td.text("$"+td.text());
                td.
                break;
        }
        if(typeof bind[key]!="function")bindrow.append(td);
    }
    
    var closetd = $("<td class='tablex'>&times;</td>");
    closetd.click(
        function(i){
            Swal.fire({
                title: "Are you sure?",
                text: "You will delete this bind. This action cannot be undone.",
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: '#d33'
            }).then((willDelete) => {
                if(willDelete.value){
                    BindLog.remove(bind);
                    bindrow.remove();
                    updateStatsView(BindLog.get(),$("#itemsview"),$("#bundlesview"));
                }
            });
        });
    
    bindrow.append(closetd);
    
    table.append(bindrow);
}

function getBindLogFrom(table){
    // Create bind log from table
    var bindlog = [];
    var bindrows = table.find(".bindrow");
    
    bindrows.each(
        function(i){
            var bindrow = $(this);
            var bindDat = bindrow.find("td[data-bindprop]");
            var bind = {};
            bindDat.each(
                function(i){
                    var key = $(this).data("bindprop");
                    bind[key]=$(this).text();
                });
            bindlog.push(bind);
        });
    
    return bindlog;
}

function downloadBindlog(bindlog){
    
}

export { BindLogApp }