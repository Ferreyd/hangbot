module.exports.attention = '!'
var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

function retrieveToken(){
// Load client secrets from a local file.
var content = fs.readFileSync('client_secret.json');
return authorize(JSON.parse(content));
  fs.readFileSync('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    
    });
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
  console.log("content sucess = " + content);

  return content;
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
  var content;
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      content = oauth2Client;
    });
  });
  return content;
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}


/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
    var service = google.youtube('v3');
    service.channels.list({
      auth: auth,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      var channels = response.data.items;
      if (channels.length == 0) {
        console.log('No channel found.');
      } else {
        console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                    'it has %s views.',
                    channels[0].id,
                    channels[0].snippet.title,
                    channels[0].statistics.viewCount);
      }
    });
  }

  /**
   * Get all id from a playlist
   */
   function callPlaylist(auth){
     return new Promise(function(resolve,reject) {
      var service = google.youtube('v3');
      // Load client secrets from a local file.  
      service.playlistItems.list({
           auth: auth,
          "part": "contentDetails",
          "playlistId": "OLAK5uy_ma6SYbjlev3hUqWOlWWHbsq3YIzuAuYk8"
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return reject(err);
        }else{
          return resolve(response);
        }      
      });
     })
  }

function managePlayListResponse(response){
  var idArr = [];
    console.log(response);
    //Store all Ids in the list except id with l-, it's an id for embed video, we do not want it
    response.forEach(element => {
        var contentDetails = element.contentDetails;
        if(!contentDetails.videoId.includes('l-')){
          idArr.push(contentDetails.videoId);
        }
    });
    var random = Math.floor(Math.random() * Math.floor(idArr.length));
    return "https://www.youtube.com/watch?v=" + idArr[random];
}
  module.exports.managePlayListResponse = managePlayListResponse;
  module.exports.callPlaylist = callPlaylist;
  module.exports.retrieveToken = retrieveToken;
 