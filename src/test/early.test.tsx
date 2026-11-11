import { fireEvent, render, screen } from "@testing-library/react";
import { EarlyAccessDialog } from "@/site/EarlyAccess";
import { siteCopy } from "@/site/copy";

/*
 * The workspace isn't public yet: every screen of the app shows the early-access
 * note (src/site/EarlyAccess.tsx), while signing up and logging in work. The note
 * names the feature that was tried, names a signed-in student's account with a
 * way to log out, and both of its main buttons close it.
 */

describe("the early-access note", () => {
  it("says who may use Preplit AI now and names the feature that was tried", () => {
    render(<EarlyAccessDialog open feature="Course workspace" onClose={() => {}} />);
    const t = siteCopy.ko.early;
    expect(screen.getByRole("heading", { name: t.title, hidden: true })).toBeTruthy();
    expect(screen.getByText("Course workspace")).toBeTruthy();
    expect(screen.getByText(t.body)).toBeTruthy();
    expect(screen.queryByText(t.logout)).toBeNull();
  });

  it("closes from the main button and from the corner button", () => {
    const closed: string[] = [];
    render(<EarlyAccessDialog open onClose={() => closed.push("x")} />);
    const t = siteCopy.ko.early;
    fireEvent.click(screen.getByText(t.button));
    fireEvent.click(screen.getByLabelText(t.close));
    expect(closed).toHaveLength(2);
  });

  it("tells a signed-in student their account is kept, and lets them log out", () => {
    let loggedOut = false;
    render(<EarlyAccessDialog open account={{ email: "mina@gmail.com", onLogout: () => { loggedOut = true; } }} onClose={() => {}} />);
    const t = siteCopy.ko.early;
    expect(screen.getByText(t.signedIn)).toBeTruthy();
    expect(screen.getByText("mina@gmail.com")).toBeTruthy();
    fireEvent.click(screen.getByText(t.logout));
    expect(loggedOut).toBe(true);
  });

  it("has the same words in both languages", () => {
    expect(Object.keys(siteCopy.en.early)).toEqual(Object.keys(siteCopy.ko.early));
    expect(siteCopy.en.early.title).toBe("Developer Access Only");
  });
});
