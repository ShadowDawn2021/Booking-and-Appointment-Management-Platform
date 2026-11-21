import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
    ) {
      return data.error;
    }
    if (!error.response) {
      return "Cannot reach the server. Check your connection.";
    }
  }
  return "Something went wrong. Please try again.";
}
