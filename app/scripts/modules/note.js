/* global $ */

// Note Module
// Handles notations based on notes.json data

function Note(quoteType) {

    this.type = quoteType;
    this.values = {};

    this.gatherInfo = () => {

        var values = {};

        values.type = this.type;

        $(`.note[data-type="${quoteType}"] [data-input="true"]`)
        .each(function(i){
            if($(this).attr("type")!="checkbox"){
                if($(this).val()!=="")values[$(this).data("id")]=$(this).val();
            }else values[$(this).data("id")]=$(this).prop("checked");
        });

        values.label = $(`.note[data-type="${quoteType}"]`).data("label");

        this.values=values;

        return this;
    }
}

Note.Customer = function(notes){
    this.notes = notes||[];
    this.values = {};
    this.gatherInfo = () => {

        var values = {};

        if(this.notes.length>0)values.quoteType=this.notes[0].type;

        $('.customerinfo [data-input="true"]')
        .each(function(i){
            if($(this).attr("type")!="checkbox"){
                if($(this).val()!=="")values[$(this).data("id")]=$(this).val();
            }else values[$(this).data("id")]=$(this).prop("checked");
        });

        if($("textarea.notepad").val()!=="")values.notePad = $("textarea.notepad").val();

        this.values=values;

        return this;
    }
}

Note.getActiveNotes = () => {

    var activeNotes = [];

    $('.note input[data-id="controlnumber"]').each(
        function(i){
            if($(this).val()!==""){
                var activeNote = $(".note").has($(this)).data("type");
                activeNotes.push(activeNote);
            }
        }
    );

    return activeNotes;
}

Note.generate = (customerObj) => {

    var customer = customerObj.values;
    var notes = customerObj.notes;

    var note = "";

    const addNote = (label, value) => {
        if (value) note+=`${label}: ${value}\n`;
    }

    // Top of note

    // Freeform notes
    if(customer.notePad) note+=`${customer.notePad}\n\n`;

    // Agent number
    if(customer.agent) addNote("Agent #: ", customer.agent+"\n");

    // Customer Note
    note+=`${(customer.name?customer.name:"Customer")} called in for a quote on ${customer.quoteType}.\n`;

    if(customer.permissiontocallback)note+=`Received permission to call customer back at ${customer.phone}`;

    if(customer.facta == "Accepted") note+="\nFACTA was read. Customer accepted."
    else if(customer.facta == "Declined") note+="\nFACTA was read. Customer declined."
    else note+="\nDid not read FACTA."

    if(customer.address&&customer.city&&customer.state&&customer.zipcode){
        note+=
`

Address
${customer.address}
${customer.city}, ${customer.state} ${customer.zipcode}`
    }

    note+="\n\n";

    notes.forEach(noteObj => {

        var data = noteObj.gatherInfo().values;

        note+=data.label+"\n\n";

        addNote("Control Number", data.controlnumber);
        addNote("Policy Number", data.policynumber);
        addNote("Effective Date", data.effectivedate);
        addNote("Closing Date", data.closingdate);
        addNote("Declared Prior", data.declaredprior);
        addNote("No need reason", data.noneed);

        if (data.pqbmodified == "Yes") note += "PQB incidents were modified and/or deleted."
        else if (data.pqbmodified == "No") note += "PQB incidents were not modified and/or deleted.\n"

        addNote("Number of vehicles", data.vehicles);

        note += "\nCoverage\n";

        addNote("Bodily Injury", data.bilimits);
        addNote("Property Damage", data.pdlimits);
        addNote("Watercraft Liability", data.watercraftliability);
        if (data.limitsmodified == "yes")
            note += "Underlying limits were modified.\n";
        else if (data.limitsmodified == "No")
            note += "Underlying limits were not modified.\n";
        addNote("Auto Bodily Injury", data.autobilimits);
        addNote("Auto Property Damage", data.autopdlimits);
        addNote("New Auto Premium", data.newautopremium);
        addNote("Property Liability", data.propertyliability);
        addNote("New Property Premium", data.newpropertypremium);
        addNote("Collision", data.collision);
        addNote("Comprehensive", data.comprehensive);
        addNote("CARCO", data.carco);
        addNote("Dwelling Coverage", data.dwelling);
        addNote("Personal Property", data.personalproperty);
        addNote("Deductible", data.deductible)
        addNote("Customer rejected these coverages", data.rejected);

        note += "\nPayment\n";

        addNote("Quoted Premium", data.quoteprice);
        addNote("Declined bind because", data.declinedbind);
        addNote("Down Payment", data.downpayment);
        addNote("Down Payment Method", data.paymethod);
        addNote("Down Payment Reference #", data.refnumber);

        note += "\nDocuments\n";

        addNote("Customer sent in", data.docsreceived);

        if (data.informedoftdocs == "Yes") note += "Discussed " + data.type + " required T-Docs with the customer.\n"
        else if (data.informedoftdocs == "No") note += "Did not discuss " + data.type + " required T-Docs with the customer.\n"

        if (data.esign == "Opt-In") note += "Customer opted-in for E-Sign."
        else if (data.esign == "Opt-Out") note += "Customer opted-out for E-Sign."
        else note += "Did not discuss E-Sign with the customer."

        note += "\n\n";

    });

    note = note.trim();

    return note;
}

export {Note}