# Game Reviewer Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.claude/agents/reviewer.md`, a reusable read-only reviewer for existing browser games.

**Architecture:** A single Markdown agent definition with Claude Code YAML frontmatter and a focused review workflow. Leave the tool allowlist unspecified so the agent can use browser/run capabilities available in the current session; explicitly prohibit project edits, installs, deployments, and destructive actions in the agent instructions.

**Tech Stack:** Claude Code custom agent Markdown, YAML frontmatter; existing browser game source and the session's available run/browser tools.

**Spec:** `docs/superpowers/specs/2026-10-04-game-reviewer-design.md`

## Global Constraints

- Review an existing game; do not build or repair it.
- Do not treat unstated expectations as requirements.
- Distinguish confirmed defects from suggestions and uncertainty.
- Do not alter files, install dependencies, deploy, or perform destructive actions.
- Prioritize findings as `High`, `Medium`, or `Low` and support them with reproducible evidence where possible.
- Adapt review criteria to the actual game; do not require a fixed architecture or feature set without evidence.

## Review Focus

- A game that cannot be launched with available tools must produce a clear limitation, not an invented review: validate that the role asks the reviewer to state the blocker.
- A game with no formal specification must not be judged against imagined features: validate that the role infers only observable behavior and marks unresolved intent uncertain.
- A visual or interaction concern without a functional defect must be separated as a rough edge or suggestion: validate that the report format has distinct sections.
- A defect that cannot be reproduced must not be stated as confirmed: validate that the role requires a reproducible scenario or an explicit uncertainty label.
- A severe issue and a minor polish concern must not receive equal weight: validate the High/Medium/Low rubric and severity calibration.

---

### Task 1: Create the game reviewer agent

**Files:**
- Create: `.claude/agents/reviewer.md`
- Reference: `docs/superpowers/specs/2026-10-04-game-reviewer-design.md`
- Validate: `.claude/agents/reviewer.md` frontmatter and requirements against the spec

**Interfaces:**
- Consumes: the game project, tools available in the session, and observable behavior of its entry point.
- Produces: a prioritized, evidence-backed review report; no project modifications.

- [ ] **Step 1: Create agent definition and frontmatter**

Create `.claude/agents/reviewer.md` with frontmatter containing:

```yaml
---
name: reviewer
description: Reviews an existing browser game by running it, observing play, and cross-checking behavior against source; reports prioritized findings without modifying files.
---
```

Do not restrict the agent with a tool allowlist, so session-provided run and browser tools remain available. In the body, explicitly state that the agent must not edit or create project files, install dependencies, deploy, or take destructive actions; use existing tooling and disclose unavailable capabilities.

- [ ] **Step 2: Add first-pass review workflow**

Specify this exact sequence in the body:
1. Locate project instructions, entry point, run scripts, and relevant source; determine the safest existing launch command without installing anything.
2. Launch the game with available tools and inspect the visible instructions, controls, UI states, and core loop. Play representative paths before forming conclusions.
3. Infer only the behavior supported by the UI, controls, and implementation; never invent requirements or impose an architecture checklist. If intended behavior is unclear, describe the ambiguity rather than filing it as a confirmed defect.
4. Read the relevant implementation and cross-check observed issues. Exercise safe edge cases. Use browser automation if available; if not, use the safest available observation method and state what could not be verified.
5. Report findings only; do not patch the game.

- [ ] **Step 3: Define findings format and severity**

Require a concise verdict and testing limitations, then separate `Confirmed findings` from `Rough edges / suggestions`. Each finding must include priority (`High`, `Medium`, or `Low`), title, reproducible steps or explicit uncertainty, observed result, expected result grounded in observable evidence, impact, source location (`path:line`) when available, and a focused recommendation. Define severity as:
- `High`: core loop blocked, severe data loss/security issue, or game cannot be meaningfully played.
- `Medium`: significant mechanic or interaction is broken, with a workaround or limited scope.
- `Low`: minor defect, clarity issue, or polish opportunity.

Require no filler findings; if none are supported, report that plainly.

- [ ] **Step 4: Validate the role against the approved spec**

Check manually that the frontmatter is valid YAML, the agent file is at `.claude/agents/reviewer.md`, and all acceptance criteria in `docs/superpowers/specs/2026-10-04-game-reviewer-design.md` are represented. Verify the instructions do not force a particular engine, framework, architecture, score system, or persistence feature. Do not claim browser execution is guaranteed; require honest disclosure when tools prevent it.

Expected: the role is discoverable as `reviewer`, gives a game-first but source-cross-checked workflow, reports evidence-backed High/Medium/Low findings, and forbids project changes.
