import { afterEach, describe, expect, it, vi } from "vitest";
import { ResendEmailSender } from "./resendEmailSender.js";

const message = {
  to: "client@test.com",
  subject: "Hello",
  text: "Plain",
  html: "<p>Rich</p>",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ResendEmailSender", () => {
  it("posts the message to Resend with bearer auth", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await new ResendEmailSender(
      "re_key",
      "Bookings <bookings@example.com>",
    ).send(message);

    const call = fetchSpy.mock.calls[0];
    expect(call?.[0]).toBe("https://api.resend.com/emails");
    expect(call?.[1]?.headers).toEqual({
      Authorization: "Bearer re_key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      from: "Bookings <bookings@example.com>",
      to: ["client@test.com"],
      subject: "Hello",
      text: "Plain",
      html: "<p>Rich</p>",
    });
  });

  it("throws with the status code when Resend rejects the request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("invalid key", { status: 401 }),
    );

    await expect(
      new ResendEmailSender("bad", "a@b.com").send(message),
    ).rejects.toThrow("401");
  });
});
