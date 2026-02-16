import { TextFieldBuilder, TextFieldStyle } from '../components/text-field';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LayoutBuilder, LayoutGap } from '../components/layout';
import { LabelBuilder, LabelSize } from '../components/label';
import { ButtonBuilder, ButtonStyle } from '../components/button';

export default {
    title: 'Examples/Forms',
};

export const PersonInformationForm = () => {
    // Form state
    const firstName$ = new BehaviorSubject('');
    const lastName$ = new BehaviorSubject('');
    const email$ = new BehaviorSubject('');
    const phone$ = new BehaviorSubject('');

    // Validation errors
    const firstNameError$ = firstName$.pipe(
        map(val => val.trim() === '' ? 'First name is required' : '')
    );

    const lastNameError$ = lastName$.pipe(
        map(val => val.trim() === '' ? 'Last name is required' : '')
    );

    const emailError$ = email$.pipe(
        map(val => {
            if (val.trim() === '') return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email format';
            return '';
        })
    );

    const phoneError$ = phone$.pipe(
        map(val => {
            if (val.trim() === '') return '';
            if (!/^\+?[\d\s\-()]+$/.test(val)) return 'Invalid phone format';
            return '';
        })
    );

    // Form validity
    const isFormValid$ = combineLatest([
        firstNameError$,
        lastNameError$,
        emailError$,
        phoneError$
    ]).pipe(
        map(errors => errors.every(error => error === ''))
    );

    // Form actions
    const submitClick$ = new Subject<void>();
    const resetClick$ = new Subject<void>();

    submitClick$.subscribe(() => {
        if (firstName$.value.trim() && lastName$.value.trim() &&
            email$.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email$.value)) {
            alert(`Form submitted!\n\nName: ${firstName$.value} ${lastName$.value}\nEmail: ${email$.value}\nPhone: ${phone$.value || 'N/A'}`);
        }
    });

    resetClick$.subscribe(() => {
        firstName$.next('');
        lastName$.next('');
        email$.next('');
        phone$.next('');
    });

    // Build layout
    const layout = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.EXTRA_LARGE);

    // Title
    layout.addSlot().withContent(
        new LabelBuilder()
            .withCaption(of('Person Information'))
            .withSize(LabelSize.LARGE)
    );

    // First Name
    layout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('First Name'))
            .withPlaceholder(of('Enter your first name'))
            .withValue(firstName$)
            .withError(firstNameError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    // Last Name
    layout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Last Name'))
            .withPlaceholder(of('Enter your last name'))
            .withValue(lastName$)
            .withError(lastNameError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    // Email
    layout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Email'))
            .withPlaceholder(of('example@domain.com'))
            .withValue(email$)
            .withError(emailError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    // Phone (optional)
    layout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Phone (Optional)'))
            .withPlaceholder(of('+1 (555) 123-4567'))
            .withValue(phone$)
            .withError(phoneError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    // Buttons
    const buttonLayout = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    buttonLayout.addSlot().withContent(
        new ButtonBuilder()
            .withCaption(of('Submit'))
            .withStyle(of(ButtonStyle.FILLED))
            .withEnabled(isFormValid$)
            .withClick(submitClick$)
    );

    buttonLayout.addSlot().withContent(
        new ButtonBuilder()
            .withCaption(of('Reset'))
            .withStyle(of(ButtonStyle.OUTLINED))
            .withClick(resetClick$)
    );

    layout.addSlot().withContent(buttonLayout);

    const container = layout.build();
    container.classList.add('p-4', 'max-w-md');

    return container;
};

export const AddressForm = () => {
    // Form state
    const street$ = new BehaviorSubject('');
    const city$ = new BehaviorSubject('');
    const state$ = new BehaviorSubject('');
    const zipCode$ = new BehaviorSubject('');
    const country$ = new BehaviorSubject('');

    // Validation errors
    const streetError$ = street$.pipe(
        map(val => val.trim() === '' ? 'Street address is required' : '')
    );

    const cityError$ = city$.pipe(
        map(val => val.trim() === '' ? 'City is required' : '')
    );

    const stateError$ = state$.pipe(
        map(val => val.trim() === '' ? 'State/Province is required' : '')
    );

    const zipCodeError$ = zipCode$.pipe(
        map(val => {
            if (val.trim() === '') return 'ZIP/Postal code is required';
            if (!/^[\d\-\s]+$/.test(val)) return 'Invalid ZIP code format';
            return '';
        })
    );

    const countryError$ = country$.pipe(
        map(val => val.trim() === '' ? 'Country is required' : '')
    );

    // Form validity
    const isFormValid$ = combineLatest([
        streetError$,
        cityError$,
        stateError$,
        zipCodeError$,
        countryError$
    ]).pipe(
        map(errors => errors.every(error => error === ''))
    );

    // Form actions
    const submitClick$ = new Subject<void>();
    const clearClick$ = new Subject<void>();

    submitClick$.subscribe(() => {
        if (street$.value.trim() && city$.value.trim() &&
            state$.value.trim() && zipCode$.value.trim() && country$.value.trim()) {
            alert(`Address submitted!\n\n${street$.value}\n${city$.value}, ${state$.value} ${zipCode$.value}\n${country$.value}`);
        }
    });

    clearClick$.subscribe(() => {
        street$.next('');
        city$.next('');
        state$.next('');
        zipCode$.next('');
        country$.next('');
    });

    // Build layout
    const layout = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.EXTRA_LARGE);

    // Title
    layout.addSlot().withContent(
        new LabelBuilder()
            .withCaption(of('Address Information'))
            .withSize(LabelSize.LARGE)
    );

    // Street Address
    layout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Street Address'))
            .withPlaceholder(of('123 Main Street'))
            .withValue(street$)
            .withError(streetError$)
            .withStyle(of(TextFieldStyle.OUTLINED))
    );

    // City and State row
    const cityStateLayout = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    cityStateLayout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('City'))
            .withPlaceholder(of('New York'))
            .withValue(city$)
            .withError(cityError$)
            .withStyle(of(TextFieldStyle.OUTLINED))
    );

    cityStateLayout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('State/Province'))
            .withPlaceholder(of('NY'))
            .withValue(state$)
            .withError(stateError$)
            .withStyle(of(TextFieldStyle.OUTLINED))
    );

    layout.addSlot().withContent(cityStateLayout);

    // ZIP and Country row
    const zipCountryLayout = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    zipCountryLayout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('ZIP/Postal Code'))
            .withPlaceholder(of('10001'))
            .withValue(zipCode$)
            .withError(zipCodeError$)
            .withStyle(of(TextFieldStyle.OUTLINED))
    );

    zipCountryLayout.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Country'))
            .withPlaceholder(of('United States'))
            .withValue(country$)
            .withError(countryError$)
            .withStyle(of(TextFieldStyle.OUTLINED))
    );

    layout.addSlot().withContent(zipCountryLayout);

    // Buttons
    const buttonLayout = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    buttonLayout.addSlot().withContent(
        new ButtonBuilder()
            .withCaption(of('Save Address'))
            .withStyle(of(ButtonStyle.FILLED))
            .withEnabled(isFormValid$)
            .withClick(submitClick$)
    );

    buttonLayout.addSlot().withContent(
        new ButtonBuilder()
            .withCaption(of('Clear'))
            .withStyle(of(ButtonStyle.TEXT))
            .withClick(clearClick$)
    );

    layout.addSlot().withContent(buttonLayout);

    const container = layout.build();
    container.classList.add('p-4', 'max-w-2xl');

    return container;
};

export const CombinedForm = () => {
    // Person Information State
    const firstName$ = new BehaviorSubject('');
    const lastName$ = new BehaviorSubject('');
    const email$ = new BehaviorSubject('');

    // Address State
    const street$ = new BehaviorSubject('');
    const city$ = new BehaviorSubject('');
    const zipCode$ = new BehaviorSubject('');

    // Validation
    const firstNameError$ = firstName$.pipe(
        map(val => val.trim() === '' ? 'Required' : '')
    );

    const lastNameError$ = lastName$.pipe(
        map(val => val.trim() === '' ? 'Required' : '')
    );

    const emailError$ = email$.pipe(
        map(val => {
            if (val.trim() === '') return 'Required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email';
            return '';
        })
    );

    const streetError$ = street$.pipe(
        map(val => val.trim() === '' ? 'Required' : '')
    );

    const cityError$ = city$.pipe(
        map(val => val.trim() === '' ? 'Required' : '')
    );

    const zipCodeError$ = zipCode$.pipe(
        map(val => val.trim() === '' ? 'Required' : '')
    );

    // Form validity
    const isFormValid$ = combineLatest([
        firstNameError$,
        lastNameError$,
        emailError$,
        streetError$,
        cityError$,
        zipCodeError$
    ]).pipe(
        map(errors => errors.every(error => error === ''))
    );

    // Actions
    const submitClick$ = new Subject<void>();

    submitClick$.subscribe(() => {
        alert(`Complete Form Submitted!\n\nPerson:\n${firstName$.value} ${lastName$.value}\n${email$.value}\n\nAddress:\n${street$.value}\n${city$.value}, ${zipCode$.value}`);
    });

    // Main layout
    const mainLayout = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.EXTRA_LARGE);

    // Title
    mainLayout.addSlot().withContent(
        new LabelBuilder()
            .withCaption(of('Registration Form'))
            .withSize(LabelSize.LARGE)
    );

    // Person section
    const personSection = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.LARGE);

    personSection.addSlot().withContent(
        new LabelBuilder()
            .withCaption(of('Personal Information'))
            .withSize(LabelSize.MEDIUM)
    );

    const nameRow = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    nameRow.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('First Name'))
            .withPlaceholder(of('John'))
            .withValue(firstName$)
            .withError(firstNameError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    nameRow.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Last Name'))
            .withPlaceholder(of('Doe'))
            .withValue(lastName$)
            .withError(lastNameError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    personSection.addSlot().withContent(nameRow);

    personSection.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Email'))
            .withPlaceholder(of('john.doe@example.com'))
            .withValue(email$)
            .withError(emailError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    mainLayout.addSlot().withContent(personSection);

    // Address section
    const addressSection = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.LARGE);

    addressSection.addSlot().withContent(
        new LabelBuilder()
            .withCaption(of('Address'))
            .withSize(LabelSize.MEDIUM)
    );

    addressSection.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('Street Address'))
            .withPlaceholder(of('123 Main St'))
            .withValue(street$)
            .withError(streetError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    const cityZipRow = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.MEDIUM);

    cityZipRow.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('City'))
            .withPlaceholder(of('New York'))
            .withValue(city$)
            .withError(cityError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    cityZipRow.addSlot().withContent(
        new TextFieldBuilder()
            .withLabel(of('ZIP Code'))
            .withPlaceholder(of('10001'))
            .withValue(zipCode$)
            .withError(zipCodeError$)
            .withStyle(of(TextFieldStyle.FILLED))
    );

    addressSection.addSlot().withContent(cityZipRow);

    mainLayout.addSlot().withContent(addressSection);

    // Submit button
    mainLayout.addSlot().withContent(
        new ButtonBuilder()
            .withCaption(of('Complete Registration'))
            .withStyle(of(ButtonStyle.FILLED))
            .withEnabled(isFormValid$)
            .withClick(submitClick$)
    );

    const container = mainLayout.build();
    container.classList.add('p-4', 'max-w-2xl');

    return container;
};
