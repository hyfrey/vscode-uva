'use strict';


import * as vscode from 'vscode';
import {Controller} from './controller';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, "vscode-uva" is now active!');
    
    let controller = new Controller(context);
    context.subscriptions.push(controller);
    controller.activate();
}

// this method is called when your extension is deactivated
export function deactivate() {
}