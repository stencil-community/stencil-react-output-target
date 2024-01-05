import { Component, Event, EventEmitter, h } from '@stencil/core';

export interface MyStencilComplexEvent {
  data: string;
}

@Component({
  tag: 'my-button',
  shadow: true,
})
export class MyButton {
  private clickCount = 0;

  @Event() stencilClick: EventEmitter<{ data: string }>;

  @Event() stencilComplexClick: EventEmitter<MyStencilComplexEvent>;

  render() {
    return (
      <button
        onClick={() =>
          this.stencilClick.emit({
            data: `Click #${++this.clickCount}`,
          })
        }
      >
        <slot />
      </button>
    );
  }
}
