# Audience Takeaway — "Harness Audit" One-Pager

Purpose: the artifact people photograph or screenshot at the end of the talk. Tool-agnostic — works whether the audience uses Copilot, Cursor, Claude Code, or an in-house agent.

---

## The mental model

```
Agent = Model + Harness

HARNESS   (system level, "operating system")   → orchestration, tool permissions, guardrails
  CONTEXT (session level, "briefing packet")    → what info loads, memory, retrieval
    PROMPT (message level, "job description")  → instructions, role, examples

A prompt can REQUEST safety. Only the harness can ENFORCE it.
```

## Guides vs. Sensors

| | Guides (before) | Sensors (after) |
|---|---|---|
| **When** | Steer the agent before it acts | Check the agent after it acts |
| **Examples** | Scoped instructions, specs, skills, agents, prompt templates | Linters, type checks, tests, architecture rules, review skills |
| **Failure mode if missing** | Agent guesses at your conventions | Agent's mistakes reach a human reviewer (or production) |

## 5-question self-audit — run this on your own team's setup

1. **Do your AI instructions load by scope, or does every request see everything?** (If everything loads always → you have a context-rot risk, not a harness.)
2. **Can you point to a real past failure behind every rule in your instructions file?** (If not → prune it; unearned rules dilute the ones that matter.)
3. **Are your instructions/prompts/skills version-controlled and reviewed like code?** (If they live in a wiki no one revisits → they're already stale.)
4. **When your code and your docs disagree, which one does the agent follow?** (It should be the code — codebase wins over guidelines.)
5. **What happens when the agent says "done"?** Does anything computational check that claim, or is a human the only sensor you have?

## 3 things to try this week

- Pick your single most-violated AI coding convention. Turn it into a linter rule or a failing test instead of another sentence in a prompt.
- Split one monolithic instructions file into scoped files that load only for the relevant file paths.
- Add one "silent on success, verbose on failure" check to your agent's workflow — even something as simple as "run the type checker before reporting done."

## Where to go deeper

*(Fill in before the talk — your blog post, repo, or slides link.)*
