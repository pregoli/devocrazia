# Upstream

`SKILL.md` and `LICENSE` are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), path `skills/productivity/grill-me/`.

- Pinned commit: `49dd158d1076134a641b33efb035946536778336`
- Don't edit `SKILL.md` here.

`/grill-me` only calls the `grilling` skill, which holds the actual interview, so update the two together (see `../grilling/UPSTREAM.md`).

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
gh api "repos/mattpocock/skills/contents/skills/productivity/grill-me/SKILL.md?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/grill-me/SKILL.md
gh api "repos/mattpocock/skills/contents/LICENSE?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/grill-me/LICENSE
```

Then update the pinned commit above.
