"use client";

import { useState } from "react";

type AsyncFunction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

export default function useApiCall<TArgs extends unknown[], TResult>(
  apiFn: AsyncFunction<TArgs, TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const execute = async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFn(...args);
      setData(response);
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { loading, error, data, execute, reset };
}
