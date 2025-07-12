import type { Plugin } from '@mobilevscode/plugin-sdk';

export const plugin: Plugin = {
    id: '<%= id %>',
    version: '0.1.0',
    capabilities: [],
    init(bus, ctx) {
        console.log(`Plugin '<%= id %>' initialized!`);
    }
};
