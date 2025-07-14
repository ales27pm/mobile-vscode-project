import createPlugin, { MyPlugin, MyIntents } from '../../../../src/plugins/MyPlugin';
import { InMemoryBus, BasicPluginContext } from '../../../../src/core/bus';

function setup() {
  const bus = new InMemoryBus<MyIntents>();
  const plugin = createPlugin(bus);
  const ctx = new BasicPluginContext<MyIntents>('test', bus);
  plugin.init(ctx);
  return { plugin: plugin as MyPlugin, ctx, bus };
}

describe('MyPlugin', () => {
  beforeAll(() => {
    (global as any).self = global;
  });

  test('create and delete node cycle', async () => {
    const { plugin, ctx } = setup();
    const nodes = plugin.getNodes() as Map<string, { name: string }>;
    expect(nodes.size).toBe(0);
    await ctx.intent('createNode', { name: 'A' });
    expect(nodes.size).toBe(1);
    const id = Array.from(nodes.keys())[0];
    const res = await ctx.intent('deleteNode', { id });
    expect(res.success).toBe(true);
    expect(nodes.size).toBe(0);
  });
});
