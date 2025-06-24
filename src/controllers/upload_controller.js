import { Controller } from "@hotwired/stimulus";
import { DirectUpload } from "../active_storage/index";
import { post } from "@rails/request.js";
import { renderUrl } from "./renderUrl";


export default class extends Controller {
  static targets = ["fileInput", "preview", "hiddenField", "removeButton"];
  static values = {
    id: String,
    url: String,
    directUploadUrl: String
  };

  uploadFile() {
    const file = this.fileInputTarget.files[0];
    if (!file) return;
    // 初始化 DirectUpload 实例
    const directUpload = new DirectUpload(file, this.directUploadUrlValue);

    // 开始上传
    directUpload.create((error, attributes) => {
      if (error) {
        console.error("上传失败:", error.target.response.errors);
      } else {
        // 保存到dam资源
        const formData = new FormData();
        formData.append("uploads[file][]", attributes.signed_id);
        formData.append("uploads[purpose]", 'dynamic_form');
        post(this.urlValue, { body: formData }).then((res) => {
          if (res.ok) {
            res.json.then((data) => {
              const id = data[0].signed_id;
              this.hiddenFieldTarget.value = id; // 更新隐藏字段
              this.idValueChanged();
            });
          }
        });
      }
    });
  }

  idValueChanged() {
    const idValue = this.hiddenFieldTarget.value;
    this.removeButtonTarget.style.display = idValue ? "inline-block" : "none"; // 控制按钮显示
    switch (this.type) {
      case "image":
        if (idValue) {
          this.previewTarget.src = this.#buildUrl();
        } else {
          this.previewTarget.src =
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='12' height='12' fill='rgba(173,184,194,0.63)'%3E%3Cpath d='M5 11.1005L7 9.1005L12.5 14.6005L16 11.1005L19 14.1005V5H5V11.1005ZM5 13.9289V19H8.1005L11.0858 16.0147L7 11.9289L5 13.9289ZM10.9289 19H19V16.9289L16 13.9289L10.9289 19ZM4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10Z'%3E%3C/path%3E%3C/svg%3E";
        }
        break;
      case "video":
        if (idValue) {
          this.previewTarget.src = this.#buildUrl();
          this.previewTarget.setAttribute("controls", "controls");
          this.previewTarget.removeAttribute("poster");
        } else {
          this.previewTarget.pause();
          this.previewTarget.currentTime = 0;
          this.previewTarget.setAttribute(
            "poster",
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(173,184,194,0.63)'%3E%3Cpath d='M16 4C16.5523 4 17 4.44772 17 5V9.2L22.2133 5.55071C22.4395 5.39235 22.7513 5.44737 22.9096 5.6736C22.9684 5.75764 23 5.85774 23 5.96033V18.0397C23 18.3158 22.7761 18.5397 22.5 18.5397C22.3974 18.5397 22.2973 18.5081 22.2133 18.4493L17 14.8V19C17 19.5523 16.5523 20 16 20H2C1.44772 20 1 19.5523 1 19V5C1 4.44772 1.44772 4 2 4H16ZM15 6H3V18H15V6ZM8 8H10V11H13V13H9.999L10 16H8L7.999 13H5V11H8V8ZM21 8.84131L17 11.641V12.359L21 15.1587V8.84131Z'%3E%3C/path%3E%3C/svg%3E",
          );
          this.previewTarget.setAttribute("src", "");
          this.previewTarget.removeAttribute("controls");
        }
        break;
    }
  }

  removeFile() {
    this.hiddenFieldTarget.value = ""; // 清除隐藏字段的值
    this.idValueChanged();
  }

  get type() {
    return this.data.get("type");
  }

  get purpose() {
    return this.data.get("purpose");
  }

  get params() {
    try {
      return JSON.parse(this.data.get("params"));
    } catch {
      return {};
    }
  }

  get urlTemplate() {
    return document.querySelector('meta[name="dam-url-template"]').getAttribute("content");
  }

  #buildUrl() {
    return renderUrl(this.urlTemplate, Object.assign({}, this.params, { id: this.hiddenFieldTarget.value, purpose: this.purpose }));
  }
}
