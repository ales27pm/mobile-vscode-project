/** Map of intent names to payload shapes */
export interface IntentMap {
  [intent: string]: unknown
}

/** A standard CRDT result */
export interface CRDTResult {
  success: boolean
  snapshot?: Uint8Array
}

/** The context passed into `init()` — typed by your IntentMap */
export interface PluginContext<IM extends IntentMap> {
  /** Your plugin’s ID */
  readonly id: string

  /**
   * Register a handler for a specific intent.
   * The callback payload type is extracted from your IM.
   */
  on<K extends keyof IM>(
    intent: K,
    cb: (payload: IM[K]) => CRDTResult | Promise<CRDTResult>,
  ): void

  /**
   * Fire an intent on the bus and get a CRDTResult back.
   * Return type can be specialized if you need.
   */
  sendIntent<K extends keyof IM>(
    intent: K,
    payload: IM[K],
  ): Promise<CRDTResult>
}

/** The bus your plugin uses to emit & listen */
export interface PluginBus<IM extends IntentMap> {
  emit<K extends keyof IM>(intent: K, payload: IM[K]): void
  on<K extends keyof IM>(intent: K, cb: (payload: IM[K]) => void): void
}

/** The core Plugin interface */
export interface Plugin<IM extends IntentMap> {
  /** Called once when your plugin is loaded */
  init(ctx: PluginContext<IM>): void
  /** The unique ID for your plugin */
  readonly id: string
}
