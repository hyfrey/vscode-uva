'use strict';

import * as vscode from 'vscode';
import {Language, Verdict} from './model';
import {UVaClient} from './uvaclient';
import {UHuntClient} from './uhuntclient';

var AsciiTable = require('ascii-table');

interface Config {
    username: string,
    password: string, 
    debug: boolean
}

export class Controller implements vscode.Disposable {

    static CmdSubmit: string = 'uva.submit';
    static CmdStatus: string = 'uva.status';

    private context: vscode.ExtensionContext;
    private outputChannel: vscode.OutputChannel;
    
    private config: Config;
    private userid: string;
    
    private uvaclient: UVaClient;
    private uhuntclient: UHuntClient;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.config = null;
        this.userid = null;
        this.updateConfig();
        
        this.outputChannel = vscode.window.createOutputChannel('UVa Status');
        this.uhuntclient = new UHuntClient();
    }
    
    public activate() {
        console.log('Register command');
        this.registerCommand(Controller.CmdSubmit, () => this.onSubmit());
        this.registerCommand(Controller.CmdStatus, () => this.onStatus());
    }
    
    public updateConfig() {
        let config = Controller.getConfig();
        if (this.config == null ||
            config.username != this.config.username ||
            config.password != this.config.password ||
            config.debug != this.config.debug) {
            console.log("Update config");
            this.config = config;
            this.userid = null;
            this.uvaclient = new UVaClient(config.username, config.password, config.debug);
        }
    }
    
    public dispose() {
        
    }
    
    public static parseProblemMeta(filePath: string, code: string): {problemNumber: string, lang: Language} {
        let fileName = filePath.split('\\').pop().split('/').pop();
        let match = /(\d+).*\.(.*)$/.exec(fileName);
        
        if (match == null) {
            return null;
        }

        let problemNumber = match[1];
        let extension = match[2].toLowerCase();
        
        let maps: {[index:string]: Language} = {
            'c': Language.C,
            'c++': Language.CPP11,
            'cpp': Language.CPP11,
            'java': Language.JAVA,
            'py': Language.PYTHON3
        }
        let lang: Language = maps[extension];
        if (lang == undefined) {
            return null;
        }

        return { problemNumber: problemNumber, lang: lang };
    }
    
    public static getConfig(): Config {
        let uvaSetting = vscode.workspace.getConfiguration('uva');
        let username: string = uvaSetting.get<string>('judge.username', '');
        let password: string = uvaSetting.get<string>('judge.password', '');
        let debug: boolean = uvaSetting.get<boolean>('debug', false);
        if (username == '' || password == '') {
            vscode.window.showErrorMessage("Please set username and password in config file.");
            null;
        }
        return {username: username, password: password, debug: debug};
    }
      
    private registerCommand(command: string, callback: (...args: any[]) => any) {
        let disposal = vscode.commands.registerCommand(command, callback);
        this.context.subscriptions.push(disposal);
    }
    
    private onSubmit() {
        this.updateConfig();
        
        let window = vscode.window;
        let document = window.activeTextEditor.document;
        let filePath = document.fileName;
        let code = document.getText();
        
        let meta = Controller.parseProblemMeta(filePath, code);
        if (meta == null) {
            window.showErrorMessage("Can not determine problem id and language from file name!");
            return;
        }
        
        console.log("Submit UVa [" + meta.problemNumber + "] " + Language[meta.lang]);
        this.uvaclient.login().then((ok: boolean) => this.uvaclient.submit(meta.problemNumber, meta.lang, code))
                         .then((ok: boolean) => {
                             window.showInformationMessage("Submit UVa [" + meta.problemNumber + "] Success");
                             console.log("Submit UVa [" + meta.problemNumber + "] Success");
                         }, (error: Error) => {
                             window.showErrorMessage("Submit UVa [" + meta.problemNumber + "] Failed! ");
                             console.error("Submit UVa [ " + meta.problemNumber + "] Fail with error: " + error.message);
                         });
    }
    
    private onStatus() {
        this.updateConfig();
        
        let window = vscode.window;
        let document = window.activeTextEditor.document;
        let filePath = document.fileName;
        let code = document.getText();
        
        let meta = Controller.parseProblemMeta(filePath, code);
        if (meta == null) {
            window.showErrorMessage("Can not determine problem id and language from file name!");
            return;
        }
        
        console.log("Status UVa [" + meta.problemNumber + "] " + Language[meta.lang]);
        let useridPromise = null;
        if (this.userid != null) {
            console.log("Use cached userid " + this.userid + " for " + this.config.username);
            useridPromise = new Promise((resolve, reject) => resolve(this.userid));
        } else {
            console.log("Fetch userid from uHunt for " + this.config.username);
            useridPromise = this.uhuntclient.uname2uid(this.config.username).then(
                (userid) => {
                    this.userid = userid;
                    return userid;
                }
            );
        }
        
        useridPromise.then(
            (uid) => {
                this.uhuntclient.subsByNums([uid], [meta.problemNumber]).then(
                    (subs) => {
                        let usersubs = subs[uid];
                        usersubs.reverse();
                        let table = new AsciiTable("UVa [" + meta.problemNumber + "] Status");
                        table.setHeading("Submission ID", "Language", "Runtime", "Submission Time", "Verdict", "Rank");
                        for (let i = 0; i < usersubs.length; ++i) {
                            let sub = usersubs[i];
                            let submissionTime = new Date(sub.submissionTime*1000);
                            table.addRow(sub.submissionID,
                                         Language[sub.language],
                                         sub.runtime,
                                         submissionTime.toISOString(),
                                         Verdict[sub.verdictID],
                                         sub.rank);
                        }
                        this.outputChannel.append(table.toString());
                        this.outputChannel.appendLine("");
                        this.outputChannel.show();
                    },
                    (error: Error) => {
                        window.showErrorMessage("Status [" + meta.problemNumber + "] Failed! ");
                        console.error("Status UVa [" + meta.problemNumber + "] Failed with error: " + error.message);
                    }
                )
            }
        )
    }
    
}