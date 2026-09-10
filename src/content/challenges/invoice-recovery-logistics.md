---
title: "Finding the 3% of invoices that were quietly wrong"
client: "A European logistics group"
sector: "Logistics"
summary: "Freight invoices were audited by sampling because nobody could check 1.2 million lines a year. We checked all of them."
outcome: "€2.1M recovered in year one"
status: illustrative
year: 2025
publishDate: 2026-04-22
---

## The problem

Freight invoicing involves contracted rates, surcharges, accessorials and exceptions that vary per carrier, per lane and per contract amendment. The group audited 2% of invoices by sample and assumed the rest were fine. Everyone suspected they were not.

## What we did

The hard part was never anomaly detection. It was reconstructing what each invoice *should* have said, which meant parsing contracts that existed as PDFs, emails and in one case a spreadsheet maintained by a since-retired employee.

We built a rate engine that reconstitutes the expected charge for every line, and flags discrepancies with the contract clause that justifies the flag. Finance disputes with evidence rather than suspicion.

## Outcome

€2.1M recovered in the first twelve months against a build cost well under a tenth of that. More usefully, three carriers corrected their own billing once they knew every line was being checked.
