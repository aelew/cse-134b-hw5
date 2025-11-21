class HelloWorldCustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    console.log('Hello world!');
  }
}

customElements.define('hello-world', HelloWorldCustomElement);
