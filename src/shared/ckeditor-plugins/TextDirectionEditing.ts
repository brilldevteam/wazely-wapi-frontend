/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTextDirectionCommand } from "./TextDirectionCommand";

/**
 * Registers the `direction` model attribute on every block ($block covers paragraph, heading,
 * list items, block quote content, etc.) and converts it to/from `dir="rtl|ltr"` +
 * `text-align: right|left` on the corresponding view element - the same shape CKEditor's own
 * Alignment feature uses for `alignment`/`text-align`, just paired with `dir` too so plain-text
 * extraction (Turndown) and any HTML consumer can detect direction without inspecting CSS.
 *
 * `PluginBase`/`CommandBase` are the exact runtime classes from the dynamically-loaded
 * `ckeditor5` module (see CkEditorInner.tsx) - see TextDirectionCommand.ts for why these can't
 * be normal top-level `import`s.
 */
export const createTextDirectionEditing = (PluginBase: any, CommandBase: any) => {
  const TextDirectionCommand = createTextDirectionCommand(CommandBase);

  return class TextDirectionEditing extends PluginBase {
    static get pluginName() {
      return "TextDirectionEditing" as const;
    }

    init(): void {
      const editor = this.editor;
      const schema = editor.model.schema;

      schema.extend("$block", { allowAttributes: "direction" });

      editor.conversion.for("upcast").attributeToAttribute({
        view: {
          key: "dir",
          value: /^(rtl|ltr)$/,
        },
        model: {
          key: "direction",
          value: (viewElement: any) => viewElement.getAttribute("dir"),
        },
      });

      // A single model attribute (`direction`) needs to produce TWO view attributes (`dir` and
      // `style="text-align:..."`). Registering two separate `attributeToAttribute()` calls for
      // the same model key doesn't work - the downcast dispatcher "consumes" the attribute change
      // on the first matching converter, so the second one silently never runs. Setting both view
      // attributes inside one raw converter avoids that.
      editor.conversion.for("downcast").add((dispatcher: any) => {
        dispatcher.on("attribute:direction", (evt: any, data: any, conversionApi: any) => {
          if (!conversionApi.consumable.consume(data.item, evt.name)) return;

          const viewElement = conversionApi.mapper.toViewElement(data.item);
          const viewWriter = conversionApi.writer;
          if (!viewElement) return;

          if (data.attributeNewValue === "rtl" || data.attributeNewValue === "ltr") {
            viewWriter.setAttribute("dir", data.attributeNewValue, viewElement);
            viewWriter.setStyle("text-align", data.attributeNewValue === "rtl" ? "right" : "left", viewElement);
          } else {
            viewWriter.removeAttribute("dir", viewElement);
            viewWriter.removeStyle("text-align", viewElement);
          }
        });
      });

      editor.commands.add("textDirection", new TextDirectionCommand(editor));
    }
  };
};
