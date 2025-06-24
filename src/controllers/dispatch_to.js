
// 把事件派发到指定的元素上
// 配置：Alpine.magic("dispatchTo", () => dispatchTo);
// 使用：<div x-data x-init="$dispatchTo('js-body', 'event-name', {foo: 'bar'})"></div>
export default function (id, name, detail = {}) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Could not dispatch ${name} event on #${id}. Element not found.`);
  } else {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        // Allows events to pass the shadow DOM barrier.
        composed: true,
        cancelable: true,
      })
    );
  }
}
