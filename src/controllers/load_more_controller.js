
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["container", "button"]
  static values = {
    url: String
  }

  loadMore() {
    const url = this.buttonTarget.getAttribute("data-load_more-url-value");

    if (!url) return;

    fetch(url)
      .then(response => response.text())
      .then(data => {
        // Parse the returned HTML
        // # TODO(李成红2024-09-12): 只渲染需要追加的内容部分html...
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(data, "text/html");

        // Find the new posts and append them to the container
        const newPosts = htmlDocument.querySelector(`#${this.containerTarget.id}`).innerHTML;
        this.containerTarget.insertAdjacentHTML("beforeend", newPosts);

        // Update the load-more button's URL value or remove the button if no more pages
        const nextButton = htmlDocument.querySelector("#load_more");
        if (nextButton) {
          const nextPageUrl = nextButton.getAttribute("data-load_more-url-value");
          this.buttonTarget.setAttribute("data-load_more-url-value", nextPageUrl);
        } else {
          this.buttonTarget.remove(); // No more pages, remove the button
        }
      })
      .catch(error => console.error("Error loading more posts:", error));
  }
}
