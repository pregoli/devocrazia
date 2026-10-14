# Upstream

`SKILL.md`, `CREDITS.md`, and `LICENSE` are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), path `skills/engineering/pr/`.

- Pinned commit: `49dd158d1076134a641b33efb035946536778336`
- Don't edit `SKILL.md` here. The repo rules in `CLAUDE.md` still apply to every PR body it shapes (no em dashes, the title becomes the squash commit message). This repo has no `GLOSSARY.md`, so the skill's pointer to it is a no-op.

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
for f in SKILL.md CREDITS.md; do
  gh api "repos/mattpocock/skills/contents/skills/engineering/pr/$f?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/pr/$f
done
gh api "repos/mattpocock/skills/contents/LICENSE?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/pr/LICENSE
```

Then update the pinned commit above.
