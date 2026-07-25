/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TextDirectionValue } from "./TextDirectionCommand";
import { textDirectionIcon, rtlIcon, ltrIcon } from "./TextDirectionIcons";

const DIRECTIONS: Array<{ value: TextDirectionValue; label: string; icon: string }> = [
  { value: "rtl", label: "RTL – Right to Left", icon: rtlIcon },
  { value: "ltr", label: "LTR – Left to Right", icon: ltrIcon },
];

type UIDeps = {
  PluginBase: any;
  Collection: any;
  ViewModel: any;
  createDropdown: any;
  addListToDropdown: any;
};

/**
 * Toolbar dropdown for the `textDirection` command, built with the same createDropdown /
 * addListToDropdown helpers CKEditor's own built-in dropdowns (e.g. Heading) use - which is
 * what gives the RTL/LTR list items keyboard navigation (arrows/Enter/Space/Escape), a
 * `role="menu"` container and the active-item checkmark for free.
 *
 * All CKEditor runtime classes/helpers are threaded in as `deps` rather than imported directly;
 * see TextDirectionCommand.ts for why.
 */
export const createTextDirectionUI = ({ PluginBase, Collection, ViewModel, createDropdown, addListToDropdown }: UIDeps) => {
  return class TextDirectionUI extends PluginBase {
    static get pluginName() {
      return "TextDirectionUI" as const;
    }

    init(): void {
      const editor = this.editor;
      const t = editor.t;

      editor.ui.componentFactory.add("textDirection", (locale: any) => {
        const command = editor.commands.get("textDirection");
        const dropdownView = createDropdown(locale);

        dropdownView.buttonView.set({
          label: t("Text Direction Options"),
          tooltip: true,
          icon: textDirectionIcon,
          ariaLabel: t("Text Direction Options"),
        });
        // `createDropdown` already binds buttonView.isEnabled/isOn (to the dropdown's own
        // isEnabled/isOpen state) - rebinding either here throws CKEditor's
        // "observable-bind-rebind" error. Follow the same pattern as CKEditor's own Alignment
        // dropdown: bind isEnabled on the dropdownView itself, and reflect the active direction
        // via the icon instead of isOn.
        dropdownView.bind("isEnabled").to(command, "isEnabled");
        dropdownView.buttonView.bind("icon").to(command, "value", (value: TextDirectionValue) =>
          value === "rtl" ? rtlIcon : value === "ltr" ? ltrIcon : textDirectionIcon
        );

        const itemDefinitions = new Collection();
        for (const direction of DIRECTIONS) {
          const itemModel = new ViewModel({
            value: direction.value,
            label: direction.label,
            icon: direction.icon,
            withText: true,
            role: "menuitemradio",
          });
          itemModel.bind("isOn").to(command, "value", (value: TextDirectionValue) => value === direction.value);
          itemDefinitions.add({ type: "button", model: itemModel });
        }

        addListToDropdown(dropdownView, itemDefinitions, {
          ariaLabel: t("Text Direction Options"),
          role: "menu",
        });

        this.listenTo(dropdownView, "execute", (evt: any) => {
          const value = evt.source.value as TextDirectionValue;
          editor.execute("textDirection", { value });
          editor.editing.view.focus();
        });

        return dropdownView;
      });
    }
  };
};
