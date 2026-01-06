/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js on server startup
 * to initialize OpenTelemetry for distributed tracing and metrics.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://vercel.com/docs/observability/otel-overview
 */

export async function register() {
  // Only register OpenTelemetry in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel');

    registerOTel({
      serviceName: 'fly-fleet-api',
      // Automatically exports to Vercel's built-in observability
      // Can also export to external providers like Honeycomb, Datadog, etc.
    });

    console.log('✅ OpenTelemetry instrumentation registered for fly-fleet-api');
  }
}
