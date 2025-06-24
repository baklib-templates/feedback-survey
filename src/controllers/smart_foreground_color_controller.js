import Color from 'color'
import { Controller } from '@hotwired/stimulus'
import { getElementBackgroundColor } from './getElementBackgroundColor'

// 根据背景色自动切换前景色
// <div data-controller="smart-foreground-color"
//      data-smart-foreground-color-dark-color="#000000"
//      data-smart-foreground-color-light-color="#ffffff"
// >
export default class extends Controller {
  connect(){
    this.element.style.color = this.isLightBackground ? this.darkColor : this.lightColor
  }

  // TODO: 有些场景下，背景色会变化，需要监听变化，重新计算前景色
  get backgroundColor(){
    return Color(getElementBackgroundColor(this.element))
  }

  get isLightBackground(){
    return this.backgroundColor.isLight()
  }

  get isDarkBackground(){
    return this.backgroundColor.isDark()
  }

  get darkColor(){
    return this.data.get('dark') || '#000000'
  }

  get lightColor(){
    return this.data.get('light') || '#ffffff'
  }
}
