# Upstream

`SKILL.md` and `LICENSE` are copied unchanged from [blader/humanizer](https://github.com/blader/humanizer) (MIT), listed on [skills.sh](https://www.skills.sh/blader/humanizer/humanizer).

- Pinned commit: `225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8` (skill version 3.1.0)
- Don't edit `SKILL.md` here. Devocrazia-specific guidance (voice sample, house conventions) lives in the calling skills, `devocrazia-article-author` and `devocrazia-medium-publish`, so updating is a plain copy.

The upstream file uses em dashes in its own examples. That's fine: the no-em-dash rule applies to articles, and the build only checks `public/content/articles/` and `src/data/articles.ts`.

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
for f in SKILL.md LICENSE; do
  gh api "repos/blader/humanizer/contents/$f?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/humanizer/$f
done
```

Then update the pinned commit above.
