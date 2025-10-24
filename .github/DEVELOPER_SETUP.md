# Developer Setup Guide

This document provides information for developers who want to contribute to or modify the Design Tokens Wizards project.

## Repository Structure

This repository includes `node_modules` to make it accessible for non-technical users who just want to clone and run the wizards without needing Node.js development experience.

## Development Dependencies

The repository has been optimized to reduce size by moving non-essential development tools to `devDependencies`. These are **not** installed by default when cloning the repository.

### Optional Dev Dependencies

The following packages are defined in `package.json` under `devDependencies` but are NOT included in the repository:

#### 1. **md-to-pdf** (v5.2.4)
- **Purpose**: Generates PDF documentation from markdown files
- **Used by**: `npm run pdf` script
- **When needed**: Only when regenerating PDF documentation
- **Installation**: `npm install --save-dev md-to-pdf`
- **Note**: Pre-generated PDFs are already included in `docs/pdf/` so most users don't need this

#### 2. **ffmpeg** (v0.0.4)
- **Purpose**: Reserved for potential future use
- **Currently**: Not actively used in the codebase
- **Installation**: `npm install --save-dev ffmpeg`

## Installing Dev Dependencies

If you need to work on documentation or use dev tools:

```bash
# Install all dev dependencies
npm install --save-dev md-to-pdf ffmpeg

# Or install individually
npm install --save-dev md-to-pdf
npm install --save-dev ffmpeg
```

## Generating PDF Documentation

To regenerate the PDF documentation:

1. Install md-to-pdf:
   ```bash
   npm install --save-dev md-to-pdf
   ```

2. Run the PDF generation script:
   ```bash
   npm run pdf
   ```

3. This will:
   - Run `.github/config/generate-pdf-docs.js` to prepare markdown files
   - Convert markdown to PDF using the config in `.github/config/pdf-config.json`
   - Apply styles from `.github/config/pdf-styles.css`
   - Output PDFs to `docs/pdf/Instructions.pdf` (English) and `docs/pdf/Instrucciones.pdf` (Spanish)

## Repository Size Optimization

The repository has been optimized to balance accessibility and size:

- **Before optimization**: 141MB (99MB node_modules + 42MB PDFs)
- **After optimization**: 57MB (15MB node_modules + 42MB PDFs)
- **Size reduction**: 60% smaller (85% reduction in node_modules)

### What Was Removed

- **puppeteer** (24.7.0) - Was imported but never used in the code
- **debug** (4.3.4) - Was declared but never used
- **md-to-pdf** (5.2.4) - Moved to devDependencies
- **ffmpeg** (0.0.4) - Moved to devDependencies

### What's Included

The following production dependencies are included in the repository:

- `@builtwithjavascript/oklch-converter` - Color space conversion
- `chalk` - Terminal styling
- `cli-table3` - Table formatting in CLI
- `inquirer` - Interactive prompts
- `path` - Path utilities
- `tinycolor2` - Color manipulation

## Contributing

When contributing to this project:

1. **Don't commit dev dependencies**: If you install `md-to-pdf` or `ffmpeg`, ensure they stay in `node_modules` but only update `package.json` if changing versions
2. **Test before committing**: Ensure all wizards work after your changes
3. **Keep it lean**: Avoid adding new dependencies unless absolutely necessary
4. **Document changes**: Update this file if adding new dev dependencies

## Running the Wizards

All wizards work without installing dev dependencies:

```bash
npm run color   # Color palette generator
npm run typo    # Typography scale generator
npm run space   # Spacing scale generator
npm run size    # Size scale generator
npm run radii   # Border radius generator
npm run merge   # Merge token files
npm run clear   # Clear generated files
```

## Version Management

To update version numbers across all wizards:

```bash
npm run update
```

This runs `.github/config/update_versions.js` which synchronizes version numbers in package.json scripts and README files.

## Questions?

If you have questions about the development setup, please open an issue on GitHub.
