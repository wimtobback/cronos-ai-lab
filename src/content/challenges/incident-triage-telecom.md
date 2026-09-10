---
title: "Cutting incident triage from 40 minutes to under five"
client: "A national telecom operator"
sector: "Telecommunications"
summary: "Network incidents were being routed by hand through three levels of support before anyone qualified saw them. We built the router."
outcome: "89% faster triage"
status: illustrative
year: 2026
publishDate: 2026-07-09
---

## The problem

Roughly 40,000 network incidents a month arrived as free text from field engineers, monitoring systems and customers. Each one passed through up to three support tiers before landing with someone who could act, and the median time from report to correct owner was 40 minutes. The cost was not the labour — it was the outage minutes that accumulated while a ticket sat in the wrong queue.

## What we did

The framing sprint established the metric that mattered: time-to-correct-owner, not time-to-resolution. That distinction ruled out most of the obvious approaches, including the ticket-summarisation tool the organisation had already bought.

We built a classifier over eight years of historical tickets and their eventual true owners, plus a confidence threshold below which the ticket goes to a human triager rather than guessing. The system routes about 78% of tickets directly and hands the rest to people, with its reasoning attached.

## Outcome

Median time-to-correct-owner fell from 40 minutes to 4.4. Misroutes fell by two thirds. The remaining 22% is deliberate — pushing the automation rate higher made the error cost worse than the time saved, and we said so.
