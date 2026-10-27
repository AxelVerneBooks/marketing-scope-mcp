## Summary

<!-- What does this change and why? Link the issue if there is one (Fixes #123). -->

## Affected tools / areas

<!-- e.g. score_offer, check_plan, HTTP transport, docs -->

## Testing

<!-- What you ran and what you checked by hand. -->

## Checklist

- [ ] `npm test` passes
- [ ] `npm pack --dry-run` lists the expected files
- [ ] New or changed tool behavior is covered in `test/server.test.mjs`
- [ ] Scores and checks still return their evidence; no violation passes silently
- [ ] Entry added under **Unreleased** in `CHANGELOG.md` (if user-visible)
- [ ] Version numbers left untouched (the release workflow bumps them)
