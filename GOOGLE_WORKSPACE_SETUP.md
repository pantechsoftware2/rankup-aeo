# Google Workspace Email Setup

The app now supports two email providers:

- `brevo`
- `google_workspace`

Set this in Vercel:

```bash
EMAIL_PROVIDER=google_workspace
ADMIN_EMAIL=yourss.naman@gmail.com
FROM_EMAIL=yourss.naman@gmail.com
GOOGLE_WORKSPACE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GOOGLE_WORKSPACE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_WORKSPACE_IMPERSONATED_USER=yourss.naman@gmail.com
```

## What Google Workspace requires

1. Create a Google Cloud project.
2. Enable the Gmail API.
3. Create a service account.
4. Turn on domain-wide delegation for that service account.
5. In the Google Admin console, authorize the service account for:
   - `https://www.googleapis.com/auth/gmail.send`
6. Impersonate a real mailbox in your Google Workspace domain.

The impersonated mailbox should match `FROM_EMAIL`.

## What changes once enabled

All transactional emails move through Gmail API:

- deep report request notifications
- deep report request confirmations
- review-ready admin notifications
- final PDF delivery
- project intake notifications
- outbound snapshot emails

## Outbound send route

The app now includes:

- `POST /api/outbound/send`

Example:

```bash
curl -X POST "https://www.rankupaeo.com/api/outbound/send?token=YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prospectId": "PROSPECT_UUID"
  }'
```

Optional fields:

- `toEmail`
- `recipientName`

If `toEmail` is omitted, the route uses the first email found on the prospect website.
