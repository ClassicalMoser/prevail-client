import { CoreProvider } from "@application";
/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./App.css";

render(
  () => (
    <CoreProvider>
      <App />
    </CoreProvider>
  ),
  document.getElementById("root") as HTMLElement,
);
