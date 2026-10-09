export function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  const timeoutError = new DOMException(`La operacion supero ${timeoutMs} ms.`, 'TimeoutError');
  const timer = setTimeout(() => controller.abort(timeoutError), timeoutMs);

  try {
    return await operation(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function retry(operation, { retries = 2, delayMs = 0, shouldRetry = () => true } = {}) {
  const totalAttempts = retries + 1;
  let lastError;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= totalAttempts || !shouldRetry(error)) throw error;
      if (delayMs > 0) await sleep(delayMs);
    }
  }

  throw lastError;
}

export async function loadDashboard(loaders) {
  const entries = Object.entries(loaders);
  const settled = await Promise.allSettled(entries.map(([, loader]) => loader()));
  const data = {};
  const errors = {};

  settled.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === 'fulfilled') data[key] = result.value;
    else errors[key] = result.reason;
  });

  return { data, errors };
}
