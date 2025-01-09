const { Resource } = require("@opentelemetry/resources");
const { ConsoleMetricExporter, PeriodicExportingMetricReader, MeterProvider } = require("@opentelemetry/sdk-metrics");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");

// 1. Configure Resources
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'mock-otel-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

// 2. Set up Metrics
const metricExporter = new ConsoleMetricExporter(); // Export metrics to the console
const meterProvider = new MeterProvider({ resource });

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 5000, // Export metrics every 5 seconds
});

meterProvider.addMetricReader(metricReader);

// 3. Initialize the SDK
const sdk = new NodeSDK({
  resource,
});

// Start the SDK
sdk.start();

// 4. Generate Mock Metrics
const meter = meterProvider.getMeter('mock-meter');
const requestCount = meter.createCounter('requests', {
  description: 'Counts the number of requests',
});

// Use an ObservableGauge with a callback
meter.createObservableGauge('active_sessions', {
  description: 'Tracks active sessions',
}, (observableResult) => {
  // Set a random value for active sessions
  const activeSessionsValue = Math.floor(Math.random() * 50);
  observableResult.observe(activeSessionsValue, { route: '/home' });
});

setInterval(() => {
  requestCount.add(1, { route: '/home', status_code: 200 });
}, 1000); // Emit metrics every 1 second
