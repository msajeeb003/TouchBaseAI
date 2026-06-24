# AI Calling Feature — Technical Scoping Document

## 1. Overview

- **Feature:** Automated AI-powered phone calls as part of follow-up sequences
- **Provider:** Retell AI
- **Purpose:** After a sale call, the CRM can schedule an AI phone call to follow up with the lead — personalized using lead data, transcripts, and previous sequence steps

---

## 2. How It Works (End-to-End Flow)

```
CURRENT FLOW (Email / SMS / WhatsApp) — Synchronous
──────────────────────────────────────────────────────
Cron picks up due step → Send message → Done
Status: scheduled → sent/failed


NEW FLOW (AI Call) — Asynchronous
──────────────────────────────────────────────────────
Cron picks up due step
  ↓
Trigger Retell API call (async)
  ↓
Status: scheduled → calling (call in progress)
  ↓
Retell makes the call (2-10 min)
  ↓
Call ends → Retell sends webhook to /webhooks/retell
  ↓
Webhook handler updates step:
  - status → sent (if answered) or failed (if no answer)
  - sendLog → call summary
  - callDuration, callRecordingUrl, callTranscript stored
```

**Key Difference:** Email/SMS/WhatsApp are synchronous (send → done). AI Call is asynchronous (trigger → wait → webhook result).

---

## 3. Database Changes

### 3.1 SequenceStep — New columns

| Column | Type | Purpose |
|--------|------|---------|
| `callId` | `String?` | Retell call ID for tracking |
| `callDuration` | `Int?` | Duration in seconds |
| `callRecordingUrl` | `String?` | Recording URL from Retell |
| `callTranscript` | `String? @db.Text` | Full call transcript |
| `callStatus` | `String?` | `completed`, `no-answer`, `busy`, `voicemail`, `failed` |

### 3.2 UserSettings — New field

| Column | Type | Purpose |
|--------|------|---------|
| `retellApiKey` | `String?` (AES-256-GCM encrypted) | Per-user Retell API key |

---

## 4. Files to Create (New)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/shared/services/calling.service.ts` | Retell API integration — trigger call, build agent prompt |
| 2 | `src/modules/webhook/webhook.route.ts` | `/webhooks/retell` endpoint |
| 3 | `src/modules/webhook/webhook.controller.ts` | Handle Retell webhook payload |
| 4 | `src/modules/webhook/webhook.service.ts` | Process call result, update step |

---

## 5. Files to Modify (Existing)

| # | File | Change |
|---|------|--------|
| 1 | `shared/constants/step-type.ts` | Add `CALL: "CALL"` |
| 2 | `shared/sequence-step/status.ts` | Add `CALLING: "calling"` |
| 3 | `shared/services/send-processor.ts` | Add `CALL` case — trigger call (async, don't wait) |
| 4 | `shared/services/prompt-builder.ts` | Add CALL-specific prompt (what to say, goals, tone) |
| 5 | `shared/services/ai.service.ts` | Update SYSTEM_PROMPT to include calls |
| 6 | `modules/settings/settings.validation.ts` | Add `retellApiKey` field |
| 7 | `modules/settings/settings.service.ts` | Add `retellApiKey` to SETTINGS_SELECT + SENSITIVE_FIELDS |
| 8 | `modules/sequence-step/sequence-step.validation.ts` | Already dynamic (uses STEP_TYPE_LIST) — auto-included |
| 9 | `modules/sequence/sequence.service.ts` | Update `stepTypeSentCounts` — add call counts |
| 10 | `modules/dashboard/dashboard.service.ts` | Add `totalCallsMade` to summary + daily trend |
| 11 | `prisma/schema.prisma` | Add new columns + migration |
| 12 | `src/app/routes/index.ts` | Mount webhook route |

---

## 6. New API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/webhooks/retell` | No JWT (Retell signature verification) | Receive call result from Retell |

Webhook endpoint is public (no JWT auth) but verified using Retell's webhook signature to prevent spoofing.

---

## 7. Retell API Integration

### 7.1 Create Phone Call (Trigger)

```
POST https://api.retellai.com/v2/create-phone-call

Headers:
  Authorization: Bearer <retellApiKey>

Body:
{
  "from_number": "+19343484930",
  "to_number": "+8801884658400",
  "override_agent_id": null,
  "retell_llm_dynamic_variables": {
    "lead_name": "John",
    "company": "Acme Corp",
    "context": "Follow up after demo call..."
  },
  "metadata": {
    "stepId": "abc-123",
    "sequenceId": "def-456",
    "userId": "ghi-789"
  }
}
```

### 7.2 Webhook Payload (Receive)

```
POST /webhooks/retell

Body:
{
  "event": "call_ended",
  "call": {
    "call_id": "call_xxx",
    "call_status": "ended",
    "disconnection_reason": "agent_hangup",
    "duration_ms": 180000,
    "recording_url": "https://...",
    "transcript": "Agent: Hi John... John: Hello...",
    "metadata": {
      "stepId": "abc-123",
      "sequenceId": "def-456",
      "userId": "ghi-789"
    }
  }
}
```

---

## 8. Send Processor — CALL vs Other Steps

| Aspect | EMAIL / SMS / WHATSAPP | CALL |
|--------|----------------------|------|
| **Execution** | Synchronous | Asynchronous |
| **processStep()** | Send → return result | Trigger API → return immediately |
| **Status after trigger** | `sent` or `failed` | `calling` |
| **Final status** | Set in processStep | Set by webhook handler |
| **checkSequenceCompletion** | Check for `scheduled` steps | Must also check for `calling` steps |

---

## 9. AI Prompt for Calls

The `content` field of a CALL step contains the AI agent's instructions:

```
You are calling {{lead.name}} from {{lead.company}} as a follow-up
to a previous sales conversation.

GOAL: Schedule a second demo call.

CONTEXT:
- Lead showed interest in our recruitment automation platform
- Previous email was sent 3 days ago (no reply)
- Lead's main concern was pricing

TONE: Professional, warm, concise. Keep the call under 3 minutes.

RULES:
- Introduce yourself and reference the previous conversation
- Ask if they had time to review the information sent
- Address any concerns
- Propose scheduling a follow-up meeting
- If they're not interested, thank them and end politely
```

---

## 10. Step Status Lifecycle

```
       EMAIL / SMS / WHATSAPP                CALL
       ──────────────────────                ────

       pending                               pending
          ↓                                     ↓
       draft (AI generated content)          draft (AI generated prompt)
          ↓                                     ↓
       scheduled                             scheduled
          ↓                                     ↓
       sent    ← (immediate)                 calling  ← (call triggered)
         or                                     ↓
       failed                                sent     ← (webhook: answered)
                                                or
                                             failed   ← (webhook: no-answer/error)
```

---

## 11. Settings UI — New Section

```
┌─ Retell AI Configuration ────────────────────────┐
│  API Key:        [__________________________]     │
│                                                   │
│  (Get your API key from retellai.com/dashboard)   │
└───────────────────────────────────────────────────┘
```

---

## 12. Cost Comparison

| Channel | Cost per unit | Avg cost per lead/step |
|---------|-------------|------------------------|
| Email | ~$0.00 | $0.00 |
| SMS | ~$0.01/msg | $0.01 |
| WhatsApp | ~$0.005/msg | $0.005 |
| **AI Call** | **~$0.12/min** | **~$0.36** (avg 3 min call) |

### Monthly Budget Estimates

| Volume | Monthly Cost |
|--------|-------------|
| 10 calls/day × 3 min avg × 30 days = 900 min | ~$100-$135 |
| 50 calls/day × 3 min avg × 30 days = 4,500 min | ~$500-$675 |
| 100 calls/day × 3 min avg × 30 days = 9,000 min | ~$1,000-$1,350 |

---

## 13. Implementation Phases

### Phase 1 — Core (Week 1)

| Task | Effort |
|------|--------|
| Database schema + migration | 0.5 day |
| `calling.service.ts` — Retell API integration | 1 day |
| `send-processor.ts` — CALL case (async trigger) | 0.5 day |
| Webhook module (route + controller + service) | 1 day |
| Settings update (retellApiKey) | 0.5 day |
| Constants update (STEP_TYPE, STATUS) | 0.5 day |

### Phase 2 — Polish (Week 2)

| Task | Effort |
|------|--------|
| `prompt-builder.ts` — CALL-specific prompt generation | 0.5 day |
| Dashboard stats — call counts + trends | 0.5 day |
| `sequence.service.ts` — call counts in getSequences | 0.5 day |
| `checkSequenceCompletion` — handle "calling" status | 0.5 day |
| Testing + edge cases | 1 day |

### Phase 3 — Future Enhancements

| Feature | When |
|---------|------|
| Business hours check (don't call at 2 AM) | Later |
| Voicemail detection + leave message | Later |
| Call retry on no-answer | Later |
| Call outcome analytics | Later |
| Call recording playback in UI | Later |

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Retell API down | Calls fail | Step stays "scheduled", retried next cron cycle |
| Webhook not received | Step stuck in "calling" forever | Timeout job — if "calling" > 15 min, mark as failed |
| Lead doesn't answer | Step appears incomplete | Mark as failed with reason "no-answer", allow retry |
| High cost | Unexpected bills | Add call duration limit in Retell agent config (max 5 min) |
| Spam/fraud risk | Number blocked by carriers | Use verified caller ID, respect do-not-call lists |

---

## 15. Summary

| Item | Details |
|------|---------|
| **Provider** | Retell AI |
| **New files** | 4 (calling service + webhook module) |
| **Modified files** | 12 |
| **New DB columns** | 5 (on SequenceStep) + 1 (on UserSettings) |
| **New API endpoint** | 1 (`POST /webhooks/retell`) |
| **New step type** | `CALL` |
| **New step status** | `calling` |
| **Estimated effort** | ~1.5-2 weeks |
| **Cost per call** | ~$0.36 (avg 3 min) |

---

## 16. Prerequisites

1. Retell AI account created (https://www.retellai.com)
2. Retell API key obtained from dashboard
3. Phone number configured in Retell (can use existing Twilio number via SIP trunk, or buy from Retell ~$2/month)
4. Retell AI agent created with base configuration

---

*Document created: April 2026*
*Last updated: April 2026*
