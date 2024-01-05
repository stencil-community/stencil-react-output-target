import type { EventName } from "@lit/react";
import { createComponent as createComponentWrapper, Options } from "@lit/react";
import React from "react";
import {
  type MyButtonCustomEvent,
  type MyStencilComplexEvent,
} from "stencil-demo";
import {
  defineCustomElement as defineMyButton,
  MyButton as MyButtonElement,
} from "stencil-demo/dist/components/my-button.js";
import {
  defineCustomElement as defineMyComponent,
  MyComponent as MyComponentElement,
} from "stencil-demo/dist/components/my-component.js";

const createComponent = <
  T extends HTMLElement,
  E extends Record<string, EventName | string>,
>({
  defineCustomElement,
  ...options
}: Options<T, E> & { defineCustomElement: () => void }) => {
  if (typeof defineCustomElement !== "undefined") {
    defineCustomElement();
  }
  return createComponentWrapper<T, E>(options);
};

type MyButtonEvents = {
  onStencilClick: EventName<CustomEvent<{ data: string }>>;
  onStencilComplexClick: EventName<MyButtonCustomEvent<MyStencilComplexEvent>>;
};

export const MyButton = createComponent<MyButtonElement, MyButtonEvents>({
  tagName: "my-button",
  elementClass: MyButtonElement,
  react: React,
  events: {
    onStencilClick: "stencilClick",
    onStencilComplexClick: "stencilComplexClick",
  } as MyButtonEvents,
  defineCustomElement: defineMyButton,
});

type MyComponentEvents = NonNullable<unknown>;

export const MyComponent = createComponent<
  MyComponentElement,
  MyComponentEvents
>({
  tagName: "my-component",
  elementClass: MyComponentElement,
  react: React,
  events: {} as MyComponentEvents,
  defineCustomElement: defineMyComponent,
});
