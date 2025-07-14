import { InMemoryBus, BasicPluginContext } from '../../../../src/core/bus';
import { IntentMap } from '../../../../src/core/types';

interface TestIntents extends IntentMap {
  hello: { name: string };
}

describe('InMemoryBus and BasicPluginContext', () => {
  test('emit triggers subscribed handler', () => {
    const bus = new InMemoryBus<TestIntents>();
    const results: any[] = [];
    bus.on('hello', payload => results.push(payload));
    bus.emit('hello', { name: 'Alice' });
    expect(results).toEqual([{ name: 'Alice' }]);
  });

  test('context.intent emits via bus', async () => {
    const bus = new InMemoryBus<TestIntents>();
    const ctx = new BasicPluginContext<TestIntents>('test', bus);
    const results: any[] = [];
    bus.on('hello', payload => results.push(payload));
    await ctx.intent('hello', { name: 'Bob' });
    expect(results).toEqual([{ name: 'Bob' }]);
  });
});
