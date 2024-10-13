import { APISteps } from '../support/api-calls';
import { ReportSteps, TEST_STATUS } from '../support/report';
import fs from 'fs';
import { utility } from '../support/utility';
import { expect } from 'chai';

let testSuite = 'API Tests';
const apiSteps = new APISteps();

before(() => {
    ReportSteps.reportSuiteStart(testSuite);
});

after(() => { ReportSteps.reportSuiteEnd(testSuite); });


beforeEach(function () {
    ReportSteps.reportTestStart(this.currentTest?.title as string);
});

afterEach(function () {
    try {
        let status: string = this.currentTest?.state as string;
        let message: string = this.currentTest?.err?.message as string;
        const ansiRegex = new RegExp('[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))', 'g');
        message = message.replace(ansiRegex, '');
        ReportSteps.reportTestStop(status as unknown as TEST_STATUS, (this.currentTest?.title as string), message);
    } catch (e) {
    }
    apiSteps.clearHeaders();
});


describe(testSuite, () => {

    it('Returns correct value', async () => {
        const requestBody = {
            "fileList": [
                "response1.json",
                "response2.json"
            ],
            "statusList": [
                200,
                400
            ]
        }
        /*
        let a = await request.post('http://localhost:8080/setFiles', {
            headers: { 'Content-Type': 'application/json' },
            data: data
        });
        console.log(a.status() + (await a.json()).message);
        */

        // await addMsg({ message: 'This is test message from the test.', context: '' })
        // const response = await apiSteps.callGETAPI('http://localhost:8080/setFiles', 'Accept=application/json,Content-Type=application/json', data);

        apiSteps.setDefaultRequestHeaders("Accept=application/json,Content-Type=application/json");
        let randomString = utility.generateRandomString(4);
        await apiSteps.callGETAPI('http://localhost:8080/aa?fileName=response.json',);
        apiSteps.printResponseBody();
        expect(apiSteps.getResponseCode()).to.equal(200);
        let responseVerify = apiSteps.verifyInResponseBody("status=pass,accounts=nonEmptyList");
        expect(responseVerify).to.be.true;
        expect(apiSteps.doesResponseBodyHaveNode("doesNotExist")).not.to.be.true;
        let header = apiSteps.getResponseHeader('content-type');
        expect(header).to.equal('application/json');
        let value = apiSteps.getFromResponseBody('names[0].type');
        expect(value).to.equal('VALUE');
        let array = apiSteps.getFromResponseForEachNodeAt('name', 'test');
        expect(utility.verifyTwoListsEqual(array, ["name1", "name2"])).to.be.true;
        const jsonString = fs.readFileSync('tests/schema.json', 'utf-8');
        expect(apiSteps.verifyResponseBodyMatchesSchema(JSON.parse(jsonString))).to.be.true;
        let specificNode = apiSteps.getFromListAtWhere("names", "name", "lastName=test");
        expect(specificNode).to.equal("Men's Haircut");
        let specificNode2 = apiSteps.getFromListAtWhere("type", "names", "zip=12345");
        expect(specificNode2).to.equal("ITEM");
        let isTrue = apiSteps.verifyAllNodesAtHave("names", "active=true");
        expect(isTrue).to.be.true;
        isTrue = apiSteps.verifyAllNodesAtHave("names", "randomNode=doesNotExist");
        expect(isTrue).to.be.true;
        isTrue = apiSteps.verifyAllNodesAtHave("names", "active=exists");
        expect(isTrue).to.be.true;
    });

});
