import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Google sign-in lifecycle", () => {
  let response: (value: { credential: string }) => void;
  const initialize = vi.fn((config: { callback: typeof response }) => { response = config.callback; });
  const renderButton = vi.fn();
  const disableAutoSelect = vi.fn();
  const prompt = vi.fn();
  const parent = () => ({ clientWidth: 500, replaceChildren: vi.fn() }) as unknown as HTMLElement;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test.apps.googleusercontent.com");
    vi.stubGlobal("window", { google: { accounts: { id: { initialize, renderButton, disableAutoSelect, prompt } } } });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("allows a second explicit sign-in after logout without invoking One Tap", async () => {
    const { renderGoogleSignInButton, disableGoogleAutoSignIn } = await import("./google-identity");
    const first = vi.fn();
    const second = vi.fn();
    const firstController = new AbortController();
    await renderGoogleSignInButton(parent(), first, firstController.signal);
    response({ credential: "first-id-token" });
    expect(first).toHaveBeenCalledWith("first-id-token");
    firstController.abort();
    disableGoogleAutoSignIn();
    response({ credential: "late-id-token" });
    expect(first).toHaveBeenCalledTimes(1);

    await renderGoogleSignInButton(parent(), second, new AbortController().signal);
    response({ credential: "second-id-token" });
    expect(second).toHaveBeenCalledWith("second-id-token");
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ auto_select: false, ux_mode: "popup" }));
    expect(renderButton).toHaveBeenCalledTimes(2);
    expect(disableAutoSelect).toHaveBeenCalledTimes(1);
    expect(prompt).not.toHaveBeenCalled();
  });

  it("ignores credentials after the login modal closes", async () => {
    const { renderGoogleSignInButton } = await import("./google-identity");
    const callback = vi.fn();
    const controller = new AbortController();
    const container = parent();
    await renderGoogleSignInButton(container, callback, controller.signal);
    controller.abort();
    response({ credential: "late-token" });
    expect(callback).not.toHaveBeenCalled();
    expect(container.replaceChildren).toHaveBeenCalledOnce();
  });

  it("does not render when the modal closes before SDK readiness", async () => {
    const { renderGoogleSignInButton } = await import("./google-identity");
    const controller = new AbortController();
    const task = renderGoogleSignInButton(parent(), vi.fn(), controller.signal);
    controller.abort();
    await task;
    expect(initialize).not.toHaveBeenCalled();
    expect(renderButton).not.toHaveBeenCalled();
  });

  it("reports missing configuration and tolerates logout without an SDK", async () => {
    const { renderGoogleSignInButton, disableGoogleAutoSignIn } = await import("./google-identity");
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "");
    await expect(renderGoogleSignInButton(parent(), vi.fn(), new AbortController().signal)).rejects.toThrow("설정");
    vi.stubGlobal("window", {});
    expect(() => disableGoogleAutoSignIn()).not.toThrow();
  });
});
