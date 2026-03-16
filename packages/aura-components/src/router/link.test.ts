import { LinkBuilder } from './link';
import { RouterBuilder } from './router-builder';
import { BehaviorSubject } from 'rxjs';
import '@testing-library/jest-dom';

jest.mock('../core/destroyable-element', () => ({
    registerDestroy: jest.fn(),
}));

function makeRouter(): RouterBuilder {
    const router = new RouterBuilder();
    // Stub navigate so tests don't trigger full routing
    jest.spyOn(router, 'navigate').mockImplementation(() => {});
    return router;
}

describe('LinkBuilder', () => {
    it('build() returns an HTMLAnchorElement', () => {
        const link = new LinkBuilder(makeRouter())
            .withHref('/home')
            .withCaption('Home')
            .build();
        expect(link).toBeInstanceOf(HTMLAnchorElement);
    });

    it('sets href attribute from string', () => {
        const link = new LinkBuilder(makeRouter())
            .withHref('/about')
            .withCaption('About')
            .build();
        expect(link.getAttribute('href')).toBe('/about');
    });

    it('sets caption text', () => {
        const link = new LinkBuilder(makeRouter())
            .withHref('/')
            .withCaption('Home')
            .build();
        expect(link.textContent).toBe('Home');
    });

    it('updates href reactively from Observable', () => {
        const href$ = new BehaviorSubject('/first');
        const link = new LinkBuilder(makeRouter())
            .withHref(href$)
            .withCaption('Link')
            .build();
        expect(link.getAttribute('href')).toBe('/first');

        href$.next('/second');
        expect(link.getAttribute('href')).toBe('/second');
    });

    it('updates caption reactively from Observable', () => {
        const caption$ = new BehaviorSubject('Before');
        const link = new LinkBuilder(makeRouter())
            .withHref('/')
            .withCaption(caption$)
            .build();
        expect(link.textContent).toBe('Before');

        caption$.next('After');
        expect(link.textContent).toBe('After');
    });

    it('click calls router.navigate() with href and prevents default', () => {
        const router = makeRouter();
        const link = new LinkBuilder(router)
            .withHref('/page')
            .withCaption('Page')
            .build();

        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        link.dispatchEvent(event);

        expect(router.navigate).toHaveBeenCalledWith('/page');
        expect(event.defaultPrevented).toBe(true);
    });

    it('applies active class when route matches (prefix mode)', () => {
        const router = makeRouter();
        // Emit a matching route
        (router as any).routeSubject.next({ path: '/products/1', params: {}, query: {} });

        const link = new LinkBuilder(router)
            .withHref('/products')
            .withCaption('Products')
            .withExactMatch(false)
            .build();

        expect(link.classList.contains('active')).toBe(true);
    });

    it('removes active class when route no longer matches', () => {
        const router = makeRouter();
        const routeSubject = (router as any).routeSubject as BehaviorSubject<any>;
        routeSubject.next({ path: '/products/1', params: {}, query: {} });

        const link = new LinkBuilder(router)
            .withHref('/products')
            .withCaption('Products')
            .build();

        expect(link.classList.contains('active')).toBe(true);

        routeSubject.next({ path: '/home', params: {}, query: {} });
        expect(link.classList.contains('active')).toBe(false);
    });

    it('exact match mode: only active on exact path', () => {
        const router = makeRouter();
        const routeSubject = (router as any).routeSubject as BehaviorSubject<any>;
        routeSubject.next({ path: '/products/1', params: {}, query: {} });

        const link = new LinkBuilder(router)
            .withHref('/products')
            .withCaption('Products')
            .withExactMatch(true)
            .build();

        // /products/1 !== /products → not active
        expect(link.classList.contains('active')).toBe(false);

        routeSubject.next({ path: '/products', params: {}, query: {} });
        expect(link.classList.contains('active')).toBe(true);
    });

    it('supports custom active class name', () => {
        const router = makeRouter();
        (router as any).routeSubject.next({ path: '/home', params: {}, query: {} });

        const link = new LinkBuilder(router)
            .withHref('/home')
            .withCaption('Home')
            .withExactMatch(true)
            .withActiveClass('router-link-active')
            .build();

        expect(link.classList.contains('router-link-active')).toBe(true);
        expect(link.classList.contains('active')).toBe(false);
    });
});
