import { BehaviorSubject, Observable, Subscription, combineLatest, isObservable, of } from 'rxjs';
import { ComponentBuilder } from '../core/component-builder';
import { registerDestroy } from '../core/destroyable-element';
import { RouterBuilder } from './router-builder';

export class LinkBuilder implements ComponentBuilder {
    private href$: Observable<string> = of('/');
    private caption$: Observable<string> = of('');
    private exactMatch: boolean = false;
    private activeClass: string = 'active';

    constructor(private readonly router: RouterBuilder) {}

    withHref(href: string | Observable<string>): this {
        this.href$ = isObservable(href) ? href : of(href);
        return this;
    }

    withCaption(caption: string | Observable<string>): this {
        this.caption$ = isObservable(caption) ? caption : of(caption);
        return this;
    }

    withExactMatch(exact: boolean): this {
        this.exactMatch = exact;
        return this;
    }

    withActiveClass(cls: string): this {
        this.activeClass = cls;
        return this;
    }

    build(): HTMLAnchorElement {
        const anchor = document.createElement('a');

        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            // Read current href from the element attribute
            const href = anchor.getAttribute('href') ?? '/';
            this.router.navigate(href);
        });

        const subscriptions = new Subscription();

        subscriptions.add(
            this.href$.subscribe((href) => {
                anchor.setAttribute('href', href);
            })
        );

        subscriptions.add(
            this.caption$.subscribe((caption) => {
                anchor.textContent = caption;
            })
        );

        subscriptions.add(
            combineLatest([this.href$, this.router.currentRoute$]).subscribe(([href, route]) => {
                const currentPath = route?.path ?? '';
                const isActive = this.exactMatch
                    ? currentPath === href
                    : currentPath.startsWith(href) && (href === '/' ? currentPath === '/' : true);

                if (isActive) {
                    anchor.classList.add(this.activeClass);
                } else {
                    anchor.classList.remove(this.activeClass);
                }
            })
        );

        registerDestroy(anchor, () => subscriptions.unsubscribe());

        return anchor;
    }
}
