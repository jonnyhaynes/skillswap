#!/usr/bin/env bash
#
# Install the shared libraries Chromium needs, for the build-time prerender
# (scripts/prerender.mjs).
#
# `npx playwright install chromium` downloads the browser binary but not its
# OS dependencies. Playwright's own `--with-deps` only knows how to do that on
# Debian/Ubuntu, and Vercel builds on Amazon Linux — so chrome-headless-shell
# starts and immediately dies with:
#
#   error while loading shared libraries: libnspr4.so
#
# This is the Amazon Linux equivalent of `playwright install-deps`. Outside
# that image (local machines, GitHub Actions' ubuntu-latest) there is no dnf
# and nothing to do, so exit quietly and let the caller carry on.

set -euo pipefail

if ! command -v dnf >/dev/null 2>&1; then
  exit 0
fi

# Mirrors Playwright's Ubuntu dependency list, translated to AL2023 package
# names. Most are already present in the build image; dnf skips those.
dnf install -y \
  alsa-lib \
  at-spi2-atk \
  at-spi2-core \
  atk \
  cairo \
  cups-libs \
  libXcomposite \
  libXdamage \
  libXext \
  libXfixes \
  libXrandr \
  libdrm \
  libxkbcommon \
  libxshmfence \
  mesa-libgbm \
  nspr \
  nss \
  pango
