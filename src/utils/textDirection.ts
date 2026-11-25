/**
 * Preserves per-block RTL/LTR direction through the plain-text pipeline WhatsApp templates
 * actually go through. CKEditor's HTML (with `dir`/`text-align`) only exists while editing -
 * the app converts it to plain text via Turndown before storing/sending to Meta, and Meta's
 * template bodies are plain UTF-8 text with no HTML support at all. So direction has to survive
 * as invisible Unicode bidi control characters embedded in the text itself, not as markup.
 *
 * RLM (Right-to-Left Mark, U+200F) / LRM (Left-to-Right Mark, U+200E) are exactly this: single
 * invisible characters that steer the Unicode Bidirectional Algorithm every text renderer
 * (browsers, WhatsApp clients, etc.) already implements, without altering the visible characters
 * or their logical order. Written as \u escapes below (rather than the literal invisible
 * characters) so they can't be silently dropped or duplicated by an editor/copy-paste.
 */

export const RLM = String.fromCharCode(0x200f);
export const LRM = String.fromCharCode(0x200e);

const DIRECTION_MARK_PATTERN = new RegExp(`[${LRM}${RLM}]`);
const DIRECTION_MARK_PATTERN_GLOBAL = new RegExp(`[${LRM}${RLM}]`, "g");

const BLOCK_SELECTOR = "[dir]";

/**
 * Given the CKEditor HTML, prepends RLM/LRM to the text content of every block that has an
 * explicit `dir="rtl"`/`dir="ltr"` attribute, so downstream plain-text extraction (Turndown, or
 * the live-preview's own tag-stripping) carries the direction forward automatically - the mark
 * becomes ordinary (invisible) text content, so no changes to Turndown's own conversion rules
 * are needed.
 *
 * Both directions are marked unconditionally (not just when the message is mixed RTL/LTR):
 * an `ltr` block whose own text is Arabic/Hebrew is still strongly RTL by Unicode bidi rules, so
 * a `dir="auto"` consumer (the live preview, WhatsApp's own client) would otherwise ignore the
 * user's explicit choice and render it RTL anyway - marking only mattered content, not sibling
 * blocks' directions.
 */
export const applyDirectionMarksToHtml = (html: string): string => {
  if (!html || typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const directionalBlocks = Array.from(doc.body.querySelectorAll(BLOCK_SELECTOR));
  if (directionalBlocks.length === 0) return html;

  for (const el of directionalBlocks) {
    const dir = el.getAttribute("dir");
    const mark = dir === "rtl" ? RLM : dir === "ltr" ? LRM : "";
    if (!mark || el.textContent?.startsWith(mark)) continue;
    el.insertBefore(doc.createTextNode(mark), el.firstChild);
  }

  return doc.body.innerHTML;
};

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The reverse direction: reconstructs `<p dir="...">` blocks from previously-saved plain text so
 * CKEditor restores each paragraph's direction on load. Only activates when the text actually
 * contains a direction mark - content saved before this feature existed (the vast majority of
 * templates) has none, and is returned completely untouched so existing campaigns keep loading
 * exactly as they did before this feature was added.
 */
export const plainTextToDirectionalHtml = (text: string): string => {
  if (!text || !DIRECTION_MARK_PATTERN.test(text)) return text;

  return text
    .split(/\n{2,}/)
    .map((block) => {
      let dir: "rtl" | "ltr" | null = null;
      let content = block;

      if (content.startsWith(RLM)) {
        dir = "rtl";
        content = content.slice(RLM.length);
      } else if (content.startsWith(LRM)) {
        dir = "ltr";
        content = content.slice(LRM.length);
      }

      const escaped = escapeHtml(content).replace(/\n/g, "<br>");
      return dir ? `<p dir="${dir}" style="text-align:${dir === "rtl" ? "right" : "left"}">${escaped}</p>` : `<p>${escaped}</p>`;
    })
    .join("");
};

/**
 * Restores direction on the `<p>` blocks that whatsAppToHtml() builds from saved WhatsApp text:
 * a block starting with RLM/LRM gets `dir` + `text-align` back (the same shape the CKEditor
 * TextDirection plugin upcasts) so each paragraph reopens in the editor with its chosen direction.
 * Like plainTextToDirectionalHtml, content without any direction mark is returned untouched.
 */
const MARKED_PARAGRAPH_PATTERN = new RegExp(`<p>([${LRM}${RLM}])`, "g");

export const restoreDirectionFromMarks = (html: string): string => {
  if (!html || !DIRECTION_MARK_PATTERN.test(html)) return html;

  return html.replace(MARKED_PARAGRAPH_PATTERN, (_match, mark: string) => {
    const dir = mark === RLM ? "rtl" : "ltr";
    return `<p dir="${dir}" style="text-align:${dir === "rtl" ? "right" : "left"}">`;
  });
};

/** Strips direction marks for contexts that must show/measure the literal message (e.g. the character counter). */
export const stripDirectionMarks = (text: string): string => text.replace(DIRECTION_MARK_PATTERN_GLOBAL, "");
