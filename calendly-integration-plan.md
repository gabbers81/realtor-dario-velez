# Calendly Date Integration - COMPLETED ✅

## Overview
✅ **IMPLEMENTATION COMPLETED** - Calendly webhook integration successfully implemented to capture appointment dates and link them to contact form submissions in the Dominican Republic real estate website.

## Current System Architecture
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Frontend**: React with TypeScript
- **Contact Form**: 6 fields saved to `contacts` table
- **Calendly**: Embedded via iframe in modal (https://calendly.com/velezsoriano87/30min)

## Implementation Approach: Webhook Integration

### Phase 1: Database Schema Update

#### 1.1 Add New Columns to Contacts Table
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE contacts 
ADD COLUMN appointment_date TIMESTAMP,
ADD COLUMN calendly_event_id VARCHAR(255) UNIQUE,
ADD COLUMN calendly_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN calendly_invitee_name VARCHAR(255),
ADD COLUMN calendly_raw_payload JSONB;

-- Add index for performance
CREATE INDEX idx_contacts_calendly_event_id ON contacts(calendly_event_id);
CREATE INDEX idx_contacts_email_calendly ON contacts(email);
```

#### 1.2 Update Drizzle Schema
In `shared/schema.ts`, add to the contacts table:
```typescript
appointmentDate: timestamp("appointment_date"),
calendlyEventId: text("calendly_event_id").unique(),
calendlyStatus: text("calendly_status").default("pending"),
calendlyInviteeName: text("calendly_invitee_name"),
calendlyRawPayload: jsonb("calendly_raw_payload"),
```

### Phase 2: Webhook Endpoint Implementation

#### 2.1 Create Webhook Route
Create new file `server/routes/webhooks.ts`:
```typescript
// This will handle POST /api/webhooks/calendly
// Validates webhook signature
// Updates contact record based on email match
// Handles edge cases (no match, multiple matches)
```

#### 2.2 Update Storage Interface
In `server/storage.ts`, add methods:
```typescript
updateContactCalendlyInfo(
  email: string, 
  calendlyData: CalendlyWebhookData
): Promise<Contact | null>;

getContactByEmail(email: string): Promise<Contact | null>;
```

### Phase 3: Calendly Configuration

#### 3.1 Webhook Setup in Calendly Dashboard
1. Navigate to Integrations → Webhooks
2. Add webhook URL: `https://[your-domain]/api/webhooks/calendly`
3. Subscribe to events:
   - `invitee.created` (when appointment is scheduled)
   - `invitee.canceled` (when appointment is canceled)
   - `invitee_event_updated` (when appointment is rescheduled)

#### 3.2 Obtain Webhook Signing Key
- Copy signing key from Calendly dashboard
- Add to environment variables: `CALENDLY_WEBHOOK_SECRET`

### Phase 4: Contact Form Flow Update

#### 4.1 Enhanced Form Submission
1. User fills contact form → Save to DB with `calendly_status: 'pending'`
2. Open Calendly modal (no changes needed)
3. User schedules → Webhook updates record

#### 4.2 Visual Feedback
Add status indicator in contact form success message:
- "Tu información ha sido guardada. Por favor agenda tu cita."
- After webhook: "Cita agendada para [date]"

### Phase 5: Security Implementation

#### 5.1 Webhook Signature Validation
```typescript
// Verify webhook authenticity using HMAC-SHA256
// Compare computed signature with Calendly-Webhook-Signature header
// Reject invalid requests with 401
```

#### 5.2 Rate Limiting
- Apply stricter rate limiting to webhook endpoint: 50 requests/minute
- Log all webhook attempts for monitoring

#### 5.3 Data Validation
- Validate email format from webhook payload
- Sanitize all string inputs before database storage
- Validate appointment date is in the future

### Phase 6: Error Handling & Edge Cases

#### 6.1 Email Matching Strategy
1. **Exact Match**: Update contact where email matches exactly
2. **No Match**: Log webhook event but don't fail (user might use different email)
3. **Multiple Matches**: Update most recent contact submission
4. **Case Sensitivity**: Use lowercase comparison for emails

#### 6.2 Webhook Retry Logic
- Return 200 OK even if contact not found (prevent Calendly retries)
- Log all events to `calendly_webhook_logs` table for debugging
- Implement idempotency using `calendly_event_id`

#### 6.3 Race Conditions
- User schedules before form submission: Store webhook data temporarily
- Multiple simultaneous submissions: Use database transactions

### Phase 7: Testing Strategy

#### 7.1 Local Testing with ngrok
1. Install ngrok: `npm install -g ngrok`
2. Expose local server: `ngrok http 5000`
3. Use ngrok URL for Calendly webhook testing

#### 7.2 Test Scenarios
- ✓ Normal flow: Form → Schedule → Webhook received
- ✓ Schedule with different email
- ✓ Cancel appointment
- ✓ Reschedule appointment
- ✓ Invalid webhook signature
- ✓ Duplicate webhook delivery

### Phase 8: Monitoring & Maintenance

#### 8.1 Logging
- Log all webhook receipts with timestamp
- Track success/failure rates
- Monitor email match percentage

#### 8.2 Admin Features (Future)
- View appointments in contact list
- Show Calendly status for each contact
- Export contacts with appointment data

## Implementation Timeline
1. **Day 1**: Database schema update, Drizzle types
2. **Day 2**: Webhook endpoint, signature validation
3. **Day 3**: Storage methods, email matching logic
4. **Day 4**: Testing with ngrok, edge case handling
5. **Day 5**: Production deployment, monitoring setup

## Rollback Plan
If issues arise:
1. Remove webhook from Calendly dashboard
2. Contact form continues working normally
3. Appointment data columns remain but unused
4. No breaking changes to existing functionality

## Success Metrics
- 90%+ webhook delivery success rate
- 80%+ email match rate
- Zero impact on existing contact form submissions
- No increase in form abandonment rate

## Dependencies
- Calendly webhook access (included in free plan)
- Environment variable: `CALENDLY_WEBHOOK_SECRET`
- No new npm packages required
- No frontend changes required (initially)

## Future Enhancements
1. Show appointment status in UI after scheduling
2. Send confirmation email with appointment details
3. Sync cancellations back to UI
4. Add appointment reminder system
5. Analytics on scheduling conversion rate