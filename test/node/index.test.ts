import assert from 'assert';
import _ from 'lodash';
import { CrashHunter, CrashEvent } from '../../src/node/index';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', async () => {
    expect(true).toBeTruthy();
  });

  it('DummyClass is instantiable', () => {
    const eventList: CrashEvent[] = [];

    const client = CrashHunter.init({
      request: async (events) => {
        _.map(events, (event) => eventList.push(event));
      },
    });

    setTimeout(async () => {
      await client.close();

      expect(eventList.length).toEqual(0);
    }, 1);
  });
});
