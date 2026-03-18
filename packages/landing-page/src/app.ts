import { appState, AppView } from './state/app-state';
import { ThemeManager } from 'aura-components';
import { createLandingPage } from './sections/landing-page';
import { createDashboardDemo } from './demo/dashboard';

const app = document.getElementById('app')!;
const themeManager = ThemeManager.getInstance();

appState.view$.subscribe(view => {
    app.innerHTML = '';
    
    if (view === AppView.LANDING) {
        app.appendChild(createLandingPage());
    } else {
        app.appendChild(createDashboardDemo());
    }
});

// Initialize theme
themeManager.setTheme('light');
document.documentElement.setAttribute('data-theme', 'light');
