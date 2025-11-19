# CI/CD Documentation

This document describes the continuous integration and deployment setup for Trivia Night.

## Overview

The project uses GitHub Actions to automate testing, building, and releasing the application for all supported platforms (Windows, macOS, and Linux).

## Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Trigger**: Push to `main` or `claude/**` branches, and pull requests to `main`

**Jobs**:
- **test-frontend**:
  - Type checks TypeScript code
  - Builds the frontend
  - Ensures no type errors

- **test-rust**:
  - Runs `cargo check` to verify Rust code compiles
  - Runs `cargo test` to execute all tests
  - Runs `cargo clippy` to catch common mistakes and improve code

**Purpose**: Ensures code quality and catches errors early before merging.

### 2. Build Workflow (`.github/workflows/build.yml`)

**Trigger**: Push to `main` or `claude/**` branches, and pull requests to `main`

**Strategy**: Matrix build across three platforms:
- `macos-latest` (macOS)
- `ubuntu-22.04` (Linux)
- `windows-latest` (Windows)

**Steps**:
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install Rust stable toolchain
4. Install platform-specific dependencies (Linux only)
5. Install npm dependencies
6. Build frontend with Vite
7. Build Tauri app with `tauri-action`
8. Upload artifacts for each platform

**Artifacts**:
- **macOS**: `.dmg` (disk image) and `.app` (application bundle)
- **Linux**: `.deb` (Debian package) and `.AppImage` (portable)
- **Windows**: `.msi` (Windows Installer) and `.exe` (NSIS installer)

**Retention**: 7 days (artifacts are deleted after 7 days to save storage)

### 3. Release Workflow (`.github/workflows/release.yml`)

**Trigger**: Push of a tag matching `v*` (e.g., `v1.0.0`, `v2.1.3`)

**Permissions**: Requires `contents: write` to create releases

**Jobs**:
- **release**: Builds for all platforms and creates GitHub release
- **create-release-notes**: Generates release notes from git commits

**Process**:
1. Builds application for all platforms
2. Uses `tauri-action` with release configuration
3. Creates a draft release on GitHub
4. Generates release notes from commits since last tag
5. Attaches all platform installers to the release

**Draft Releases**: Releases are created as drafts, allowing you to:
- Review the release notes
- Test the installers
- Edit the description
- Publish when ready

## Creating a Release

### Step-by-Step

1. **Ensure clean state**:
   ```bash
   git checkout main
   git pull origin main
   git status  # Should show clean working tree
   ```

2. **Update version** (if needed):
   - Update `version` in `package.json`
   - Update `version` in `src-tauri/Cargo.toml`
   - Update `version` in `src-tauri/tauri.conf.json`
   - Commit these changes:
     ```bash
     git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
     git commit -m "Bump version to 1.0.0"
     git push origin main
     ```

3. **Create and push tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

4. **Monitor workflow**:
   - Go to the Actions tab on GitHub
   - Watch the "Release" workflow progress
   - This will take 15-30 minutes to build for all platforms

5. **Review draft release**:
   - Go to the Releases page on GitHub
   - Find the draft release
   - Review installers and release notes
   - Edit description if needed
   - Click "Publish release" when ready

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

Examples:
- `v1.0.0` - First major release
- `v1.1.0` - Added new features
- `v1.1.1` - Bug fixes
- `v2.0.0` - Breaking changes

## Platform-Specific Notes

### macOS

**Installers**:
- `.dmg`: Disk image with drag-to-Applications
- `.app`: Application bundle (for manual installation)

**Requirements**:
- macOS 10.15 (Catalina) or later
- Signed builds require Apple Developer certificate (not configured yet)

**Note**: Users may need to allow the app in System Preferences > Security & Privacy on first run (unsigned builds).

### Linux

**Installers**:
- `.deb`: For Debian/Ubuntu-based distributions
- `.AppImage`: Universal portable application

**Installation**:
```bash
# Debian/Ubuntu
sudo dpkg -i trivia-night_0.1.0_amd64.deb

# AppImage
chmod +x trivia-night_0.1.0_amd64.AppImage
./trivia-night_0.1.0_amd64.AppImage
```

**Dependencies**: The `.deb` package includes all dependencies. AppImage is self-contained.

### Windows

**Installers**:
- `.msi`: Windows Installer package
- `.exe`: NSIS installer (more user-friendly)

**Requirements**:
- Windows 10 (1809) or later
- WebView2 runtime (auto-installed by installer)

**Note**: Windows Defender may show a warning for unsigned builds. Users need to click "More info" and "Run anyway".

## Troubleshooting

### Build Failures

**"Could not find tauri-cli"**
- Ensure `@tauri-apps/cli` is in `devDependencies`
- Check that `npm ci` ran successfully

**Linux build fails with missing libraries**
- Verify all dependencies are listed in the workflow
- Check Ubuntu version matches (currently using 22.04)

**macOS build fails with code signing error**
- This is expected for unsigned builds
- Add Apple Developer certificates to GitHub secrets for signed builds

**Windows build fails**
- Ensure WebView2 is properly configured in `tauri.conf.json`
- Check that NSIS is available in the runner

### Workflow Not Triggering

**Push to branch doesn't trigger build**
- Check branch name matches pattern in workflow
- Verify workflow file is in `.github/workflows/`
- Check GitHub Actions is enabled for the repository

**Tag push doesn't trigger release**
- Ensure tag matches pattern `v*`
- Verify tag was pushed: `git push origin --tags`
- Check workflow permissions

### Artifact Issues

**Artifacts not uploading**
- Check file paths in upload step
- Verify build completed successfully
- Ensure files exist in expected locations

**Can't download artifacts**
- Artifacts expire after 7 days
- Download from Actions run page
- For releases, use the Release page instead

## Security Considerations

### Secrets

Currently no secrets are required. Future additions may include:

- `APPLE_CERTIFICATE`: macOS code signing
- `APPLE_CERTIFICATE_PASSWORD`: Certificate password
- `APPLE_SIGNING_IDENTITY`: Signing identity
- `WINDOWS_CERTIFICATE`: Windows code signing
- `WINDOWS_CERTIFICATE_PASSWORD`: Certificate password

Add secrets in: Settings > Secrets and variables > Actions > New repository secret

### Permissions

Workflows use minimal permissions:
- Default: `read` access to repository
- Release workflow: `contents: write` for creating releases

## Optimization

### Caching

The workflows use caching to speed up builds:
- **npm cache**: Caches downloaded packages
- **Rust cache**: Caches compiled dependencies

### Parallel Builds

The matrix strategy builds all platforms in parallel, reducing total build time from ~45 minutes (sequential) to ~15 minutes (parallel).

### Artifact Retention

Artifacts are kept for 7 days to balance storage costs and availability. Release artifacts are permanent (attached to releases).

## Future Improvements

1. **Code Signing**
   - Add Apple Developer certificate for macOS
   - Add code signing certificate for Windows
   - Implement notarization for macOS

2. **Auto-update**
   - Implement Tauri auto-updater
   - Configure update manifest
   - Add update check on app launch

3. **Additional Checks**
   - Add linting (ESLint, Prettier)
   - Add security scanning
   - Add dependency vulnerability scanning
   - Add bundle size monitoring

4. **Performance**
   - Add benchmark tests
   - Monitor bundle size changes
   - Profile memory usage

5. **Documentation**
   - Auto-generate API documentation
   - Deploy documentation to GitHub Pages
   - Add changelog generation

## Resources

- [Tauri GitHub Actions Guide](https://tauri.app/v1/guides/building/cross-platform)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tauri Action](https://github.com/tauri-apps/tauri-action)
- [Semantic Versioning](https://semver.org/)
