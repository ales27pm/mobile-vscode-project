export interface PluginIntent {
    type: string;
    payload?: unknown;
    // Add more fields as needed to represent intent structure
}

export interface PluginBus {
    onIntent(intentType: string, callback: (intent: PluginIntent) => void): void;
    publishOutput(output: any): void;
}
export interface PluginContext {
    config: Record<string, any>;
    getCRDT(docId: string): any;
}
export interface Plugin {
    id: string;
    version: string;
    capabilities: string[];
    init(bus: PluginBus, ctx: PluginContext): void;
}
