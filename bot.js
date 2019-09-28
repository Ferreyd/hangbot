    const Fs = require('fs');
    const Winston = require('winston');
    const Discord = require('discord.js');
    const Tools = require('./tools.js')
    let moment = require("moment-timezone");
    var apixuToken;
    var auth;
    const sobrieteDate = moment();


    NICO_ID = "186800850780291072";
    JEREMY_ID = "448910034835996682";
    GIUSEPPE_ID = "472766245499043841";
    DAMIEN_ID = "386067183282683907";
    MARC_ID = "428164148145291266";
    NADEGE_ID = "473925682951356418";
    IMAN_ID = "476803068290400257";
    WILLIAM_ID = "211555535621718017";
    LAURENT_ID = "232909795491971072";


    const startup = () => {
        Winston.log('info', 'Starting up...');

        const bot = new Discord.Client();
        let isInit = false;

        const init = () => {
            isInit = true;
        };

        bot.on('ready', () => {
            Winston.log('info', 'I\'m connected to the Discord network!');
            Winston.log('info', bot.user.username);
            Winston.log('info',"Tring to get Youtube API Key");
            // Load client secrets from a local file.
            auth = Tools.retrieveToken();
            if(auth == null){
                Winston.log('error',"Youtube API Key has not been generated");
            }
            Winston.log('info',"Youtube API Key has been generated");

            // Properly close connection on Ctrl-C
            process.on('SIGINT', () => {
                Winston.log('info', 'Shutting down...');
                bot.destroy().then(() => process.exit());
            });

            if (!isInit)
                init();
        });


        // Respond to messages
        bot.on('message', msg => {
            // Make sure we de not reply to our own messages
            if (msg.author.id === bot.user.id) return;
            if (msg.content != null) {
                if (msg.content === '!heure') {
                    heure_command(bot, msg);
                } else if (msg.content.includes('!meteo')) {
                    meteo(bot, msg);
                } else if (msg.content.includes('!issue')) {
                    msg.reply('https://github.com/Ferreyd/hangbot/issues');
                } else if (msg.content.includes('!github')) {
                    msg.reply('https://github.com/Ferreyd/hangbot');
                } else if (msg.content.includes('!help')) {
                    msg.reply("\n!heure\n!issue\n!github\n!help\n!bonjour\n!weekend\n!jour\n");
                } else if (msg.content.includes('!jour')) {
                    jour_command(bot, msg);
                } else if (msg.content.includes('!weekend')) {
                    weekend_command(bot, msg);
                } else if (msg.content.includes('!bonjour')) {
                    bonjour_command(bot, msg);
                }  else if(msg.content.includes('!bigflo') && msg.author.id == NICO_ID) {
                    bigfloAndOliCommand(bot,msg);
                } else if(msg.content.includes('!sobriete')) {
                    sobrieteComand(bot,msg);
                } else if(msg.content.includes('!note')){
                    noteCommand(bot,msg);                   
                }else{
                    return;
                }
            }
        });

        // Connect from the token found in the .token file
        Fs.readFile('.token', {encoding: 'utf-8'}, (err, data) => {
            if (err == null){
                bot.login(data.trimRight());
                console.log("read sucessfully discord token");
            }                
            else{
                console.log("Cannot read discord token token");
                Winston.log('error', err.message);
            }                
        });


        // Connect from the token found in the .token file
        Fs.readFile('apixu.token', {encoding: 'utf-8'}, (err, data) => {
            if (err == null){
                apixuToken = data.trimRight();
                console.log("read sucessfully apixu token");
            }                
            else{
                console.log("Cannot read apixu token");
                Winston.log('error', err.message);
            }
                
        });
          
          
    };

    startup();

    const meteo = (bot, msg) => {
        var content = msg.content;
        var baseTown = ["Nice", "Nantes", "Paris", "Quebec","Bruxelles", "La Marsa", "Lyon"];
        if(content === '!meteo'){
            baseTown.forEach(function(town){
                var promise = Tools.callWeather(apixuToken,town);
                promise.then(function(result){
                   const embed = Tools.manageWeatherResponse(result);
                    bot.channels.get(msg.channel.id).send({embed});    
                });
            }),function(err){
                bot.channels.get(msg.channel.id).send("Erreur lors de la requète");
            };
        }else{
            var town = content.replace('!meteo', '');
            var promise = Tools.callWeather(apixuToken,town);
            promise.then(function(result){
                const embed = Tools.manageWeatherResponse(result);
                bot.channels.get(msg.channel.id).send({embed});    
            }), function(err){
                bot.channels.get(msg.channel.id).send("La ville " + town + " n'existe pas.")
            };
        }  
    };
    const heure_command = (bot, msg) => {
        moment.locale('fr');
        let now = moment();

        let nice = now.tz('Europe/Paris').format("LLLL");
        let noumea = now.tz('Pacific/Noumea').format("LLLL");
        let quebec = now.tz('America/Montreal').format("LLLL");

        let message = "\nNice : " + nice + "\nNoumea : " + noumea + "\nQuebec : " + quebec;

        bot.channels.get(msg.channel.id).send(message);

    };
    const bonjour_command = (bot, msg) => {
        msg.reply("Bonjour, comment ça va aujourd'hui ?")
    };
    const jour_command = (bot, msg) => {
        moment.locale('fr');
        if (NICO_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nJ'espère que tu souffres aujourd'hui,  " + msg.author + " !" );
        }
        else if (JEREMY_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nTabernacle " + moment("16:00", "HH:mm").tz('America/Montreal').fromNow() + " ce sera ta fin de journée carisse," +
                " prend ton char et vas t'en " + msg.author + " , et vive Céline");
        }
        else if (GIUSEPPE_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\tEt " + moment("15:30", "HH:mm").tz('Pacific/Noumea').fromNow() + " ce sera l'heure d'aller à la plage et de te faire dorer la raie mon petit " + msg.author);
        }
        else if (IMAN_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("16:00", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée " + msg.author + " , courage !!");
        }
        else if (DAMIEN_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("17:00", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera l'heure de remonter de la mine " + msg.author + " !!");
        }
        else if (MARC_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " tu pourras arreter de rien fouttre au taff pour rien branler chez toi, bravo " + userId)
        }
        else if (WILLIAM_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée " + msg.author + " , courage !!");
        }
        else if (NADEGE_ID === msg.author.id) {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("19:00", "HH:mm").tz('Europe/Paris').fromNow() + " tu pourras dépenser tes tickets resto au bar " + msg.author + " , alcoolique !!");
        }
        else {
            bot.channels.get(msg.channel.id).send("\nEt " + moment("17:30", "HH:mm").tz('Europe/Paris').fromNow() + " ce sera ta fin de journée " + msg.author + " , courage !!")
        }
    };

    const weekend_command = (bot, msg) => {
        msg.reply("\nPas encore implémenté, patience !");
    };

    /**
     * This command send a random video with @louckousse tagged from notorious french artist Big Flo and Oli
     * The idea is to take the playlist and randomly extract one video from it and display it.
     * @param {} bot 
     * @param {*} msg 
     */
    const bigfloAndOliCommand = (bot, msg) => {
        var promise = Tools.callPlaylist(auth); 
        promise.then(function(result) {
            var channels = result.data.items;
            if (channels.length == 0) {
                console.log('No channel found.');
            } else {
                var lck = bot.users.get("186800747856265219");
                bot.channels.get(msg.channel.id).send("Malheuresement ca marche pas ;(, parce que " + bot.users.get(NICO_ID) + " est un gros boloss");
            }}, function(err){
                msg.reply("Malheuresement ca marche pas ;(, parce que " + bot.users.get(NICO_ID) + " est un gros boloss")
                console.log(err);
            });    
    }

    const sobrieteComand = (bot,msg) => {
        moment.locale('fr');
        if(msg.content.includes('reset')){
            bot.channels.get(msg.channel.id).send("Remise à zéro");
            sobrieteDate = moment();
        }   
        let now = moment(); 
        let jours = now.diff(sobrieteDate, 'days');  
        bot.channels.get(msg.channel.id).send("Lucas est sobre depuis : " + jours + " jours");
    }


    const noteCommand = (bot,msg) => {
        var max = 10;
        var min = 0;
        let random = Math.floor(Math.random() * (max - min + 1)) + min;
        let res;
        switch(random){
            case 0:
                res = "0/10 moins fun qu'un CD vierge";
            break;
            case 1:
                res = "1/10 à chier";
            break;
            case 2:
                res = "2/10 merdique";
            break;
            case 3:
                res = "3/10 naze";
            break;
            case 4:
                res = "4/10 bof";
            break;
            case 5:
                res = "5/10 meh";
            break;
            case 6:
                res = "6/10 très bon :dreamburger:";
            break;
            case 7:
                res = "7/10 pas mal !";
            break;
            case 8:
                res = "8/10 génial";
            break;
            case 9:
                res = "9/10 truc de ouf";
            break;
            case 10:
                res = "10/10 magnifique !!!";
            break;   
            default: break;                                 
        }
        bot.channels.get(msg.channel.id).send(res);
    }

