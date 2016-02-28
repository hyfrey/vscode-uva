# README

Submit code to UVa online judge from Visual Studio Code

## Features
* submit code and get judge result

## Usage
**Set username and password**

```
"uva.judge.username": "USERNAME",
"uva.judge.password": "PASSWORD"
```

**Open problem source file**

vscode-uva will auto detect problem number and language from source file name.
Make sure the file name starts with problem number and has proper file extension, 
such as `108 - Maximum Sum.cpp`. The language will be determined by the following rules:

Language | Extension
--- | ---
C | c, C
C++11 | c++, C++, cpp, CPP
Java | java, JAVA
Python3 | py, PY

**Submit problem**

Run command `UVa: Submit`. Wait a moment for vscode to submit, it will inform you when finish.

**Query problem status**

Run command `UVa: Status`. Your submissions to this problem will display in output.

### Trouble shooting
Turn on debug if vscode-uva doesn't work. It will print verbose HTTP log to console. 
If UVa web site change web page, this extention may not work.
```
"uva.debug": true
``` 

## Future Plan

### Code
* resue UVaClient between different command invocation
* add unit test
* move uvaclient.ts and uhuntclient.ts to seperate library

### Features
* ask for username and password if they are not set in config file
* read problem id and language from comment
* add more uhunt api to command
* worksapce management
* streamline compile run workflow
* add support for other oj such as zoj, poj, spoj, leetcode

## Development
### Build
Checkout source code
```
$ git clone git@github.com:hyfreyr/vscode-uva.git
```

Make sure you have typings installed, otherwise install
```
$ npm install -g typings
```

Install dependencies
```
$ npm install
```

Generate typings
```
$ typings install 
```

Open source directory in Visual Studio Code, press `F5` to run

## For more information
* [Visual Studio Code](https://code.visualstudio.com/)
* [TypeScript](http://www.typescriptlang.org/)
* [UVa online judge](https://uva.onlinejudge.org/)
* [uHunt](http://uhunt.felix-halim.net/)

**Enjoy!**
