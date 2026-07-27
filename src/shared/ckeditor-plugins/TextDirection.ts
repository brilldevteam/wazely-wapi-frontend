/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTextDirectionEditing } from "./TextDirectionEditing";
import { createTextDirectionUI } from "./TextDirectionUI";

export type { TextDirectionValue } from "./TextDirectionCommand";

type PluginDeps = {
  Plugin: any;
  Command: any;
  Collection: any;
  ViewModel: any;
  createDropdown: any;
  addListToDropdown: any;
};

/**
 * Builds the `TextDirection` plugin using the exact runtime CKEditor classes/helpers from the
 * already dynamically-loaded `ckeditor5` module (see CkEditorInner.tsx's useEffect) - nothing in
 * this plugin directory does a top-level `import ... from "ckeditor5"`, to avoid re-introducing
 * the "duplicated ckeditor5 modules" bundling error the dynamic-import setup exists to prevent.
 */
export const createTextDirectionPlugin = ({ Plugin, Command, Collection, ViewModel, createDropdown, addListToDropdown }: PluginDeps) => {
  const TextDirectionEditing = createTextDirectionEditing(Plugin, Command);
  const TextDirectionUI = createTextDirectionUI({ PluginBase: Plugin, Collection, ViewModel, createDropdown, addListToDropdown });

  return class TextDirection extends Plugin {
    static get pluginName() {
      return "TextDirection" as const;
    }

    static get requires() {
      return [TextDirectionEditing, TextDirectionUI];
    }
  };
};
