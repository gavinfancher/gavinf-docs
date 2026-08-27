---
title: "Git Help"
description: "Git and GitHub notes."
sidebar:
  label: Overview
  order: 0
---

### Creating a repo from the cli (GitHub)

```bash
gh repo create my-repo-name --private --source=. --push
```
pass
- `--public` to adjust the repo visibility
- `--push` is optional
- `--source=.` uses the local directory files (all of them when you pass `.`) to the repo