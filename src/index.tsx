/* @refresh reload */
import { render } from "solid-js/web";
import { CoreProvider } from "@application";
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
