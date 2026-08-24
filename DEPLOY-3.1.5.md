# Deploy V3.1.5

No database migration is required. Deploy the application as a normal code-only release.

Recommended gates:

```bash
npm run typecheck
npm run content:check
npm run security:static
npm run stability:smoke
npm run build
```

After deploy, verify `/programlar/engage` on mobile, tablet and desktop. Confirm calculator controls update total score and the Game Manual CTA opens the configured program source.
