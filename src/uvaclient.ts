'use strict';

import * as request from 'request';
import {Language} from './model';

var cheerio = require('cheerio');

export class UVaClient {
    static baseURL = 'https://uva.onlinejudge.org/';
    
    private username: string;
    private passwd: string;
    private uva: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
    
    constructor(username: string, passwd: string, debug: boolean) {
        this.username = username;
        this.passwd = passwd;
        this.uva = request.defaults({
            baseUrl: UVaClient.baseURL,
            jar: request.jar(),
            followAllRedirects: true,
            headers: {
                'Accept-Charset': 'utf-8,ISO-8859-1',
                'Accept-Language': 'en-US,en;q=0.8',
                'User-Agent' :  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) "+
                            "AppleWebKit/537.17 (KHTML, like Gecko) "+
                            "Chrome/24.0.1312.57 Safari/537.17",
                "Accept" : "text/html, application/xml, text/xml, */*",
            }            
        });
        request.debug = debug;
    }
    
    public login(): Thenable<boolean> {
        return this._index().then((body) => {return this._fillLogin(body, this.username, this.passwd);}).
                             then((form) => {return this._postLogin(form);})
    }
    
    public submit(problemNumber: string, lang: Language, code: string): Thenable<boolean> {
        return this._postSubmit(problemNumber, lang, code);
    }
    
    private _index(): Thenable<string> {
        return new Promise((resolve, reject) => {
            this.uva.get('/index.php', (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(new Error(response.statusMessage));
                }
            });
        });
    }
    
    private _fillLogin(body: string, username: string, passwd: string): {[index: string]: string} {      
        let $ = cheerio.load(body);
        let formArray = $('#mod_loginform').serializeArray();
        let form: {[index: string]: string} = {};
        for (var i = 0; i < formArray.length; ++i) {
            form[formArray[i].name] = formArray[i].value;
        }
        form['username'] = username;
        form['passwd'] = passwd;
        
        return form;
    }
    
    private _postLogin(data: { [index: string]: string }): Thenable<boolean> {
        let options = {
            followAllRedirects: false,
            qs: {
                'option': 'com_comprofiler',
                'task': 'login'
            },
            form: data,
            headers: {
                'Referer': UVaClient.baseURL + 'index.php'
            }
        };
        
        return new Promise((resolve, reject) => {
            this.uva.post('/index.php', options, (error, response, body) => {
                if (!error && (response.statusCode == 200 || response.statusCode == 301)) {
                    resolve(true);
                } else {
                    reject(new Error(response.statusMessage));
                }
            });
        });
    }
    
    private _postSubmit(problemNumber: string, lang: Language, code: string): Thenable<boolean> {
        let options = {
            url: '/index.php',
            qs: {
                'option': 'com_onlinejudge',
                'Itemid': '25',
                'page': 'save_submission'
            },
            formData: {
                'localid': problemNumber,
                'language': lang,
                'code': code
            }
        };
        return new Promise((resolve, reject) => {
            this.uva.post(options, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    if (body.match(/not\s+authori[zs]ed/i)) {
                        reject(new Error("Cannot login. Password correct?"));
                    } else {
                        resolve(true);
                    }
                } else {
                    reject(new Error(response.statusMessage));
                }
            });
        });
    }
}