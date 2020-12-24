/*
 *  Copyright 2020 EPAM Systems
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const { EVENTS } = require('@reportportal/client-javascript/lib/constants/events');
const { RP_STATUSES } = require('@reportportal/client-javascript/lib/constants/statuses');
const SpecificUtils = require('./specificUtils');
const { entityType, hookTypes, hookTypesMap } = require('./constants/itemTypes');
const LOG_LEVELS = require('./constants/logLevels');
const { JasmineStatuses } = require('./constants/testStatuses');

/*const promiseErrorHandler = (promise) => {
    promise.catch((err) => {
        console.error(err);
    });
};*/

class ReportportalReporter {
    constructor(conf, onSetLaunchStatus) {
        this.client = conf.client;
        this.tempLaunchId = conf.tempLaunchId;
        this.parentsInfo = [];
        this.conf = conf;
        this.setLaunchStatus = onSetLaunchStatus;
        this.registerListeners();
        this.reportHooks();
        this.additionalCustomParams = {};
        this.suiteDescription = new Map();
        this.suiteLogs = new Map();
        this.suiteAttributes = new Map();
        this.suiteTestCaseIds = new Map();
        this.suiteStatuses = new Map();
        this.hookIds = new Map();
        this.itemStartTime = null;
        this.currentTestFilePathIndex;
        this.needToSlice = false;
        this.currentPromise;
        this.suiteCount = 0;
        this.clientPromise;
    }

    reportHooks() {
        this.conf.reportHooks && this.installHooks();
    }

    escapeMarkdown(string) {
        return string.replace(/_/gm, '\\_').replace(/\*/gm, '\\*');
    }

    getParentInfo() {
        if (!this.parentsInfo.length) {
            return null;
        }

        return this.parentsInfo[this.parentsInfo.length - 1];
    }

    getParentOfParentInfo() {
        if (this.parentsInfo.length > 1) {
            return this.parentsInfo[this.parentsInfo.length - 2];
        }

        return null;
    }

    setParentInfo(info) {
        //console.log('"\x1b[35m', `Set parent "${info.name}"`);
        this.parentsInfo.push(info);
    }

    spliceParentInfo(position, info) {
        //console.log('"\x1b[35m', `Slice parent "${info.name}"`);
        this.parentsInfo.splice(position, 0, info);
    }

    finishParent(deletedBy, type) {
        //console.log(`${this.getParentInfo().type} == ${type}`)

        // Не даем разным типам (сьют, спека) удалять друг друга (бывает из-за асинхронности)
        if(this.getParentInfo().type == type) {
            // Для дебага, чтобы понимать, кем был удален
            //console.log('"\x1b[36m"', `Parent ${this.getParentInfo().tempId} "${this.getParentInfo().name}" was deleted by "${deletedBy.name}"!!`);

            this.parentsInfo.pop();
        }
    }


    getTopLevelType() {
        if (!this.parentsInfo.length) {
            return entityType.SUITE;
        }
        return entityType.TEST;
    }

    getTime() {
        return new Date().valueOf();
    }

    promiseTimeout (time) {
        return new Promise(function(resolve,reject){
          setTimeout(function(){resolve(time);},time);
        });
      };

    addAttributes(attr) {
        if (attr && attr.suite) {
            const attributes = (this.suiteAttributes.get(attr.suite) || []).concat(attr.attributes);

            this.suiteAttributes.set(attr.suite, attributes);
        } else {
            const attributes = this.additionalCustomParams.attributes
                ? { attributes: this.additionalCustomParams.attributes.concat(attr.attributes) }
                : attr;

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, attributes);
        }
    }

    setDescription(description) {
        if (description && description.suite) {
            this.suiteDescription.set(description.suite, description.text);
        } else {
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                description && { description: description.text },
            );
        }
    }

    setTestCaseId(testCase) {
        if (testCase && testCase.suite) {
            this.suiteTestCaseIds.set(testCase.suite, testCase.testCaseId);
        } else {
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                testCase && { testCaseId: testCase.testCaseId },
            );
        }
    }

    setStatus(data) {
        if (data && data.suite) {
            this.suiteStatuses.set(data.suite, data.status);
        } else {
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                data && { customStatus: data.status },
            );
        }
    }

    addTestItemLog(testItemLog) {
        const logWithTime = Object.assign(testItemLog.log, { time: this.getTime() });

        if (testItemLog && testItemLog.suite) {
            const logs = (this.suiteLogs.get(testItemLog.suite) || []).concat([logWithTime]);

            this.suiteLogs.set(testItemLog.suite, logs);
        } else {
            const logs = this.additionalCustomParams.logs
                ? { logs: this.additionalCustomParams.logs.concat([logWithTime]) }
                : { logs: [logWithTime] };

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, logs);
        }
    }

    sendLaunchLog(log) {
        this.sendLog(this.tempLaunchId, log);
    }

    sendLog(tempId, {
        level, message = '', file, time,
    }) {
        this.client.sendLog(tempId,
            {
                message,
                level,
                time: time || this.getTime(),
            },
            file);
    }

    registerListeners() {
        process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
        process.on(EVENTS.SET_DESCRIPTION, this.setDescription.bind(this));
        process.on(EVENTS.SET_TEST_CASE_ID, this.setTestCaseId.bind(this));
        process.on(EVENTS.SET_STATUS, this.setStatus.bind(this));
        process.on(EVENTS.SET_LAUNCH_STATUS, this.setLaunchStatus.bind(this));
        process.on(EVENTS.ADD_LOG, this.addTestItemLog.bind(this));
        process.on(EVENTS.ADD_LAUNCH_LOG, this.sendLaunchLog.bind(this));
    }

    getSuiteAttributesBySuite(suite) {
        return this.suiteAttributes.get(suite);
    }

    getSuiteDescriptionBySuite(suite) {
        return this.suiteDescription.get(suite);
    }

    getSuiteTestCaseIdBySuite(suite) {
        return this.suiteTestCaseIds.get(suite);
    }

    getSuiteStatusBySuite(suite) {
        return this.suiteStatuses.get(suite);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSuiteLogsBySuite(suite) {
        return this.suiteLogs.get(suite);
    }

    changeCurrentTestFilePath(suite) {
        if (this.currentTestFilePathIndex === undefined) {
            this.currentTestFilePathIndex = 0;

            return;
        }

        if (suite.description === suite.fullName) {
            this.currentTestFilePathIndex = this.currentTestFilePathIndex + 1;
        }
    }

    /* 
    Принцип работы алгоритма RP
    1. [--Suite--] -> [--Suite/Test--] -> [--Test--] 
    2. [--Suite--] -> [--Suite/Test--] -> [--X--] 
    Каждая спека смотрится на наличие родителя. Если родителя нет -> создается сьют.
    Если родитель есть, привязывается к нему, и добавляется в массив. 
    Родитель служит "каталогом" в RP. Спека тоже может служить "каталогом", но это баг
    который означает, что она стал для другой спеки родителем
    После обработки, удаляется из массива, чтобы следующая спека могла привязаться к родителю-сьюту.
    */
    async suiteStarted(suite) {

        this.changeCurrentTestFilePath(suite);
        this.suiteCount = this.suiteCount + 1;
        const fullSuiteName = SpecificUtils.getFullTestName(suite);

        // Чтобы отключить логирование xdescribe спек
        if (fullSuiteName.indexOf('x') == 0) {
            //console.log("SUITE TO SKIP!!!")
            return;
        }

        const promise = SpecificUtils.getCodeRef(this.currentTestFilePathIndex, fullSuiteName);

        // Для дебага
        /*
        console.log("-----------")
        console.log("creating Suite..." + suite.description);
        console.log("-----------")
        */

        console.log(this.getSuiteStatusBySuite(suite));
        const suiteTitle = suite.description;
        const attributes = this.getSuiteAttributesBySuite(suiteTitle);
        const description = this.getSuiteDescriptionBySuite(suiteTitle);
        const testCaseId = this.getSuiteTestCaseIdBySuite(suiteTitle);
        const logs = this.getSuiteLogsBySuite(suiteTitle);
        const type = this.getTopLevelType();
        await this.currentPromise;
        return this.currentPromise = promise.then((codeRef) => {
            this.itemStartTime = this.getTime();
            const parent = this.getParentInfo();
            const suiteObj = this.client.startTestItem(Object.assign({
                type,
                description: suiteTitle,
                startTime: this.itemStartTime,
                name: suiteTitle,
            },
            attributes && { attributes },
            description && { description },
            testCaseId && { testCaseId },
            codeRef && { codeRef }), this.tempLaunchId, parent && parent.tempId);
            // Задаем type = suite или spec, чтобы потом проверять в finishParent
            this.setParentInfo({ tempId: suiteObj.tempId, startTime: this.itemStartTime, name: suiteObj.name, type: 'suite' });

            // для дебага
            /*
            console.log("--");
            console.log("Suite parent ID: " + suiteObj.tempId);
            console.log("--"); 
            */

            logs && logs.forEach(log => this.sendLog(suiteObj.tempId, log));
            //promiseErrorHandler(suiteObj.promise);

            this.additionalCustomParams = {};
            this.suiteAttributes.delete(suiteTitle);
            this.suiteDescription.delete(suiteTitle);
            this.suiteTestCaseIds.delete(suiteTitle);
            this.suiteLogs.delete(suiteTitle);
        });
    }

    async specStarted(spec) {
        const fullTestName = SpecificUtils.getFullTestName(spec);
        //console.log("FUlltestname: " + fullTestName);

        //Чтобы отключить логирование xdescribe спек
        if (fullTestName.indexOf('x') == 0) {
            //console.log("TEST TO SKIP!!!")
            return;
        }

        const promise = SpecificUtils.getCodeRef(this.currentTestFilePathIndex, fullTestName);

        // обязательно ожидаем хотя бы завершение корневого промиса. Ожидание клиентского промиса
        // приводит к нарушением структуре RP
        await this.currentPromise;

        /* Для дебага
        let parentInfo = this.getParentInfo();
        console.log("-----------")
        console.log("Spec started..." + "\ Test name:" + spec.description)
        console.log("Spec parent ID:" + parentInfo.tempId + " Parent name:" + parentInfo.name);
        console.log("-----------")

        //Показывает все свойства spec и его значения
        console.log('Propery for spec on START')
        
        for (let prop in spec) {
            console.log(`Property: ${prop} with value ${spec[prop]}`);
        }*/

        // Сохраняем текущий промис для ожидания в следующем шаге – закрытия спеки
        return this.currentPromise = promise.then((codeRef) => {
            this.itemStartTime = this.getTime();

            // Если промис по удалению последнего элемента не успел сработать
            // забираем в качестве Parent – Suite и задаем, что его элемент
            // нужно добавить предпоследним параметром needToSlice
            let parent = this.getParentInfo();
            if(parent.type == "spec") {
                parent = this.getParentOfParentInfo();
                this.needToSlice = true;
            }

            // Создаем и добавляем спеку в RP, затем добавляем в массив
            const stepObj = this.client.startTestItem(Object.assign({
                type: entityType.STEP,
                description: spec.description,
                startTime: this.itemStartTime,
                name: spec.description,
            }, codeRef && { codeRef }), this.tempLaunchId, parent && parent.tempId);

            if(this.needToSlice == false) {
                this.setParentInfo({ tempId: stepObj.tempId, startTime: this.itemStartTime, name: stepObj.name, type: "spec" });
            }
            else {
                this.spliceParentInfo(this.parentsInfo.length - 1, { tempId: stepObj.tempId, startTime: this.itemStartTime, name: stepObj.name, type: "spec" });
                this.needToSlice = false;
            }

            /* Для дебага
            console.log("--");
            console.log("Spec name:" + spec.description);
            console.log("Spec ID: " + stepObj.tempId);
            console.log("All parents:")
            console.log(this.parentsInfo);
            console.log("--");*/

            //promiseErrorHandler(stepObj.promise);
        });
    }

    getHookStartTime(hookType, parent) {
        if (hookType === entityType.BEFORE_METHOD || hookType === entityType.BEFORE_SUITE) {
            return Math.max(parent && parent.startTime, this.itemStartTime - 1);
        }
        return this.itemStartTime || this.getTime();
    }

    hookStarted(hook) {
        const parent = this.getParentOfParentInfo();
        const type = hookTypesMap[hook];
        const startTime = this.getHookStartTime(type, parent);
        const hookObj = this.client.startTestItem({
            type,
            startTime,
            name: hook,
        }, this.tempLaunchId, parent && parent.tempId);

        this.hookIds.set(hook, hookObj.tempId);
        promiseErrorHandler(hookObj.promise);
    }

    hookDone(hook, RPStatus, err) {
        const hookId = this.hookIds.get(hook);

        if (hookId) {
            this.hookIds.delete(hook);
            if (err) {
                const log = { message: `message: ${err}`, level: LOG_LEVELS.ERROR };

                this.sendLog(hookId, log);
            }
            const hookDonePromise = this.client.finishTestItem(hookId, {
                status: RPStatus || RP_STATUSES.PASSED,
                endTime: this.getTime(),
            });

            promiseErrorHandler(hookDonePromise.promise);
        }
    }

    async specDone(spec) {
        // Для дебага
        // console.log("SpecDone:" + spec.description);


        //Чтобы отключить логирование xdescribe спек
        if (spec.fullName.indexOf('x') == 0) {
            //console.log("TEST TO SKIP DONE!!!")
            return;
        }

        /* Проблема с асинхронностью: для тестов, которые:
            - скипаются xit'ом
            - быстро упали
            - находятся в xdescribe сьюте
            Для таких ситуаций функция удаления спеки из массива происходит быстрее, чем его добавление.
            Удаляются не те спеки, ломая всю структуру RP.
        */
        await this.currentPromise;

        const {
            attributes, description, testCaseId, logs = [], customStatus,
        } = this.additionalCustomParams;
        let status = customStatus || spec.status;


        /* Для дебага
        console.log('Propery for spec on DONE')
         for (let prop in spec) {
            console.log(`Property: ${prop} with value ${spec[prop]}`);
        }*/

        // Вручную проставляем Interrupted для Pending кейсов в случае фейла кейса
        // SKIPPED только для кейсов xit и xdescribe
        if (status === JasmineStatuses.PENDING || status === JasmineStatuses.DISABLED) {
            if(spec.description.indexOf('x') == 0 || spec.fullName.indexOf('x') == 0) {
                status = RP_STATUSES.SKIPPED;
                //console.log("STATUS = SKIPPED");
            } else if(status === JasmineStatuses.PENDING) {
                //console.log("INTERRUPTED")
                status = RP_STATUSES.INTERRUPTED;
            }
        }

        let level = '';
        let message = spec.fullName;
        if (status === RP_STATUSES.FAILED) {
            level = LOG_LEVELS.ERROR;
            const failures = [];
            spec.failedExpectations.forEach((failure) => {
                failures.push(`message: ${this.escapeMarkdown(failure.message)}`);
                failures.push(`stackTrace: ${this.escapeMarkdown(failure.stack)}`);
            });
            message = failures.join('\n');
        }

        let promise = Promise.resolve(null);

        if (this.conf.attachPicturesToLogs) {
            promise = SpecificUtils.takeScreenshot(spec.fullName);
        }

        return this.currentPromise = promise.then((fileObj) => {

            // parent = текущая спека
            // Закрываем спеку и удаляем ее из массива, чтоб Parent снова стал сьют
            // Если parent закрылся не успешно, он будет висеть с лоудером в RP
            let parent = this.getParentInfo();
            const allLogs = [{ message, level, file: fileObj }].concat(logs);
            const issue = (status === RP_STATUSES.SKIPPED && this.conf.skippedIssue === false)
                ? { issueType: 'NOT_ISSUE' }
                : null;
            allLogs && allLogs.forEach(log => this.sendLog(parent && parent.tempId, log));
            const finishTestItemPromise = this.client.finishTestItem(parent && parent.tempId, Object.assign({
                status,
            },
            attributes && { attributes },
            description && { description },
            testCaseId && { testCaseId },
            issue && { issue }));
            //promiseErrorHandler(finishTestItemPromise.promise);

            this.additionalCustomParams = {};
            // Обязательно передаем тип на удаление
            this.finishParent(parent.name, "spec");
            this.itemStartTime = null;
        });
    }

    async suiteDone(suite) {
        //console.log("Suite Done!");

        const fullSuiteName = SpecificUtils.getFullTestName(suite);
        //Чтобы отключить логирование xdescribe спек
        if (fullSuiteName.indexOf('x') == 0) {
            //console.log("SUITE TO SKIP DONE!!!")
            return;
        }

        const status = this.getSuiteStatusBySuite(suite.description);
        let parent = this.getParentInfo();
        await this.currentPromise;

        //Из-за задержек в промисах, могли остаться какие-то элементы в массиве. 
        //Очищаем их до Suite, чтобы сьюты мы закрыли со статусом
        //Все, что до них это спеки, которые уже прошли через закрытие и простановку статуса
        let length = this.parentsInfo.length;
        //console.log(`Suite Count: ${this.suiteCount}, length of Array ${length}`);
        let count = this.suiteCount;
        if(count > 1) {
            for(let i = 0; i < length-count; i ++) {
                //console.log("IN CYCLE!!");
                this.finishParent(this.parentsInfo[length-1-i], "spec");
            }
            parent = this.getParentInfo();
            //console.log(`NEW PARENTT IS ${parent.name} + ${parent.tempId}`);
        }

        this.suiteCount = this.suiteCount - 1;
        //console.log(`tryng to delete ${parent.tempId}`)

        // Если сьют завершается не успешно, он висит с лоудером в RP
        this.currentPromise = this.client.finishTestItem(parent && parent.tempId,
            Object.assign({}, status && { status }));
        this.finishParent(suite.description, "suite");

        //promiseErrorHandler(this.currentPromise);
        this.suiteStatuses.delete(suite.description);
        this.itemStartTime = null;
    }

    installHooks() {
        const jasmineBeforeAll = global.beforeAll;
        const jasmineAfterAll = global.afterAll;
        const jasmineBeforeEach = global.beforeEach;
        const jasmineAfterEach = global.afterEach;

        const wrapperBeforeAll = SpecificUtils.makeHooksWrapper(
            jasmineBeforeAll,
            () => this.hookStarted(hookTypes.BEFORE_ALL),
            (status, err) => this.hookDone(hookTypes.BEFORE_ALL, status, err),
        );
        const wrapperAfterAll = SpecificUtils.makeHooksWrapper(
            jasmineAfterAll,
            () => this.hookStarted(hookTypes.AFTER_ALL),
            (status, err) => this.hookDone(hookTypes.AFTER_ALL, status, err),
        );
        const wrapperBeforeEach = SpecificUtils.makeHooksWrapper(
            jasmineBeforeEach,
            () => this.hookStarted(hookTypes.BEFORE_EACH),
            (status, err) => this.hookDone(hookTypes.BEFORE_EACH, status, err),
        );
        const wrapperAfterEach = SpecificUtils.makeHooksWrapper(
            jasmineAfterEach,
            () => this.hookStarted(hookTypes.AFTER_EACH),
            (status, err) => this.hookDone(hookTypes.AFTER_EACH, status, err),
        );

        global.beforeAll = wrapperBeforeAll;
        global.afterAll = wrapperAfterAll;
        global.beforeEach = wrapperBeforeEach;
        global.afterEach = wrapperAfterEach;
    }
}

module.exports = ReportportalReporter;
