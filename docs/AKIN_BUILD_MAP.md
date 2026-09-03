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

AKIN should feel like an experience, not a conventional app made from menus, forms, and feature pages.

The core product has exactly two modes.

## Public Mode

Public Mode is the outward-facing AKIN experience.

It is a genuine, useful wellbeing space, not a fake shell. It can contain calm, stress, reflection, breathing, and other general wellbeing experiences.

Its additional purpose is discretion: when AKIN is opened around other people, the user's personal content is not visible.

There is no obvious "Private Mode" button.

The top-right orb behaves normally on a regular tap, while the user's chosen private entrance behavior can be attached to it or another approved hidden interaction.

## Private Mode

Private Mode is the real personalized AKIN space.

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

Private Mode is accessed through a concealed entrance chosen during onboarding, followed by appropriate authentication such as biometrics or a 4-digit PIN.

Leaving Private Mode should return immediately to Public Mode.

## Core privacy principle

The hidden entry is concealment, not the only security layer.

Private security should combine a discreet entrance with proper authentication.

Production private PIN / secret-word handling must never store plaintext credentials. Browser-only prototype hashing is not the final security architecture.

---

# 2. Major User Phases

AKIN has four major phases that must not be confused with one another.

## Phase A — Acquisition

Purpose: convince a new person that AKIN is useful enough to create an account.

Acquisition happens before signup.

A cold user should never be dropped directly into a generic signup form.

There are two acquisition entry types:

### Targeted acquisition

A user arrives from an ad or campaign with an entry identifier.

Example:

`?entry=mia_4800`

AKIN loads the acquisition experience mapped to that entry.

### General acquisition

A new user opens AKIN with no campaign context, for example:

- direct Play Store install
- shared app link
- website discovery
- word-of-mouth
- direct launch without an existing account

This user should receive a general AKIN introduction/acquisition experience before signup.

The general acquisition experience has not yet been built.

## Phase B — Account Creation

After the acquisition experience has delivered value and earned the signup, the user creates an AKIN account.

Current fields in the frontend signup form:

- first name
- email
- password

The current custom Xano endpoint is `POST /w_signup`.

## Phase C — Onboarding / Private Orientation

This happens after signup.

Its job is not to sell AKIN. Its job is to explain how AKIN works, why it becomes personal, why the private/public structure exists, and how the user enters her personal AKIN.

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
10. Begin first real private experience

The current frontend private onboarding remains prototype/localStorage-driven and must eventually be migrated to backend-driven state.

## Phase D — Returning User

A returning authenticated user should enter regular Public Mode.

From there the user accesses Private Mode through her concealed entrance and authentication.

---

# 3. App Entry Routing

The app should determine its starting experience from state and entry context.

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

## Current web acquisition parameter

Current test parameter:

`entry`

Example:

`?entry=mia_4800`

The entry value is intentionally a stable slug, not ad copy and not necessarily a raw database ID.

## Future mobile install attribution

For an installed Android app, verified app/deep links can preserve entry context.

For a user who clicks an ad before installing, install attribution/referrer handling will be required so the app can recover the acquisition entry on first launch.

This has not yet been implemented.

---

# 4. Acquisition Engine

The acquisition engine is backend-driven.

Do not hardcode the Mia flow into frontend JavaScript.

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
- campaign name: AKIN Launch - This Life Is Mine
- offer code: launch_199
- active: true

Xano's reference picker currently displays this campaign as `facebook #2` rather than the campaign name.

## w_marketing_creative

Purpose: individual creative/ad concept under a campaign.

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

Current creative concepts:

1. Mia - ₱4,800 Until Payday
2. Mia - Kailan Kaya Ako Naman

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

- name: Mia - ₱4,800 Until Payday
- slug: mia_4800
- title: ₱4,800 Until Payday
- entry_type: targeted
- active: true

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

## Current Mia acquisition experience

### Step 1 — intro

Heading: `₱4,800 Until Payday`

Body:

`Mia has ₱4,800 left until payday. Her mother needs help. Her daughter needs something for school. Her husband assumes she’ll figure it out. She looks at what’s left and thinks, “What about me?”`

No options.

### Step 2 — choice

Heading/question: `What would you do first?`

Body: `You can only stretch ₱4,800 so far. Something has to come first.`

Options:

- Help my mother first → `mother_first`
- Buy what my daughter needs → `daughter_first`
- Stretch the money and figure it out → `make_it_work`
- Keep something for myself → `myself_first`

Each currently has a tailored `response_text`.

### Step 3 — reflection

Heading: `Sometimes it isn’t really about the ₱4,800.`

Body: `It’s about being the person everyone expects to adjust, solve it, and keep things moving.`

Question: `Does that feel familiar?`

Options:

- A little → `a_little`
- Very → `very`
- Too familiar → `too_familiar`

### Step 4 — value

Heading: `Try separating these two questions.`

Body:

`“What actually needs to be solved today?” and “What am I automatically carrying because everyone expects me to?”`

### Step 5 — CTA

Heading: `AKIN can go deeper than this.`

Body:

`AKIN can remember what you’re dealing with, notice patterns over time, and create experiences around what actually matters in your life. Your personal AKIN stays private.`

Frontend CTA label: `Create my AKIN`

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

# 5. Acquisition API

## GET /w_acquisition_experience

Xano API base:

`https://x8ki-letl-twmt.n7.xano.io/api:esjA0pTg`

Endpoint:

`GET /w_acquisition_experience`

Input:

- `slug` — text, required

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
2. Query all active `w_acquisition_step` records where `acquisition_experience_id = acquisition_experience.id`, sorted `step_order ASC`
3. Create `acquisition_steps_complete = []`
4. For each acquisition step:
   - query active `w_acquisition_step_option` records where `acquisition_step_id = item.id`, sorted `option_order ASC`
   - create complete step object
   - append to `acquisition_steps_complete`
5. Response:
   - experience = acquisition_experience
   - steps = acquisition_steps_complete

Important Xano expression syntax currently used:

```text
$var.acquisition_steps_complete|push:$var.complete_step
```

Complete-step object variables must use `$var`, for example:

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

Do not revert to literal `item.id`, `var:item`, or other guessed expression formats.

---

# 6. Authentication and Bootstrap

AKIN uses `w_user`, not the Teacher/Parent app `user` table.

Never link AKIN users to the existing TLNP `user` table.

## w_user

Known fields include:

- id
- created_at
- updated_at
- email
- first_name
- password — native Xano Password field
- password_hash — legacy/unused text field, leave blank; candidate for later removal
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

The native Xano Password field is the real account-password field.

Do not expose password or password_hash in bootstrap responses.

## POST /w_signup

Custom signup endpoint.

Current behavior:

1. Check `w_user` by email
2. Reject duplicate email
3. Create `w_user`
4. Create authentication token
5. Create `w_user_onboarding`
6. Create `w_user_state`
7. Return token and created records

Current frontend still hardcodes Philippines signup defaults. These values must be reviewed before international rollout and should eventually be derived from market/entry context rather than hardcoded.

## POST /auth/login

Use Xano's native generated Authentication login endpoint tied to `w_user`.

A custom `w_login` was attempted and should not be used.

## GET /auth/me

Native Xano auth endpoint. Tested successfully.

## GET /w_bootstrap

Authenticated endpoint that returns current user/application state.

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

For a new user, most of these correctly return `null` or `[]`.

Bootstrap currently works.

Potential later optimization: bootstrap is broad and may eventually be reduced to startup-critical data, with history/detail loaded separately. Do not optimize this prematurely unless startup performance requires it.

---

# 7. Market / Country / Language Architecture

AKIN is international-ready from the foundation.

Product content, market, country, language/locale, pricing/currency, and marketing localization must remain separable.

China is intentionally treated as a separate later-market implementation because of its distribution/compliance ecosystem.

## w_country

Fields:

- id
- created_at
- updated_at
- name
- iso2
- iso3
- default_timezone
- default_currency_code
- is_active

Current countries entered:

- Philippines — PH / PHL / Asia/Manila / PHP
- Indonesia — ID / IDN / Asia/Jakarta / IDR
- Thailand — TH / THA / Asia/Bangkok / THB
- Vietnam — VN / VNM / Asia/Ho_Chi_Minh / VND
- Malaysia — MY / MYS / Asia/Kuala_Lumpur / MYR
- Singapore — SG / SGP / Asia/Singapore / SGD

## w_language

Fields:

- id
- created_at
- updated_at
- name
- native_name
- code
- locale_code
- is_active

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

Locale convention currently uses underscores, for example `en_PH`.

## w_market

Fields:

- id
- created_at
- updated_at
- name
- code
- country_id
- default_language_id
- default_currency_code
- default_locale
- is_active
- launch_status enum
- sort_order

Current Philippines market:

- name: Philippines
- code: PH
- default language: English
- currency: PHP
- locale: en_PH
- is_active: true
- launch_status: live
- sort_order: 1

## w_market_language

Fields:

- id
- created_at
- updated_at
- market_id
- language_id
- is_default
- is_supported
- is_marketing_enabled
- is_app_enabled
- sort_order

Current Philippines language mappings:

1. English — default
2. Tagalog
3. Cebuano
4. Bikol
5. Ilocano
6. Hiligaynon
7. Waray

All were initially enabled for support, marketing, and app use.

---

# 8. Broader Xano Data Model

AKIN currently has a large `w_` data model. The purpose is to support an explainable, evolving personalized product rather than put all behavior in one table.

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

Do not assume every table is already actively used by the frontend. Many exist as foundation for later stages.

---

# 9. Frontend Structure

Current repository structure includes:

```text
index.html
css/
  shared/
    base.css
    login.css
    cards.css
    navigation.css
  public/
    public.css
    detail.css
  private/
    private.css
    access.css
  acquisition/
    acquisition.css
js/
  shared/
    app.js
    api.js
    atmosphere.js
    cards.js
    login.js
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
  acquisition/
    mode.js
```

## Responsibilities

### js/shared/app.js

Top-level startup orchestration.

Currently initializes:

- Public Mode
- Private Mode
- Private onboarding prototype
- Private entry
- Login
- Acquisition Mode
- atmosphere

It detects an `entry` URL parameter and starts acquisition when present.

### js/shared/api.js

Xano API client.

Current API base:

`https://x8ki-letl-twmt.n7.xano.io/api:esjA0pTg`

Current exported responsibilities include:

- signup
- login
- bootstrap
- getAcquisitionExperience(slug)
- auth token storage helpers

### js/shared/login.js

Handles existing sign-in/create-account forms and calls Xano auth/signup/bootstrap.

Login/signup UI should not be shown during acquisition until the CTA completes.

### js/acquisition/mode.js

Loads `?entry=<slug>`, calls `getAcquisitionExperience`, renders ordered acquisition steps, choices, tailored responses, and transitions to signup after the CTA.

### css/acquisition/acquisition.css

Acquisition-specific styling.

IMPORTANT: acquisition must visually belong to the same AKIN design system as the existing public/private cards.

### css/shared/cards.css

Canonical existing AKIN card geometry and visual language.

Current card geometry includes approximately:

- mobile width: `min(78vw, 390px)`
- desktop width: `min(54vw, 430px)`
- height driven by the existing carousel around 560–610px
- `var(--radius-xl)`
- glass surface
- established shadow
- relaxed `var(--slow)` motion, currently about 1.45 seconds

Acquisition should reuse these proportions and motion principles instead of inventing a separate giant/small card system unless a deliberate product decision changes this.

---

# 10. Experience and Design Rules

These rules are mandatory unless intentionally changed in a product discussion.

## Experience first

Do not start from menus, CRUD screens, or database structure. Start from what the user should feel, understand, notice, or do next.

## One visual language

Acquisition, Public Mode, Private Mode, onboarding, and later journeys should feel like the same AKIN product.

Reuse:

- card proportions
- atmosphere
- typography family
- spacing rhythm
- glass language
- shadow language
- movement language
- relaxed timing

Do not casually create a separate design system for a new mode.

## User controls pacing

Experiences should not rush through emotional/reflection content.

Important reflections should become visible moments and continue only on explicit user action.

## Backend-driven content

Where the content is part of an experience engine, store it in Xano and render it from data rather than hardcoding one-off flows into JavaScript.

## Extend, do not rebuild

Existing systems should be extended one piece at a time.

Before adding a new file/system, confirm whether an existing component can own the responsibility.

## Read current files before editing

Never modify a file based only on remembered structure. Fetch the current GitHub version first.

## Code formatting

Use readable, compact multi-line code.

Do NOT aggressively minify or collapse entire CSS/JS files into long one-line blocks.

Avoid excessive blank lines, but preserve normal readability.

Use existing section comment style where appropriate:

`/*   comment*/`

When changing a code file, prefer returning/updating the full changed file rather than fragmented snippets unless explicitly requested otherwise.

---

# 11. Current Frontend Status

## Working

- existing AKIN visual shell
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
- acquisition choice rendering
- tailored choice response rendering
- explicit Continue after tailored response
- transition from final acquisition CTA to signup

## Prototype / needs migration or refinement

- private authentication/localStorage logic
- private onboarding/localStorage state
- biometric/WebAuthn production architecture
- concealed entrance production security
- general acquisition path
- mobile install/deferred deep-link attribution
- acquisition visual/flow polish
- post-acquisition answer persistence into the new user's account
- backend-driven onboarding sequence
- first real Private Mode personalized experience after onboarding

---

# 12. Current Acquisition UI Issue / Exact Work Point

This is the immediate work point as of 2026-09-03.

The first Mia acquisition flow works technically, but the user reported:

1. The original acquisition presentation was visually ugly and disconnected from the existing AKIN card system.
2. The flow initially advanced too quickly.
3. Login/sign-in UI was appearing during the acquisition flow; a hidden-state CSS fix was added.
4. Acquisition styling then drifted into a separate large experience surface instead of reusing established AKIN card proportions.
5. Acquisition was subsequently moved back toward the existing card dimensions, but the visual flow still needs review.
6. Some CSS files were again condensed into overly compressed one-line formatting. This must be corrected and must not become the standard.

## Immediate next work

Before adding new acquisition features:

1. Review the current acquisition recording/behavior and current GitHub files.
2. Keep login completely hidden until the acquisition CTA finishes.
3. Make acquisition use the same established AKIN card size and visual vocabulary as Public/Private cards.
4. Improve the sequence/flow without changing the backend content model unless necessary.
5. Reformat modified acquisition/login CSS into readable compact multi-line CSS without changing behavior unnecessarily.
6. Test `?entry=mia_4800` again.

Do not jump ahead to the second ad or general acquisition until the first flow feels correct.

---

# 13. Known Architecture Decisions Not To Reopen Casually

- AKIN uses `w_user`, separate from TLNP Teacher/Parent `user`.
- AKIN has exactly Public Mode and Private Mode.
- Public Mode is legitimate useful content and the discreet outward-facing state.
- Private Mode contains personalized/account-linked activity.
- Hidden entrance is concealment plus authentication, not security by obscurity alone.
- Acquisition and onboarding are different phases.
- New cold users do not go directly to signup.
- Ad-entry acquisition can be targeted by a stable entry slug.
- Direct first-time users need a general acquisition path.
- Returning users enter Public Mode.
- Acquisition content is backend-driven.
- International architecture separates market, country, language/locale, pricing, product content, and advertising localization.
- China is a separate later implementation.
- Experience design is primary; database and UI structure serve the experience.

---

# 14. Maintenance Rule

When a meaningful structural change is completed, update the relevant section of this file in the same working session.

Examples that require an update:

- new Xano table or important field relationship
- new endpoint or response contract
- changed app entry route
- changed auth/bootstrap flow
- changed acquisition architecture
- changed onboarding architecture
- new frontend mode or major file responsibility
- product decision that changes Public/Private behavior
- new market/language architecture decision

Small visual tweaks, copy edits, and bug fixes do not need a documentation update unless they change how the system works.
