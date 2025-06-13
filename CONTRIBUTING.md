# Contributing to Fantasy Pro Clubs App

Thank you for your interest in contributing to the Fantasy Pro Clubs App! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the [Issues](https://github.com/yourusername/fantasy-pro-clubs-app/issues) section
2. If not, create a new issue with the following information:
   - Clear and descriptive title
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Environment details (browser, OS, etc.)

### Suggesting Features

1. Check if the feature has already been suggested in the [Issues](https://github.com/yourusername/fantasy-pro-clubs-app/issues) section
2. If not, create a new issue with the following information:
   - Clear and descriptive title
   - Detailed description of the feature
   - Use cases and benefits
   - Any mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. Make your changes
4. Run tests and ensure they pass:
   ```bash
   npm run test
   ```
5. Run linting and fix any issues:
   ```bash
   npm run lint
   ```
6. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug in feature"
   ```
7. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Create a Pull Request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots if applicable
   - List of changes made

## Development Guidelines

### Code Style

- Follow the [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use ESLint and Prettier for code formatting
- Follow the existing code style in the project

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use type guards when necessary

### Testing

- Write unit tests for new features
- Write integration tests for complex features
- Maintain or improve test coverage
- Use meaningful test descriptions

### Documentation

- Update documentation for new features
- Add JSDoc comments for functions and components
- Keep README and API documentation up to date
- Document any breaking changes

### Git Workflow

1. Keep commits atomic and focused
2. Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

3. Keep your branch up to date with main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep the PR focused and manageable
4. Squash commits before merging

## Getting Help

- Join our [Discord community](https://discord.gg/your-server)
- Ask questions in the [Discussions](https://github.com/yourusername/fantasy-pro-clubs-app/discussions) section
- Check the [FAQ](docs/FAQ.md) for common questions

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 