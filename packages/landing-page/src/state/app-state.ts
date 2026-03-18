import { BehaviorSubject } from 'rxjs';

export enum AppView {
    LANDING = 'landing',
    DASHBOARD = 'dashboard'
}

class AppState {
    private viewSubject = new BehaviorSubject<AppView>(AppView.LANDING);
    view$ = this.viewSubject.asObservable();

    setView(view: AppView) {
        this.viewSubject.next(view);
        window.scrollTo(0, 0);
    }

    getView(): AppView {
        return this.viewSubject.getValue();
    }
}

export const appState = new AppState();
