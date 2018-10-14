const Fs = require('fs');
const Path = require('path');
const Winston = require('winston');
const Discord = require('discord.js');
const Config = require('./config.js')
const request = require('request');
const async = require("async");


/**Two provider
 * https://www.geonames.org/export/ws-overview.html
 * &&
 * https://openweathermap.org/appid
 *
 * @type {string}KK
 */
GEONAME_API_URL = "http://api.geonames.org/";
GEONAME_API_TIMEZONE = "timezoneJSON";
GEONAME_API_WEATHER = "weatherJSON";
GEONAME_API_USERNAME = "hangbot";
GEONAME_API_NCE_LONG = "7.1827776";
GEONAME_API_NCE_LAT = "43.7031691";
GEONAME_API_YQB_LONG = "-71.6218679";
GEONAME_API_YQB_LAT = "46.8560266";
GEONAME_API_NOU_LONG = "-22.2643536";
GEONAME_API_NOU_LAT = "166.4098473";
GEONAME_API_ICAO_NOU_CODE = "NWWW";
GEONAME_API_ICAO_NCE_CODE = "LFMN";
GEONAME_API_ICAO_YQB_CODE = "CYQB";


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
        if(msg.content != null){
            switch (msg.content) {
                case '!heure': heure_command(bot,msg); break;
                case '!bonjour' : bonjour_command(bot,msg); break;
                default: return;
            }
        }

        if (msg.content != null && msg.content === '!heure') {
            heure_command(bot,msg);
        }

    });

    // Connect from the token found in the .token file
    Fs.readFile('.token', {encoding: 'utf-8'}, (err, data) => {
        if (err == null)
            bot.login(data.trimRight());
        else
            Winston.log('error', err.message);
    });
};

startup();

const heure_command = (bot,msg) => {
    var message;
    var nce = "";
    var nou = "";
    var yqb = "";
    var msgNce = "";
    var msgNou = "";
    var msgYqb = "";

    //http://api.geonames.org/timezoneJSON?formatted=true&lat=47.01&lng=10.2&username=demo&style=full
    request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NCE_LAT + "&lng=" + GEONAME_API_NCE_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
        if (error) {
            return Winston.log('error', "error on NCE : " + error);
        }
        nce = JSON.parse(body);
        msgNce += "Nice : heure : " + nce.time;
    });

    request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NOU_LAT + "&lng=" + GEONAME_API_NOU_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
        if (error) {
            return Winston.log('error', "error on NOU : " + error);
        }
        nou = JSON.parse(body);
        msgNou += "Nouméa : heure : " + nou.time;
    });

    request.get(GEONAME_API_URL + GEONAME_API_TIMEZONE + "?formated=true&lat=" + GEONAME_API_NCE_LAT + "&lng=" + GEONAME_API_YQB_LONG + "&username=" + GEONAME_API_USERNAME + "&style=full", (error, response, body) => {
        if (error) {
            return Winston.log('error', "error on YQB : " + error);
        }
        yqb = JSON.parse(body);
        msgYqb += "Quebec : heure : " + yqb.time;
    });

    message = msgNce + "\n" + msgNou + "\n" + msgYqb;
    msg.reply(message);
};

const bonjour_command = (bot,msg) => {
    msg.reply("Bonjour, comment ça va aujourd'hui ?");
}