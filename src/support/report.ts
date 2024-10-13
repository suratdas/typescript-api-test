import { utility } from "./utility";

export enum TEST_STATUS {
    passed = 'passed',
    failed = 'failed',
    timedOut = 'timedOut',
    skipped = 'skipped',
    interrupted = 'interrupted'
}

export enum EXTENT_STEP_STATUS {
    PASS = 'PASS',
    FAIL = 'FAIL',
    INFO = 'INFO',
    SKIP = 'SKIP',
    WARNING = 'WARNING'
}

export class ReportSteps {

    static reportSuiteStart(testSuite: string) {
        console.log('REPORT: SUITE_START: ' + testSuite);
    }

    static reportSuiteEnd(testSuite: string) {
        console.log('REPORT: SUITE_END: ' + testSuite);
    }

    static reportTestStart(title: string) {
        console.log('REPORT: TEST_START: ' + title);
    }

    static reportTestStop(status: TEST_STATUS, title: string, errors: string) {
        let statusString = status.includes('pass') ? 'PASS' : 'FAIL';
        console.log('REPORT: TEST_END ' + statusString);
        // console.log('TITLE: ' + title);
        if (errors.length > 0) {
            console.log(title + " : " + errors);
        }
        console.log('REPORT: TEST_END END');
    }

    static reportStepMessage(status: EXTENT_STEP_STATUS, message: string) {
        const timeStamp = utility.getCurrentDateTime();
        console.log('REPORT: STEP_MESSAGE ' + EXTENT_STEP_STATUS[status]);
        console.log(timeStamp + 'MESSAGE: ' + message);
        console.log('REPORT: STEP_MESSAGE END');
    }

    static reportStepMessageWithJson(status: EXTENT_STEP_STATUS, message: string, json: string) {
        const timeStamp = utility.getCurrentDateTime();
        console.log('REPORT: STEP_MESSAGE_WITH_JSON ' + status);
        console.log(timeStamp + 'MESSAGE: ' + message);
        console.log('JSON: ' + json);
        console.log('REPORT: STEP_MESSAGE_WITH_JSON END');
    }

    static reportStepMessageWithScreenshot(status: EXTENT_STEP_STATUS, message: string, screenshotPath: string) {
        const timeStamp = utility.getCurrentDateTime();
        console.log('REPORT: STEP_MESSAGE_WITH_SCREENSHOT ' + status);
        console.log(timeStamp + 'MESSAGE: ' + message);
        console.log('PATH: ' + screenshotPath);
        console.log('REPORT: STEP_MESSAGE_WITH_SCREENSHOT END');
    }

};

