/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { createTextDirectionCommand } from "./TextDirectionCommand";

/**
 * `createTextDirectionCommand` is a factory that extends the *real* CKEditor `Command` class at
 * runtime (see the file's own comment for why). For unit testing just this command's decision
 * logic, a minimal fake base class stands in - it only needs a constructor that captures
 * `editor`, since that's all TextDirectionCommand actually relies on from the base class.
 */
class FakeCommandBase {
  editor: any;
  isEnabled = true;
  value: unknown;
  constructor(editor: any) {
    this.editor = editor;
  }
}

type FakeBlock = { getAttribute: (key: string) => string | undefined };

/**
 * `selectedIndexes` models which blocks are actually within the user's selection - defaults to
 * "all of them" so existing tests that don't care about the selected/root distinction keep
 * working unchanged. `blocks` always represents every block in the document root, which the
 * command falls back to via `getRoot().getChildren()` when the selection isn't a deliberate
 * multi-block one.
 */
const createFakeEditor = (initialDirections: Array<string | undefined>, selectedIndexes?: number[]) => {
  const attrs = new Map<FakeBlock, string | undefined>();
  const blocks: FakeBlock[] = initialDirections.map((dir) => {
    const block: FakeBlock = { getAttribute: (key) => (key === "direction" ? attrs.get(block) : undefined) };
    attrs.set(block, dir);
    return block;
  });
  const selectedBlocks = selectedIndexes ? selectedIndexes.map((i) => blocks[i]) : blocks;

  return {
    blocks,
    model: {
      schema: { checkAttribute: () => true },
      document: {
        selection: { getSelectedBlocks: () => selectedBlocks[Symbol.iterator]() },
        getRoot: () => ({ getChildren: () => blocks }),
      },
      change: (cb: (writer: any) => void) => {
        cb({
          setAttribute: (_key: string, value: string, block: FakeBlock) => attrs.set(block, value),
          removeAttribute: (_key: string, block: FakeBlock) => attrs.set(block, undefined),
        });
      },
    },
  };
};

const TextDirectionCommand = createTextDirectionCommand(FakeCommandBase);

describe("TextDirectionCommand", () => {
  it("applies RTL to a single selected paragraph", () => {
    const editor = createFakeEditor([undefined]);
    const command = new TextDirectionCommand(editor);

    command.execute({ value: "rtl" });

    expect(editor.blocks[0].getAttribute("direction")).toBe("rtl");
  });

  it("applies LTR to a single selected paragraph", () => {
    const editor = createFakeEditor([undefined]);
    const command = new TextDirectionCommand(editor);

    command.execute({ value: "ltr" });

    expect(editor.blocks[0].getAttribute("direction")).toBe("ltr");
  });

  it("applies direction to every block when multiple blocks are selected", () => {
    const editor = createFakeEditor([undefined, undefined, undefined]);
    const command = new TextDirectionCommand(editor);

    command.execute({ value: "rtl" });

    for (const block of editor.blocks) {
      expect(block.getAttribute("direction")).toBe("rtl");
    }
  });

  it("applies direction to the whole document when only the cursor's block is selected (no deliberate multi-block selection)", () => {
    const editor = createFakeEditor([undefined, undefined, undefined, undefined], [1]);
    const command = new TextDirectionCommand(editor);

    command.execute({ value: "rtl" });

    for (const block of editor.blocks) {
      expect(block.getAttribute("direction")).toBe("rtl");
    }
  });

  it("scopes to just the selected blocks when the user deliberately selects more than one paragraph, leaving the rest untouched (mixed-direction messages)", () => {
    const editor = createFakeEditor([undefined, undefined, undefined, undefined, undefined], [1, 2]);
    const command = new TextDirectionCommand(editor);

    command.execute({ value: "rtl" });

    expect(editor.blocks[0].getAttribute("direction")).toBeUndefined();
    expect(editor.blocks[1].getAttribute("direction")).toBe("rtl");
    expect(editor.blocks[2].getAttribute("direction")).toBe("rtl");
    expect(editor.blocks[3].getAttribute("direction")).toBeUndefined();
    expect(editor.blocks[4].getAttribute("direction")).toBeUndefined();
  });

  it("switches an already-RTL block to LTR", () => {
    const editor = createFakeEditor(["rtl"]);
    const command = new TextDirectionCommand(editor);
    command.refresh();

    command.execute({ value: "ltr" });

    expect(editor.blocks[0].getAttribute("direction")).toBe("ltr");
  });

  it("switches an already-LTR block to RTL", () => {
    const editor = createFakeEditor(["ltr"]);
    const command = new TextDirectionCommand(editor);
    command.refresh();

    command.execute({ value: "rtl" });

    expect(editor.blocks[0].getAttribute("direction")).toBe("rtl");
  });

  it("toggles the direction off when the same value is applied again", () => {
    const editor = createFakeEditor(["rtl"]);
    const command = new TextDirectionCommand(editor);
    command.refresh();

    command.execute({ value: "rtl" });

    expect(editor.blocks[0].getAttribute("direction")).toBeUndefined();
  });

  it("refresh() reports the current block's direction as the command value", () => {
    const editor = createFakeEditor(["rtl"]);
    const command = new TextDirectionCommand(editor);

    command.refresh();

    expect(command.value).toBe("rtl");
  });

  it("refresh() reports an empty value when the block has no direction set", () => {
    const editor = createFakeEditor([undefined]);
    const command = new TextDirectionCommand(editor);

    command.refresh();

    expect(command.value).toBe("");
  });
});
