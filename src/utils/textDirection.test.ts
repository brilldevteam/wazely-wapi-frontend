import { describe, it, expect } from "vitest";
import { RLM, LRM, applyDirectionMarksToHtml, plainTextToDirectionalHtml, stripDirectionMarks } from "./textDirection";

describe("applyDirectionMarksToHtml", () => {
  it("prepends RLM to a single RTL paragraph", () => {
    const html = '<p dir="rtl" style="text-align:right">مرحبا بكم</p>';
    expect(applyDirectionMarksToHtml(html)).toBe(`<p dir="rtl" style="text-align:right">${RLM}مرحبا بكم</p>`);
  });

  it("marks an LTR paragraph with LRM even with no sibling RTL block present", () => {
    const html = '<p dir="ltr" style="text-align:left">Hello</p>';
    expect(applyDirectionMarksToHtml(html)).toBe(`<p dir="ltr" style="text-align:left">${LRM}Hello</p>`);
  });

  it("marks LTR paragraphs with LRM when the message also has an RTL block (mixed Arabic/English)", () => {
    const html = '<p dir="rtl" style="text-align:right">مرحبا</p><p dir="ltr" style="text-align:left">Hello</p>';
    const result = applyDirectionMarksToHtml(html);
    expect(result).toContain(`${RLM}مرحبا`);
    expect(result).toContain(`${LRM}Hello`);
  });

  it("marks an all-Arabic message explicitly switched to LTR, so dir=auto renderers don't fall back to RTL from the Arabic characters themselves", () => {
    const html = '<p dir="ltr" style="text-align:left">مرحبا بكم</p>';
    expect(applyDirectionMarksToHtml(html)).toBe(`<p dir="ltr" style="text-align:left">${LRM}مرحبا بكم</p>`);
  });

  it("applies direction independently to multiple selected/marked blocks", () => {
    const html = '<p dir="rtl">اختبار واحد</p><p dir="rtl">اختبار اثنين</p>';
    const result = applyDirectionMarksToHtml(html);
    const matches = result.match(new RegExp(RLM, "g"));
    expect(matches).toHaveLength(2);
  });

  it("leaves plain content (no dir attributes) completely untouched - existing campaigns unaffected", () => {
    const html = "<p>Just a normal message with no direction set.</p>";
    expect(applyDirectionMarksToHtml(html)).toBe(html);
  });

  it("does not corrupt bold text, links, or other inline formatting inside a directional block", () => {
    const html = '<p dir="rtl" style="text-align:right"><strong>مرحبا</strong> <a href="https://example.com">رابط</a></p>';
    const result = applyDirectionMarksToHtml(html);
    expect(result).toBe(`<p dir="rtl" style="text-align:right">${RLM}<strong>مرحبا</strong> <a href="https://example.com">رابط</a></p>`);
  });

  it("does not corrupt variables such as {{1}}", () => {
    const html = '<p dir="rtl" style="text-align:right">مرحبا {{1}}، شكرا لك</p>';
    const result = applyDirectionMarksToHtml(html);
    expect(result).toContain("{{1}}");
    expect(result).toBe(`<p dir="rtl" style="text-align:right">${RLM}مرحبا {{1}}، شكرا لك</p>`);
  });

  it("does not corrupt numbers, punctuation, or phone numbers in an RTL block", () => {
    const html = '<p dir="rtl" style="text-align:right">اتصل بنا على +974 1234 5678!</p>';
    const result = applyDirectionMarksToHtml(html);
    expect(result).toContain("+974 1234 5678!");
  });

  it("does not double up the mark if applied twice (idempotent)", () => {
    const html = '<p dir="rtl" style="text-align:right">مرحبا</p>';
    const once = applyDirectionMarksToHtml(html);
    const twice = applyDirectionMarksToHtml(once);
    expect(twice).toBe(once);
  });
});

describe("plainTextToDirectionalHtml", () => {
  it("restores a single RTL paragraph from a leading RLM mark", () => {
    const text = `${RLM}مرحبا بكم`;
    expect(plainTextToDirectionalHtml(text)).toBe('<p dir="rtl" style="text-align:right">مرحبا بكم</p>');
  });

  it("restores a single LTR paragraph from a leading LRM mark", () => {
    const text = `${LRM}Hello there`;
    expect(plainTextToDirectionalHtml(text)).toBe('<p dir="ltr" style="text-align:left">Hello there</p>');
  });

  it("restores direction independently per paragraph when it differs between blocks", () => {
    const text = `${RLM}مرحبا بكم\n\n${LRM}Hello there`;
    const html = plainTextToDirectionalHtml(text);
    expect(html).toBe('<p dir="rtl" style="text-align:right">مرحبا بكم</p><p dir="ltr" style="text-align:left">Hello there</p>');
  });

  it("leaves content with no direction marks completely untouched (backward compatibility)", () => {
    const text = "Just a plain saved template with **bold** markdown-ish text.\n\nAnd a second line.";
    expect(plainTextToDirectionalHtml(text)).toBe(text);
  });

  it("leaves an empty string untouched", () => {
    expect(plainTextToDirectionalHtml("")).toBe("");
  });

  it("escapes HTML-significant characters so reconstructed markup stays valid", () => {
    const text = `${RLM}Price < 5 & > 2`;
    const html = plainTextToDirectionalHtml(text);
    expect(html).toBe('<p dir="rtl" style="text-align:right">Price &lt; 5 &amp; &gt; 2</p>');
  });

  it("round-trips through applyDirectionMarksToHtml -> plain text -> plainTextToDirectionalHtml", () => {
    const original = '<p dir="rtl" style="text-align:right">مرحبا {{1}}</p><p dir="ltr" style="text-align:left">Thanks, {{2}}</p>';
    const marked = applyDirectionMarksToHtml(original);
    // Simulate what Turndown does to consecutive <p> blocks: extract text, blank-line separated.
    const plain = marked
      .replace(/<\/p><p[^>]*>/g, "\n\n")
      .replace(/<\/?p[^>]*>/g, "");
    const restored = plainTextToDirectionalHtml(plain);
    expect(restored).toBe('<p dir="rtl" style="text-align:right">مرحبا {{1}}</p><p dir="ltr" style="text-align:left">Thanks, {{2}}</p>');
  });
});

describe("stripDirectionMarks", () => {
  it("removes RLM and LRM marks without touching surrounding text", () => {
    const text = `${RLM}مرحبا ${LRM}Hello`;
    expect(stripDirectionMarks(text)).toBe("مرحبا Hello");
  });

  it("removes all occurrences, not just the first", () => {
    const text = `${RLM}one${RLM}two${LRM}three`;
    expect(stripDirectionMarks(text)).toBe("onetwothree");
  });

  it("is a no-op on text with no marks", () => {
    const text = "Nothing special here, {{1}} and https://example.com";
    expect(stripDirectionMarks(text)).toBe(text);
  });

  it("supports measuring character count the same way the 1600-char counter does, unaffected by marks", () => {
    const withMark = `${RLM}مرحبا`;
    const plain = "مرحبا";
    expect(stripDirectionMarks(withMark).length).toBe(plain.length);
  });
});
