import { Controller } from "@hotwired/stimulus";
import { increaseMaxZIndex, decreaseMaxZIndex } from "./max-z-index"


export default class extends Controller {
  static targets = ["container", "button"];

  connect() {
    this.opened = false;
    this.styleBackup = {};
    this.#updateButtonText();
  }

  toggle(event) {
    this.opened ? this.close(event) : this.open(event);
  }

  open(event) {
    const { currentTarget: target } = event;

    this.#backupScrollPosition(target);

    document.body.classList.add("is-fullscreen");
    this.styleBackup = {
      position: this.#container.style.position,
      top: this.#container.style.top,
      left: this.#container.style.left,
      right: this.#container.style.right,
      bottom: this.#container.style.bottom,
      zIndex: this.#container.style.zIndex,
    };

    Object.assign(this.#container.style, {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: increaseMaxZIndex(),
    });

    this.#container.classList.add(...this.#classes);

    this.opened = true;
    this.#updateButtonText();
  }

  close(event) {
    Object.assign(this.#container.style, this.styleBackup);
    this.#container.classList.remove(...this.#classes);
    decreaseMaxZIndex();
    document.body.classList.remove("is-fullscreen");
    this.opened = false;
    this.#updateButtonText();
    this.#restoreScrollPosition();
  }

  #updateButtonText() {
    if (this.hasButtonTarget) {
      this.buttonTarget.textContent = this.opened ? this.#closeText : this.#openText;
    }
  }

  #backupScrollPosition(button) {
    let container = button.parentElement;
    while (container) {
      const style = window.getComputedStyle(container);
      if (style.overflow === "auto" || style.overflow === "scroll") {
        break;
      }
      container = container.parentElement;
    }

    if (container) {
      // 获取按钮相对于 overflow 容器的位置
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const relativeTop = buttonRect.top - containerRect.top + container.scrollTop;
      const relativeLeft = buttonRect.left - containerRect.left + container.scrollLeft;

      // 保存滚动条位置
      this.scrollPosition = { element: container, y: container.scrollTop, x: container.scrollLeft };
    }
  }

  #restoreScrollPosition() {
    if (this.scrollPosition?.element) {
      this.scrollPosition.element.scrollTop = this.scrollPosition.y;
      this.scrollPosition.element.scrollLeft = this.scrollPosition.x;
    }
  }

  get #container() {
    return this.hasContainerTarget ? this.containerTarget : this.element;
  }

  get #classes() {
    return (this.data.get("class") || "").split(" ");
  }

  get #openText() {
    return this.data.get("open-text");
  }

  get #closeText() {
    return this.data.get("close-text");
  }
}
