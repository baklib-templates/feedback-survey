import { Controller } from "@hotwired/stimulus";
import Pickr from "@simonwep/pickr";

function updateElementColor(element, color, hideText) {
  if (hideText) {
    element.style.color = color.toHEXA();
  }else{
    if (color.s * color.a > 45 || (100 - color.v) * color.a > 45) {
      // dark
      element.style.color = "#FFFFFF";
    } else {
      element.style.color = "#000000";
    }
  }
  element.style.backgroundColor = color.toHEXA();
}

// 颜色选择器主动更新input的值，触发 change 事件，可以让其他控件监听到，比如 AplineJS
function updateInputValue(element, color) {
  old_value = element.value;
  new_value = color.toHEXA();
  element.value = new_value;
  if(old_value != new_value){
    element.dispatchEvent(new Event("change"));
  }
}

// <input data-controller="color-picker"/>
//    documentation: https://github.com/Simonwep/pickr
export default class extends Controller {
  static targets = ["trigger", "input"];
  initialize() {
    this.element[this.identifier] = this;
  }

  connect() {
    this.defaultValue = this.inputElement?.value;
    this.pickr = Pickr.create({
      el: this.dataWithDefault("el", this.triggerElement),
      container: this.dataWithDefault("container", "body"),
      theme: this.dataWithDefault("theme", "monolith"),
      closeOnScroll: this.dataWithDefault("closeOnScroll", true),
      appClass: this.dataWithDefault("appClass"),
      useAsButton: this.dataWithDefault("useAsButton", true),
      padding: this.dataWithDefault("padding", 8),
      inline: this.dataWithDefault("inline", false),
      autoReposition: this.dataWithDefault("autoReposition", true),
      sliders: this.dataWithDefault("sliders"),
      disabled: this.dataWithDefault("disabled", false),
      lockOpacity: this.dataWithDefault("lockOpacity", false),
      outputPrecision: this.dataWithDefault("outputPrecision", 0),
      comparison: this.dataWithDefault("comparison", true),
      default: this.dataWithDefault("default", this.inputElement?.value),
      swatches: this.data.has("swatches")
        ? this.data.get("swatches").split("|")
        : [
            "rgba(244, 67, 54, 1)",
            "rgba(233, 30, 99, 1)",
            "rgba(156, 39, 176, 1)",
            "rgba(103, 58, 183, 1)",
            "rgba(63, 81, 181, 1)",
            "rgba(33, 150, 243, 1)",
            "rgba(3, 169, 244, 1)",
            "rgba(0, 188, 212, 1)",
            "rgba(0, 150, 136, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(139, 195, 74, 1)",
            "rgba(205, 220, 57, 1)",
            "rgba(255, 235, 59, 1)",
            "rgba(255, 193, 7, 1)",
          ],
      defaultRepresentation: this.dataWithDefault(
        "defaultRepresentation",
        "HEX"
      ),
      showAlways: this.dataWithDefault("showAlways", false),
      closeWithKey: this.dataWithDefault("closeWithKey", "Escape"),
      position: this.dataWithDefault("position", "bottom-start"),
      adjustableNumbers: this.dataWithDefault("adjustableNumbers", true),
      components: {
        // Main components
        palette: this.dataWithDefault("componentsPalette", true),
        preview: this.dataWithDefault("componentsPreview", true),
        opacity: this.dataWithDefault("componentsOpacity", true),
        hue: this.dataWithDefault("componentsHue", true),

        // Input / output Options
        interaction: {
          hex: this.dataWithDefault("componentsInteractionHex", false),
          rgba: this.dataWithDefault("componentsInteractionRgba", false),
          hsla: this.dataWithDefault("componentsInteractionHsla", false),
          hsva: this.dataWithDefault("componentsInteractionHsva", false),
          cmyk: this.dataWithDefault("componentsInteractionCmyk", false),
          input: this.dataWithDefault("componentsInteractionInput", true),
          cancel: this.dataWithDefault("componentsInteractionCancel", true),
          clear: this.dataWithDefault("componentsInteractionClear", false),
          save: this.dataWithDefault("componentsInteractionSave", true),
        },
      },
      i18n: {
        // Strings visible in the UI
        "ui:dialog": this.dataWithDefault(
          "i18nUiDialog",
          "color picker dialog"
        ),
        "btn:toggle": this.dataWithDefault(
          "i18nUiToggle",
          "toggle color picker dialog"
        ),
        "btn:swatch": this.dataWithDefault("i18nBtnSwatch", "color swatch"),
        "btn:last-color": this.dataWithDefault(
          "i18nBtnLastColor",
          "use previous color"
        ),
        "btn:save": this.dataWithDefault("i18nBtnSave", "Save"),
        "btn:cancel": this.dataWithDefault("i18nBtnCancel", "Cancel"),
        "btn:clear": this.dataWithDefault("i18nBtnClear", "Clear"),

        // Strings used for aria-labels
        "aria:btn:save": this.dataWithDefault(
          "i18nAriaBtnSave",
          "save and close"
        ),
        "aria:btn:cancel": this.dataWithDefault(
          "i18nAriaBtnCancel",
          "cancel and close"
        ),
        "aria:btn:clear": this.dataWithDefault(
          "i18nAriaBtnClear",
          "clear and close"
        ),
        "aria:input": this.dataWithDefault(
          "i18nAriaInput",
          "color input field"
        ),
        "aria:palette": this.dataWithDefault(
          "i18nAriaPalette",
          "color selection area"
        ),
        "aria:hue": this.dataWithDefault("i18nAriaHue", "hue selection slider"),
        "aria:opacity": this.dataWithDefault(
          "i18nAriaOpacity",
          "selection slider"
        ),
      },
    });
    this.pickr.on("change", this.onChange.bind(this));
    this.pickr.on("save", this.onSave.bind(this));
    this.pickr.on("init", this.onInit.bind(this));
    this.pickr.on("show", this.onShow.bind(this));
    this.pickr.on("cancel", this.onCancel.bind(this));
  }

  disconnect() {
    if (this.pickr) {
      this.pickr.destroyAndRemove();
      this.pickr = null;
    }
  }

  get triggerElement() {
    return this.hasTriggerTarget ? this.triggerTarget : (this.inputElement || this.element);
  }

  get inputElement() {
    return this.hasInputTarget ? this.inputTarget : undefined;
  }

  dataWithDefault(attr, default_value) {
    return this.data.has(attr)
      ? default_value === true || default_value === false
        ? this.data.get(attr) === "true"
        : this.data.get(attr)
      : default_value;
  }

  onInit(instance) {
    const { result } = instance.getRoot().interaction;
    result.addEventListener(
      "keydown",
      (e) => {
        // Detect whever the user pressed "Enter" on their keyboard
        if (e.key === "Enter") {
          instance.applyColor(); // Save the currently selected color
          instance.hide(); // Hide modal
        }
      },
      { capture: true }
    );

    this.dispatch("init", { detail: instance._color });
  }

  onShow(instance){
    this.pickr.setColor(this.inputElement?.value,true)
    this.dispatch("show", { detail: instance._color });
  }

  onCancel(instance) {
    if (!this.pickr.options.inline) this.pickr.hide();
    this.dispatch("change", { detail: instance._color });
  }

  onChange(color) {
    this.dispatch("change", { detail: color });
  }

  onSave(color) {
    if (!this.pickr.options.inline) this.pickr.hide();
    this.dispatch("save", { detail: color });
  }

  // 当其他控件更新了 input value, 让 pickr 更新颜色
  applyColor(_event) {
    if(!this.inputElement) return;
    if(this.pickr.getColor().toHEXA() == this.inputElement.value) return;
    this.pickr.setColor(this.inputElement.value)
  }

  updateValue(event) {
    updateInputValue(this.inputElement, event.detail);
  }

  updateBackground(event) {
    updateElementColor(this.inputElement, event.detail, this.data.has("hideText"));
  }

  update(event) {
    this.updateValue(event);
    this.updateBackground(event);
  }
}
