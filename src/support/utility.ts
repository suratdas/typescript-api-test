import { EXTENT_STEP_STATUS, ReportSteps } from "./report";

export const utility = {

    generateRandomString: (length: number): string => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    generateRandomNumber: (length: number): string => {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    getCurrentDateTime(): string {
        const date = new Date();
        // return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    },

    verifyTwoListsEqual(a: any[], b: any[]): boolean {
        let valueToReturn = JSON.stringify(a.sort()) === JSON.stringify(b.sort())
        if (valueToReturn)
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.PASS, 'Lists are equal.');
        else
            ReportSteps.reportStepMessage(EXTENT_STEP_STATUS.FAIL, 'Lists are not equal.');
        return valueToReturn;
    },

    futureEpochTime(hours: number) {
        let millisecondsInHour = 86400000;
        let date = (Date.now() + hours * millisecondsInHour).toString();
        return date.substring(0, date.length - 3) + '000';
    }

}
