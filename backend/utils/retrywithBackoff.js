const retryWithBackoff = async (
  fn,
  retries = 3,
  initialDelay = 1000
) => {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries - 1) {
        throw lastError;
      }

      const delay =
        initialDelay * Math.pow(2, attempt);

      console.log(
        `AI request failed. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
};

module.exports = retryWithBackoff;
