import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/lang";
import { ForgotPassword, Login, ResetPassword, Signup } from "@/pages/Auth";

/*
 * The sign-in pages: Google and "Forgot password?" appear only when the server
 * has them set up, sign-up with Google waits for the consent box, a Google
 * sign-in that came back with an error says what happened, and the reset page
 * needs its link's token.
 */

type Config = { inviteRequired: boolean; google: boolean; passwordReset: boolean };

const calls: string[] = [];

function serve(config: Config) {
  calls.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/api/auth/refresh")) return new Response(null, { status: 204 });
    if (url.endsWith("/api/auth/config")) return Response.json({ success: true, ...config });
    if (url.endsWith("/api/auth/password/forgot")) return Response.json({ success: true });
    return Response.json({ success: false, error: "NotFound" }, { status: 404 });
  }));
}

function page(node: ReactNode, path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <LangProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
          </AuthProvider>
        </LangProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

const ALL_ON: Config = { inviteRequired: false, google: true, passwordReset: true };
const ALL_OFF: Config = { inviteRequired: false, google: false, passwordReset: false };

beforeEach(() => {
  window.localStorage.setItem("jb_lang", "en");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("log in", () => {
  it("offers Google and Forgot password when the server has them", async () => {
    serve(ALL_ON);
    page(<Login />, "/login");
    const google = await screen.findByRole("link", { name: "Continue with Google" });
    expect(google).toHaveAttribute("href", "/api/auth/google/start?intent=login&next=%2Fworkspace");
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
  });

  it("shows neither when the server has not set them up", async () => {
    serve(ALL_OFF);
    page(<Login />, "/login");
    await waitFor(() => expect(calls.some((u) => u.endsWith("/api/auth/config"))).toBe(true));
    await screen.findByRole("button", { name: "Log in" });
    expect(screen.queryByText("Continue with Google")).toBeNull();
    expect(screen.queryByText("Forgot password?")).toBeNull();
  });

  it("says what happened when a Google sign-in came back without finishing", async () => {
    serve(ALL_ON);
    page(<Login />, "/login?error=GoogleCancelled");
    expect(await screen.findByRole("alert")).toHaveTextContent("Google sign-in was cancelled.");
  });
});

describe("sign up", () => {
  it("does not start Google until the consent box is ticked", async () => {
    serve(ALL_ON);
    page(<Signup />, "/signup");
    fireEvent.click(await screen.findByRole("button", { name: "Continue with Google" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Tick the privacy notice box first.");
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("explains that an unknown Google account is made here, after the consent box", async () => {
    serve(ALL_ON);
    page(<Signup />, "/signup?error=GoogleNoAccount");
    expect(await screen.findByRole("alert")).toHaveTextContent("No account uses that Google account yet.");
  });
});

describe("password reset", () => {
  it("sends the link and then says the same thing whether or not the address has an account", async () => {
    serve(ALL_ON);
    page(<ForgotPassword />, "/forgot-password");
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "mina@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Send the link" }));
    expect(await screen.findByRole("status")).toHaveTextContent("If an account uses that address, the link is on its way.");
  });

  it("asks for a new link when it was opened without its token", async () => {
    serve(ALL_ON);
    window.history.replaceState(null, "", "/reset-password");
    page(<ResetPassword />, "/reset-password");
    expect(await screen.findByRole("alert")).toHaveTextContent("This link is incomplete.");
    expect(screen.getByRole("link", { name: "Get a new link" })).toHaveAttribute("href", "/forgot-password");
  });

  it("reads the token from the fragment, clears it from the address bar, and checks the two passwords match", async () => {
    serve(ALL_ON);
    window.history.replaceState(null, "", `/reset-password#token=${"a".repeat(64)}`);
    page(<ResetPassword />, "/reset-password");
    expect(window.location.hash).toBe("");
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "first password" } });
    fireEvent.change(screen.getByLabelText("New password again"), { target: { value: "second password" } });
    fireEvent.click(screen.getByRole("button", { name: "Save the password" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The two passwords are not the same.");
    expect(calls.some((u) => u.endsWith("/api/auth/password/reset"))).toBe(false);
  });
});
