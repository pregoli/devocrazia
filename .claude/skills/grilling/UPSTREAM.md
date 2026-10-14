# Upstream

`SKILL.md` and `LICENSE` are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), path `skills/productivity/grilling/`.

- Pinned commit: `49dd158d1076134a641b33efb035946536778336`
- Don't edit `SKILL.md` here. Devocrazia-specific guidance lives in the calling skills (`devocrazia-article-author`), so updating is a plain copy.

`grilling` is the interview itself and can be invoked by the model. `grill-me` is the user-only `/grill-me` command that calls it, so update the two together.

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
gh api "repos/mattpocock/skills/contents/skills/productivity/grilling/SKILL.md?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/grilling/SKILL.md
gh api "repos/mattpocock/skills/contents/LICENSE?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/grilling/LICENSE
```

Then update the pinned commit above.
