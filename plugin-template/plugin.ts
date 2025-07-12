export const plugin = {
    id: 'my-new-plugin',
    version: '0.1.0',
    capabilities: ['intent:hover'],
    init(bus, ctx) {
      console.log('My New Plugin Initialized!');
      bus.onIntent('hover', (intent) => {
        if (intent.target === 'hello') {
          bus.publishOutput({
            pluginId: this.id,
            docId: intent.docId,
            type: 'explanation',
            data: { text: 'This is a greeting!' }
          });
        }
      });
    }
  };
