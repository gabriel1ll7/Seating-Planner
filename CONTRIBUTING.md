# Contributing to Seating.Art

Thank you for your interest in contributing to Seating.Art! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, device)

### Suggesting Features

Have an idea for a new feature? Create an issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

Check the [Future Features](README.md#-future-features) section in the README first to see if it's already planned.

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies:**
   ```bash
   bun install
   cd server && bun install
   ```
3. **Make your changes** with clear, focused commits
4. **Test thoroughly:**
   - Test on multiple browsers
   - Test on mobile devices
   - Ensure no console errors
5. **Follow code style:**
   - Use TypeScript types
   - Follow existing patterns
   - Add comments for complex logic
6. **Update documentation** if needed
7. **Submit a Pull Request** with a clear description

## Development Setup

See the [Quick Start](README.md#-quick-start) section in the README for detailed setup instructions.

## Code Style Guidelines

- **TypeScript:** Use strong typing, avoid `any`
- **Components:** Use functional components with hooks
- **State:** Use Jotai atoms for global state
- **Formatting:** Code will be formatted automatically
- **Naming:** Use descriptive, camelCase variable names

## Commit Messages

Write clear, descriptive commit messages:

```
Add feature for exporting seating chart to PDF

- Implement PDF generation using jspdf
- Add export button to header
- Include venue layout and guest list
```

## Testing

While we don't have automated tests yet, please test your changes:

- [ ] Frontend works without errors
- [ ] Backend API responds correctly
- [ ] Changes work on Chrome, Firefox, Safari
- [ ] Mobile responsive design maintained
- [ ] Dark mode works correctly

## Questions?

Feel free to open an issue for any questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
