import { AppShell } from '@composition';
/* @refresh reload */
import { render } from 'solid-js/web';
import './styles/app.css';

render(() => <AppShell />, document.querySelector('#root') as HTMLElement);
