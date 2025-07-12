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

/** Strongly‐typed context for your plugin */
export interface MyContext extends PluginContext<MyIntents> {}

export class MyPlugin implements Plugin<MyContext, MyIntents> {
  public readonly id: string

  constructor(
    private readonly bus: PluginBus<MyContext, MyIntents>,
  ) {
    this.id = 'my-plugin'
  }

  init(ctx: MyContext): void {
    // all handlers get correct payload types
    ctx.on('createNode', this.handleCreateNode.bind(this))
    ctx.on('deleteNode', this.handleDeleteNode.bind(this))
  }

  private handleCreateNode(
    payload: MyIntents['createNode'],
  ): CRDTResult {
    // …your logic here
    // this.bus.emit('nodeCreated', { id: newNodeId, name: payload.name })
    return { success: true }
  }

  private handleDeleteNode(
    payload: MyIntents['deleteNode'],
  ): CRDTResult {
    // …your logic here
    // this.bus.emit('nodeDeleted', { id: payload.id })
    return { success: true }
  }
}

/** Export a factory so consumers get a real instance */
export default (bus: PluginBus<MyContext, MyIntents>) =>
  new MyPlugin(bus)
