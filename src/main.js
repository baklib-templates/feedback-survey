import * as Turbo from "@hotwired/turbo"
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import { Application } from "@hotwired/stimulus"
import ThemeController from "./controllers/theme_controller"
//获取下一页评论内容
import LoadMoreController from "./controllers/load_more_controller"
//下拉框
import Dropdown from 'stimulus-dropdown'
import usePopper from "./controllers/usePopper"
import dispatchTo from "./controllers/dispatch_to"
import breakpoints from "./controllers/breakpoints"
import tooltip from "./controllers/tooltip";
// 全屏编辑
import FullscreenController from "./controllers/fullscreen_controller.js"
// 编辑器功能按钮过多折叠到下拉框
import MoreController from "./controllers/more_controller"
// 把 Element 停靠在另一个 Element 上方或下方, 编辑器编辑栏固定在header(或其他元素)下方
import StickyController from "./controllers/sticky_controller"
// dam_image_field 和 dam_video_field, 上传预览
import UploadController from "./controllers/upload_controller.js"
// 可以搜索的select选择器, tag_field_tag选择
import tomSelect from "./controllers/tomSelect";
// 根据背景色自动切换前景色, 标签选择显示, 切换文字颜色避免看不清
import SmartForegroundColorController from "./controllers/smart_foreground_color_controller"
// 颜色选择器
import ColorPickerController from "./controllers/color_picker_controller"
import DialogFetchController from "./controllers/dialog_fetch_controller"

Alpine.directive("tom-select", tomSelect);
Alpine.directive("tooltip", tooltip);
Alpine.store("breakpoints", breakpoints)
window.Alpine = Alpine
Alpine.plugin(collapse)
document.addEventListener('alpine:init', () => {
  Alpine.data("usePopper", usePopper);
})
Alpine.magic("dispatchTo", () => dispatchTo);
Alpine.start()

const application = Application.start()
window.Stimulus = application
application.register('theme', ThemeController)
application.register('dropdown', Dropdown)
application.register('load_more', LoadMoreController)
application.register('fullscreen', FullscreenController)
application.register("more", MoreController)
application.register("sticky", StickyController)
application.register("upload", UploadController)
application.register("smart-foreground-color", SmartForegroundColorController)
application.register("color-picker", ColorPickerController)
application.register("dialog-fetch", DialogFetchController)


