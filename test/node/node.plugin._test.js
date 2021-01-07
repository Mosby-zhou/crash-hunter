const assert = require('assert');
const _ = require('lodash');
const { CrashHunter } = require('../../dist/node/index');

const eventList = [];

const client = CrashHunter.init({
  request: async (events) => {
    _.map(events, (event) => eventList.push(event));
  },
});

setTimeout(() => {
  throw new Error('not handled Error');
});

setTimeout(() => {
  throw 'not handled string';
});

setTimeout(() => {
  (async () => {
    await client.close();
  })();
  setTimeout(() => {
    assert.strictEqual(eventList.length, 2, `eventList is ${eventList.length} not equal 1`);
    assert.deepStrictEqual(
      _.pick(eventList[0], ['name', 'message']),
      {
        name: 'Error',
        message: 'not handled Error',
      },
      `eventList[0] is a Error`,
    );
    assert.deepStrictEqual(
      _.pick(eventList[1], ['name', 'message']),
      {
        name: '',
        message: 'not handled string',
      },
      `eventList[1] is a string`,
    );
  }, 100);
}, 2000);
