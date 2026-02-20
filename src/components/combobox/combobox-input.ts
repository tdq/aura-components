import { ComboBoxStyle } from './types';
import { cn, STYLE_MAP } from './styles';

export interface ComboBoxInputElements {
    container: HTMLDivElement;
    input: HTMLInputElement;
    iconContainer: HTMLDivElement;
}

export interface ComboBoxInputProps {
    placeholder?: string;
    ariaControls?: string;
}

export function renderComboBoxInput(props: ComboBoxInputProps = {}): ComboBoxInputElements {
    const inputContainer = document.createElement('div');
    inputContainer.className = cn(
        'flex items-center w-full transition-all relative overflow-hidden',
        'disabled:opacity-38 disabled:cursor-not-allowed'
    );
    // Default style
    STYLE_MAP[ComboBoxStyle.TONAL].split(' ').forEach(c => inputContainer.classList.add(c));

    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-haspopup', 'listbox');
    input.className = 'px-px-16 py-px-12 w-full bg-transparent outline-none body-large placeholder:text-on-surface-variant text-on-surface z-10';
    if (props.placeholder) {
        input.placeholder = props.placeholder;
    }
    if (props.ariaControls) {
        input.setAttribute('aria-controls', props.ariaControls);
    }
    inputContainer.appendChild(input);

    // Dropdown icon
    const iconContainer = document.createElement('div');
    iconContainer.className = 'pr-px-12 flex items-center justify-center text-on-surface-variant cursor-pointer z-10';
    iconContainer.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
        </svg>
    `;
    inputContainer.appendChild(iconContainer);

    return {
        container: inputContainer,
        input,
        iconContainer
    };
}
