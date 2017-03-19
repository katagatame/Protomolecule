'use strict'

import * as fs from 'fs';
import * as readline from 'readline';
import * as google from 'googleapis';
import * as googleAuth from 'google-auth-library';

export default class Google
{
    public SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    public TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
    public TOKEN_PATH = this.TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

    public authorize(credentials, callback)
    {
        let clientSecret: string = credentials.installed.client_secret;
        let clientId: string = credentials.installed.client_id;
        let redirectUrl: string = credentials.installed.redirect_uris[0];
        let auth: googleAuth = new googleAuth();
        let oauth2Client: googleAuth.OAuth2 = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        
        fs.readFile(this.TOKEN_PATH, function(err: NodeJS.ErrnoException, token: Buffer)
        {
            if (err)
                new Google().getNewToken(oauth2Client, callback);
            else
            {
                oauth2Client.credentials = JSON.parse(token.toString());
                callback(oauth2Client);
            }
        });
    }

    public getNewToken(oauth2Client, callback)
    {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES
        });

        console.log('Authorize this app by visiting this url: ', authUrl);

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter the code from that page here: ', function(code)
        {
            rl.close();
            oauth2Client.getToken(code, function(err, token)
            {
                if (err)
                    return console.log('Error while trying to retrieve access token', err);
                oauth2Client.credentials = token;
                new Google().storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    public storeToken(token)
    {
        try {
            fs.mkdirSync(this.TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST')
                throw err;
        }
        fs.writeFile(this.TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + this.TOKEN_PATH);
    }
};