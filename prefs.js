//    ugactivitynx preferences

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class UgActivityNxPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        // --- Logo ---------------------------------------------------------
        const logoGroup = new Adw.PreferencesGroup({
            title: 'Logo',
            description: 'By default the logo is found from /etc/os-release and the icon theme.',
        });
        page.add(logoGroup);

        const symbolicRow = new Adw.SwitchRow({
            title: 'Symbolic logo',
            subtitle: 'Prefer a monochrome logo that follows the top bar text colour',
        });
        logoGroup.add(symbolicRow);
        settings.bind('symbolic-icon', symbolicRow, 'active',
            Gio.SettingsBindFlags.DEFAULT);

        const sizeRow = new Adw.SpinRow({
            title: 'Logo size',
            subtitle: 'In pixels; 0 matches the top bar font size',
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 64, step_increment: 1, page_increment: 4,
            }),
        });
        logoGroup.add(sizeRow);
        settings.bind('icon-size', sizeRow, 'value',
            Gio.SettingsBindFlags.DEFAULT);

        const fileRow = new Adw.ActionRow({
            title: 'Custom logo file',
        });
        logoGroup.add(fileRow);

        const updateFileRow = () => {
            const path = settings.get_string('custom-icon-path');
            fileRow.subtitle = path || 'None — using the distribution logo';
            symbolicRow.sensitive = !path;
            clearButton.sensitive = !!path;
        };

        const chooseButton = new Gtk.Button({
            icon_name: 'document-open-symbolic',
            tooltip_text: 'Choose image…',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
        });
        const clearButton = new Gtk.Button({
            icon_name: 'edit-clear-symbolic',
            tooltip_text: 'Use distribution logo',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
        });
        fileRow.add_suffix(chooseButton);
        fileRow.add_suffix(clearButton);

        chooseButton.connect('clicked', () => {
            const filter = new Gtk.FileFilter({ name: 'Images' });
            filter.add_pixbuf_formats();
            filter.add_mime_type('image/svg+xml');
            const filters = new Gio.ListStore({ item_type: Gtk.FileFilter });
            filters.append(filter);

            const dialog = new Gtk.FileDialog({
                title: 'Choose logo',
                modal: true,
                filters,
            });
            dialog.open(window, null, (dlg, res) => {
                try {
                    const file = dlg.open_finish(res);
                    if (file?.get_path())
                        settings.set_string('custom-icon-path', file.get_path());
                } catch {
                    // Cancelled.
                }
            });
        });
        clearButton.connect('clicked', () =>
            settings.set_string('custom-icon-path', ''));

        settings.connect('changed::custom-icon-path', updateFileRow);
        updateFileRow();

        // --- Button contents ---------------------------------------------
        const contentGroup = new Adw.PreferencesGroup({ title: 'Button' });
        page.add(contentGroup);

        const dotsRow = new Adw.SwitchRow({
            title: 'Workspace indicator dots',
            subtitle: 'Keep GNOME\'s workspace dots next to the logo',
        });
        contentGroup.add(dotsRow);
        settings.bind('show-workspace-dots', dotsRow, 'active',
            Gio.SettingsBindFlags.DEFAULT);

        const labelRow = new Adw.SwitchRow({
            title: '"Activities" label',
            subtitle: 'Show the text label, as in Red Hat\'s original patch',
        });
        contentGroup.add(labelRow);
        settings.bind('show-label', labelRow, 'active',
            Gio.SettingsBindFlags.DEFAULT);

        window._settings = settings;
    }
}
