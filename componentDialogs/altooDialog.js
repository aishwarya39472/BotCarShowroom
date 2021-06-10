const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');

const AltooCard = require('../resources/adaptiveCards/altooCard')

const CARDS = [

    AltooCard
];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';
var bookoption = '';

class AltooDialog extends ComponentDialog {

    constructor(conservsationState, userState) {
        super('altooDialog');



        this.addDialog(new TextPrompt(TEXT_PROMPT,this.nameValidator));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.numberValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.getAltooBrand.bind(this),
            this.getName.bind(this),

            this.getNumber.bind(this),
           // this.confirmStep.bind(this),// Ask confirmation if user wants to make reservation?
           // this.secondStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
            this.summaryStep.bind(this)

        ]));




        this.initialDialogId = WATERFALL_DIALOG;


    }

    async run(turnContext, accessor) {


        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async firstStep(step) {
        endDialog = false;
        await step.context.sendActivity({
            //text:'breeza car:',
            attachments: [CardFactory.adaptiveCard(CARDS[0])]
        });
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CONFIRM_PROMPT, 'Would you like to go with this car?', ['yes', 'no']);

    }
    async getAltooBrand(step) {

        console.log(step.result)
        console.log(step)
        if (step.result === true) {
            return await step.prompt(CHOICE_PROMPT, 'what would you like to do ?', ['Booking', 'Cancel Booking', 'Car details']);
        }

        if (step.result === false) {
            await step.context.sendActivity("You chose not to go ahead with this car.");
            endDialog = true;
            return await step.endDialog();
        }

    }
    async getName(step) {

        if (step.result.value === 'Booking') {
            bookoption = 'Booking';

            return await step.prompt(TEXT_PROMPT, 'please enter your name');
        }
        else if (step.result.value === 'Cancel Booking') {
            bookoption = 'Cancel Booking';
            return await step.prompt(NUMBER_PROMPT, 'Please Enter Your BookingId:');

        }
        else if (step.result.value === 'Car details') {
            bookoption = 'Car details';
            //await step.context.sendActivity("Please use link");
            await step.context.sendActivity("You can view car details by using this following link https://www.zigwheels.com/newcars/Maruti-Suzuki/Alto-800");
            endDialog = true;
            return await step.endDialog();
        }

    }

    async getNumber(step) {


        if (bookoption === 'Booking') {
            return await step.prompt(NUMBER_PROMPT, 'please enter your mobile number  ');

        }
        else if (bookoption == 'Cancel Booking') {
            return await step.continueDialog()
        }

        //await step.next()
        //await step.context.sendActivity("You chose not to go ahead with reservation.");
    }


 

    async summaryStep(step) {


        {
            if (bookoption === 'Booking') {
                await step.context.sendActivity("Booking made successfully.your bookingID :8660748665")
            }
            else if (bookoption === 'Cancel Booking') {
                await step.context.sendActivity("Booking cancelled successfully.Thank you and please visit again")
            }

            // Business 

            // await step.context.sendActivity("Booking made successfully.your bookingID=879009921")
            endDialog = true;
            console.log(step)
            return await step.endDialog();

        }


    }


   
    async numberValidator(promptContext) {
        
        console.log("dddddddddddddddddddddddddddddddddddddddddddd")
        console.log(promptContext)
        //console.log(promptContext.recognized.value)
        //promptContext.recognized.value = ;
        //var n = /^\d{10}$/;
       // var n = ^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$';
        //var b =promptContext.recognized.value;
       
        var n =/^[0-9]{10}$/;
        if(n.test(promptContext.recognized.value))
        {
            return await promptContext.recognized.succeeded
        }
        else{
            return false;
        }
    }
   

    async nameValidator(promptContext) {

        console.log("dddddddddddddddddddddddddddddddddddddddddddd")
        console.log(promptContext)
        //console.log(promptContext.recognized.value)
        //promptContext.recognized.value = ;
        //var n = /^\d{10}$/;
       // var n = ^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$';
        //var b =promptContext.recognized.value;
        
        var n =/^[a-zA-Z]+$/;
        if(n.test(promptContext.recognized.value))
        {
            return await promptContext.recognized.succeeded
        }
        else {
            return false;
        }
        
    
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.AltooDialog = AltooDialog;








