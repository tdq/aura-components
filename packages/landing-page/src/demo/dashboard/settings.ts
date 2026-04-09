import { PanelBuilder, FormBuilder, LabelBuilder, LabelSize } from 'aura-components';
import { of, BehaviorSubject } from 'rxjs';

export function createSettings(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24';

    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Account Settings')))
        .build();
    panel.classList.add('max-w-2xl');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const form = new FormBuilder()
            .withCaption(of('Profile Settings'))
            .withDescription(of('Manage your account information and preferences.'));
        
        const fields = form.withFields();
        
        fields.addHeading().withCaption(of('Profile Information')).withSize(LabelSize.MEDIUM);
        fields.addTextField().withLabel(of('Username')).withValue(new BehaviorSubject('admin_user'));
        fields.addTextField().withLabel(of('Email Address')).withValue(new BehaviorSubject('admin@example.com'));

        fields.addHeading().withCaption(of('Notifications')).withSize(LabelSize.MEDIUM);
        fields.addCheckBox().withCaption(of('Email Notifications')).withValue(new BehaviorSubject(true));
        fields.addCheckBox().withCaption(of('SMS Notifications')).withValue(new BehaviorSubject(false));

        const toolbar = form.withToolbar();
        toolbar.withPrimaryButton().withCaption(of('Save Changes'));
        toolbar.addSecondaryButton().withCaption(of('Cancel'));

        body.appendChild(form.build());
    }

    container.appendChild(panel);

    return container;
}
