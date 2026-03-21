import { describe, it, expect } from "vitest";
import nodemailer from "nodemailer";

describe("Gmail credentials validation", () => {
  it("should validate Gmail SMTP credentials", async () => {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_PASSWORD;

    expect(gmailUser).toBeDefined();
    expect(gmailPassword).toBeDefined();

    // Create transporter with Gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // Verify connection
    try {
      await transporter.verify();
      expect(true).toBe(true);
    } catch (error) {
      console.error("Gmail verification failed:", error);
      throw new Error("Gmail credentials are invalid");
    }
  });
});
