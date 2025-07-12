import { EventEmitter } from 'events'
import {
  PluginBus,
  PluginContext,
  IntentMap,
  CRDTResult,
} from './types'

export class InMemoryBus<IM extends IntentMap>
  implements PluginBus<IM, PluginContext<IM>>
{
  private readonly emitter = new EventEmitter()

  emit<K extends keyof IM>(intent: K, payload: IM[K]): void {
    this.emitter.emit(intent as string, payload)
  }

  on<K extends keyof IM>(intent: K, cb: (payload: IM[K]) => void): void {
    this.emitter.on(intent as string, cb as (payload: unknown) => void)
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
    this.bus.on(intent, cb as (payload: IM[K]) => void)
  }

  intent<K extends keyof IM>(intent: K, payload: IM[K]): Promise<CRDTResult> {
    this.bus.emit(intent, payload)
    return Promise.resolve({ success: true })
  }
}
