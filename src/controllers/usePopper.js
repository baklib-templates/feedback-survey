import { createPopper } from "@popperjs/core";

export default usePopper = (userOptions = {}) => ({
  popperInstance: null,
  options: buildOptions(userOptions),
  isShowPopper: false,
  init() {
    this.$nextTick(
      () =>
        (this.popperInstance = createPopper(
          this.$refs.popperRef,
          this.$refs.popperRoot,
          this.options
        ))
    );
    this.$watch("isShowPopper", (val) => val && this.popperInstance.update());

    Alpine.effect(
      () => Alpine.store("breakpoints").name && (this.isShowPopper = false),
    );
  },
  isClickOutside(event) {
    return !this.$refs.popperRef.contains(event.target) && !this.$refs.popperRoot.contains(event.target);
  },
  hidePopperWhenOutside(event) {
    this.isClickOutside(event) && this.hidePopper();
  },
  togglePopper(){
    this.isShowPopper = !this.isShowPopper;
  },
  hidePopper(){
    this.isShowPopper && (this.isShowPopper = false);
  }
});

const buildOptions = (options) => {
  const config = {
    placement: options.placement ?? "auto",
    strategy: options.strategy ?? "fixed",
    onFirstUpdate: options.onFirstUpdate ?? function () {},

    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, options.offset ?? 0],
        },
      },
    ],
  };

  if (options.modifiers) config.modifiers.push(...options.modifiers);

  return config;
};
