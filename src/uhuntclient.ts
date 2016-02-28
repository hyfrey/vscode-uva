'use strict';

import * as request from 'request';
import {Language, Submission} from './model';

export class UHuntClient {
    static baseURL = 'http://uhunt.felix-halim.net/api/';
    
    private uHunt: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
    
    public constructor() {
        this.uHunt = request.defaults({
            baseUrl: UHuntClient.baseURL,
        });
    }
    
    public uname2uid(uname: string): Thenable<string> {
        let path = '/uname2uid/' + uname;
        return new Promise((resolve, reject) => {
            this.uHunt.get(path, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    let errorMessage = 'uname2uid fail with error ' + response.statusMessage
                    reject(new Error(errorMessage));
                    console.log(errorMessage)
                }
            });
        });
    }
    
    public subsByNums(user: string[], nums: string[], minID?: string): Thenable<{ [uid: string]: Submission[] }> {
        let path = '/subs-nums/' + user.join(',') + '/' + nums.join(',');
        return new Promise((resolve, reject) => {
            this.uHunt.get(path, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    let res = JSON.parse(body);
                    let ret: { [uid: string]: Submission[] } = {};
                    for (var uid in res) {
                        let subs = res[uid].subs;
                        let s: Submission[] = [];
                        for (var i = 0; i < subs.length; ++i) {
                            s.push({
                                submissionID: subs[i][0],
                                problemID: subs[i][1],
                                verdictID: subs[i][2],
                                runtime: subs[i][3],
                                submissionTime: subs[i][4],
                                language: subs[i][5],
                                rank: subs[i][6]
                            });
                        }
                        ret[uid] = s;
                    }
                    resolve(ret);
                } else {
                    let errorMessage = "subsByNums fail with error " + response.statusMessage;
                    reject(new Error(errorMessage));
                }
            });
        });
    }
}