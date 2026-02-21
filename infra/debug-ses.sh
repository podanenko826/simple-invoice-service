#!/bin/bash

# Debug SES Configuration
# Run this with: AWS_PROFILE=ske-dev bash debug-ses.sh

REGION="us-east-1"
FROM_EMAIL="security@awsbyivan.com"
TO_EMAIL="yalovechik2012@gmail.com"

echo "=== Checking SES Configuration ==="
echo ""

echo "1. Checking SES identities in $REGION..."
aws ses list-identities --region $REGION --profile ${AWS_PROFILE:-default}
echo ""

echo "2. Checking verification status for $FROM_EMAIL..."
aws ses get-identity-verification-attributes \
  --identities $FROM_EMAIL \
  --region $REGION \
  --profile ${AWS_PROFILE:-default}
echo ""

echo "3. Checking if account is in sandbox mode..."
aws ses get-account-sending-enabled --region $REGION --profile ${AWS_PROFILE:-default}
echo ""

echo "4. Testing email send..."
aws ses send-email \
  --from $FROM_EMAIL \
  --destination "ToAddresses=$TO_EMAIL" \
  --message "Subject={Data='Test from SES'},Body={Text={Data='This is a test email to verify SES is working.'}}" \
  --region $REGION \
  --profile ${AWS_PROFILE:-default}

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test email sent successfully! Check $TO_EMAIL inbox."
else
    echo ""
    echo "❌ Failed to send test email. Check the error above."
fi

echo ""
echo "=== CloudWatch Logs ==="
echo "To view Lambda logs, run:"
echo "aws logs tail /aws/lambda/InvoiceServiceStack-AuthCreateAuthChallenge --follow --region $REGION --profile ${AWS_PROFILE:-default}"
