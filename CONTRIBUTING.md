# Contributing to Codexify

First off, thanks for taking the time to contribute! 🎉

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Making Changes](#making-changes)
5. [Submitting Changes](#submitting-changes)
6. [Style Guide](#style-guide)
7. [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [project email].

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/codexify.git
```

2. Install dependencies:
```bash
cd codexify/electron
npm install
```

3. Create a branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
codexify/electron/
├── src/
│   ├── components/     # React components
│   │   └── ui/        # shadcn/ui components
│   ├── lib/           # Utility functions
│   ├── model.js       # AI model handling
│   ├── db.js         # Database operations
│   └── index.js      # Main electron process
├── assets/           # Static assets
└── tests/           # Test files
```

## Making Changes

1. **Components**: New UI components should be added to `src/components/`
2. **Database**: Database changes should update both `db.js` and the schema version
3. **AI Model**: Changes to embedding logic go in `model.js`
4. **Document Processing**: Update `document-processor.js` for new file types

### Best Practices

- Write meaningful commit messages
- Add tests for new functionality
- Update documentation for API changes
- Follow the existing code style
- Keep changes focused and atomic

## Submitting Changes

1. Update your branch with main:
```bash
git fetch origin
git rebase origin/main
```

2. Push your changes:
```bash
git push origin feature/your-feature-name
```

3. Create a Pull Request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Steps to test
   - Related issues

## Style Guide

### JavaScript/TypeScript
- Use TypeScript for new components
- Follow prettier configuration
- Use ES6+ features
- Add JSDoc comments for functions

### React
- Use functional components
- Implement proper prop-types
- Follow shadcn/ui patterns
- Keep components small and focused

### CSS
- Use Tailwind utilities
- Follow BEM for custom CSS
- Maintain dark mode support

## Testing

1. Run the test suite:
```bash
npm test
```

2. Test types:
   - Unit tests for utilities
   - Integration tests for database
   - E2E tests for main features

### Writing Tests

```typescript
describe('Feature', () => {
  it('should work as expected', () => {
    // Your test here
  });
});
```

## Release Process

1. Version bump in `package.json`
2. Update CHANGELOG.md
3. Create a tagged release
4. Build and test installers

## Getting Help

- Check the [documentation](docs/)
- Join our [Discord community](#)
- Create an issue for bugs
- Discuss major changes in issues first

## Recognition

Contributors will be added to our [Contributors](CONTRIBUTORS.md) list. We value and appreciate all contributions, big or small! 