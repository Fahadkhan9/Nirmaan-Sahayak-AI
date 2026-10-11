# Live demo script

Copy-paste sentences for the live demo, with the result each one should give. Every result below was
checked against the running app (`claude-sonnet-5-5`, rules consolidated to 6 March 2025).
The three starred (★) cases are also one-click "Try" buttons above the text box.

## Before you start

- `.env.local` (or Vercel env) has `ANTHROPIC_API_KEY`.
- Access gate (optional): set `ACCESS_CODE=<code>` and `ACCESS_DEMO_FILL=true`, then restart.
  Opening the app goes to `/access`; click **Fill demo code**, then **Enter**.
  For a recording without the gate, leave `ACCESS_CODE` empty.
- Click **New citizen** between cases so old numbers do not mix in.

## 1. ★ Hindi plan check (main demo)

```
200 वर्ग मीटर प्लॉट, 9 मीटर सड़क, अर्ध-पृथक, ऊंचाई 9 मीटर, आगे 3 मीटर, पीछे 1.5 मीटर, साइड 3 मीटर, निर्मित क्षेत्र 180 वर्ग मीटर, फीस कितनी?
```

The form fills itself, then:
- Rear: **FAIL**, needs 2.5 m, Rule 56(2)(a), p.78
- Front: pass (3.0 m, Rule 56(1)(a), p.77) · Side: pass (Rule 56(3), p.78) · Plot type: pass (Rule 53(1)(i), p.70)
- Amendment: warn (Rule 2(5)(c), 28 Aug 2026 change for plots up to 500 sq m)
- Fee: **Rs 2,180** (Rule 21(3)(b), p.36)
- "Add: Frontage" chip, because frontage was not given

Then change **Rear open space** to `2.5` in the form: rear turns to pass instantly, with no AI call.

## 2. English plan in feet (units converted by code)

```
Plot 1200 sq ft, road 30 ft wide, row house, height 10 m, front gap 10 ft, rear 5 ft, built-up area 1000 sq ft. Is this okay?
```

- Converted: plot 111.48 sq m, road 9.14 m, front 3.05 m, rear 1.52 m, built-up 92.9 sq m
- Front: **FAIL**, needs 3.6 m (a 30 ft road is just over 9 m), Rule 56(1)(a), p.77
- Rear: pass (1.5 m) · Side: pass (row houses need none) · Plot type: pass
- Fee: Rs 1,343

## 3. Hinglish plan in gaj (all pass)

```
Mera plot 300 gaj ka hai, frontage 13 meter, sadak 12 meter, detached ghar, height 7 meter, aage 3.6 meter, peeche 3 meter, dono side 3 meter.
```

- Plot 250.84 sq m (300 gaj converted by code)
- Front, rear, side and plot type: all **pass** · Amendment: warn
- "Add: Total built-up area" chip (needed for the fee)

## 4. ★ Rule question in Hindi (verified quote)

```
15 मीटर ऊंची इमारत में लिफ्ट ज़रूरी है क्या?
```

- Answer in Hindi: lifts are needed above 12.5 m, so yes
- Rule 83, p.95, quote "Provision for lifts shall be made for building more than 12.5 meters in height." **✓ Verified**

## 5. ★ Not in the rules

```
How do I pay my property tax online?
```

- "नियमों में नहीं मिला · Not found in the rules". No made-up answer.

## Backup rule questions (all verified in the eval)

```
I applied for building permission and the authority has not replied. What happens if they miss the deadline?
```
Rule 28, p.48

```
How far must my balcony stay from a low-voltage overhead electric line, vertically and horizontally?
```
Rule 52(1)(a), p.69

```
बिल्डिंग परमिशन की फीस कितनी है और किस नियम में लिखी है?
```
Rule 21(2)(ii), p.35

```
Which rule decides what happens when the Development Plan and these rules disagree?
```
Rule 103, p.107

## Points to say

- Claude only reads the language. Plain code applies the rules, and Claude never does maths.
- Every quote is checked word for word against the rulebook before it shows "Verified".
- The checks work even without an API key.
- No personal data is stored. Guidance only: the officer decides.
