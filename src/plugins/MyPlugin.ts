import {
  Plugin,
  PluginBus,
  PluginContext,
  CRDTResult,
  IntentMap,
} from '../core/types'

/** Define the intents your plugin cares about */
export interface MyIntents extends IntentMap {
  createNode: { name: string }
  deleteNode: { id: string }
  // …add more as needed
}



export class MyPlugin implements Plugin<MyIntents, PluginContext<MyIntents>> {
  public readonly id: string
  private nodes = new Map<string, { name: string }>()

  constructor(
    private readonly bus: PluginBus<MyIntents, PluginContext<MyIntents>>,
  ) {
    this.id = 'my-plugin'
  }

  init(ctx: PluginContext<MyIntents>): void {
    // all handlers get correct payload types
    ctx.on('createNode', this.handleCreateNode.bind(this))
    ctx.on('deleteNode', this.handleDeleteNode.bind(this))
  }

  private handleCreateNode(
    payload: MyIntents['createNode'],
  ): CRDTResult {
    const id = self.crypto?.randomUUID?.() || `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    this.nodes.set(id, { name: payload.name })
    return { success: true }
  }

  private handleDeleteNode(
    payload: MyIntents['deleteNode'],
  ): CRDTResult {
    const removed = this.nodes.delete(payload.id)
    return { success: removed }
  }
}

/** Export a factory so consumers get a real instance */
export default (bus: PluginBus<MyIntents, PluginContext<MyIntents>>) =>
  new MyPlugin(bus)
