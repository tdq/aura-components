import { Observable, isObservable, Subscription } from 'rxjs';
import { ComponentBuilder, PopupBuilder } from '../../core/component-builder';
import { registerDestroy } from '@/core/destroyable-element';

export type PopoverWidth = 'match-anchor' | 'auto' | string;

let _activePopover: PopoverBuilder | null = null;

export class PopoverBuilder implements PopupBuilder {
    private _anchor?: HTMLElement;
    private _content?: ComponentBuilder;
    private _width: Observable<PopoverWidth> | PopoverWidth = 'match-anchor';
    private _offset: number = 4;
    private _className?: string;
    private _onCloseCb?: () => void;
    private _glass: boolean = false;

    private _popoverEl?: HTMLElement;
    private _isOpen: boolean = false;
    private _currentWidth: PopoverWidth = 'match-anchor';
    private _widthSub?: Subscription;

    // Bound references for cleanup
    private _clickOutsideHandler?: (e: MouseEvent) => void;
    private _scrollHandler?: (e: Event) => void;
    private _resizeHandler?: () => void;

    withAnchor(anchor: HTMLElement): this {
        this._anchor = anchor;
        return this;
    }

    withContent(content: ComponentBuilder): this {
        this._content = content;
        return this;
    }

    withWidth(width: Observable<PopoverWidth> | PopoverWidth): this {
        this._width = width;
        return this;
    }

    withOffset(offset: number): this {
        this._offset = offset;
        return this;
    }

    withClass(className: string): this {
        this._className = className;
        return this;
    }

    withOnClose(callback: () => void): this {
        this._onCloseCb = callback;
        return this;
    }

    asGlass(): this {
        this._glass = true;
        return this;
    }

    build(): this {
        this._buildIfNeeded();
        return this;
    }

    show(): void {
        this._buildIfNeeded();
        this._position();
        if (!this._isOpen) {
            if (_activePopover !== null && _activePopover !== this) {
                _activePopover.close();
            }
            this._popoverEl!.style.display = '';
            (this._popoverEl as any).showPopover();
            this._isOpen = true;
            _activePopover = this;
        }
    }

    close(): void {
        if (!this._popoverEl || !this._isOpen) return;
        this._onClose();
    }

    private _buildIfNeeded(): void {
        if (this._popoverEl) return;
        if (!this._anchor) throw new Error('PopoverBuilder: anchor is required before show()');
        if (!this._content) throw new Error('PopoverBuilder: content is required before show()');

        const el = document.createElement('div');
        el.setAttribute('popover', 'manual');

        const baseClasses = 'fixed m-0 rounded-small shadow-level-2 overflow-y-auto p-0';
        el.className = baseClasses;

        if (this._glass) {
            el.classList.add('glass-effect');
        }

        if (this._className) {
            this._className.split(' ').forEach(c => {
                if (c) el.classList.add(c);
            });
        }

        el.appendChild(this._content.build());

        // Ensure the element starts hidden. Real browsers apply a UA stylesheet rule
        // (`[popover] { display: none }`) but jsdom does not, so we set it explicitly.
        // show()/hidePopover() will clear/restore this as needed.
        el.style.display = 'none';

        document.body.appendChild(el);
        this._popoverEl = el;

        // Handle Observable vs plain width
        if (isObservable(this._width)) {
            this._widthSub = (this._width as Observable<PopoverWidth>).subscribe(w => {
                this._currentWidth = w;
                if (this._isOpen) this._position();  // re-apply width reactively
            });
        } else {
            this._currentWidth = this._width as PopoverWidth;
        }

        // Defensive fallback: catches browser-initiated dismissals (e.g. Escape key on
        // popover="auto") that bypass our own close paths. All programmatic closes go through
        // _onClose() which sets _isOpen=false first, so this guard fires only for native events.
        el.addEventListener('toggle', (event: any) => {
            const isNowOpen = event.newState === 'open';
            if (!isNowOpen && this._isOpen) {
                this._isOpen = false;
                this._onCloseCb?.();
            }
        });

        // Close on click outside (anchor and popover are allowed)
        this._clickOutsideHandler = (e: MouseEvent) => {
            if (!this._isOpen) return;
            const target = e.target as Node;
            if (
                !this._popoverEl!.contains(target) &&
                !this._anchor?.contains(target)
            ) {
                this._onClose();
            }
        };
        document.addEventListener('click', this._clickOutsideHandler);

        // Close on scroll unless scrolling inside the popover
        this._scrollHandler = (e: Event) => {
            if (!this._isOpen) return;
            if (this._popoverEl!.contains(e.target as Node)) return;
            this._onClose();
        };
        document.addEventListener('scroll', this._scrollHandler, true);

        // Close on window resize
        this._resizeHandler = () => {
            if (!this._isOpen) return;
            this._onClose();
        };
        window.addEventListener('resize', this._resizeHandler);

        // Cleanup tied to anchor element lifetime
        if (this._anchor) {
            registerDestroy(this._anchor, () => this._cleanup());
        }
    }

    private _position(): void {
        if (!this._popoverEl || !this._anchor) return;

        const rect = this._anchor.getBoundingClientRect();
        const top = rect.bottom + this._offset;
        const left = rect.left;

        this._popoverEl.style.top = `${top}px`;
        this._popoverEl.style.left = `${left}px`;

        const w = this._currentWidth;
        if (w === 'match-anchor') {
            this._popoverEl.style.width = `${rect.width}px`;
            this._popoverEl.style.minWidth = '';
        } else if (w === 'auto') {
            this._popoverEl.style.width = 'auto';
            this._popoverEl.style.minWidth = `${rect.width}px`;
        } else {
            this._popoverEl.style.width = w;
            this._popoverEl.style.minWidth = '';
        }
    }

    private _onClose(): void {
        if (!this._popoverEl || !this._isOpen) return;
        this._isOpen = false;           // set BEFORE hidePopover so toggle sees false
        (this._popoverEl as any).hidePopover();
        this._popoverEl.style.display = 'none';
        if (_activePopover === this) _activePopover = null;
        this._onCloseCb?.();
    }

    private _cleanup(): void {
        if (this._isOpen) {
            this._isOpen = false;
            if (_activePopover === this) _activePopover = null;
            this._onCloseCb?.();
        }
        this._widthSub?.unsubscribe();
        this._widthSub = undefined;

        if (this._clickOutsideHandler) {
            document.removeEventListener('click', this._clickOutsideHandler);
            this._clickOutsideHandler = undefined;
        }

        if (this._scrollHandler) {
            document.removeEventListener('scroll', this._scrollHandler, true);
            this._scrollHandler = undefined;
        }

        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = undefined;
        }

        this._popoverEl?.remove();
        this._popoverEl = undefined;
    }
}
