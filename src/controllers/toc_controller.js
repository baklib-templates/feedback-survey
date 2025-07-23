import { Controller } from "@hotwired/stimulus";

const styles = `
  [data-toc-target="menu"] li {
    cursor: pointer;
    padding: 0.2rem 0;
  }

  [data-toc-target="menu"] li > ul {
    padding-left: 1rem;
  }

  [data-toc-target="menu"] li.active {
    font-weight: bold;
  }

  [data-toc-target="menu"] li:not(.active) {
    font-weight: normal;
  }
`

export default class extends Controller {
  static targets = ["container", "content", "menu", "linkTemplate"];

  connect(){
    if (!(this.hasContainerTarget && this.hasContentTarget && this.hasMenuTarget)) return

    this.#injectStyles()
    this.#updateTree()
    this.#observeContent()
  }
  contentTargetConnected(element){
    console.log('content connected')
  }

  get linkTemplate(){
    if(this.hasLinkTemplateTarget){
      const template = this.linkTemplateTarget;
      if(template.tagName == 'TEMPLATE'){
        const content = template.content.cloneNode(true);
        return content.querySelector('*'); // 返回第一个子元素
      }else{
        return template.cloneNode(true);
      }
    }else{
      return document.createElement("li");
    }
  }

  refresh(){
    this.#updateTree()
    this.#observeContent()
    this.#highlightActiveHeading();
  }

  #observeContent(){
    // 监听滚动
    this.contentTarget.addEventListener('scroll', () => {
      if(!this.clickingLink){
        this.#highlightActiveHeading()
      }
    });
    // 页面 resize 时也触发一次
    this.contentTarget.addEventListener('resize', () => this.#highlightActiveHeading());


    // 监听内容变化
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
    this._mutationObserver = new MutationObserver(() => {
      this.refresh();
    });
    this._mutationObserver.observe(this.contentTarget, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // 初始高亮
    this.#highlightActiveHeading();
  }

  #highlightActiveHeading() {
    const headings = Array.from(this.contentTarget.querySelectorAll('h1, h2, h3, h4'));
    if (headings.length === 0) return;

    // 获取 content 的滚动位置
    const scrollTop = this.contentTarget.scrollTop;
    const contentRect = this.contentTarget.getBoundingClientRect();

    let activeIndex = 0;

    for (let i = 0; i < headings.length; i++) {
      const linkRect = headings[i].getBoundingClientRect();
      // 这里用 heading 距离 content 顶部的距离
      const offset = linkRect.top - contentRect.top;
      if (offset <= 30) { // 30px 容差
        activeIndex = i;
      } else {
        break;
      }
    }

    // 高亮对应的 li
    const links = this.menuTarget.querySelectorAll('li');
    for (let i = 0; i < links.length; i++) {
      links[i].classList.remove("active");
    };
    if (links[activeIndex]) links[activeIndex].classList.add("active");
  }

  #updateTree(){
    // 清空 TOC 容器
    this.menuTarget.innerHTML = "";

    // 获取所有 heading
    const headings = this.contentTarget.querySelectorAll('h1, h2, h3, h4');
    if (headings.length === 0) return;

    // 生成目录树
    const directoryTree = this.#buildDirectoryTree(headings);
    directoryTree.children.forEach((node) => {
     const li = this.#generateDOMNode(node);

      // 添加到 TOC
      this.menuTarget.appendChild(li);
    })
  }

  // 生成dom节点
  #generateDOMNode(node) {
    const li = this.linkTemplate;
    li.textContent = node.text;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clickingLink = true;
      const containerTop = this.contentTarget.getBoundingClientRect().top;
      const headingTop = node.heading.getBoundingClientRect().top;
      const scrollOffset = headingTop - containerTop + this.contentTarget.scrollTop;
      this.contentTarget.scrollTo({ top: scrollOffset, behavior: 'smooth' });
      this.clickingLink = false;
    });

    if (node.children.length > 0) {
      const ul = document.createElement("ul");
      node.children.forEach((childNode) => {
        ul.appendChild(this.#generateDOMNode(childNode));
      });
      li.appendChild(ul);
    }

    return li;
  }

  // 生成目录树
  // { level: 0, children: [ {level: 1, text: '', children: [], parent: []} ] }
  #buildDirectoryTree(headings) {
    // 构建一个标准的目录树，支持 heading 层级跳跃
    const root = { level: 0, children: [] };
    let stack = [root];

    headings.forEach((heading) => {
      if (heading.textContent.trim() === "") return;

      const level = parseInt(heading.tagName.substr(1), 10);
      const node = { level, text: heading.textContent, heading, children: [] };

      // 回退到合适的父节点
      while (stack.length > 1 && level <= stack[stack.length - 1].level) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });

    return root;
  }

  #injectStyles(){
    if(document.getElementById("toc-styles")){
      return;
    }
    const style = document.createElement("style");
    style.textContent = styles;
    style.id = "toc-styles";
    document.head.appendChild(style);
  }
}
