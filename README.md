# UG Activities NX

A GNOME Shell extension that adds your distribution's logo to the Activities
button (the workspace "pill") in the top bar.

It re-implements Red Hat's downstream gnome-shell patch
[`0001-panel-add-an-icon-to-the-ActivitiesButton.patch`](https://gitlab.com/redhat/centos-stream/rpms/gnome-shell/-/blob/c9s/0001-panel-add-an-icon-to-the-ActivitiesButton.patch)
as an extension, so it works on Ubuntu (or any distro) without patching
gnome-shell and can be switched on or off at any time.

Targets GNOME 49–50 (Ubuntu 26.04).

## How it differs from the patch

The patch was written for GNOME 3.x–44, where the button held an "Activities"
text label. Since GNOME 45 the button holds workspace indicator dots instead.
This extension wraps whatever the button contains in a box with the logo in
front, the same way the patch wrapped the label, and puts everything back
untouched when disabled.

- **Logo lookup:** the patch hard-codes
  `/usr/share/icons/hicolor/scalable/apps/start-here.svg`. This extension
  looks up `LOGO` from `/etc/os-release` (e.g. `ubuntu-logo`), then
  `<ID>-logo`, `distributor-logo` and finally `start-here` in the icon theme.
- **Size:** 24px by default; set it to 0 to use `icon-size: 1em`, as in the patch.

## Settings

- Symbolic (monochrome) logo (on by default)
- Logo size (default 24px; 0 = match the top bar font)
- Custom logo file
- Show/hide the workspace dots (hidden by default)
- Show an "Activities" text label (the pre-GNOME 45 look of the patch; on by default)

## Installation

### Requirements

`make`, plus the `gnome-extensions` and `glib-compile-schemas` tools (on
Ubuntu these come with `gnome-shell` and `libglib2.0-bin`):

```sh
sudo apt install make libglib2.0-bin
```

### Build and install

```sh
git clone https://github.com/authorwerks-dev/ug-activities-nx.git
cd ug-activities-nx
make install
```

This packs the extension into `build/ug-activities-nx@authorwerks-dev.shell-extension.zip`
and installs it to `~/.local/share/gnome-shell/extensions/`. `make build` only
creates the zip.

GNOME 49+ runs on Wayland only, so the shell can't be restarted in place:
**log out and back in**, then enable it:

```sh
gnome-extensions enable ug-activities-nx@authorwerks-dev
```

(or use the Extensions app). Open the settings with `make test-prefs` or
`gnome-extensions prefs ug-activities-nx@authorwerks-dev`.

Turn it off at any time with `gnome-extensions disable ug-activities-nx@authorwerks-dev`;
the Activities button goes back to stock immediately.

### Uninstall

```sh
make remove
```

### Without make

```sh
gnome-extensions pack -f --extra-source=LICENSE \
    --schema=schemas/org.gnome.shell.extensions.ug-activities-nx.gschema.xml
gnome-extensions install -f ug-activities-nx@authorwerks-dev.shell-extension.zip
```

Upstream patch © Ray Strode / Red Hat, GPL-2.0-or-later.
