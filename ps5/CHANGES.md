# Change record

Initial design: f4dcfb87e53db25f40ee84953ceb405b0e9b83ba

## 1. Check mandatory degree enrollment before recommending

- **Changed:** skill assess-posting
- **Commit:** 5c0d9ca
- **Who noticed:** me
- **Who chose the fix:** me, from options the agent gave
- **What changed:** Use the confirmed bachelor program when assessing mandatory degree enrollment; skip graduate-enrollment-only roles and preserve unknown qualifications. Save a separate reassessment while retaining the original result.

### What was wrong (my own words)

the tracker mark Amazon intern as explore even though it reqires master or higher while im only bacheloer. It didnt check the required degree

<!-- attested 2026-11-19 sha256:9f1db3227551 -->

### Why this fix (my own words)

bc it is more percise so that ppl with bachloer's only wont have job appication with master only

<!-- attested 2026-11-19 sha256:6ba01bdd8beb -->

## 2. Flag application deadlines without a confirmed year

- **Changed:** skill assess-posting
- **Commit:** 2d8d6bd
- **Who noticed:** me
- **Who chose the fix:** the agent
- **What changed:** Change otherwise exploratory postings to needs_review when a captured calendar deadline has no confirmed year. Put the warning first in the rationale and unknowns, preserve the original date phrase, and avoid inferring a year.

### What was wrong (my own words)

it fix that when the year of the deadline is unclear, it will let the human check it manually

<!-- attested 2026-11-19 sha256:8b0f4d781c39 -->

### Why this fix (my own words)

bc when letting human check those unclear one so that the expired one wont be in the list

<!-- attested 2026-11-19 sha256:7cde7a06d8e5 -->
