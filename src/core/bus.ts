import { EventEmitter } from 'events'
import {
  PluginBus,
  PluginContext,
  IntentMap,
  CRDTResult,
} from './types'

export class InMemoryBus<IM extends IntentMap>
  implements PluginBus<IM>
{
  private readonly emitter = new EventEmitter()

  async emit<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    const listeners = this.emitter.listeners(intent as string) as ((payload: IM[K]) => CRDTResult | Promise<CRDTResult>)[]
    const results = await Promise.all(listeners.map(fn => Promise.resolve(fn(payload))) )
    return results
  }

  on<K extends keyof IM>(intent: K, cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>): void {
    this.emitter.on(intent as string, cb as (payload: unknown) => void)
  }

  listeners<K extends keyof IM>(intent: K) {
    return this.emitter.listeners(intent as string) as ((payload: IM[K]) => CRDTResult | Promise<CRDTResult>)[]
  }
}

export class BasicPluginContext<IM extends IntentMap>
  implements PluginContext<IM>
{
  constructor(readonly id: string, private readonly bus: PluginBus<IM>) {}

  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void {
    this.bus.on(intent, cb)
  }

  intent<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult[]> {
    return this.bus.emit(intent, payload)
  }
}
