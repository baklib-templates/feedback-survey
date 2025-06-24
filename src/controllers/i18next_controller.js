import i18next from 'i18next';
import { Controller } from "@hotwired/stimulus";
export default class extends Controller {
  connect() {
    i18next.init({
      lng: 'en',
      debug: true,
      resources: {
        en: {
          translation: {
            "key": "hello world"
          }
        }
      }
    });
  }
}
