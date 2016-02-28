// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {Language} from '../src/model';
import {Controller} from '../src/controller';

// Defines a Mocha test suite to group tests of similar kind together
suite("Parse Problem Meta Tests", function () {

    let oks = [{
        arg: { filePath: '/abc/def/.111.cpp', content: '' },
        expected: { problemNumber: '111', lang: Language.CPP11 }
    }, {
        arg: { filePath: '/abc/def/  32 w 23 ww .C++', content: '' },
        expected: { problemNumber: '32', lang: Language.CPP11 }
    }, {
        arg: { filePath: '/abc/def/   23 a 9 bc 8 .java', content: '' },
        expected: { problemNumber: '23', lang: Language.JAVA }
    }, {
        arg: { filePath: '/abc/def/   23 a 9 bc 8 .py', content: '' },
        expected: { problemNumber: '23', lang: Language.PYTHON3 }
    }]

    oks.forEach((e) => {
        test('parse [' + e.arg.filePath + '] should success', () => {
            let meta = Controller.parseProblemMeta(e.arg.filePath, e.arg.content);
            assert.equal(e.expected.problemNumber, meta.problemNumber);
            assert.equal(e.expected.lang, meta.lang);
        });
    });
    
    let fails = [
        { filePath: '/abc/def/   23 a 9 bc 8 .cs', content: '' },
        { filePath: '/abc/def/ abc .java', content: '' },
        { filePath: '/abc/def/123', content: '' },
        { filePath: '/abc/def/   23  cs.   ', content: '' },
    ];
    fails.forEach((e) => {
        test('parse [' + e.filePath + '] should fail', () => {
            let meta = Controller.parseProblemMeta(e.filePath, e.content);
            assert.equal(null, meta);
        });
    });
});