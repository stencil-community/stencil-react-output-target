import React from "react";
import { createComponent as createComponentWrapper, Options } from "@lit/react";
import {
  MyComponent as MyComponentElement,
  defineCustomElement as defineMyComponent,
} from "stencil-demo/dist/components/my-component.js";

const createComponent = <T extends HTMLElement>({
  defineCustomElement,
  ...options
}: Options<T> & { defineCustomElement: () => void }) => {
  if (typeof defineCustomElement !== "undefined") {
    defineCustomElement();
  }
  return createComponentWrapper<T>(options);
};

export const MyComponent = createComponent({
  tagName: "my-component",
  elementClass: MyComponentElement,
  react: React,
  events: {},
  defineCustomElement: defineMyComponent,
});
