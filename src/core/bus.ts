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

    const failures = results.filter(result => result.status === 'rejected')
    if (failures.length > 0) {
      const errors = failures.map(f => (f as PromiseRejectedResult).reason)
      throw new Error(`Plugin execution failed for intent '${String(intent)}': ${errors.join(', ')}`)
    }
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<CRDTResult>).value)
  }

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void {
    if (!this.listeners[intent as string]) {
      this.listeners[intent as string] = []
    }
    this.listeners[intent as string].push(async payload => {
      return cb(payload as IM[K])
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
    return this.bus.emit(intent, payload)
  }
}
