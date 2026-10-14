# Upstream

`SKILL.md` and `LICENSE` are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), path `skills/engineering/to-tickets/`.

- Pinned commit: `49dd158d1076134a641b33efb035946536778336`
- Don't edit the copied files here.

Breaks a spec issue or a conversation into ticket issues with blocking edges. It reads the tracker setup from `docs/agents/`, which `setup-matt-pocock-skills` wrote.

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
gh api "repos/mattpocock/skills/contents/skills/engineering/to-tickets/SKILL.md?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/to-tickets/SKILL.md
gh api "repos/mattpocock/skills/contents/LICENSE?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/to-tickets/LICENSE
```

Then update the pinned commit above. `to-spec`, `to-tickets`, and `setup-matt-pocock-skills` share the tracker conventions, so update them together.
