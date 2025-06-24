import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["container"]

  connect() {
    if (!this.hasContainerTarget) return;

    const that = this;
    const scrollElement = this.containerTarget;
    let ticking = false;
    let latest_position = 0;
    let scroll_direction = 'down';

    scrollElement.addEventListener("scroll", function(e) {
      const offsetY = this.scrollTop

      // set direction up or down
      if (offsetY > latest_position) {
        scroll_direction = 'down';
      } else if (offsetY < latest_position) {
        // up
        scroll_direction = 'up';
      }

      if (!ticking) {
        window.requestAnimationFrame(function() {
          latest_position = offsetY <= 0 ? 0 : offsetY;
          // header animation
          that.toggleAsleep(latest_position, scroll_direction);

          ticking = false;
        });

        ticking = true;
      }
    }, false);
  }

  toggleAsleep(scroll_pos, scroll_direction) {
    if (scroll_direction == 'down' && scroll_pos >= 44) {
      document.body.classList.add('asleep')
    } else if (scroll_direction == 'up' && scroll_pos < 44) {
      document.body.classList.remove('asleep')
    }
  }
}
