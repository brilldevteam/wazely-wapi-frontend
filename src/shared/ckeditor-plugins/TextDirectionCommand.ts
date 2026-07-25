/* eslint-disable @typescript-eslint/no-explicit-any */
export type TextDirectionValue = "ltr" | "rtl" | "";

// `Command` must be the exact runtime class from the dynamically-loaded `ckeditor5` module
// instance (see CkEditorInner.tsx) - a separate static `import { Command } from "ckeditor5"`
// here would risk re-introducing the "duplicated ckeditor5 modules" bundling error the app's
// dynamic-import setup was built to avoid. So this file exports a factory instead of a class.
export const createTextDirectionCommand = (CommandBase: any) => {
  return class TextDirectionCommand extends CommandBase {
    declare value: TextDirectionValue;

    constructor(...args: any[]) {
      super(...args);
    }

    refresh(): void {
      const model = this.editor.model;
      const firstBlock = model.document.selection.getSelectedBlocks().next().value;

      this.isEnabled = !!firstBlock && this._canHaveDirection(firstBlock);
      this.value = (this.isEnabled && firstBlock.getAttribute("direction")) || "";
    }

    execute(options: { value?: TextDirectionValue } = {}): void {
      const model = this.editor.model;
      const selectedBlocks = Array.from(model.document.selection.getSelectedBlocks()).filter((block: any) =>
        this._canHaveDirection(block)
      );

      // A message body is a single message, not a multi-section document: if the user only has
      // the cursor placed somewhere (the common case for a quick toolbar click) rather than
      // deliberately selecting multiple paragraphs, apply the direction to the whole message
      // instead of just the one paragraph the cursor happens to be in. An explicit multi-block
      // selection is still honored as-is, so mixed-direction messages (e.g. an Arabic paragraph
      // plus an English one) can still be set up on purpose.
      const blocks = selectedBlocks.length > 1 ? selectedBlocks : this._allBlocks();

      // Toggle off when re-applying the same direction, matching AlignmentCommand's behavior.
      const value = options.value === this.value ? "" : options.value;

      model.change((writer: any) => {
        for (const block of blocks) {
          if (value) {
            writer.setAttribute("direction", value, block);
          } else {
            writer.removeAttribute("direction", block);
          }
        }
      });
    }

    private _canHaveDirection(block: any): boolean {
      return this.editor.model.schema.checkAttribute(block, "direction");
    }

    private _allBlocks(): any[] {
      const root = this.editor.model.document.getRoot();
      return Array.from(root.getChildren()).filter((block: any) => this._canHaveDirection(block));
    }
  };
};
