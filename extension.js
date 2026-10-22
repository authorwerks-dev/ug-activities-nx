//    ug-activities-nx
//    GNOME Shell extension
//
//    Adds the distribution logo to the top bar's Activities button.
//    Re-implements Red Hat's gnome-shell downstream patch
//    "0001-panel-add-an-icon-to-the-ActivitiesButton.patch" (Ray Strode, 2014)
//    as an extension, adapted to GNOME 45+ where the button shows workspace
//    indicator dots instead of an "Activities" label.
//
//    @authorwerks-dev 2026

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Gettext from 'gettext';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Use gnome-shell's own translation of "Activities" so the label matches the
// user's language without shipping translations.
const shellGettext = Gettext.domain('gnome-shell').gettext;

// Build a themed icon for the running distribution, from /etc/os-release.
// On Ubuntu LOGO=ubuntu-logo; on Fedora/RHEL LOGO=fedora-logo-icon etc.
function getDistroGicon(preferSymbolic) {
    const get = key => GLib.get_os_info(key) ?? '';
    const id = get('ID');
    const logoNames = [
        get('LOGO'),
        id && `${id}-logo`,
        id && `${id}-logo-icon`,
        'distributor-logo',
        // Red Hat's patch hard-codes hicolor/scalable/apps/start-here.svg;
        // looking it up by name finds that file and any themed version.
        'start-here',
    ].filter(Boolean);
    const symbolic = logoNames.map(n => `${n}-symbolic`);
    const names = preferSymbolic
        ? [...symbolic, ...logoNames]
        : [...logoNames, ...symbolic];

    return Gio.ThemedIcon.new_from_names([...new Set(names)]);
}

function fileGicon(path) {
    if (!path)
        return null;
    const file = Gio.File.new_for_path(path);
    return file.query_exists(null) ? new Gio.FileIcon({ file }) : null;
}

export default class UgActivitiesNxExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._button = Main.panel.statusArea.activities;
        if (!this._button) {
            console.warn(`${this.uuid}: Activities button not found`);
            return;
        }

        // GNOME 45+: ActivitiesButton's only child is a WorkspaceIndicators
        // box (the "pill" of workspace dots). Re-parent it into our own box,
        // just like the patch re-parents the "Activities" label.
        this._dots = this._button.get_first_child();
        if (!this._dots) {
            console.warn(`${this.uuid}: Activities button has no content to wrap`);
            this._button = null;
            return;
        }
        this._button.remove_child(this._dots);
        this._dots.add_style_class_name('ug-activities-nx-dots');

        this._box = new St.BoxLayout({
            style_class: 'ug-activities-nx-box',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._icon = new St.Icon({
            style_class: 'ug-activities-nx-logo',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._label = new St.Label({
            style_class: 'ug-activities-nx-label',
            text: shellGettext('Activities'),
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._box.add_child(this._icon);
        this._box.add_child(this._label);
        this._box.add_child(this._dots);
        this._button.add_child(this._box);
        // Lets the stylesheet trim the button's own side padding.
        this._button.add_style_class_name('ug-activities-nx-button');

        this._settings.connectObject('changed', () => this._sync(), this);
        this._sync();
    }

    _sync() {
        const s = this._settings;

        this._icon.gicon =
            fileGicon(s.get_string('custom-icon-path')) ??
            getDistroGicon(s.get_boolean('symbolic-icon'));

        // 0 = leave it to the stylesheet (icon-size: 1em, as in the patch).
        this._icon.icon_size = s.get_int('icon-size') > 0 ? s.get_int('icon-size') : -1;

        this._label.visible = s.get_boolean('show-label');
        this._dots.visible = s.get_boolean('show-workspace-dots');
    }

    disable() {
        this._settings?.disconnectObject(this);

        if (this._box) {
            // Put the workspace dots back exactly as gnome-shell had them.
            this._box.remove_child(this._dots);
            this._dots.remove_style_class_name('ug-activities-nx-dots');
            this._dots.visible = true;
            this._button.add_child(this._dots);
            this._button.remove_style_class_name('ug-activities-nx-button');
            this._box.destroy();
        }

        this._box = null;
        this._icon = null;
        this._label = null;
        this._dots = null;
        this._button = null;
        this._settings = null;
    }
}
