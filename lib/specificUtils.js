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

const path = require('path');
const process = require('process');
const clientHelpers = require('@reportportal/client-javascript/lib/helpers');
const { RP_STATUSES } = require('@reportportal/client-javascript/lib/constants/statuses');
const pjson = require('./../package.json');
const LOG_LEVELS = require('./constants/logLevels');

const PJSON_VERSION = pjson.version;
const PJSON_NAME = pjson.name;

function takeScreenshot(fileName) {
  let promiseResolve;
  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
  });
  if (global.browser) {
    global.browser.takeScreenshot().then(
      (png) => {
        promiseResolve({
          name: fileName,
          type: 'image/png',
          content: png,
        });
      },
      (error) => {
        console.dir(error);
        promiseResolve(null);
      }
    );
  } else {
    promiseResolve(null);
  }
  return promise;
}

function escapeMarkdown(string) {
  return string.replace(/_/gm, '\\_').replace(/\*/gm, '\\*');
}

function getAllLogs(spec, fileObject, logs) {
  const failures = [];
  spec.failedExpectations.forEach((failure) => {
    failures.push(`message: ${this.escapeMarkdown(failure.message)}`);
    failures.push(`stackTrace: ${this.escapeMarkdown(failure.stack)}`);
  });

  if (failures.length) {
    const message = failures.join('\n');

    return [{ level: LOG_LEVELS.ERROR, message, file: fileObject }, ...logs];
  }

  return logs;
}

function getLaunchObj(conf) {
  const systemAttr = this.getSystemAttributes(conf.skippedIssue);
  const launchObj = Object.assign(
    {
      attributes: conf.attributes ? [...conf.attributes, ...systemAttr] : systemAttr,
      description: conf.description,
    },
    conf.id && { id: conf.id },
    conf.rerun && { rerun: conf.rerun },
    conf.rerunOf && { rerunOf: conf.rerunOf },
    conf.mode && { mode: conf.mode }
  );

  return launchObj;
}

function getSystemAttributes(skippedIssue) {
  const systemAttr = [
    {
      key: 'agent',
      value: `${PJSON_NAME}|${PJSON_VERSION}`,
      system: true,
    },
  ];

  if (skippedIssue === false) {
    const skippedIssueAttribute = {
      key: 'skippedIssue',
      value: 'false',
      system: true,
    };

    systemAttr.push(skippedIssueAttribute);
  }

  return systemAttr;
}

function getAgentInfo() {
  return {
    version: PJSON_VERSION,
    name: PJSON_NAME,
  };
}

function getCodeRef(currentSpecIndex, fullTestName) {
  if (!global.browser) {
    return Promise.resolve(null);
  }

  return global.browser.getProcessedConfig().then((config) => {
    const currentTestFilePath = config.specs[currentSpecIndex].replace(
      new RegExp('\\\\', 'g'),
      '/'
    );
    const processCwd = process.cwd().replace(/\\/g, '/');

    const testFileDir = path.parse(
      path.normalize(path.relative(processCwd, currentTestFilePath))
    ).dir;

    const separator = testFileDir ? '/' : '';
    const testFile = path.parse(currentTestFilePath);

    return `${testFileDir}${separator}${testFile.base}/${fullTestName}`;
  });
}

function getFullTestName(test) {
  if (test.description === test.fullName) {
    return test.description;
  }

  const parentName = test.fullName.replace(test.description, '').slice(0, -1);

  return `${parentName}/${test.description}`;
}

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

function isHookShouldBeCalled(action) {
  return !(this.isPromise(action) && action !== undefined && action.valueOf() === undefined);
}

function makeHooksWrapper(wrapped, funcStart, funcFinish) {
  return function (action, timeout) {
    wrapped((done) => {
      let isFuncBeCalled = true;

      try {
        isFuncBeCalled = SpecificUtils.isHookShouldBeCalled(action(done));

        if (isFuncBeCalled) {
          funcStart();
          funcFinish();
        }

        done();
      } catch (err) {
        if (isFuncBeCalled) {
          funcStart();
          funcFinish(RP_STATUSES.FAILED, err);
        }

        done.fail(err);
      }
    }, timeout);
  };
}

function convertIsoStringToMicroseconds(isoDateStringWithMicroseconds) {
  const [datePart, microsecondsPart] = isoDateStringWithMicroseconds.split('.');
  const date = new Date(`${datePart}Z`);
  const microseconds = parseInt(microsecondsPart.slice(0, -1), 10);

  return date.getTime() * 1000 + microseconds;
}

function getBeforeHookStartTime(itemStartTime) {
  return clientHelpers.formatMicrosecondsToISOString(
    convertIsoStringToMicroseconds(itemStartTime) - 1000
  );
}

module.exports = {
  takeScreenshot,
  escapeMarkdown,
  getAllLogs,
  getLaunchObj,
  getSystemAttributes,
  getAgentInfo,
  getCodeRef,
  getFullTestName,
  isPromise,
  isHookShouldBeCalled,
  makeHooksWrapper,
  convertIsoStringToMicroseconds,
  getBeforeHookStartTime,
};
