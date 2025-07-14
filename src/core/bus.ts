import {
  PluginBus,
  PluginContext,
  IntentMap,
  CRDTResult,
} from './types'

export class InMemoryBus<IM extends IntentMap>
  implements PluginBus<IM, PluginContext<IM>>
{
  private readonly listeners: Record<string, ((payload: unknown) => Promise<CRDTResult>)[]> = {}

  emit<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    const fns = this.listeners[intent as string] || []
    return Promise.all(fns.map(fn => fn(payload)))
  }

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void {
    if (!this.listeners[intent as string]) {
      this.listeners[intent as string] = []
    }
    this.listeners[intent as string].push(payload => Promise.resolve(cb(payload as IM[K])))
  }
}

export class BasicPluginContext<IM extends IntentMap>
  implements PluginContext<IM>
{
  constructor(readonly id: string, private readonly bus: PluginBus<IM, PluginContext<IM>>) {}

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void {
    this.bus.on(intent, cb)
  }

  async intent<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult> {
    const [result] = await this.bus.emit(intent, payload)
    return result ?? { success: true }
  }
}
