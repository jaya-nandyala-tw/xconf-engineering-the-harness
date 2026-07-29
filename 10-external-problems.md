# External Problems — Beyond ssi-ai-kit

Research gathered to widen the talk's "problem, generalized" section (and the honesty beats in Context Rot) beyond ssi-ai-kit's own experience — real, citable, industry-wide evidence that harness engineering (and environment engineering specifically) addresses problems every multi-repo team hits, not just ours. Companion to [`07-resources.md`](./07-resources.md), which covers harness-engineering *literature*; this file covers harness-engineering *evidence* — numbers, incidents, case studies.

**Scoring convention:** ⭐ = strongest/most stage-ready (real number, named source, directly on-topic).

---

## 1. Environment fragmentation as a delivery-speed bottleneck (general SWE, not AI-specific)

Supports: Section 3 ("the problem, generalized") — the environment-setup bullet, and the user's ask to widen "solving the environment to increase speed of delivery."

- ⭐ **Uber — DevPod (remote dev environments):** measured **2.5x speedup on complex builds, 1.8x on average builds** after moving engineers off local laptops onto standardized remote environments; >60% of Uber engineers adopted DevPods by Nov 2022. Rare hard before/after multiplier. — [Uber Engineering Blog](https://www.uber.com/blog/devpod-improving-developer-productivity-at-uber/)
- ⭐ **GitHub — internal bootstrap time:** dropped **from minutes to 10 seconds** after standardizing containerized dev environments internally. — [GitHub Blog](https://github.blog/enterprise-software/collaboration/increase-developer-productivity-save-time-on-developer-onboarding-and-drive-roi-in-2023/)
- **Shopify — "Spin" cloud dev platform:** built because local monolith builds were melting laptops; complex project environments now provision in **~1 hour from scratch, minutes to sync thereafter**. — [Shopify Engineering Blog](https://shopify.engineering/shopifys-cloud-development-journey)
- **Forrester TEI (commissioned by GitHub, 2022):** developer time savings of **10% (Yr1) → 15% (Yr2) → 20% (Yr3)** from standardized workflows; 376–433% 3-year ROI headline. *Caveat: vendor-commissioned — disclose if quoted.* — [Forrester TEI of GitHub Enterprise Cloud](https://tei.forrester.com/go/github/enterprisecloud/)
- **Trend indicator:** share of developers using local machines as primary dev environment reportedly fell **64% (2024) → 36% (2025)**. *Secondary summary — verify against primary DORA report before quoting on stage.*
- **Order-of-magnitude anchor (not environment-specific):** industry survey finds developers lose **8+ hrs/week (~20% of capacity)** to tooling/technical-debt inefficiencies — ~$6.9M/yr for a 500-person org. — [ShiftMag](https://shiftmag.dev/developers-waste-8-hours-weekly-on-inefficiencies-like-technical-debt-3956/)

## 2. Reproducible-environment solutions (the fix, with numbers)

Supports: the "solving the environment" solution half — pairs with Section 1 above as problem → fix.

- ⭐ **Gitpod / Quizlet:** debugging a broken local environment went from **~2 hours to under 30 seconds** (spin up a fresh workspace instead of troubleshooting); onboarding-related productivity issues dropped 60pp. — [Gitpod customer story](https://www.gitpod.io/customers/quizlet)
- ⭐ **Gitpod / Vizlib:** new-hire onboarding **2 days → 1 hour**; **20% fewer post-release hotfixes** (QA could spin up a workspace per branch). — [Gitpod customer story](https://www.gitpod.io/customers/vizlib)
- **Nix flakes / FiveOneFour:** a new engineer wrote a `flake.nix` on day one; polyglot environment setup went **~30 min → ~5 min**, with `flake.lock` pinning toolchain versions so CI matches dev exactly. — [FiveOneFour Blog](https://www.fiveonefour.com/blog/managing-a-polyglot-stack-with-nix-flake)
- ⭐ **Anthropic's own guidance — agent-run environment health check:** recommends an agent start each session by running an `init.sh`, bringing up the dev server, and running an end-to-end smoke check *before* touching new work. First-party vendor validation of the same pattern already in the walkinglabs course (`07-resources.md` #4) — worth citing both together. — [Anthropic Engineering](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- *Caveat:* devcontainers specifically have thin named-company ROI numbers — treat as qualitative ("works on my machine" elimination), not quantified, unless a better case study turns up.

## 3. Multi-repo / cross-service coordination pain (the "blast radius" problem, generalized)

Supports: Section 3's blast-radius bullet — this is the strongest new material of the whole batch.

- ⭐⭐ **Mabl — AI agents shipping across 75+ repos:** before building a cross-repo dependency registry, "context drift" caused **~40% of agent task failures** across a 25-engineer, 100+ repo estate; after an 850-line dependency graph spanning 79 repos, failures dropped to **under 5%**. Recent (2026), directly on-topic, real before/after — this is close to a ready-made case study for the talk. — [Mabl Blog, Part 1](https://www.mabl.com/blog/how-we-built-a-system-for-ai-agents-to-ship-real-code-across-75-repos) / [Part 2](https://www.mabl.com/blog/how-we-built-a-system-for-ai-agents-to-ship-real-code-across-75-repos-part-2)
- ⭐ **Cortex — Engineering in the Age of AI: 2026 Benchmark Report:** as AI adoption accelerated industry-wide, incidents per PR rose **23.5%**, change failure rate rose **~30%** — quantifies "surfaces too late" at industry scale. — [Cortex report](https://www.cortex.io/post/ai-is-making-engineering-faster-but-not-better-state-of-ai-benchmark-2026)
- **Uber's "Death Star" architecture:** ~2,000 engineers, 1,000+ services, 8,000 git repos — "to build a simple feature an engineer often has to work across multiple services owned by different teams," producing "networked monoliths" that must be deployed together. Good scale-setting quote. — [Uber Engineering Blog](https://www.uber.com/us/en/blog/microservice-architecture/) / [summary](https://highscalability.com/lessons-learned-from-scaling-uber-to-2000-engineers-1000-ser/)
- **Netflix Service Topology:** built because static dependency maps "proved useless" for thousands of microservices deploying multiple times a day, after four years of engineers repeatedly asking "what would this change affect?" — [InfoQ](https://www.infoq.com/news/2026/06/netflix-microservices-realtime/)
- **Academic backing:** systematic mapping study confirms context-/role-switching as a well-documented source of extraneous cognitive load in software engineering. — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S095058492100046X)

## 4. Enterprise AI-agent adoption — the productivity paradox

Supports: Context Rot / honesty section — evidence that scaling AI agents org-wide surfaces new problems, not fewer.

- ⭐⭐ **METR RCT:** 16 experienced OSS devs, 246 real tasks — devs using AI were **19% slower**, but *perceived* themselves as **20% faster**. The single best "wow" stat in this whole research pass — a measured perception-reality gap that's the whole argument for computational sensors over self-assessment in one number. — [METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- ⭐ **Microsoft's internal rollout study (arXiv, Jul 2026):** tens of thousands of engineers adopting Claude Code + Copilot CLI — adopters merged **~24% more PRs**, but researchers explicitly caution "a merged PR is not the same as the value it delivers." — [arXiv 2607.01418](https://arxiv.org/abs/2607.01418)
- ⭐ **"These Aren't the Reviews You're Looking For" (arXiv):** analysis of the AIDev dataset — **61.4%** of agent-authored PRs get *no recorded human review at all*; **22.6%** reviewed only by other agents; **71.6%** of all review comments are themselves agent-authored. Strong evidence that verification is being silently delegated to unaccountable agent-to-agent loops. — [arXiv 2605.02273](https://arxiv.org/abs/2605.02273)
- **Uber capped AI coding spend:** burned its entire 2026 AI budget in ~4 months, imposed a **$1,500/engineer/month** cap per tool. A real "unmanaged agent scale-out" cost story, distinct from the Replit/Cursor database incidents already in `09-potential-content.md`. — [Simon Willison](https://simonwillison.net/2026/Jun/3/uber-caps-usage/)
- **Faros AI / productivity-paradox synthesis:** 93%+ tool adoption, but organizational throughput gains near **10%** — the headline paradox stat, cites the METR finding above. — [Faros AI](https://www.faros.ai/blog/ai-software-engineering)
- **Salesforce Engineering (internal data):** PRs regularly exceed 20 files/1,000 lines, code volume **+30%**, review latency rising quarter-over-quarter — prompted a review-tooling rebuild ("Prizm"). — [Salesforce Engineering Blog](https://engineering.salesforce.com/scaling-code-reviews-adapting-to-a-surge-in-ai-generated-code/)
- **Worth a closer look before using:** a piece titled *"What Is an AI Coding Agent Harness? Stripe, Shopify, Airbnb"* (MindStudio) surfaced in this research and looks directly on-topic but hasn't been read in full yet. — [MindStudio](https://www.mindstudio.ai/blog/ai-coding-agent-harness-stripe-shopify-airbnb)

## 5. AI output quality — "plausible but wrong," quantified

Supports: Section 3's core claim and the Sensors section's justification — same territory as `07-resources.md` #5/#6 but with new, harder numbers.

- ⭐⭐ **GitClear 2025 report (211M lines, 2020–2024):** copy-paste code up **48%** (8.3%→12.3% of all lines), duplicated code blocks up **8x**, refactoring ("moved" code) down **24.1%→9.5%**. Directly quantifies "AI reproduces patterns instead of reusing/refactoring existing code" — the mechanism behind "wrong pattern for your codebase." — [GitClear](https://www.gitclear.com/ai_assistant_code_quality_2025_research)
- ⭐ **CodeRabbit (470 PRs, Dec 2025):** AI-authored PRs average **10.83 issues vs. 6.45** for human-only (**~1.7x**); logic/correctness issues **+75%**, readability **+3x**, security up to **2.74x**. Quantifies "looks right, isn't correct" at issue-taxonomy granularity. — [CodeRabbit](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- **Self-Attribution Bias paper (arXiv 2603.04582, Mar 2026):** across 4 coding/tool-use datasets, LLM monitors under-report high-risk/low-correctness actions when the action appears in the model's *own* prior turn vs. an identical action presented fresh — a formal academic demonstration of self-verification bias, beyond what Anthropic/Osmani already argue qualitatively. — [arXiv](https://arxiv.org/abs/2603.04582)

---

## How this maps back to the talk

- **Section 3 (the problem, generalized):** lead with Mabl's 40%→5% number (§3 above) as the multi-repo case study, and GitClear's duplication data (§5) as the "plausible but wrong" mechanism. Uber's DevPod/Shopify Spin numbers (§1) back the environment half of the ask.
- **Sensors section:** METR's 19%-slower-but-feels-20%-faster stat (§4) is the strongest available justification for "don't trust self-assessment" — stronger than anything currently in `07-resources.md`.
- **Context Rot / honesty section:** the review-abdication stat (61.4% no human review, §4) and Uber's spend cap (§4) are good "this is a live, unsolved industry problem" beats — not just ssi-ai-kit's own gaps.
- **Generalizing / 5 principles:** Anthropic's own `init.sh`-style agent self-check (§2) reinforces Principle-adjacent material already staged in `09-potential-content.md` row 3 (sensors) and the walkinglabs citation in `07-resources.md`.

Nothing here has been folded into `01-talk-outline.md` yet — flag which items you want in, and whether you want the MindStudio Stripe/Shopify/Airbnb piece read in full first.
