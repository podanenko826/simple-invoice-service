# Feedback Email Notifications Setup

## Overview
Implemented SNS email notifications for user feedback. When users submit feedback, it's saved to S3 and an email notification is sent immediately.

## Architecture

```
User submits feedback
    ↓
API Gateway → save-feedback Lambda
    ↓
    ├─→ Save to S3 (JSON file)
    └─→ Publish to SNS Topic
            ↓
        Email to alertEmail
```

## Changes Made

### 1. Lambda Function (`save-feedback.ts`)
- Added SNS client import
- Publishes formatted message to SNS topic after saving to S3
- Email includes:
  - Feedback message
  - Rating (if provided)
  - Page location
  - User ID
  - Timestamp
  - User agent and IP
  - S3 file location

### 2. CDK Stack (`invoice-service-stack.ts`)
- Created SNS topic: `sis-feedback-dev`
- Added email subscription (uses `alertEmail` from stack props)
- Granted Lambda permission to publish to SNS
- Added `FEEDBACK_TOPIC_ARN` environment variable to Lambda

## Configuration

### Enable Email Notifications

Edit `infra/app.ts` and uncomment the alertEmail line:

```typescript
const alertEmail = "your-email@example.com"; // Your email address
```

Then pass it to the stack:

```typescript
const mainStack = new InvoiceServiceStack(app, "InvoiceServiceStack", {
    // ... other props
    alertEmail: alertEmail, // Uncomment this line
});
```

### Deploy

```bash
cd infra
npm run build
cdk deploy InvoiceServiceStack
```

### Confirm Email Subscription

After deployment:
1. Check your email inbox
2. Look for "AWS Notification - Subscription Confirmation"
3. Click the confirmation link
4. You'll start receiving feedback notifications

## Email Format

**Subject:** `New Feedback: ⭐ 5/5` (or "No rating")

**Body:**
```
New feedback received from OneThing Invoice!

📝 Message:
[User's feedback message]

⭐ Rating: 5/5
📄 Page: /workspace

👤 User ID: [cognito-user-id]
🕐 Timestamp: 2026-03-03T12:34:56.789Z
🌐 User Agent: Mozilla/5.0...
📍 Source IP: 1.2.3.4

📦 S3 Location: s3://sis-feedback-350610702366/feedback/2026-03-03/[filename].json
```

## Testing

1. Deploy the changes
2. Confirm your email subscription
3. Submit feedback through the app
4. Check your email within seconds

## Cost

- **SNS**: $0.50 per million notifications
- **Email delivery**: First 1,000 emails/month free, then $2 per 100,000 emails
- **Typical cost**: ~$0.01/month for 100 feedback submissions

## Troubleshooting

### Not receiving emails?

1. **Check spam folder** - AWS emails sometimes go to spam
2. **Verify subscription** - Check SNS console for subscription status
3. **Check Lambda logs** - Look for "SNS notification sent successfully"
4. **Verify topic ARN** - Check Lambda environment variables

### Lambda errors?

Check CloudWatch Logs for the `SaveFeedbackFunction`:
```bash
aws logs tail /aws/lambda/InvoiceServiceStack-SaveFeedbackFunction --follow
```

## Future Enhancements

- Add Slack notifications
- Create feedback dashboard
- Add sentiment analysis
- Aggregate weekly feedback reports
- Add feedback categories/tags
