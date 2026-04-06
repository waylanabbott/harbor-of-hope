import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';

export default function CookieConsentBanner() {
  return (
    <CookieConsent
      cookieName="harborCookieConsent"
      enableDeclineButton
      location="bottom"
      onAccept={() => {
        // Consent is now stored -- dark mode will persist on next toggle
      }}
      onDecline={() => {
        Cookies.remove('darkMode');
      }}
      style={{
        background: '#2D2D2D',
        fontSize: '14px',
      }}
      buttonStyle={{
        background: '#E8735A',
        color: '#FFFFFF',
        borderRadius: 24,
        fontWeight: 700,
        padding: '8px 24px',
        fontSize: '14px',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid #FFFFFF',
        color: '#FFFFFF',
        borderRadius: 24,
        fontWeight: 700,
        padding: '8px 24px',
        fontSize: '14px',
      }}
      buttonText="Accept"
      declineButtonText="Decline"
    >
      We use cookies to enhance your experience. Essential cookies are required
      for the site to function. Non-essential cookies help us remember your
      preferences like dark mode.
    </CookieConsent>
  );
}
