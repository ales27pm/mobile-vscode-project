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
    return Promise.allSettled(fns.map(fn => fn(payload))).then(results =>
      results.flatMap(r => {
        if (r.status === 'fulfilled') {
          return [r.value]
        }
        console.error('Listener failed', r.reason)
        return []
      }),
    )
  }

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): () => void {
    if (!this.listeners[intent as string]) {
      this.listeners[intent as string] = []
    }
    const wrapped = (payload: unknown) => Promise.resolve(cb(payload as IM[K]))
    const arr = this.listeners[intent as string]
    arr.push(wrapped)
    return () => {
      const index = arr.indexOf(wrapped)
      if (index !== -1) {
        arr.splice(index, 1)
      }
    }
  }
}

export class BasicPluginContext<IM extends IntentMap>
  implements PluginContext<IM>
{
  constructor(readonly id: string, private readonly bus: PluginBus<IM, PluginContext<IM>>) {}

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): () => void {
    return this.bus.on(intent, cb)
  }

  async intent<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    // return all listener results so callers can act on multiple handlers
    const results = await this.bus.emit(intent, payload)
    return results
  }
}
