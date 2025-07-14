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

  async emit<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    const fns = this.listeners[intent as string] || []
    const results = await Promise.allSettled(fns.map(fn => fn(payload)))
    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) || 'Unknown error' }
    )
  }

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void {
    if (!this.listeners[intent as string]) {
      this.listeners[intent as string] = []
    }
    this.listeners[intent as string].push(async payload => {
      try {
        return await Promise.resolve(cb(payload as IM[K]))
      } catch (error) {
        console.error(`Plugin bus error in intent ${String(intent)} (listener ${this.listeners[intent as string].length}):`, error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    })
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

  async intent<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    // return all listener results so callers can act on multiple handlers
    return this.bus.emit(intent, payload)
  }
}
