import { Controller } from "@hotwired/stimulus";

// 把 Element 停靠在另一个 Element 上方或下方
// 用法：
// <div data-controller="sticky" data-sticky-under-value="#header"></div>
// <div data-controller="sticky" data-sticky-above-value="#footer"></div>
export default class extends Controller {
  static values = {
    above: String,
    under: String,
    top: Number,
    stickedOffset: { type: Number, default: 0 },
  };

  initialize() {
    this._refreshTopValue = this._refreshTopValue.bind(this);
  }

  connect() {
    this.styleBackup = {
      position: this.element.style.position,
      top: this.element.style.top,
    };
    if (this.hasTopValue) {
      this.element.style.top = `${this.topValue}px`;
    } else {
      document.addEventListener("resize", this._refreshTopValue, { passive: true });
      document.addEventListener("scroll", this._refreshTopValue, { passive: true });
    }
    this.element.style.position = "sticky";
    this.started = true;
  }

  disconnect() {
    this.started = false;
    if (!this.hasTopValue) {
      document.removeEventListener("resize", this._refreshTopValue);
      document.removeEventListener("scroll", this._refreshTopValue);
    }
    Object.assign(this.element.style, this.styleBackup);
  }

  pause() {
    this.disconnect();
  }

  resume() {
    this.connect();
  }

  toggle() {
    this.started ? this.pause() : this.resume();
  }

  _refreshTopValue() {
    let top = 0;
    if (this.aboveElement) {
      const rect = this.aboveElement.getBoundingClientRect();
      top = rect.top;
    } else if (this.underElement) {
      const rect = this.underElement.getBoundingClientRect();
      top = rect.bottom;
    }
    this.element.style.top = `${top}px`;
    if (this.element.getBoundingClientRect().top <= top + this.stickedOffsetValue) {
      this.data.set("sticked", true);
    } else {
      this.data.delete("sticked");
    }
  }

  aboveValueChanged() {
    this.aboveElement = this.aboveValue && document.querySelector(this.aboveValue);
  }

  underValueChanged() {
    this.underElement = this.underValue && document.querySelector(this.underValue);
  }
}
