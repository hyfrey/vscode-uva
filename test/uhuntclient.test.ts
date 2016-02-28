
// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {Language, Verdict, Submission} from '../src/model';
import {UHuntClient} from '../src/uhuntclient';

suite("uHunt API", function() {
    let uHunt = new UHuntClient();
    
    test("uname2id should ok", function () {
        this.timeout(50000);
        return uHunt.uname2uid('helloneo').then(
            (id) => {
                assert.equal(299, id);
            }
        );
    });

    test("subsByNums should ok", function () {
        this.timeout(50000);
        return uHunt.subsByNums(['299'], ['11172']).then(
            (subs) => {
                let usersub = subs['299'];
                assert.equal(true, usersub.length > 0);
                assert.equal(5339779, usersub[0].submissionID);
                assert.equal(2113, usersub[0].problemID);
                assert.equal(Verdict.Accepted, usersub[0].verdictID);
                assert.equal(0, usersub[0].runtime);
                assert.equal(1171721987, usersub[0].submissionTime);
                assert.equal(Language.C, usersub[0].language);
                assert.equal(4, usersub[0].rank);
            }
        );
    });
    
})