import { Controller } from "@hotwired/stimulus";
import { renderUrl } from "./renderUrl";
import { get as HTTPGet } from "@rails/request.js";

export default class extends Controller {
  static values = { id: String };

  async idValueChanged() {
    switch (this.type) {
      case "image":
        if (this.idValue) {
          this.element.src = await this.#buildUrl();
        } else {
          this.element.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='12' height='12' fill='rgba(173,184,194,0.63)'%3E%3Cpath d='M5 11.1005L7 9.1005L12.5 14.6005L16 11.1005L19 14.1005V5H5V11.1005ZM5 13.9289V19H8.1005L11.0858 16.0147L7 11.9289L5 13.9289ZM10.9289 19H19V16.9289L16 13.9289L10.9289 19ZM4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10Z'%3E%3C/path%3E%3C/svg%3E";
        }
        break;
      case "video":
        if (this.idValue) {
          this.element.src = this.#buildUrl();
          this.element.setAttribute("controls", "controls");
          this.element.removeAttribute("poster");
        } else {
          this.element.pause();
          this.element.currentTime = 0;
          this.element.setAttribute(
            "poster",
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(173,184,194,0.63)'%3E%3Cpath d='M16 4C16.5523 4 17 4.44772 17 5V9.2L22.2133 5.55071C22.4395 5.39235 22.7513 5.44737 22.9096 5.6736C22.9684 5.75764 23 5.85774 23 5.96033V18.0397C23 18.3158 22.7761 18.5397 22.5 18.5397C22.3974 18.5397 22.2973 18.5081 22.2133 18.4493L17 14.8V19C17 19.5523 16.5523 20 16 20H2C1.44772 20 1 19.5523 1 19V5C1 4.44772 1.44772 4 2 4H16ZM15 6H3V18H15V6ZM8 8H10V11H13V13H9.999L10 16H8L7.999 13H5V11H8V8ZM21 8.84131L17 11.641V12.359L21 15.1587V8.84131Z'%3E%3C/path%3E%3C/svg%3E",
          );
          this.element.setAttribute("src", "");
          this.element.removeAttribute("controls");
        }
        break;
    }
  }

  // 如果是同步主版本，则通过 JSON 获取主板本的地址，否则直接返回 URL，这种做法修复了 dam/desk/entities/url#show 中 redirect_to 导致浏览器缓存无法
  // 传递 etag 和 last-modified 的问题，如果不这样做，会导致 DAM 主版本切换之后，用户不能马上在管理后台看到效果
  async #buildUrl() {
    const url = renderUrl(this.urlTemplate, Object.assign({}, this.params, { id: this.idValue, purpose: this.purpose, sync_main_version: this.syncMainVersion }));
    if (this.syncMainVersion) {
      const response = await HTTPGet(url, { responseKind: "json" });
      if (response.ok) {
        const data = await response.json;
        return data.url;
      }else{
        return "";
      }
    }else{
      return url;
    }
  }

  get type() {
    return this.data.get("type") || '';
  }

  get purpose() {
    return this.data.get("purpose") || '';
  }

  get syncMainVersion() {
    return this.data.get("sync-main-version") == "true";
  }

  get params() {
    try {
      return JSON.parse(this.data.get("params"));
    } catch {
      return {};
    }
  }

  get urlTemplate() {
    return this.data.get("template") || document.querySelector('meta[name="dam-url-template"]').getAttribute("content");
  }
}
