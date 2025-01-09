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

// Create a parent span
const parentSpan = tracer.startSpan('parent-operation');

setInterval(() => {
  // Create a child span using the parent span context
  context.with(trace.setSpan(context.active(), parentSpan), () => {
    const span = tracer.startSpan('mock-operation');
    setTimeout(() => {
      span.end(); // End the span after a delay
    }, Math.random() * 1000);
  });
}, 2000); // Create a new span every 2 seconds

// End the parent span after some time (optional)
setTimeout(() => {
  parentSpan.end();
}, 10000); // End the parent span after 10 seconds
