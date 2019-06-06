var fs = require('fs');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const Winston = require('winston');
const request = require('request');
let moment = require("moment");
const apixuClient = require("apixu");
const Discord = require('discord.js');


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

/**Two provider
 * https://www.geonames.org/export/ws-overview.html
 * &&
 * https://openweathermap.org/appid
 *
 * @type {string}KK
 */
GEONAME_API_URL = "http://api.geonames.org/";
GEONAME_API_TIMEZONE = "timezoneJSON";
GEONAME_API_WEATHER = "weatherIcaoJSON";
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


function retrieveToken() {
    // Load client secrets from a local file.
    var content = fs.readFileSync('client_secret.json');
    return authorize(JSON.parse(content));
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    var token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);
    var content = oauth2Client;

    return content;
}

/**
 * Get all id from a playlist
 */
function callPlaylist(auth) {
    var playLists = [
        "OLAK5uy_ma6SYbjlev3hUqWOlWWHbsq3YIzuAuYk8",
        "OLAK5uy_nRvWYf9bJ3SkRBfnf_EaDPOR2go7rALt4",
        "OLAK5uy_mRqyZ2BpVP0DYOQhoJ5bOVJf_YkCOnt7A",
        "OLAK5uy_kyKRw_LFIHoFv6R1i0FUj-AE4Y2pBLTBM",
        "OLAK5uy_mm1W8DyG7S0oyIDoyT7kXWm5PMR7HazdA",
        "OLAK5uy_mPW7bT74pBeyhKJrcBfr4H8AQh0M-xk_o",
        "PL3Z4-KSyTRJudYnJG9uq18tVo2IdbH9Ey"
    ]
    var randomPlayList = getRandomInt(playLists.length);
    var playList = playLists[randomPlayList];
    return new Promise(function (resolve, reject) {
        var service = google.youtube('v3');
        // Load client secrets from a local file.
        service.playlistItems.list({
            auth: auth,
            "part": "contentDetails",
            "playlistId": playList,
            "limit": 20
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return reject(err);
            } else {
                return resolve(response);
            }
        });
    })
}

function callWeather(token, town) {
    var config = apixuClient.config;
    config.apikey = token;
    var apixu = new apixuClient.Apixu(config);
    return new Promise(function (resolve, reject) {
        apixu.current(town).then((current) => {
            resolve(current);
        }, (err) => {
            reject(err);
        });
    });
}

function manageWeatherResponse(weatherResponse) {
    let embed = new Discord.RichEmbed();
    let location = weatherResponse.location;
    let current = weatherResponse.current;
    let temperature = "La température est de **" + current.temp_c + " °C** pour un ressenti de : **" + current.feelslike_c + "**";
    let vent = "La vitesse du vent est de **" + current.wind_kph + " km/h " + " direction **" + windDirection(current.wind_degree) + "**";
    let nuages = "L'indice d'UV est de **" + current.uv + "** ";
    let pluie = "";
    if (current.cloud !== 0) {
        nuages = "La couverture nuageuse est de " + current.cloud + " %";
    }

    embed.setTitle("Météo pour " + location.name);

    embed.addField("Températures", temperature);
    embed.addField("Vent", vent);
    embed.addField("Conditions", condition);
    embed.addField("Couverture nuageuse", nuages);

    if (current.precip_mm !== 0) {
        pluie = "Il a plu **" + current.precip_mm + " mm** pour l'instant";
        embed.addField("Précipitations", pluie);
    }
    embed.addField("Mise à jour", current.last_updated);

    return embed;
}

function windDirection(wind) {
    if (wind < 45) return "Nord";
    else if (wind >= 45 && wind < 90) return "Nord-Est";
    else if (wind <= 90 && wind < 135) return "Est";
    else if (wind <= 135 && wind < 180) return "Sud-Est";
    else if (wind <= 180 && wind < 235) return "Sud";
    else if (wind <= 235 && wind < 270) return "Sud-Ouest";
    else if (wind <= 270 && wind < 315) return "Ouest";
    else if (wind <= 315 && wind < 360) return "Nord-Ouest";
    else return "non précisée";
}

function managePlayListResponse(response, lck) {
    var sentences = [
        "big up à notre plus grand fan " + lck + " , elle est pour toi celle-là !",
        "dis donc " + lck + " , ce serait pas ta préférée ?",
        "Car tu nous kiff " + lck + " voilà notre meilleur son pour toi <3",
        "Tu es un vrai frère " + lck,
        "Tu viens de la téci comme nous " + lck + " laisse toi bercer par le flow",
        "ZIIIIIIIIZE sur toi " + lck + " <3",
        "D'Oslo " + lck];
    var idArr = [];
    //Store all Ids in the list except id with l-, it's an id for embed video, we do not want it
    response.forEach(element => {
        var contentDetails = element.contentDetails;
        if (!contentDetails.videoId.includes('l-')) {
            idArr.push(contentDetails.videoId);
        }
    });
    var randomId = getRandomInt(idArr.length);
    var randomSentence = getRandomInt(sentences.length);
    return sentences[randomSentence] + "  https://www.youtube.com/watch?v=" + idArr[randomId];
}

function getRandomInt(maxInt) {
    return Math.floor(Math.random() * Math.floor(maxInt));
}

module.exports.managePlayListResponse = managePlayListResponse;
module.exports.callPlaylist = callPlaylist;
module.exports.retrieveToken = retrieveToken;
module.exports.attention = '!';
module.exports.callWeather = callWeather;
module.exports.manageWeatherResponse = manageWeatherResponse;
 