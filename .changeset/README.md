# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage releases.

## Adding a changeset

When you make a change that should be included in the release notes, run:

```bash
pnpm changeset
```

This will prompt you to:

1. Select the type of change (patch, minor, major)
2. Write a summary of the change

The changeset will be saved as a markdown file in the `.changeset` directory.

## Release process

When `dev` is merged to `main`:

1. The release workflow checks for changesets
2. If changesets exist, it creates/updates a "Release" PR that:
   - Bumps the version in `package.json`
   - Updates `CHANGELOG.md` with all changes
3. When the Release PR is merged, a GitHub Release is automatically created

## Versioning guidelines

- **patch**: Bug fixes, small improvements, dependency updates
- **minor**: New features, significant improvements
- **major**: Breaking changes, major new features
