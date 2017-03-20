'use strict'

import * as fs from 'fs';
import * as readline from 'readline';
import * as googleAuth from 'google-auth-library';

export default class Google
{
    public SCOPES: Array<string> = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    public TOKEN_DIR: string = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
    public TOKEN_PATH: string = this.TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

    public authorize(credentials: any, callback: any): void
    {
        // variable declaration
        let clientSecret: string = credentials.installed.client_secret;
        let clientId: string = credentials.installed.client_id;
        let redirectUrl: string = credentials.installed.redirect_uris[0];
        let auth: googleAuth = new googleAuth();
        let oauth2Client: googleAuth.OAuth2 = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        
        // read in the token file
        fs.readFile(this.TOKEN_PATH, function(err: NodeJS.ErrnoException, token: Buffer)
        {
            // error checking
            if (err)
                // grab new token
                new Google().getNewToken(oauth2Client, callback);
            
            // token exists
            else
            {
                // set cerdentials
                oauth2Client.credentials = JSON.parse(token.toString());
                callback(oauth2Client);
            }
        });
    }

    public getNewToken(oauth2Client: googleAuth.OAuth2, callback: any): void
    {
        // variable declaration
        var authUrl: string = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES
        });
        var rl: readline.ReadLine = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // authorize this app
        console.log('Authorize this app by visiting this url: ', authUrl);        

        // grab the autorization code from user
        rl.question('Enter the code from that page here: ', (code: string) => {
            rl.close();
            oauth2Client.getToken(code, (err: any, token: Buffer) => {
                // error checking
                if (err)
                    return console.log('Error while trying to retrieve access token', err);

                // set and store the token
                oauth2Client.credentials = token;
                new Google().storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    public storeToken(token: Buffer): void
    {
        // makes sure directory exists
        try {
            fs.mkdirSync(this.TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST')
                throw err;
        }

        // store token
        fs.writeFile(this.TOKEN_PATH, JSON.stringify(token));

        // alert user
        console.log('Token stored to ' + this.TOKEN_PATH);
    }
};
