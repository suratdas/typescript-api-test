import { JSONPath } from 'jsonpath-plus';
import supertest, { Response } from 'supertest';
import { ReportSteps, EXTENT_STEP_STATUS } from './report';
import { Validator } from 'jsonschema';

let request = supertest('');
let defaultRequestHeaders: { [key: string]: string } = {};
let response: Response;

export class APISteps {
    clearHeaders() {
        defaultRequestHeaders = {};
    }

    setDefaultRequestHeaders(headersString: string): boolean {

        defaultRequestHeaders = this.parseHeaders(headersString);
        return true;
    }

    callGETAPI = async (url: string, headers?: string, requestBody?: {}): Promise<Response> => {
        response = requestBody
            ? await this.getRequestBuilder('get', url, headers).send(requestBody)
            : await this.getRequestBuilder('get', url, headers);
        if (requestBody)
            ReportSteps.reportStepMessageWithJson(EXTENT_STEP_STATUS.INFO, 'Calling GET to url: ' + url + ' with request body', JSON.stringify(requestBody));
        else
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Calling GET to url: ' + url);
        return response;
    }

    callPOSTAPI = async (url: string, requestBody: {}, headers?: string,): Promise<Response> => {
        response = await this.getRequestBuilder('post', url, headers).send(requestBody);
        ReportSteps.reportStepMessageWithJson(EXTENT_STEP_STATUS.INFO, 'Calling GET to url: ' + url + (requestBody ? ' with request body' : ''), JSON.stringify(requestBody));
        return response;
    }

    callPUTAPI = async (url: string, requestBody: {}, headers?: string,): Promise<Response> => {
        response = await this.getRequestBuilder('put', url, headers).send(requestBody);
        ReportSteps.reportStepMessageWithJson(EXTENT_STEP_STATUS.INFO, 'Calling GET to url: ' + url + (requestBody ? ' with request body' : ''), JSON.stringify(requestBody));
        return response;
    }

    callDELETEAPI = async (url: string, headers?: string): Promise<Response> => {
        response = await this.getRequestBuilder('delete', url, headers);
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Calling DELETE to url: ' + url);
        return response;
    }

    callHEADAPI = async (url: string, headers?: string): Promise<Response> => {
        response = await this.getRequestBuilder('head', url, headers);
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Calling HEAD to url: ' + url);
        return response;
    }

    printResponseBody() {
        ReportSteps.reportStepMessageWithJson(EXTENT_STEP_STATUS.INFO, 'Response message body:', JSON.stringify(response.body));
        // ReportSteps.reportStepMessageWithScreenshot(EXTENT_STEP_STATUS.PASS, 'Message for screenshot.', 'screenshots/aa.png');
        return response.body;
    }

    getResponseCode(): number {
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Response code was : ' + response.statusCode);
        return response.statusCode;
    }

    verifyResponseStatusCode(value: number): boolean {
        let statusCode = response.statusCode;
        let verification = statusCode == value;
        if (verification) {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, "As expected, response status code was " + statusCode);
        } else {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, "Expected status code: " + value + " Found: " + statusCode);
        }
        return verification;
    }

    getFromResponseBody(jsonPath: string): any {
        let value = JSONPath({ path: jsonPath, json: response.body, wrap: false });
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, jsonPath + " value is : " + value);
        return value;
    }

    verifyInResponseBody(verifyString: string): boolean {
        let verifications: string[] = [];
        if (verifyString.includes(",")) {
            verifyString.split(",").forEach(e => {
                let node = e.split("=")[0];
                let expectedValue = e.split("=")[1];
                let actualValue = JSONPath({ path: node, json: response.body, wrap: false })
                if (actualValue) {
                    if (expectedValue == "emptyList") {
                        if (actualValue.length !== 0) {
                            verifications.push(node + " is not empty. It was expected to be empty.");
                        }
                    } else if (expectedValue == "nonEmptyList") {
                        if (actualValue.length === 0) {
                            verifications.push(node + " is empty. It was expected not to be empty.");
                        }
                    } else {
                        if (actualValue != expectedValue) {
                            verifications.push(node + " is not same. Expected: " + expectedValue + " Found: " + actualValue);
                        }
                    }
                } else {
                    if (expectedValue != 'doesNotExist') {
                        verifications.push('As expected, node ' + node + ' was not found.');
                    }
                }
            });
        }
        if (verifications.length == 0) {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, JSON.stringify("Successfully verified for : " + verifyString));
            return true;
        }
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, JSON.stringify(verifications));
        return false;
    }

    getResponseHeader(headerName: string): string {
        let value = response.headers[headerName];
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Response header ' + headerName + ' is: ' + value);
        return value;
    }

    getFromResponseForEachNodeAt(value: string, jsonPath: string): any[] {
        let originalArray: [] = JSONPath({ path: jsonPath, json: response.body, wrap: false });
        let valueToReturn = originalArray.map(obj => JSONPath({ path: value, json: obj, wrap: false }));
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Found nodes: ' + JSON.stringify(valueToReturn));
        return valueToReturn;
    }

    getFromListAtWhere(nodeToRetrieve: string, jsonPath: string, condition: string) {
        let node: {}[] = JSONPath({ path: jsonPath, json: response.body, wrap: false });
        let key = condition.split("=")[0];
        let value = condition.split("=")[1];
        let desiredNode = node.find(e => JSONPath({ path: key, json: e, wrap: false }) == value);
        let valueToReturn = JSONPath({ path: nodeToRetrieve, json: desiredNode!, wrap: false });
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Found nodes: ' + JSON.stringify(valueToReturn));
        return valueToReturn;
    }

    verifyAllNodesAtHave(jsonPath: string, condition: string) {
        let node: {}[] = JSONPath({ path: jsonPath, json: response.body, wrap: false });
        let key = condition.split("=")[0];
        let value = condition.split("=")[1];
        if (value.includes("exists")) {
            let desiredNode = node.filter(e => JSONPath({ path: key, json: e, wrap: false }) === undefined);
            let valueToReturn = desiredNode.length == 0;
            if (valueToReturn)
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, 'Verified at ' + jsonPath + '. All elements have the node: ' + key);
            else
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, 'Verified at ' + jsonPath + '. Some elements did not have the node: ' + key);
            return valueToReturn;
        } else if (value.includes("doesNotExist")) {
            let desiredNode = node.filter(e => JSONPath({ path: key, json: e, wrap: false }) !== undefined);
            let valueToReturn = desiredNode.length == 0;
            if (valueToReturn)
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, 'Verified at ' + jsonPath + '. None of the elements have the node: ' + key);
            else
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, 'Verified at ' + jsonPath + '. Some of the elements have the node: ' + key);
            return valueToReturn;
        } else {
            let desiredNode = node.filter(e => JSONPath({ path: key, json: e, wrap: false }) != value);
            let valueToReturn = desiredNode.length == 0;
            if (valueToReturn)
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, 'Verified node: ' + key + ' at ' + jsonPath + '. It has value: ' + value);
            else
                ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, 'Verified node: ' + key + ' at ' + jsonPath + '. Some nodes did not have value: ' + value);
            return valueToReturn;
        }
    }

    verifyResponseBodyMatchesSchema(schema: object): boolean {
        let result = new Validator().validate(response.body, schema);
        if (result.valid) {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, 'Schema validation is successful.');
        } else {
            ReportSteps.reportStepMessageWithJson(EXTENT_STEP_STATUS.FAIL, 'schema validation failed.', JSON.stringify(result.errors, null, 2));
        }
        return result.valid;
    }

    doesResponseBodyHaveNode(node: string) {
        let potentialNode = JSONPath({ path: node, json: response.body, wrap: false });
        let valueToReturn = potentialNode != undefined;
        ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'The node ' + node + (valueToReturn ? ' was found.' : ' was not found.'));
        return valueToReturn;
    }

    private getRequestBuilder(type: string, url: string, headersString?: string) {
        let requestBuilder;
        if (type === 'get')
            requestBuilder = request.get(url);
        else if (type === 'post')
            requestBuilder = request.post(url);
        else if (type === 'put')
            requestBuilder = request.put(url);
        else if (type === 'delete')
            requestBuilder = request.delete(url);
        else if (type === 'head')
            requestBuilder = request.head(url);
        else
            throw Error('Passed wrong API verb.')
        let headerValue = (headersString && headersString.length > 0)
            ? { ...this.parseHeaders(headersString), ...defaultRequestHeaders }
            : defaultRequestHeaders;
        if (Object.keys(headerValue).length > 0) {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'Added request headers: ' + JSON.stringify(headerValue));
            requestBuilder = requestBuilder.set(headerValue);
            //     .set('Cookie', ['myApp-token=12345667', 'myApp-other=blah'])
        } else {
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.INFO, 'You are calling API without any headers.');
        }
        return requestBuilder;
    }

    private parseHeaders(headersString: string): { [key: string]: string } {
        let headers: { [key: string]: string } = {};
        if (headersString.trim().length > 0) {
            headersString.split(',').forEach(header => {
                const [key, value] = header.split('=');
                headers[key.trim()] = value.trim();
            });
        }
        return headers;
    }

};
