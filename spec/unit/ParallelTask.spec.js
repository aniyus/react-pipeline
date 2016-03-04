jest.dontMock('../TestTask');
jest.dontMock('../helper');
jest.dontMock('../ParallelTestTask');
jest.dontMock('../EmptyReactComponent');

import React from 'react';

const ReactPipeline = require('../../src/ReactPipeline').default;
const Task = require('../../src/Task').default;
const Pipeline = require('../../src/Pipeline').default;
const ParallelTask = require('../../src/ParallelTask').default;
const TestTask = require('../TestTask').default;
const ParallelTestTask = require('../ParallelTestTask').default;
const EmptyReactComponent = require('../EmptyReactComponent').default;

describe('ParallelTask', () => {
  describe('start', () => {
    pit('executes own task', () => {
      const mockCallback = jest.genMockFunction().mockImplementation(() => {
        return Promise.resolve();
      });

      class InnerParallelTask extends ParallelTask {
        exec() { return mockCallback(); }
      }
      
      return ReactPipeline.start(
        <Pipeline>
          <InnerParallelTask />
        </Pipeline>
      ).then(data => {
        expect(mockCallback.mock.calls.length).toBe(1);
      })
      .catch(fail);

    });

    pit('executes child tasks in parallel', () => {
      const mockCallback = jest.genMockFunction();
      const sleeper = (dur) => {
        return () => {
          return new Promise((resolve, reject) => {
            expect(mockCallback).not.toBeCalled();

            setTimeout(() => {
              mockCallback();
              resolve();
            }, dur);

            if (setTimeout.mock.calls.length === 2) {
              jest.runOnlyPendingTimers();
            }
          });
        };
      }

      return ReactPipeline.start(
        <Pipeline>
          <ParallelTask>
            <TestTask callback={sleeper(500)} />
            <TestTask callback={sleeper(100)} />
          </ParallelTask>
        </Pipeline>
      ).then(data => {
        expect(mockCallback.mock.calls.length).toBe(2);
      })
      .catch(fail);
    });
  });
});
