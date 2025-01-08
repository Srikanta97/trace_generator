const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { MeterProvider, ConsoleMetricExporter, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Resource } = require('@opentelemetry/resources');

// 1. Configure Resources
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'mock-otel-app',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
});

// 2. Set up Tracing
const spanExporter = new ConsoleSpanExporter(); // Export traces to the console
const traceProcessor = new SimpleSpanProcessor(spanExporter);

// 3. Set up Metrics
const metricExporter = new ConsoleMetricExporter(); // Export metrics to the console
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000, // Export metrics every 5 seconds
});

// 4. Initialize the SDK
const sdk = new NodeSDK({
  resource,
  spanProcessor: traceProcessor,
  metricReader,
});

sdk.start().then(() => {
  console.log('OpenTelemetry SDK started');

  // 5. Generate Mock Traces
  const tracer = sdk.getTracerProvider().getTracer('mock-tracer');
  setInterval(() => {
    const span = tracer.startSpan('mock-operation');
    setTimeout(() => {
      span.end(); // End the span after a delay
    }, Math.random() * 1000);
  }, 2000); // Create a new span every 2 seconds

  // 6. Generate Mock Metrics
  const meter = new MeterProvider({ resource }).getMeter('mock-meter');
  const requestCount = meter.createCounter('requests', {
    description: 'Counts the number of requests',
  });
  const activeSessions = meter.createObservableGauge('active_sessions', {
    description: 'Tracks active sessions',
  });

  setInterval(() => {
    requestCount.add(1, { route: '/home', status_code: 200 });
    activeSessions.add(Math.floor(Math.random() * 50));
  }, 1000); // Emit metrics every 1 second
});
