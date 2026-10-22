NAME = ug-activities-nx
UUID = $(NAME)@authorwerks-dev

.PHONY: build install schemas test-shell test-prefs remove clean

build: clean
	mkdir -p build/
	gnome-extensions pack -f \
		--extra-source=LICENSE \
		--schema=schemas/org.gnome.shell.extensions.$(NAME).gschema.xml \
		-o build

install: build
	gnome-extensions install -f build/$(UUID).shell-extension.zip

schemas:
	glib-compile-schemas schemas/

test-prefs: install
	gnome-extensions prefs $(UUID)

# GNOME 49+ dropped the X11 nested mode; --devkit opens a nested Wayland
# session in a window (needs mutter-dev-bin / mutter-devkit installed).
test-shell: install
	dbus-run-session -- gnome-shell --devkit --wayland

remove:
	rm -rf $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

clean:
	rm -rf build/ schemas/gschemas.compiled
