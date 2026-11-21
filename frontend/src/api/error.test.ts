import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const response = { status, data } as AxiosResponse;
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    response,
  );
}

describe("getErrorMessage", () => {
  it("returns the API error message", () => {
    expect(
      getErrorMessage(
        axiosErrorWithResponse(404, { error: "Provider not found" }),
      ),
    ).toBe("Provider not found");
  });

  it("reports an unreachable server when there is no response", () => {
    expect(
      getErrorMessage(new AxiosError("Network Error", "ERR_NETWORK")),
    ).toBe("Cannot reach the server. Check your connection.");
  });

  it("falls back for unexpected bodies and non-HTTP errors", () => {
    const fallback = "Something went wrong. Please try again.";
    expect(getErrorMessage(axiosErrorWithResponse(500, "<html>"))).toBe(
      fallback,
    );
    expect(getErrorMessage(new Error("boom"))).toBe(fallback);
  });
});
