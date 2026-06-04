import { CoreProvider } from '@application';
/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import './styles/app.css';

render(
  () => (
    <CoreProvider>
      <App />
    </CoreProvider>
  ),
  document.querySelector('#root') as HTMLElement,
);
