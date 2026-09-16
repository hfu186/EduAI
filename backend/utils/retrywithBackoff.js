const retryWithBackoff = async (
  fn,
  retries = 3,
  initialDelay = 1000
) => {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(
              typeof error === "string"
                ? error
                : "Unknown AI request error"
            );

      console.error(
        `[AI RETRY] Attempt ${attempt + 1}/${retries}`
      );

      console.error("[AI RETRY] Error:", {
        message: lastError.message,
        name: lastError.name,
        status: lastError.status,
        code: lastError.code,
        type: lastError.type,
      });

      if (attempt === retries - 1) {
        throw lastError;
      }

      const delay = initialDelay * Math.pow(2, attempt);

      console.log(
        `AI request failed. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError || new Error("AI request failed.");
};

module.exports = retryWithBackoff;