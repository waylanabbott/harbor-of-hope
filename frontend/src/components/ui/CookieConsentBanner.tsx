import { Link as RouterLink } from 'react-router-dom';
import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      cookieName="harborCookieConsent"
      enableDeclineButton
      location="bottom"
      onAccept={() => {
        // Consent granted — preference cookies (dark mode) will persist
      }}
      onDecline={() => {
        // Consent denied — remove all non-essential cookies
        Cookies.remove('fontSize');
      }}
      style={{
        background: '#2D2D2D',
        fontSize: '14px',
        padding: '16px 24px',
        alignItems: 'center',
        lineHeight: 1.6,
      }}
      buttonStyle={{
        background: '#E8735A',
        color: '#FFFFFF',
        borderRadius: 24,
        fontWeight: 700,
        padding: '10px 28px',
        fontSize: '14px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid #FFFFFF',
        color: '#FFFFFF',
        borderRadius: 24,
        fontWeight: 700,
        padding: '10px 28px',
        fontSize: '14px',
      }}
      buttonText="Accept All Cookies"
      declineButtonText="Essential Only"
    >
      <span>
        We use <strong>essential cookies</strong> required for the site to
        function (authentication, security) and{' '}
        <strong>preference cookies</strong> (text size) only with your consent.
        We do not use tracking or advertising cookies. Read our{' '}
        <RouterLink
          to="/privacy"
          style={{ color: '#E8935A', textDecoration: 'underline' }}
        >
          Privacy Policy
        </RouterLink>{' '}
        for details on data collection, your GDPR rights, and how to request
        data deletion.
      </span>
    </CookieConsent>
  );
}
