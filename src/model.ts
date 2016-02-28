'use strict';

export enum Language {
    C = 1,
    JAVA,
    CPP,
    PASCAL,
    CPP11,
    PYTHON3
}

export enum Verdict {
    SubmissionError = 10,
    CanNotJudge = 15,
    InQueue = 20,
    CompileError = 30,
    RestrictedFunction = 35,
    RuntimeError = 40,
    OutputLimit = 45,
    TimeLimit = 50,
    MemoryLimit = 60,
    WrongAnswer = 70,
    PresentationError = 80,
    Accepted = 90
}

export interface Submission {
    submissionID: number,
    problemID: number,
    verdictID: Verdict,
    runtime: number,
    submissionTime: number,
    language: Language,
    rank: number
}