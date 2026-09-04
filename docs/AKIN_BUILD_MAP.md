# AKIN Build Map

This document is the working source-of-truth for the AKIN product, architecture, data model, frontend structure, and current build state.

## Working rule

Before making structural changes to AKIN:

1. Read this document.
2. Read the current implementation files involved in the change.
3. Extend the existing system instead of rebuilding it.
4. Update this document when a structural decision, endpoint, table relationship, entry route, or major frontend responsibility changes.

The GitHub repository is the source-of-truth for implementation. Chat history and memory are supporting context only.

---

# 1. Product Model

AKIN is a personalized personal-development and wellbeing product, launching first for Filipino women and designed from the beginning to support additional countries, markets, languages, pricing, content, and advertising later.

AKIN should feel like an experience, not a conventional app made from menus, forms, trackers, and feature pages.

AKIN touches mental wellbeing, but the product should feel less clinical and more life-personal. It should not present itself primarily as therapy, a mood tracker, a habit tracker, or a meditation app.

Its core value is that it gradually understands a person's life: the people she carries, recurring patterns, things she postpones, what gives or drains energy, what she wants, what she avoids, and what keeps getting moved to later. AKIN then uses that understanding to create useful, timely experiences.

## Core positioning

AKIN should feel like:

- something that notices
- something that remembers
- something that helps the user see patterns
- something that creates useful moments around real life
- something that becomes more personal over time

Avoid unnecessarily clinical language when a normal human phrase works better.

Example:

Prefer:

`Who usually gets pushed to the end?`

over:

`Identify your caregiving stress response.`

The product has exactly two modes.

## Public Mode

Public Mode is the outward-facing AKIN experience.

It is a genuine, useful wellbeing space with general experiences such as calm, stress, breathing, reflection, and other outward-safe content.

Its additional purpose is discretion: when AKIN is opened around other people, personal content is not visible.

There is no obvious Private Mode button.

The top-right orb behaves normally on a regular tap. A user's chosen concealed entrance can later be attached to it or another approved hidden interaction.

## Private Mode

Private Mode is the personalized AKIN space.

This is where account-linked activity belongs, including:

- journeys
- experiences
- relationships / connections
- memories
- goals
- reflections
- check-ins
- recommendations
- history
- personalization
- learned context

Private Mode is accessed through a concealed entrance chosen during onboarding, followed by proper authentication such as biometrics or a 4-digit PIN.

Leaving Private Mode should return immediately to Public Mode.

## Core privacy principle

The hidden entrance is concealment, not the only security layer.

Private security should combine a discreet entrance with proper authentication.

Production private PIN / secret-word handling must never store plaintext credentials. Browser-only prototype hashing is not the final security architecture.

---

# 2. Major User Phases

AKIN has four major phases that must not be confused with one another.

## Phase A — Acquisition

Purpose: show enough value to convince a new person that AKIN is worth creating an account for.

Acquisition happens before signup.

A cold user should never be dropped directly into a generic signup form.

The acquisition experience should be a miniature demonstration of AKIN itself:

```text
recognition
→ tension
→ choice
→ surprise / response
→ self-recognition
→ useful insight
→ possibility
→ invitation
```

There are two acquisition entry types.

### Targeted acquisition

A user arrives from an ad or campaign with an entry identifier.

Current test example:

`?entry=mia_4800`

The entry value is intentionally a stable slug. It does not have to match the current ad copy or a raw database ID.

### General acquisition

A new user opens AKIN with no campaign context, for example:

- direct Play Store install
- shared app link
- website discovery
- word-of-mouth
- direct launch without an account

This user should receive a general AKIN acquisition experience before signup.

The general acquisition experience has not yet been built.

## Phase B — Account Creation

After acquisition has delivered value and earned the signup, the user creates an AKIN account.

Current frontend fields:

- first name
- email
- password

Current custom Xano endpoint:

`POST /w_signup`

## Phase C — Onboarding / Private Orientation

This happens after signup.

Its job is not to sell AKIN. Its job is to explain how AKIN works, why it becomes personal, why Public/Private exists, and how the user enters her personal AKIN.

Expected conceptual order:

1. Welcome to your AKIN
2. Explain what AKIN can learn and remember
3. Explain why personal AKIN is private
4. Explain Public Mode and why it exists
5. Choose a private entrance method
6. Create 4-digit PIN
7. Optional biometrics
8. Recovery setup
9. Practice entering and leaving
10. Begin first real Private Mode experience

The current frontend private onboarding remains prototype/localStorage-driven and must later migrate to backend-driven state.

## Phase D — Returning User

A returning authenticated user should enter regular Public Mode.

From there the user accesses Private Mode through her concealed entrance and authentication.

---

# 3. App Entry Routing

Conceptually:

```text
open AKIN
↓
valid authenticated user?

YES
→ bootstrap
→ Public Mode

NO
↓
entry / campaign context present?

YES
→ targeted acquisition experience

NO
→ general acquisition experience
```

After acquisition signup:

```text
w_signup
→ save auth token
→ w_bootstrap
→ onboarding / private orientation
```

## Future mobile install attribution

For an installed Android app, verified app/deep links can preserve entry context.

For a user who clicks an ad before installing, install attribution/referrer handling will be required so the app can recover the acquisition entry on first launch.

This has not yet been implemented.

---

# 4. Acquisition Backend Engine

The acquisition engine is backend-driven.

Do not hardcode one ad flow into frontend JavaScript.

Current relationship:

```text
w_marketing_campaign
→ w_marketing_creative
→ w_acquisition_experience
→ w_acquisition_step
→ w_acquisition_step_option
```

## w_marketing_campaign

Purpose: represents a marketing campaign.

Known fields:

- id
- created_at
- updated_at
- market_id
- language_id
- platform
- campaign_name
- campaign_external_id
- offer_code
- is_active

Current first campaign:

- platform: facebook
- campaign_name: `AKIN Launch - This Life Is Mine`
- offer_code: `launch_199`
- active: true

## w_marketing_creative

Purpose: one creative/ad concept under a campaign.

Known fields:

- id
- created_at
- updated_at
- marketing_campaign_id
- language_id
- name
- creative_type
- asset_url
- message_variant
- external_id
- acquisition_experience_id
- is_active

Current creative concepts include:

1. `Mia - ₱1,900 Until Payday`
2. `Mia - Kailan Kaya Ako Naman`

The first creative is linked to the first acquisition experience.

The second creative does not yet have its own acquisition experience built.

## w_acquisition_experience

Purpose: one complete pre-signup acquisition path.

Fields:

- id
- created_at
- updated_at
- name
- slug
- title
- description
- market_id
- language_id
- entry_type enum
- is_active

Current enum values:

- targeted
- general

Current first record:

- id: 1
- name: `Mia - ₱1,900 Until Payday`
- slug: `mia_4800`
- title: `₱1,900 Until Payday`
- market_id: 2
- language_id: 1
- entry_type: targeted
- active: true

The old slug `mia_4800` remains intentionally stable for now even though the scenario amount changed to ₱1,900.

## w_acquisition_step

Purpose: ordered steps inside one acquisition experience.

Fields:

- id
- created_at
- updated_at
- acquisition_experience_id
- step_order
- step_type enum
- heading
- body
- question_text
- is_required
- is_active

Current step types:

- intro
- choice
- reflection
- value
- cta

Known Mia step record IDs:

- Step 1 intro: record #1
- Step 2 choice: record #3
- Step 3 reflection: record #5
- Step 4 value: record #6
- Step 5 CTA: record #7

## w_acquisition_step_option

Purpose: selectable options for acquisition steps.

Fields:

- id
- created_at
- updated_at
- acquisition_step_id
- option_order
- label
- value
- response_text
- is_active

`response_text` allows a selected option to produce a tailored reflection before the user continues.

---

# 5. Current Mia Acquisition Content

## Step 1 — intro

Heading:

`₱1,900 Until Payday`

Body:

`Mia has ₱1,900 left until payday.<br><br>Her daughter needs something for school. Her mother messaged asking if she could help. There are still groceries to buy.<br><br>And everyone assumes she’ll figure it out.`

## Step 2 — choice

Heading:

`₱1,900. Three needs. Not enough.`

Body:

`School: ₱650<br>Mama: ₱500<br>Groceries: ₱1,200<br><br>Something has to give.`

Question:

`What would you do first?`

Options:

1. `Help my mother first` → `mother_first`
2. `Buy what my daughter needs` → `daughter_first`
3. `Stretch the money and figure it out` → `make_it_work`
4. `Keep something for myself` → `myself_first`

Current tailored responses:

### mother_first

`You went straight to the person who needed you.<br><br>That may feel automatic when you’re used to being the one who helps.<br><br>But when everyone needs something from you, your own needs can disappear without you noticing.`

### daughter_first

`You chose your daughter first.<br><br>That probably wasn’t even a hard decision.<br><br>The harder question may be: when do you ever make that kind of decision for yourself?`

### make_it_work

`You chose to absorb the pressure yourself.<br><br>Make it work. Adjust. Solve it.<br><br>That can become such a normal role that you stop noticing how often you’re the one carrying the gap.`

### myself_first

`You kept something for yourself.<br><br>Did that feel completely reasonable… or did a little guilt show up with it?`

## Step 3 — reflection

Heading:

`This may not really be about ₱1,900.`

Body:

`It may be about what happens when everyone needs something from you.`

Question:

`Who usually gets pushed to the end?`

Options:

1. `Me` → `me`
2. `Usually me` → `usually_me`
3. `I don’t even think about it anymore` → `dont_think_about_it`

Current responses:

### me

`You noticed it.<br><br>You may be so used to adjusting that putting yourself last can feel normal.<br><br>Sometimes the first shift is simply seeing that it keeps happening.`

### usually_me

`That answer says a lot.<br><br>You may already know the pattern: other people’s needs become urgent, while yours become something you can deal with later.<br><br>The problem is that “later” can keep moving.`

### dont_think_about_it

`That may be the pattern AKIN is noticing.<br><br>When adjusting becomes automatic, you can stop seeing it as a choice.<br><br>You just keep moving yourself to later.`

## Step 4 — value

Heading:

`Try this once today.`

Body:

`Before automatically solving the next problem, ask yourself:<br><br>“Is this actually mine to carry?”<br><br>Not everything you can handle has to become your responsibility.`

## Step 5 — CTA

Heading:

`Imagine if something remembered this.`

Body:

`Not just this answer.<br><br>The patterns.<br>The people you always show up for.<br>The things you keep putting off.<br>The parts of yourself that quietly get moved to later.<br><br>AKIN can notice those things over time and create experiences around what actually matters in your life.<br><br>Your AKIN becomes yours over time.`

question_text / CTA label:

`Create my AKIN`

## Acquisition interaction rule

The experience must not run ahead automatically.

For a choice with a tailored response:

```text
show question
→ user taps option
→ choices transition away
→ tailored response becomes its own moment
→ user explicitly taps Continue
→ next step
```

The user controls the pace.

---

# 6. Acquisition API

## GET /w_acquisition_experience

Xano API base:

`https://x8ki-letl-twmt.n7.xano.io/api:esjA0pTg`

Endpoint:

`GET /w_acquisition_experience`

Input:

- slug — text, required

Example:

`/w_acquisition_experience?slug=mia_4800`

Current response shape:

```json
{
  "experience": {},
  "steps": [
    {
      "id": 1,
      "step_order": 1,
      "step_type": "intro",
      "heading": "...",
      "body": "...",
      "question_text": "...",
      "is_required": false,
      "is_active": true,
      "options": []
    }
  ]
}
```

### Current Xano function stack

1. Get `w_acquisition_experience` by `slug = input.slug`
2. Query active `w_acquisition_step` records where `acquisition_experience_id = acquisition_experience.id`, sorted `step_order ASC`
3. Create `acquisition_steps_complete = []`
4. For each acquisition step:
   - query active `w_acquisition_step_option` records where `acquisition_step_id = item.id`, sorted `option_order ASC`
   - create complete step object
   - append to `acquisition_steps_complete`
5. Response:
   - experience = acquisition_experience
   - steps = acquisition_steps_complete

Important Xano expression syntax:

```text
$var.acquisition_steps_complete|push:$var.complete_step
```

Complete-step objects must use `$var`, for example:

```text
{
  "id": $var.item.id,
  "step_order": $var.item.step_order,
  "step_type": $var.item.step_type,
  "heading": $var.item.heading,
  "body": $var.item.body,
  "question_text": $var.item.question_text,
  "is_required": $var.item.is_required,
  "is_active": $var.item.is_active,
  "options": $var.step_options
}
```

Do not revert to `var:`, literal `item.id`, or guessed Xano expression syntax.

---

# 7. Acquisition Frontend Architecture

The acquisition renderer is generic. Mia-specific copy remains in Xano and Mia-specific visual assets are isolated in a theme definition.

Do not add Mia-specific branching throughout `mode.js`.

## Current files

```text
js/acquisition/
  mode.js
  themes.js
css/acquisition/
  acquisition.css
assets/acquisition/
  mia/
    intro.svg
    choice.svg
    reflection.svg
    value.svg
    cta.svg
    login.svg
```

## js/acquisition/mode.js

Responsibilities:

- read `?entry=<slug>`
- call `getAcquisitionExperience(slug)`
- get the matching visual theme
- render ordered cards
- render questions and options
- show tailored `AKIN noticed` response moments
- require explicit Continue
- animate drifting previous/next cards
- change the full-page backdrop with the current step
- transition into signup after the CTA

The renderer normalizes backend text by converting literal `<br>` / `<br><br>` sequences into newline characters before assigning textContent. This preserves safe rendering while letting Xano control line breaks.

Do not switch response/body rendering to unsanitized `innerHTML` just to support line breaks.

## js/acquisition/themes.js

Purpose: map an acquisition entry slug to a visual theme/assets without changing the renderer.

Current Mia mapping:

```text
mia_4800
→ theme key: mia
→ intro visual
→ choice visual
→ reflection visual
→ value visual
→ CTA visual
→ login visual
```

Future campaign rule:

```text
new campaign / acquisition slug
→ create its own asset folder
→ add one theme mapping
→ reuse the same acquisition renderer
```

Do not rebuild the frontend for every ad.

Example future asset structure:

```text
assets/acquisition/kailan_ako_naman/
assets/acquisition/work_pressure/
assets/acquisition/relationship/
```

## Acquisition asset path rule

Theme asset paths are app-root-relative.

Because CSS files live under `css/acquisition/`, do not accidentally construct asset paths relative to the CSS file location.

The earlier wrong path pattern caused requests such as:

`/AKIN/css/acquisition/assets/acquisition/mia/...`

which produced 404 errors.

Current paths should resolve from the app root:

`assets/acquisition/mia/...`

## Current Mia visual set

All six Mia visuals have been replaced and individually confirmed in GitHub as of 2026-09-04:

- intro
- choice
- reflection
- value
- CTA
- signup/login

These assets are used both inside cards and as softened/blurred full-page atmosphere.

---

# 8. Acquisition Design Rules

Acquisition should feel like a miniature AKIN experience, not a survey or generic funnel.

## Card hierarchy

Each card should have one clear emotional job.

Preferred hierarchy:

1. small progress
2. small kicker / eyebrow
3. restrained heading
4. short body
5. question / interaction or reflection block
6. CTA

Do not let the heading dominate the entire card.

## Typography

Headings should be expressive but restrained.

Avoid giant headings that consume half the card and overpower body/interaction content.

Responses should not look like second giant headings.

`AKIN noticed` should feel like a distinct reflective moment, visually separated from the main copy.

## Separation

Use spacing, subtle dividers, panels, and negative space to separate:

- story/context
- question
- selected response
- action

Avoid five competing heading/paragraph levels on one card.

## Visual storytelling

Acquisition should use imagery and atmosphere from real life, not look like a sterile therapy product.

For Mia, appropriate visual cues include:

- money / receipts
- school items
- groceries
- phone/messages
- household surfaces
- small moments of quiet/pressure
- warmer, more open imagery as the experience moves toward possibility

Use visuals as atmosphere and grounding, not as decorative clutter.

## Full-page background

The page behind the card should not remain a blank flat wash.

The current acquisition implementation uses softened/blurred versions of the step artwork as the full-screen background and crossfades them as the user advances.

## Motion

Keep the established AKIN spatial language:

- current card centered
- previous card drifts left/back
- next card waits right/back
- relaxed motion around the existing `var(--slow)` timing (~1.45s)

Movement should feel soft and deliberate, not mechanical or jittery.

## Final CTA / signup handoff

The final CTA should feel like emotional continuation, not a sudden generic account wall.

The current direction is:

- `Create my AKIN` as the primary acquisition continuation
- returning user option remains available as `I already have one`
- signup screen may inherit a campaign-specific visual atmosphere from the theme

---

# 9. Authentication and Bootstrap

AKIN uses `w_user`, not the TLNP Teacher/Parent `user` table.

Never link AKIN users to the existing TLNP user table.

## w_user

Known fields include:

- id
- created_at
- updated_at
- email
- first_name
- password — native Xano Password field
- password_hash — legacy/unused text field
- country_id
- market_id
- language_id
- locale
- timezone
- is_active
- onboarding_complete
- private_setup_complete
- private_entry_method
- private_pin_hash
- private_pin_salt
- private_word_hash
- private_word_salt
- biometric_enabled
- last_login_at
- last_private_access_at

The native Xano Password field is the actual account-password field.

Do not expose password or password_hash in bootstrap responses.

## POST /w_signup

Current behavior:

1. Check `w_user` by email
2. Reject duplicate email
3. Create `w_user`
4. Create auth token
5. Create `w_user_onboarding`
6. Create `w_user_state`
7. Return token and created records

Current frontend signup still hardcodes Philippines defaults and must eventually derive them from market/entry context.

Important current mismatch to revisit:

- Philippines market record is currently ID 2
- frontend signup code previously hardcoded `market_id: 1`

Do not ignore this when signup integration is refined.

## POST /auth/login

Use Xano's native generated Authentication login endpoint tied to `w_user`.

Do not use the abandoned custom `w_login` attempt.

## GET /auth/me

Native Xano auth endpoint. Tested successfully.

## GET /w_bootstrap

Authenticated endpoint returning current user/application state.

Current response includes:

- w_user
- user_onboarding
- user_state
- active_user_journey
- user_profile
- user_preferences
- user_subscription
- user_goals
- user_memories
- user_connections
- user_reflections
- user_signals
- latest_checkin
- user_recommendations
- recent_activity
- user_answers
- active_user_experience
- user_connection_events
- user_context
- user_experience_steps
- notification_preferences

For a new user, most of these correctly return null or empty arrays.

Bootstrap currently works.

Potential later optimization: reduce bootstrap to startup-critical data only if performance requires it. Do not optimize prematurely.

---

# 10. Market / Country / Language Architecture

AKIN is international-ready from the foundation.

Product content, market, country, language/locale, pricing/currency, and marketing localization must remain separable.

China is intentionally treated as a separate later-market implementation because of its distinct distribution/compliance ecosystem.

## w_country

Current countries entered:

- Philippines — PH / PHL / Asia/Manila / PHP
- Indonesia — ID / IDN / Asia/Jakarta / IDR
- Thailand — TH / THA / Asia/Bangkok / THB
- Vietnam — VN / VNM / Asia/Ho_Chi_Minh / VND
- Malaysia — MY / MYS / Asia/Kuala_Lumpur / MYR
- Singapore — SG / SGP / Asia/Singapore / SGD

## w_language

Initial languages include:

- English
- Tagalog
- Cebuano / Bisaya
- Bikol
- Ilocano
- Hiligaynon / Ilonggo
- Waray
- Indonesian / Bahasa Indonesia
- Thai
- Vietnamese
- Malay / Bahasa Melayu

Database language naming rule:

Use `Tagalog`, not `Filipino`, for the Philippine language record.

Locale convention currently uses underscores in Xano, for example:

`en_PH`

## w_market

Current Philippines market:

- id: 2
- name: Philippines
- code: PH
- default language: English
- currency: PHP
- locale: en_PH
- active: true
- launch_status: live
- sort_order: 1

## w_market_language

Current Philippines mappings:

1. English — default
2. Tagalog
3. Cebuano
4. Bikol
5. Ilocano
6. Hiligaynon
7. Waray

All were initially enabled for support, marketing, and app use.

---

# 11. Broader Xano Data Model

AKIN uses a broad `w_` data model to support explainable personalization and future expansion.

Do not assume every existing table is already actively used by the frontend.

## Core content engine

- w_journey
- w_experience
- w_experience_step
- w_experience_category
- w_category
- w_question
- w_answer_option
- w_answer_option_signal
- w_signal

## Market / localization / marketing

- w_country
- w_language
- w_market
- w_market_language
- w_market_branding
- w_market_pricing
- w_market_settings
- w_market_store_listing
- w_marketing_campaign
- w_marketing_creative
- w_content_localization
- w_content_market
- w_journey_localization
- w_acquisition_experience
- w_acquisition_step
- w_acquisition_step_option

## User / auth / lifecycle

- w_user
- w_user_authenticator
- w_user_recovery
- w_user_acquisition
- w_user_device
- w_user_session
- w_user_onboarding
- w_user_state
- w_user_state_history

## User journey / experience progress

- w_user_journey
- w_user_experience
- w_user_experience_step
- w_user_answer
- w_user_signal

## Personalization / life context

- w_user_profile
- w_user_memory
- w_user_connection
- w_user_connection_event
- w_user_reflection
- w_user_goal
- w_user_goal_journey
- w_user_activity
- w_user_preference
- w_user_checkin
- w_user_checkin_signal
- w_user_context
- w_user_recommendation

## Subscription / notifications

- w_subscription
- w_subscription_event
- w_notification_preference
- w_notification_event

## Privacy / consent / security

- w_user_consent
- w_user_privacy_request
- w_security_event
- w_audit_log

## AI / orchestration

- w_ai_interaction
- w_ai_prompt
- w_ai_model_config
- w_ai_task
- w_ai_task_event

## System / operations

- w_app_error
- w_feature_flag
- w_system_setting
- w_system_event

---

# 12. Frontend Repository Structure

Current relevant structure:

```text
index.html
assets/
  acquisition/
    mia/
      intro.svg
      choice.svg
      reflection.svg
      value.svg
      cta.svg
      login.svg
css/
  shared/
    base.css
    login.css
    cards.css
    navigation.css
  acquisition/
    acquisition.css
  public/
    public.css
    detail.css
  private/
    private.css
    access.css
js/
  shared/
    app.js
    api.js
    atmosphere.js
    cards.js
    login.js
  acquisition/
    mode.js
    themes.js
  public/
    data.js
    detail.js
    mode.js
    orb.js
  private/
    data.js
    mode.js
    auth.js
    onboarding.js
    entry.js
```

## js/shared/app.js

Top-level startup orchestration.

Currently initializes:

- Public Mode
- Private Mode
- private onboarding prototype
- private entry
- login
- Acquisition Mode
- atmosphere

It detects the `entry` URL parameter and starts acquisition when present.

## js/shared/api.js

Current API base:

`https://x8ki-letl-twmt.n7.xano.io/api:esjA0pTg`

Current responsibilities include:

- signup
- login
- bootstrap
- getAcquisitionExperience(slug)
- auth token helpers

Acquisition fetching now includes cache-busting behavior so stale Xano content is less likely to appear during testing.

## js/shared/login.js / css/shared/login.css

Handles sign-in/create-account UI and Xano auth/signup/bootstrap.

Login must remain completely hidden while acquisition is running.

Acquisition may pass a campaign-specific login background/atmosphere into the signup handoff.

## css/shared/cards.css

This remains the canonical AKIN spatial/motion reference.

Established design language includes:

- rounded large cards
- soft glass / layered surfaces
- controlled shadows
- relaxed motion
- spatial card transitions
- approximately 1.45 second slow motion timing

Acquisition should feel related to this system even when its card surface uses campaign artwork.

---

# 13. Experience and Design Rules

These rules are mandatory unless intentionally changed in product discussion.

## Experience first

Do not start from menus, CRUD screens, or database structure.

Start from what the user should feel, understand, notice, or do next.

## One visual language

Acquisition, Public Mode, Private Mode, onboarding, and future journeys should feel like the same AKIN product.

Reuse:

- spatial movement
- typography family
- spacing rhythm
- glass/layer language
- shadow language
- relaxed timing
- atmosphere

Do not casually create a separate design system for a new mode.

## User controls pacing

Experiences should not rush emotional/reflection content.

Important responses must remain visible until explicit user action.

## Backend-driven content

Where content belongs to an experience engine, keep it in Xano and render it from data.

Do not hardcode one campaign's copy into JavaScript.

## Theme-driven acquisition visuals

Campaign-specific artwork can live in GitHub assets and be selected through `themes.js`.

The renderer stays generic.

Future ads should be easy to create by changing:

- Xano campaign/creative
- acquisition experience/steps/options
- one visual theme mapping
- one asset folder

without rebuilding the acquisition engine.

## Extend, do not rebuild

Existing systems should be extended one piece at a time.

Before adding a new file/system, confirm whether an existing component can own the responsibility.

## Read current files before editing

Never modify a file based only on remembered structure. Fetch the current GitHub version first.

## Code formatting

Use readable, compact multi-line code.

Do not aggressively minify or collapse CSS/JS into long one-line blocks.

Avoid excessive blank lines while preserving normal readability.

Use existing section comment style where appropriate:

`/*   comment*/`

---

# 14. Current Status — 2026-09-04

## Working

- AKIN visual shell
- Public Mode prototype
- Private Mode prototype
- concealed private entry prototype
- private onboarding prototype
- Xano signup
- Xano native login
- auth token storage
- bootstrap call
- acquisition endpoint
- `?entry=mia_4800` detection
- Xano-driven Mia acquisition content loading
- choice rendering
- tailored choice response rendering
- explicit Continue after responses
- drifting card transitions
- campaign-specific acquisition theme lookup
- per-step card artwork
- full-page artwork-based backdrop crossfades
- safe conversion of Xano `<br>` text into rendered line breaks
- final acquisition CTA → account-entry handoff
- separate campaign-specific login artwork
- six current Mia visual assets uploaded and confirmed

## Current design state

The acquisition flow is substantially improved from the first prototype.

The user confirmed the newer version is better, but visual review is still ongoing.

The current design now has:

- smaller, calmer headings
- clearer content hierarchy
- separate response treatment
- stronger section separation
- real visual backgrounds
- background atmosphere behind the card
- reusable theme architecture for future ads

Further polish may still be required after the next live visual test.

## Prototype / needs migration or refinement

- private authentication/localStorage logic
- private onboarding/localStorage state
- biometric/WebAuthn production architecture
- concealed entrance production security
- general acquisition path
- mobile install/deferred deep-link attribution
- post-acquisition answer persistence into the new user's account
- backend-driven onboarding sequence
- first real personalized Private Mode experience after onboarding
- signup market defaults derived from actual market context
- final visual polish of first Mia acquisition experience

## Immediate next work

1. Test the newly replaced Mia visual asset set live.
2. Review each of the five acquisition cards plus signup handoff for visual quality.
3. Adjust image crop/overlay/typography only where the live experience shows a real issue.
4. Keep Mia content/backend architecture stable unless testing reveals a content problem.
5. Do not start rebuilding the acquisition engine for the second ad; reuse the theme/content model.

---

# 15. Known Architecture Decisions Not To Reopen Casually

- AKIN uses `w_user`, separate from TLNP Teacher/Parent `user`.
- AKIN has exactly Public Mode and Private Mode.
- Public Mode is legitimate useful content and the discreet outward-facing state.
- Private Mode contains personalized/account-linked activity.
- Hidden entrance is concealment plus authentication, not security by obscurity alone.
- Acquisition and onboarding are different phases.
- New cold users do not go directly to signup.
- Ad-entry acquisition is targeted by a stable entry slug.
- Direct first-time users need a general acquisition path.
- Returning users enter Public Mode.
- Acquisition content is backend-driven.
- Acquisition visuals are theme-driven and campaign-specific, while the renderer remains generic.
- Future ad experiences should be easy to swap through Xano content plus theme/assets, not separate frontend builds.
- AKIN is life-personal and wellbeing-oriented, not positioned primarily as a clinical mental-health product.
- International architecture separates market, country, language/locale, pricing, product content, and advertising localization.
- Tagalog is the database language name; do not substitute Filipino.
- China is a separate later implementation.
- Experience design is primary; database and UI structure serve the experience.

---

# 16. Maintenance Rule

When a meaningful structural change is completed, update the relevant section of this file in the same working session.

Examples that require an update:

- new Xano table or important field relationship
- new endpoint or response contract
- changed app entry route
- changed auth/bootstrap flow
- changed acquisition architecture
- changed acquisition theme/asset architecture
- changed onboarding architecture
- new frontend mode or major file responsibility
- product decision that changes Public/Private behavior
- new market/language architecture decision

Small visual tweaks, copy edits, and bug fixes do not need a documentation update unless they change how the system works.
