import os
from typing import Optional


class SmsSender:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_FROM_NUMBER")

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.auth_token and self.from_number)

    def send_sms(self, to_number: str, body: str) -> Optional[str]:
        """Send an SMS. Returns a provider message id if available."""
        if not self.is_configured():
            # Dev fallback: no real provider configured
            print(f"[sms][disabled] to={to_number} body={body}")
            return None

        from twilio.rest import Client

        client = Client(self.account_sid, self.auth_token)
        msg = client.messages.create(
            to=to_number,
            from_=self.from_number,
            body=body,
        )
        return getattr(msg, "sid", None)
