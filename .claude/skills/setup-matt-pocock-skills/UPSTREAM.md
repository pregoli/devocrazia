# Upstream

`SKILL.md`, its seed templates (`domain.md`, `issue-tracker-*.md`, `triage-labels.md`), and `LICENSE` are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), path `skills/engineering/setup-matt-pocock-skills/`.

- Pinned commit: `49dd158d1076134a641b33efb035946536778336`
- Don't edit the copied files here.

It has already been run: its output is `docs/agents/*.md` and the `## Agent skills` block in `CLAUDE.md`. Those files are ours to edit. Run `/setup-matt-pocock-skills` again only to switch issue trackers.

One deviation from its process: it writes `docs/agents/triage-labels.md` only when the `triage` skill is installed, but `to-spec` and `to-tickets` apply the `ready-for-agent` label regardless, so the labels file is there and the labels exist on GitHub.

To update, read the upstream diff first, since these instructions run with your permissions:

```bash
SHA=<new commit>
for f in SKILL.md domain.md issue-tracker-github.md issue-tracker-gitlab.md issue-tracker-local.md triage-labels.md; do
  gh api "repos/mattpocock/skills/contents/skills/engineering/setup-matt-pocock-skills/$f?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/setup-matt-pocock-skills/$f
done
gh api "repos/mattpocock/skills/contents/LICENSE?ref=$SHA" -H "Accept: application/vnd.github.raw" > .claude/skills/setup-matt-pocock-skills/LICENSE
```

Then update the pinned commit above. `to-spec`, `to-tickets`, and `setup-matt-pocock-skills` share the tracker conventions, so update them together.
