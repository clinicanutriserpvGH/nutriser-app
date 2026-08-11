import { describe, expect, it } from "vitest";
import {
  MOBILE_REDIRECT_URL,
  isMobileOrTablet,
  shouldRedirectMobileRequest,
} from "./_core/deviceRedirect";

const IPHONE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD_USER_AGENT =
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID_TABLET_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";
const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";

describe("mobile and tablet redirect", () => {
  it("uses the Nutriser health portal as the redirect destination", () => {
    expect(MOBILE_REDIRECT_URL).toBe("https://portaldesaludnutriser.club");
  });

  it.each([
    ["iPhone", IPHONE_USER_AGENT],
    ["iPad", IPAD_USER_AGENT],
    ["Android tablet", ANDROID_TABLET_USER_AGENT],
  ])("detects %s as a mobile or tablet device", (_device, userAgent) => {
    expect(isMobileOrTablet({ userAgent })).toBe(true);
  });

  it("detects a mobile client hint even when the user agent is ambiguous", () => {
    expect(
      isMobileOrTablet({
        userAgent: DESKTOP_USER_AGENT,
        secChUaMobile: "?1",
      }),
    ).toBe(true);
  });

  it("does not detect desktop as mobile or tablet", () => {
    expect(isMobileOrTablet({ userAgent: DESKTOP_USER_AGENT })).toBe(false);
  });

  it("redirects a mobile homepage request", () => {
    expect(
      shouldRedirectMobileRequest({
        userAgent: IPHONE_USER_AGENT,
        path: "/",
      }),
    ).toBe(true);
  });

  it("does not redirect desktop homepage requests", () => {
    expect(
      shouldRedirectMobileRequest({
        userAgent: DESKTOP_USER_AGENT,
        path: "/",
      }),
    ).toBe(false);
  });

  it("does not redirect API or static asset requests", () => {
    for (const path of ["/api/trpc", "//api/trpc", "/manus-storage/logo.png", "/assets/main.js"]) {
      expect(
        shouldRedirectMobileRequest({
          userAgent: IPHONE_USER_AGENT,
          path,
        }),
      ).toBe(false);
    }
  });
});
