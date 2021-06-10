// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { BreezaDialog } = require('./componentDialogs/breezaDialog');
const { WagnorDialog } = require('./componentDialogs/wagnorDialog')
const { CiazDialog } = require('./componentDialogs/ciazDialog')
const { AltooDialog } = require('./componentDialogs/altooDialog')

//const { CiazDialog } = require('./componentDialogs/breezaDialog')
//const { AltooDialog } = require('./componentDialogs/breezaDialog')
const {LuisRecognizer,QnAMaker}  = require('botbuilder-ai');
const {CardFactory} = require('botbuilder');
const WelcomeCard = require('./resources/adaptiveCards/welcomeCard')

const CARDS = [

    WelcomeCard


];
class RRBOT extends ActivityHandler {
    constructor(conversationState,userState) {
        super();

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.breezaDialog = new BreezaDialog(this.conversationState,this.userState);
        this.wagnorDialog = new WagnorDialog(this.conversationState,this.userState);
        this.ciazDialog = new CiazDialog(this.conversationState,this.userState);
        this.altooDialog = new AltooDialog(this.conversationState,this.userState);
        
        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty('conservationData');
        //this.testproperty=this.conversationState.createProperty('testproperty')
        

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisAPIHostName }.api.cognitive.microsoft.com`
        }, {
            includeAllIntents: true
        }, true);

       
        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId,
            endpointKey: process.env.QnAEndpointKey,
            host: process.env.QnAEndpointHostName
        }); 
    
   
        
        
        this.qnaMaker = qnaMaker;


        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

        const luisResult = await dispatchRecognizer.recognize(context)
        console.log("iamcoming")
        console.log(luisResult)
        const intent = LuisRecognizer.topIntent(luisResult); 
       
        
        const entities = luisResult.entities;

        await this.dispatchToIntentAsync(context,intent,entities);
        
        await next();

        });

    this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            console.log("onDialiog")
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });   
    this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context)
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }


    

    async sendWelcomeMessage(turnContext) {
        
        const { activity } = turnContext;
     

        // Iterate over all new members added to the conversation.
        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                
                const welcomeMessage = `Welcome to Maruthi Car show room Bot ${ activity.membersAdded[idx].name }. `;
               
                await turnContext.sendActivity(welcomeMessage);
                await  turnContext.sendActivity({
                    //text:'altoo car:',
                    attachments: [CardFactory.adaptiveCard(CARDS[0])]
                 });
                
                await this.sendSuggestedActions(turnContext);
            }
        }
    }

    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['Breeza','Wagnor','Ciaz','Altoo','carshowroomAddress'],' Please choose a Car you are intersted in?  or If you like  to visit us Select Car showroom address.');
        await turnContext.sendActivity(reply);
    }


    async dispatchToIntentAsync(context,intent,entities){

        var currentIntent = '';
        console.log("hello")
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{}); 
        //const testproperty=await this.testproperty.get(context,{});  

        if(previousIntent.intentName && conversationData.endDialog === false )
        {
           currentIntent = previousIntent.intentName;

        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
             currentIntent = intent;

        }
        else if(intent == "None" && !previousIntent.intentName)
        {

            var result = await this.qnaMaker.getAnswers(context)
            console.log("result")
            console.log(result)
            await context.sendActivity(`${ result[0].answer}`);
            await this.sendSuggestedActions(context);
        }
        
        else
        {
            currentIntent = intent;
            await this.previousIntent.set(context,{intentName: intent});
           // await this.testproperty.set(context,{})

        }
        console.log(currentIntent)
    switch(currentIntent)
    {
        case 'Breeza':
            console.log("Inside breeza Case");
            await this.conversationData.set(context,{ endDialog: false });
            await this.breezaDialog.run(context, this.dialogState,this);
            conversationData.endDialog = await this.breezaDialog.isDialogComplete();
            if(conversationData.endDialog)
            {
            
                await this.sendSuggestedActions(context);
                await this.previousIntent.set(context,{intentName: null});
                
    
            } 
            break;
    
            case 'Wagnor':
            console.log("Inside Wagnor  Case");
            await this.conversationData.set(context,{endDialog: false});
            await this.wagnorDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.wagnorDialog.isDialogComplete();
            if(conversationData.endDialog)
            {
            
                await this.sendSuggestedActions(context);
                await this.previousIntent.set(context,{intentName: null});
                
    
            } 
            break;
            case 'Ciaz':
                console.log("Inside Ciaz Case");
                await this.conversationData.set(context,{endDialog: false});
                await this.ciazDialog.run(context, this.dialogState);
                conversationData.endDialog = await this.ciazDialog.isDialogComplete();
                if(conversationData.endDialog)
                {
                
                    await this.sendSuggestedActions(context);
                    await this.previousIntent.set(context,{intentName: null});
                    
        
                } 
                break;
        
                case 'Altoo':
                    console.log("Inside Altoo Case");
                    await this.conversationData.set(context,{endDialog: false});
                    await this.altooDialog.run(context, this.dialogState);
                    conversationData.endDialog = await this.altooDialog.isDialogComplete();
                    if(conversationData.endDialog)
                    {
                    
                        await this.sendSuggestedActions(context);
                        await this.previousIntent.set(context,{intentName: null});
                        
            
                    } 
                    break;
        default:
            console.log("Did not match  case");
            break;
        }
    


    }


}



module.exports.RRBOT = RRBOT;
