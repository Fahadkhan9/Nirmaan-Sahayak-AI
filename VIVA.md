# VIVA.md: understand the project in 5 minutes

## The story in three lines

1. A citizen in Bhopal pays fees and submits a building plan, then gets rejected weeks later for a setback rule.
2. The BMC clerk could have caught it, but the rulebook is 108 pages and the clerk has a minute per person.
3. Nirmaan Sahayak AI checks the plan at the counter, in seconds, and shows the rule, page and exact text as proof.

## How it works, step by step

```
Clerk types one sentence (Hindi or English)
        |
        v
Claude reads it  --->  pulls out numbers + units (plot 200 sqm, road 9 m)   [AI, cheap call, no rulebook]
        |              code converts feet / sq ft / gaj to metres                [NO AI]
        |                       |
        |                       v
        |              Form fills itself, clerk can fix any number
        |                       |
        |                       v
        |              Plain code checks each rule: pass / fail / warn   [NO AI, same answer every time]
        |
        +--> if there is a general question --> Claude answers from the full rulebook   [AI, cached]
                                                       |
                                                       v
                                              Code checks the quote exists word for word
        |
        v
Result: rule number + page + exact quote + rules version + "guidance only"
```

## Words you should be able to explain

| Word | Plain meaning in our project |
|---|---|
| Rules engine | Our TypeScript functions that read the tables and decide pass or fail. No AI inside. |
| Structured output | We give Claude a fixed JSON shape (a zod schema) and it must reply in that shape, so we get clean numbers, not a paragraph. We used this instead of forced tool calls because our model rejects forced tool use. |
| Two calls | Call 1 reads the sentence (small, cheap). Call 2 answers rule questions with the whole rulebook (only when needed). |
| Prompt caching | The rulebook (about 284k characters, roughly 70k tokens) is sent once and reused for a few minutes, so repeat questions are faster and cheaper. |
| Quote verifier | Code that searches the rulebook for Claude's quote. If it's not there word for word, we mark it unverified. |
| Server component | `page.tsx` runs on the server only. Buttons and forms are small client components. API keys never reach the browser. |
| Server action | A server function the page calls directly. It's where Claude is called. |
| Eval | A fixed list of questions with known answers. We run it and count how many we get right. |
| Boundary test | A test at the exact edge of a table row, like a 9.0 m road, where wrong tools slip. |
| Continuous slabs | The fee table prints 0-75 and 76-125. We read 75.5 sq m as the next slab (76-125). Written in `data/tables.json`. |
| Kruti Dev | The old Hindi font in the official Hindi PDF. We converted it to normal Hindi text. |

## Why we made each choice

- **Why not just a chatbot?** A chatbot answers what you ask. We check the whole plan, even what nobody asked.
  The numbers come from tested code, and every quote is verified.
- **Why not RAG?** The rulebook fits in Claude's memory (roughly 70k tokens). RAG's main failure is fetching the
  wrong rule. We skipped it and spent the time on verification.
- **Why does the engine run without AI?** So the department can use the core checks on day one, even without an
  API key, and the same input always gives the same result.
- **Why is the rule quote in English?** The English PDF is the source of truth. A translated legal sentence can
  change meaning. We show the official Hindi page as reading help.
- **Why no login with user accounts?** No personal data allowed, and it adds setup. A shared access code keeps it
  to counter staff.
- **Why does code convert units, not Claude?** Claude never does maths in our app. It says "30 ft"; code
  multiplies by 0.3048. Same rule for every number on screen.
- **Why a 2026 warning?** Our rules stop at March 2025. Rule 2(5)(c) changed in August 2026. We say so instead of
  pretending.

## Numbers to remember

- Front gap by road width: up to 9 m road → 3.0 m; above 9 to 12 → 3.6 m; above 12 to 18 → 4.5 m; above 18 → 6.0 m. (Rule 56(1)(a), p.77)
- Rear gap by plot area: up to 40 → none; above 40 to 150 → 1.5 m; above 150 to 225 → 2.5 m; above 225 → 3.0 m. (Rule 56(2)(a), p.78)
- Side gap: detached 3.0 m both sides (one side 1.5 m if height up to 7 m and frontage under 12 m); semi-detached 3.0 m one side (2.5 m if height and frontage both up to 10 m); row type none. (Rule 56(3), p.78)
- Plot size: detached above 225 sq m and frontage above 12 m; semi-detached 125-225 and 8-12 m; row type 50-225 and 4.5-12 m. (Rule 53(1)(i), p.70)
- Residential permission fee: slabs by built-up area, Rs 750 up to Rs 50,000. Application fee Rs 1 per sq m. (Rule 21, pp.35-36)
  Demo case: 180 sq m built-up = Rs 2,000 slab + Rs 180 application = Rs 2,180.
- Our accuracy (11 Oct 2026): rule checks 16/16, found/not-found 17/17, right rule 15/15, quotes verified 14/15.
  12 answered by Claude, 3 plan-style questions answered by the rules engine on screen.
  If asked: answers vary run to run (q11 was "not found" in an earlier run), and one quote (lifts) was
  unverified because it was not copied exactly; the app shows that honestly.

## What it does NOT do (say this before they ask)

- Buildings above 12.5 m, FAR, parking and non-residential fees are not checked by code. The tool says so and
  sends the clerk to the right rule (Rule 42 for tall buildings, Rule 21(3)(c) for high-rise fees).
- It does not store anything. Check history (Neon) was planned and not built.
- It does not approve anything. The officer decides.
- It does not know the text of the 2026 amendment, only that it exists.

## If a judge argues

1. Agree with what is true. 2. Answer in two sentences. 3. Point at the screen (accuracy, verified quote).
4. If you don't know: "We haven't tested that yet; here is how we would check it."
