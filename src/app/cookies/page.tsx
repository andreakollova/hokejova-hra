import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Cookie & Local Storage Policy',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={130} height={30} className="h-6 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 py-12 prose prose-gray prose-sm max-w-none">
        <h1>HOCKEY BEATS</h1>
        <h1>Cookie &amp; Local Storage Policy</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.0<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>This Cookie &amp; Local Storage Policy explains how Hockey Beats uses cookies, browser local storage, and similar technologies to operate its website and interactive hockey training platform.</p>

        <p>It describes the information stored on users&apos; devices, the purposes of that storage, available controls, and when consent may be required.</p>

        <p>Hockey Beats is operated by:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number (IČO):</strong> 53874871<br />
        <strong>Tax Identification Number (DIČ):</strong> 2121518399<br />
        <strong>VAT Identification Number:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <p>This Policy should be read together with our Privacy Policy and Terms of Service.</p>

        <h2>2. What Are Cookies and Local Storage?</h2>

        <p>Cookies are small pieces of information stored by a browser when a user visits a website.</p>

        <p>They may be used to maintain sessions, remember preferences, support security, or provide other functionality.</p>

        <p>Local storage is a browser technology that allows a website to store information on a user&apos;s device across browsing sessions.</p>

        <p>Unlike cookies, local-storage values are not automatically attached to every HTTP request.</p>

        <p>Other technologies, including session storage and similar browser mechanisms, may also be used to support website functionality.</p>

        <p>The rules governing access to information on a user&apos;s device can apply to cookies and other storage technologies, including local storage.</p>

        <h2>3. How Hockey Beats Uses Browser Storage</h2>

        <p>Hockey Beats uses browser storage primarily to:</p>

        <ul>
          <li>Maintain account-related functionality.</li>
          <li>Remember usernames and preferences.</li>
          <li>Save gameplay progression and achievements.</li>
          <li>Store camera calibration settings.</li>
          <li>Support Remote Phone Camera sessions.</li>
          <li>Remember music preferences and history.</li>
          <li>Support friends and social features.</li>
          <li>Maintain the technical operation and security of the Service.</li>
        </ul>

        <p>The current application does not use its own advertising or behavioral advertising cookies.</p>

        <p>We do not use browser storage to sell personal data to advertisers.</p>

        <h2>4. Cookies Used by Hockey Beats</h2>

        <h3>4.1 Username cookie</h3>

        <p><strong>Cookie name:</strong> <code>hb_username</code></p>

        <p><strong>Purpose:</strong> Stores the user&apos;s username for relevant account and interface functionality.</p>

        <p><strong>Duration:</strong> Up to one year from the time it is set.</p>

        <p><strong>Path:</strong> <code>/</code></p>

        <p><strong>Category:</strong> Functional storage.</p>

        <p><strong>Provider:</strong> Hockey Beats.</p>

        <p>The cookie is not used by Hockey Beats for third-party advertising.</p>

        <p>Its classification as strictly necessary or consent-dependent must reflect the actual purpose and technical necessity of its use.</p>

        <p>A cookie does not become exempt from consent requirements merely because it is described as functional.</p>

        <h3>4.2 Authentication-related storage</h3>

        <p>Account authentication is provided through Supabase Auth.</p>

        <p>Depending on the authentication method and implementation, authentication functionality may use cookies or other browser storage to maintain a secure user session.</p>

        <p>Where storage is strictly necessary to provide a sign-in service expressly requested by the user, it may qualify for an exemption from prior consent under applicable law.</p>

        <p>The precise names, expiration periods, and purposes of authentication-related storage must be verified against the deployed implementation.</p>

        <h2>5. Local Storage Used by Hockey Beats</h2>

        <p>The current application uses the following local-storage keys.</p>

        <h3>5.1 <code>sportqo_engagement</code></h3>

        <p><strong>Purpose:</strong> Stores gameplay progression and engagement information, including XP, streaks, games played, and achievements.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Generally persists until removed by the application, browser, or user.</p>

        <h3>5.2 <code>sportqo_user_settings</code></h3>

        <p><strong>Purpose:</strong> Remembers user settings such as username, platform, and selected music service.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Generally persists until removed.</p>

        <h3>5.3 <code>sportqo_music_history</code></h3>

        <p><strong>Purpose:</strong> Stores information about music tracks previously used or played through supported features.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Generally persists until removed or cleared by an applicable application function.</p>

        <h3>5.4 <code>hb_friends</code></h3>

        <p><strong>Purpose:</strong> Stores information used by available friends and social features.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Generally persists until removed.</p>

        <h3>5.5 <code>ballTracker_calibration</code></h3>

        <p><strong>Purpose:</strong> Stores camera and ball-tracking calibration settings so that users do not need to repeat configuration unnecessarily.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Generally persists until removed.</p>

        <h3>5.6 <code>hb_remote_session</code></h3>

        <p><strong>Purpose:</strong> Stores a session identifier used to establish or maintain Remote Phone Camera functionality.</p>

        <p><strong>Storage type:</strong> Browser local storage.</p>

        <p><strong>Duration:</strong> Persists until cleared by the application, browser, or user.</p>

        <p>This session identifier is not a stored camera recording.</p>

        <h2>6. Strictly Necessary Storage</h2>

        <p>Certain cookies or browser-storage technologies may be necessary to provide a feature or service expressly requested by a user.</p>

        <p>Examples may include:</p>

        <ul>
          <li>Maintaining a secure authenticated session.</li>
          <li>Preserving essential security information.</li>
          <li>Establishing a Remote Phone Camera connection requested by the user.</li>
          <li>Storing information technically indispensable to a requested gameplay function.</li>
        </ul>

        <p>Where a technology meets the applicable legal requirements for strictly necessary storage, prior consent may not be required.</p>

        <p>We assess necessity based on the actual function of the technology, not merely its name or category.</p>

        <p>Storage used for convenience, analytics, personalization, or other optional purposes does not automatically qualify for an exemption.</p>

        <h2>7. Consent for Non-Essential Storage</h2>

        <p>Where applicable law requires consent before storing or accessing information on a user&apos;s device, Hockey Beats will request valid consent before using the relevant non-essential technology.</p>

        <p>Consent must be:</p>

        <ul>
          <li>Freely given.</li>
          <li>Specific.</li>
          <li>Informed.</li>
          <li>Unambiguous.</li>
          <li>Capable of being withdrawn.</li>
        </ul>

        <p>Users must not be required to accept non-essential storage merely to access features that can operate without it.</p>

        <p>Where a consent banner is required, users will be provided with appropriate choices to accept or reject optional technologies.</p>

        <p>Declining optional storage will not prevent access to functionality that does not depend on that storage.</p>

        <h2>8. Analytics</h2>

        <h3>8.1 Vercel Analytics</h3>

        <p>Hockey Beats uses Vercel Analytics to understand website usage and performance.</p>

        <p>Under the current integration, Vercel Analytics is intended to provide aggregated usage information without setting its own analytics tracking cookies on users&apos; devices.</p>

        <p>The absence of analytics cookies does not necessarily mean that no personal data is processed.</p>

        <p>Any analytics-related personal data processing is described in the Privacy Policy.</p>

        <h3>8.2 Internal visit tracking</h3>

        <p>Hockey Beats also operates an internal visit-tracking system that records:</p>

        <ul>
          <li>Page path.</li>
          <li>Username, where available.</li>
          <li>Timestamp.</li>
        </ul>

        <p>These records are stored in Supabase.</p>

        <p>They are not anonymous where they can be associated with an identifiable user.</p>

        <p>The internal <code>page_views</code> records are automatically deleted after 90 days through the configured deletion process.</p>

        <p>This server-side recordkeeping is distinct from storing cookies or local-storage values on the user&apos;s device, although any associated access to device-stored information must independently comply with applicable law.</p>

        <h2>9. Camera and Remote Phone Camera</h2>

        <p>Hockey Beats uses camera-based ball tracking for gameplay.</p>

        <p>Under the current implementation:</p>

        <ul>
          <li>Camera frames are processed locally in the browser.</li>
          <li>Raw camera images and videos are not uploaded to Hockey Beats servers as part of tracking.</li>
          <li>Frames are processed in real time and discarded.</li>
          <li>Camera calibration settings may be stored locally.</li>
          <li>Remote Phone Camera uses a session identifier and transmits numerical tracking coordinates rather than raw video.</li>
        </ul>

        <p>Camera access requires the user&apos;s browser or device permission.</p>

        <p>Granting camera permission is separate from granting consent to non-essential cookies or other browser storage.</p>

        <p>Remote Phone Camera is available to Free and Premium users without an additional charge.</p>

        <h2>10. Third-Party Services</h2>

        <p>Hockey Beats uses or may integrate with external service providers, including:</p>

        <p><strong>Supabase:</strong> Authentication and database functionality.</p>

        <p><strong>Vercel:</strong> Website hosting, infrastructure, and analytics.</p>

        <p><strong>Google:</strong> Optional account authentication.</p>

        <p><strong>Apple:</strong> Optional account authentication and Apple Music integration.</p>

        <p><strong>Spotify:</strong> Music integration where legally and contractually permitted.</p>

        <p><strong>Payment processors:</strong> Subscription billing when paid checkout functionality is implemented.</p>

        <p>Third-party services may use cookies or similar technologies according to their actual functionality and applicable policies.</p>

        <p>Hockey Beats will assess any third-party storage used through its website and implement consent mechanisms where legally required.</p>

        <p>We do not guarantee that a third-party service never uses cookies or similar technologies.</p>

        <h2>11. Managing Cookies and Local Storage</h2>

        <p>Users can manage browser storage through their browser settings.</p>

        <p>Depending on the browser, users may be able to:</p>

        <ul>
          <li>View stored cookies.</li>
          <li>Delete individual cookies.</li>
          <li>Clear local-storage data.</li>
          <li>Block cookies.</li>
          <li>Clear website data.</li>
          <li>Manage site permissions.</li>
        </ul>

        <p>Deleting browser storage may result in:</p>

        <ul>
          <li>Loss of saved preferences.</li>
          <li>Reset gameplay settings.</li>
          <li>Removal of locally stored progress.</li>
          <li>Disconnection of a Remote Phone Camera session.</li>
          <li>The need to sign in again.</li>
        </ul>

        <p>Removing local browser data does not necessarily delete information already stored in a user&apos;s Hockey Beats account or database.</p>

        <p>Account-related deletion requests are handled under the Privacy Policy.</p>

        <h2>12. Withdrawing Cookie Consent</h2>

        <p>Where Hockey Beats uses consent-dependent storage, users will be able to withdraw their consent through an accessible mechanism.</p>

        <p>Withdrawing consent will not affect the lawfulness of processing performed before withdrawal.</p>

        <p>Following withdrawal, we will stop using the relevant non-essential technologies and take appropriate steps regarding associated stored information, subject to technical feasibility and applicable law.</p>

        <p>Strictly necessary storage may remain active where permitted by law.</p>

        <h2>13. Data Protection and User Rights</h2>

        <p>Some information stored through cookies or local storage may constitute personal data.</p>

        <p>Where personal data is processed, the GDPR and other applicable data protection rules may apply.</p>

        <p>Users may have rights of access, rectification, erasure, restriction, portability, objection, and withdrawal of consent, depending on the circumstances.</p>

        <p>Further information is available in our Privacy Policy:</p>

        <p><strong><a href="https://hockeybeats.app/privacy">https://hockeybeats.app/privacy</a></strong></p>

        <p>For privacy requests, contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <h2>14. Children&apos;s Privacy</h2>

        <p>Hockey Beats is intended for users aged 13 and older.</p>

        <p>Users under 13 must not create an account or use the Service.</p>

        <p>Where consent is legally required for a child and applicable law requires parental authorization, the necessary consent must be obtained through an appropriate process.</p>

        <p>A child selecting a checkbox does not automatically establish verified parental consent.</p>

        <p>We aim to minimize unnecessary tracking and avoid using children&apos;s personal data for behavioral advertising.</p>

        <h2>15. Changes to This Policy</h2>

        <p>We may update this Policy to reflect:</p>

        <ul>
          <li>Changes to website functionality.</li>
          <li>New or removed storage technologies.</li>
          <li>Changes to authentication or payment integrations.</li>
          <li>Updates to analytics.</li>
          <li>Changes in applicable law.</li>
          <li>Improvements to privacy and security practices.</li>
        </ul>

        <p>The current version and effective date will be published on our website.</p>

        <p>Where a new technology requires prior consent, we will obtain that consent before using it.</p>

        <h2>16. Contact Information</h2>

        <p>For questions about cookies, browser storage, consent, or privacy, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Cookie &amp; Local Storage Policy — Version 1.0</strong></p>
      </main>
    </div>
  );
}
