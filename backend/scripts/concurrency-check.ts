// scripts/concurrency-check.ts
const baseUrl = process.env.API_URL ?? "http://localhost:4000";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`); // fixed: backticks
  }
  return value;
}

async function main(): Promise<void> {
  const token = requireEnv("CUSTOMER_TOKEN");
  const body = JSON.stringify({
    providerSlug: requireEnv("PROVIDER_SLUG"),
    serviceId: requireEnv("SERVICE_ID"),
    startTime: requireEnv("START_TIME"),
  });
  const attempts = Number(process.env.ATTEMPTS ?? 20);

  const responses = await Promise.all(
    Array.from({ length: attempts }, () =>
      fetch(`${baseUrl}/api/bookings`, {
        // fixed: backticks
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // fixed: backticks
        },
        body,
      }),
    ),
  );

  const statusCounts: Record<string, number> = {};
  for (const response of responses) {
    statusCounts[response.status] = (statusCounts[response.status] ?? 0) + 1;
  }
  console.table(statusCounts);

  if (statusCounts["201"] !== 1) {
    console.error(
      `Expected exactly 1 created booking, got ${statusCounts["201"] ?? 0}`,
    ); // fixed: backticks
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
