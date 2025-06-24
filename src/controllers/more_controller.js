import { Controller } from "@hotwired/stimulus"
import { useResize } from 'stimulus-use'

function elementOffsetRight(element) {
  const rect = element.getBoundingClientRect();
  return element.offsetLeft + rect.width;
}

function elementOffsetLeft(element) {
  return element.offsetLeft;
}

function elementWidth(element) {
  const rect = element.getBoundingClientRect();
  return rect.width;
}

// 一个简单的 more 控制器，用于处理节点的折叠和展开
// 使用方法：
// 1. 在需要折叠的节点外层包裹一个容器，然后在容器上添加 data-controller="more"。
// 2. 在容器上添加 data-more-target="container"。
// 3. 在容器内部添加需要折叠的节点，这些节点会被移动到下拉菜单中。
// 4. 在容器内部添加一个按钮，用于展示下拉菜单，然后在按钮上添加 data-more-target="button"。
// 5. 在容器内部添加一个下拉菜单，用于存放被折叠的节点，然后在下拉菜单上添加 data-more-target="dropdown"。
// 6. 在容器上添加 data-more-hidden-class="hidden"，用于指定隐藏按钮的类名。
export default class extends Controller {
  static targets = ["container", "button", "dropdown"]
  static classes = ["hidden"]

  initialize(){
    this.foldedNodes = []
  }

  connect() {
    this.nodes = Array.from(this.container.children);
    useResize(this, { element: this.containerTarget, dispatchEvent: false });
  }

  resize({ width }) {
    if(this.resizing) {
      this.queuedResize = width;
      return;
    }
    if(this.containerWidth == width) return;

    this.resizing = true;
    // console.log('resizing...', width)

    if(this.containerWidth == undefined || this.containerWidth > width) {
      this.#fold()
    }else{
      this.#expand()
    }

    this.containerWidth = width;
    this.resizing = false;

    // 确保最后一次 resize 事件被执行
    if(this.queuedResize != undefined){
      console.log('process queued resize...')
      if(this.queuedResize < width){
        this.#fold()
      }else{
        this.#expand()
      }
      this.queuedResize = undefined;
    }
  }

  #fold() {
    if(this.folding) return;
    if(this.container.children.length < 2) return;

    this.folding = true;
    // console.log('fold...')

    let moved = false;

    for(let index = this.container.children.length - 1; index >= 1; index--) {
      const node = this.container.children[index];
      const leftNode = this.container.children[index - 1];

      if(elementWidth(node) == 0) continue; // 如果节点宽度为 0，说明节点是隐藏的，不需要处理

      if(elementOffsetLeft(node) < elementOffsetRight(leftNode)) {
        console.log('node', index, 'offsetLeft', elementOffsetLeft(node), 'leftNodeOffsetRight', elementOffsetRight(leftNode), node);
        moved = true
        if(this.#isMoreButton(node)) {
          this.#moveChildToMore(leftNode);
        }else{
          // 如果发现他左边的节点跑到了右边，就说明这是一个换行点。
          for(let j = this.container.children.length - 2; j >= index; j--) {
            this.#moveChildToMore(this.container.children[j]);
          }
        }
      }
    }
    this.folding = false;
    if(moved) {
      console.log('moved, fold again...')
      this.#fold(); // 递归调用，检查移动的节点是否有足够空间让 more 按钮回到上一行
    }
  }

  #expand() {
    if(this.expanding) return;
    if(this.dropdownTarget.children.length == 0) return;
    this.expanding = true;
    console.log('expand...')

    let moved = false;

    const lastContainerChild = this.container.children[this.container.children.length - 1];
    const firstDropdownChild = this.dropdownTarget.children[0];
    if(elementOffsetRight(lastContainerChild) + elementWidth(firstDropdownChild) < this.container.offsetWidth) {
      moved = true;
      this.#moveBackToContainer(firstDropdownChild);
    }

    this.expanding = false;

    if(moved) {
      console.log('moved, expand again...')
      this.#expand(); // 递归调用，检查移动的节点是否有因为 margin 原因导致换行.
    }
  }

  #moveChildToMore(node) {
    console.log('move node to more', node)
    this.dropdownTarget.prepend(node);
    this.buttonTarget.classList.remove(...this.hiddenClasses);
  }

  #moveBackToContainer(node) {
    console.log('move back to container', node)
    this.containerTarget.insertBefore(node, this.buttonTarget);
    if(this.dropdownTarget.children.length == 0) {
      this.buttonTarget.classList.add(...this.hiddenClasses);
    }
  }

  #isMoreButton(element){
    return element == this.buttonTarget;
  }

  get container() {
    return this.containerTarget || this.element;
  }
}
