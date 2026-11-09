import { fireEvent, render, screen } from "@testing-library/react";
import { EarlyAccessDialog } from "@/site/EarlyAccess";
import { siteCopy } from "@/site/copy";

/*
 * Preplit AI isn't public yet: logging in, signing up and the app show the
 * early-access note (src/site/EarlyAccess.tsx). The note names the feature the
 * student tried, and both of its buttons close it.
 */

describe("the early-access note", () => {
  it("says who may use Preplit AI now and names the feature that was tried", () => {
    render(<EarlyAccessDialog open feature="Log in" onClose={() => {}} />);
    const t = siteCopy.ko.early;
    expect(screen.getByRole("heading", { name: t.title, hidden: true })).toBeTruthy();
    expect(screen.getByText("Log in")).toBeTruthy();
    expect(screen.getByText(t.body)).toBeTruthy();
  });

  it("closes from the main button and from the corner button", () => {
    const closed: string[] = [];
    render(<EarlyAccessDialog open onClose={() => closed.push("x")} />);
    const t = siteCopy.ko.early;
    fireEvent.click(screen.getByText(t.button));
    fireEvent.click(screen.getByLabelText(t.close));
    expect(closed).toHaveLength(2);
  });

  it("has the same words in both languages", () => {
    expect(Object.keys(siteCopy.en.early)).toEqual(Object.keys(siteCopy.ko.early));
    expect(siteCopy.en.early.title).toBe("Developer Access Only");
  });
});
