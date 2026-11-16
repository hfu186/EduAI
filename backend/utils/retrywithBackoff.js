const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, optionsOrRetries = {}, legacyDelay) => {
  const options =
    typeof optionsOrRetries === "number"
      ? { retries: optionsOrRetries, initialDelay: legacyDelay }
      : optionsOrRetries;

  const { retries = 3, initialDelay = 1000, label = "ai" } = options;
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(typeof error === "string" ? error : "Unknown AI request error");

      console.error(`[RETRY:${label}] Attempt ${attempt + 1}/${retries}:`, {
        message: lastError.message,
        name: lastError.name,
        status: lastError.status,
        code: lastError.code,
      });

      if (attempt === retries - 1) throw lastError;

      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`[RETRY:${label}] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error("AI request failed.");
};

module.exports = retryWithBackoff;