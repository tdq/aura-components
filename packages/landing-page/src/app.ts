import 'aura-components/style.css'
import { ThemeManager } from 'aura-components';
import { router } from './routes';

const app = document.getElementById('app')!;
const themeManager = ThemeManager.getInstance();

// Initialize theme
themeManager.setTheme('light');
document.documentElement.setAttribute('data-theme', 'light');

// Build and append the router outlet
app.appendChild(router.build());
