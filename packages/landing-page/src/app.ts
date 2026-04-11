import 'aura-components/style.css'
import { ThemeManager } from 'aura-components';
import { router } from './routes';

const app = document.getElementById('app')!;
ThemeManager.getInstance();

// Build and append the router outlet
app.appendChild(router.build());
