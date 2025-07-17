import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["button"]
  static values = {
    url: String
  }

  openDialog() {
    const url = this.urlValue
    if (!url) return;

    fetch(url)
      .then(response => response.text())
      .then(html => {
        // 创建弹窗
        debugger
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 2. 找到 toolbar 节点
        const toolbar = doc.querySelector('div[x-ref="toolbar"]');
        if (toolbar) {
          // 3. 找到页面上已有的 editor 节点
          const editor = doc.querySelector('div.editor.editing');
          if (editor) {
            debugger
            // 移除带有 data-fullscreen-target="button" 的 div
            const fullscreenDiv = editor.querySelector('button[data-fullscreen-target="button"]');
            if (fullscreenDiv) fullscreenDiv.remove();
            editor.appendChild(toolbar);
          }
        }

        const modal = document.querySelector("#headlessui-dialog");

        const header = doc.querySelector('header');
        if (header) {
          header.remove();
        }
        const dialog_content = doc.querySelector('#dialog_content');
        if (!modal.hasAttribute('class')) {
          modal.setAttribute('class', 'fixed inset-0 z-[100] custom-scrollbar-stronger overflow-y-auto overflow-x-hidden');
        }
        if (dialog_content) {
          modal.innerHTML = buildDialog(dialog_content.innerHTML);
        }else {
          modal.innerHTML = doc.body.innerHTML;
        }

        // 关闭事件
        modal.querySelectorAll('[data-action="click->dialog-fetch#closeDialog"]').forEach(btn => {
          btn.onclick = () => {
            modal.removeAttribute('class');
            modal.innerHTML = ""; // 清空内容
          };
        });
      })
      .catch(error => console.error("Error loading dialog content:", error));
  }

  closeDialog(event) {
    // 关闭弹窗
    const modal = this.modalTarget || event.target.closest('.modal'); // 你可以根据实际结构获取 modal
    if (modal) {
      modal.removeAttribute('class');
      modal.innerHTML = ""; // 清空内容
    }
  }
}

// 将 buildDialog 函数移到类外面，作为独立函数
function buildDialog(content) {
  return `
  <div class="overflow-hidden relative min-h-screen">
    <div class="w-full sm:flex sm:justify-center sm:pt-12">
      <div class="absolute inset-0 bg-opacity-40 backdrop-filter backdrop-blur-sm main-transition dark:bg-opacity-40 bg-gray-900/20 dark:bg-gray-900"
      id="headlessui-dialog-overlay-:rgt:"
      >
      </div>
      <div class="hidden sm:block">
        <div class="absolute top-1 right-1 p-1.5 rounded-lg border shadow-none cursor-pointer md:right-4 md:top-4 dropdown-background bg-white/40 hover:bg-white dark:bg-border/30 dark:hover:bg-border/70 main-transition"
          data-action="click->dialog-fetch#closeDialog"
          tabindex="-1" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="w-6 h-6 secondary-svg">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
            </svg>
          </div>
      </div>
      <div
        class="relative z-50 mx-0 w-full max-w-5xl bg-white opacity-100 transition-transform ease-in-out transform scale-100 dark:shadow darker-dropdown-background 2xl:mx-0 sm:mx-8 sm:my-10 sm:rounded-lg">
        <div class="mb-10 sm:hidden">
          <button
            class="p-1.5 fixed left-4 top-4 text-[11px] uppercase tracking-wide  dark:hover:bg-dark-accent bg-gray-50 dashboard-secondary dark:bg-border border-gray-50"><svg
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <div class="mx-auto min-w-0 max-w-7xl">
          <div class="relative">
            <div class="max-w-5xl h-full">
              ${content}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`
}
