# Contributing to Design Tokens Wizards

Thank you for your interest in contributing to Design Tokens Wizards! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### 1. Fork and Clone

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/design-tokens-wizards.git
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/design-tokens-wizards.git
   ```

### 2. Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 3. Making Changes

1. Make your changes following the project's coding standards
2. Write or update tests as needed
3. Update documentation if necessary
4. Test your changes thoroughly

### 4. Commit Guidelines

- Use clear and descriptive commit messages
- Reference issues and pull requests in commit messages when applicable
- Keep commits focused and atomic

Example commit message:

```
feat: add new color contrast checker

- Implement WCAG 2.1 contrast ratio calculation
- Add support for custom color formats
- Update documentation with new features

Closes #123
```

### 5. Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if you're changing functionality
3. The PR will be merged once you have the sign-off of at least one other developer
4. Make sure all tests pass

### 6. Development Guidelines

#### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

#### Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Include both unit and integration tests where appropriate

#### Documentation

- Update documentation for any new features or changes
- Include examples where helpful
- Keep documentation clear and concise
- **Important**: All major sections in the documentation must be separated by page breaks for proper PDF generation
  - Each h1 and h2 heading should start on a new page
  - Use appropriate CSS classes to ensure proper page breaks
  - Test the PDF output to verify correct page separation

#### PDF Generation

- All documentation sections must be properly separated by pages
- Each major section (h1) should start on a new page
- Each subsection (h2) should also start on a new page
- Test the PDF output to ensure proper page breaks
- Maintain consistent margins and spacing across pages

## Project Structure

```
design-tokens-wizards/
├── src/
│   ├── wizards/          # Main wizard implementations
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── tests/               # Test files
├── docs/               # Documentation
└── examples/           # Example usage
```

## Getting Help

If you need help or have questions:

1. Check the existing documentation
2. Open an issue for bugs or feature requests
3. Join our community discussions

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to Design Tokens Wizards! 🚀
