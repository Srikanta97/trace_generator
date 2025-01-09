const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');
const { trace, context } = require('@opentelemetry/api');

// 1. Configure Resources
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'mock-otel-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// 2. Set up Tracing
const spanExporter = new ConsoleSpanExporter(); // Export traces to the console
const traceProcessor = new SimpleSpanProcessor(spanExporter);

// 4. Initialize the SDK
const sdk = new NodeSDK({
  resource,
  spanProcessor: traceProcessor,
});

// Start the SDK
sdk.start();

console.log('OpenTelemetry SDK started');

// 5. Generate Mock Traces
const tracer = trace.getTracer('mock-tracer');

// Counter to track active spans
let activeSpanCount = 0;

function createSpanTree(parentSpan, level, maxLevels, childrenPerSpan) {
  if (level > maxLevels) {
    return;
  }

  // Use context.with to ensure the child spans inherit the parent span context
  context.with(trace.setSpan(context.active(), parentSpan), () => {
    for (let i = 1; i <= childrenPerSpan; i++) {
      activeSpanCount++; // Increment active span count

      const childSpan = tracer.startSpan(`level-${level}-span-${i}`);

      // Simulate work and recursively create child spans
      setTimeout(() => {
        createSpanTree(childSpan, level + 1, maxLevels, childrenPerSpan);

        // End the current span
        childSpan.end();
        activeSpanCount--; // Decrement active span count

        // Check if all spans are complete
        if (activeSpanCount === 0) {
          console.log("All spans completed. Ending root span...");
          rootSpan.end();
        }
      }, Math.random() * 1000);
    }
  });
}

// Start the root span and the tree structure
const rootSpan = tracer.startSpan('root-span');
activeSpanCount++; // Include the root span in the count
createSpanTree(rootSpan, 1, 4, 3); // 4 levels, each span having 3 children
