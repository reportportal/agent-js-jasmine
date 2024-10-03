/*
 *  Copyright 2024 EPAM Systems
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
 *
 */

class RPClientMock {
  config;

  constructor(config) {
    this.config = config;
  }

  startLaunch = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
    tempId: 'tempLaunchId',
  });

  finishLaunch = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
  });

  startTestItem = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
    tempId: 'tempTestItemId',
  });

  finishTestItem = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
  });

  getPromiseFinishAllItems = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
  });

  sendLog = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
  });

  checkConnect = jest.fn().mockReturnValue({
    promise: Promise.resolve('ok'),
  });
}

module.exports = RPClientMock;
