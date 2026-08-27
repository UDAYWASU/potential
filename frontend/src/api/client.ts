const API_URL =
  import.meta.env.VITE_API_URL;

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        credentials: "include",

        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
    );

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string"
          ? data.detail
          : "Something went wrong.";

      const error = new Error(
        message,
      ) as ApiError;

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data as T;

  } catch (error) {

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please try again later.",
      );
    }

    throw error;
  }
}