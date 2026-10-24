import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.1<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>At Hockey Beats, we respect your privacy and are committed to protecting your personal data.</p>

        <p>This Privacy Policy explains how we collect, use, store, share, and protect personal information when you visit our website, create an account, play games, connect supported music services, use camera-based tracking, or interact with other features of Hockey Beats.</p>

        <p>It also explains your rights under applicable data protection laws, including the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;).</p>

        <p>Hockey Beats is operated by:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number (IČO):</strong> 53874871<br />
        <strong>Tax Identification Number (DIČ):</strong> 2121518399<br />
        <strong>VAT Identification Number:</strong> SK2121518399</p>

        <p><strong>Privacy contact:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <p>DRIXTON s. r. o. is the controller of personal data processed for the purposes described in this Policy, unless otherwise stated.</p>

        <h2>2. Scope of This Privacy Policy</h2>

        <p>This Policy applies to personal data processed through:</p>

        <ul>
          <li>The Hockey Beats website.</li>
          <li>Account registration and authentication.</li>
          <li>Hockey games and gameplay features.</li>
          <li>Camera-based ball tracking.</li>
          <li>Remote Phone Camera functionality.</li>
          <li>Player profiles, scores, achievements, and leaderboards.</li>
          <li>Friends and social features.</li>
          <li>Optional music service integrations.</li>
          <li>Customer support and privacy requests.</li>
          <li>Subscription and billing functionality when introduced.</li>
        </ul>

        <p>This Policy does not replace the privacy policies of third-party providers, such as Google, Apple, Spotify, or payment processors.</p>

        <h2>3. Categories of Personal Data We Process</h2>

        <p>Depending on how you use Hockey Beats, we may process the following categories of personal data.</p>

        <h3>3.1 Account and authentication data</h3>

        <p>When you register or sign in, we may process:</p>

        <ul>
          <li>Email address.</li>
          <li>Username.</li>
          <li>Authentication identifiers.</li>
          <li>Password authentication data, including securely stored password hashes.</li>
          <li>Account creation and authentication information.</li>
          <li>Information required to maintain account security.</li>
        </ul>

        <p>Authentication is supported by Supabase Auth.</p>

        <p>We do not need to know your plaintext password to authenticate your account.</p>

        <h3>3.2 Google and Apple sign-in</h3>

        <p>Hockey Beats supports:</p>

        <ul>
          <li>Email and password registration.</li>
          <li>Sign in with Google.</li>
          <li>Sign in with Apple.</li>
        </ul>

        <p>If you choose Google or Apple authentication, the provider may share information necessary to create or authenticate your account, such as an account identifier, email address, or other permitted profile information.</p>

        <p>The information shared depends on the provider and your settings.</p>

        <p>Apple may provide a private relay email address.</p>

        <p>We do not receive your Google or Apple account password.</p>

        <p>Google and Apple process information under their own applicable privacy notices.</p>

        <h3>3.3 Email verification</h3>

        <p>Users registering with an email address and password must verify their email address through a verification link before their first successful sign-in.</p>

        <p>We process the information necessary to send and validate that verification request and to maintain the security of the authentication process.</p>

        <h3>3.4 Profile and personalization data</h3>

        <p>We may store:</p>

        <ul>
          <li>Username.</li>
          <li>Selected avatar or mascot.</li>
          <li>Profile color.</li>
          <li>User settings.</li>
          <li>Preferred platform.</li>
          <li>Music service preference.</li>
          <li>Friends list.</li>
        </ul>

        <h3>3.5 Gameplay and progression data</h3>

        <p>We may process:</p>

        <ul>
          <li>Experience points (XP).</li>
          <li>Player level.</li>
          <li>Gameplay streaks.</li>
          <li>Achievements.</li>
          <li>Games played.</li>
          <li>Scores.</li>
          <li>Selected difficulty.</li>
          <li>Song or track name associated with gameplay.</li>
          <li>Other information necessary to provide game progression and leaderboards.</li>
        </ul>

        <h3>3.6 Music-related information</h3>

        <p>Where you use music features, we may process:</p>

        <ul>
          <li>Selected music service.</li>
          <li>Music connection status.</li>
          <li>Track names.</li>
          <li>Music playback history stored by Hockey Beats.</li>
          <li>Authentication or authorization information necessary to connect supported services, where applicable.</li>
        </ul>

        <p>We do not claim ownership of your external music accounts or subscriptions.</p>

        <h3>3.7 Website usage and visit records</h3>

        <p>Our internal visit-tracking system records:</p>

        <ul>
          <li>The page path visited.</li>
          <li>The username associated with the visit, where available.</li>
          <li>The timestamp of the visit.</li>
        </ul>

        <p>These records are stored in the <code>page_views</code> table in Supabase.</p>

        <p><strong>Because visit records can include a username, they are personal data and are not treated as anonymous.</strong></p>

        <h3>3.8 Technical and security information</h3>

        <p>Our hosting, authentication, and infrastructure providers may process technical information necessary to operate and secure the Service, such as:</p>

        <ul>
          <li>IP addresses.</li>
          <li>Browser and device information.</li>
          <li>Request metadata.</li>
          <li>Authentication events.</li>
          <li>Security and diagnostic information.</li>
        </ul>

        <p>The precise information processed depends on the relevant provider, technical configuration, and the user&apos;s interaction with the Service.</p>

        <p>We use this information only where there is an appropriate legal basis and in accordance with applicable law.</p>

        <h3>3.9 Customer support information</h3>

        <p>If you contact us, we may process your email address, the content of your request, and information reasonably necessary to investigate and respond.</p>

        <h3>3.10 Subscription and payment information</h3>

        <p>Hockey Beats plans to introduce paid subscriptions through a payment service provider, potentially Stripe.</p>

        <p><strong>Stripe payment processing is not currently implemented as part of the confirmed technical setup.</strong></p>

        <p>When paid checkout is introduced, we will update the relevant privacy information to explain the payment provider, categories of payment and billing data, processing purposes, recipients, and applicable retention periods before processing begins.</p>

        <p>We do not represent that Hockey Beats currently collects or processes payment card details through Stripe.</p>

        <h2>4. Camera-Based Ball Tracking</h2>

        <h3>4.1 Local processing</h3>

        <p>Hockey Beats uses camera-based tracking to detect the position of a hockey ball during gameplay.</p>

        <p>Under the current implementation, camera frames are processed locally in the user&apos;s browser using JavaScript and browser-based Canvas technology.</p>

        <p><strong>Raw camera images and videos are not uploaded to Hockey Beats servers or stored by Hockey Beats as part of the ball-tracking process.</strong></p>

        <p>Frames are processed in real time and discarded.</p>

        <h3>4.2 Camera permissions</h3>

        <p>Camera access requires permission through your browser or device.</p>

        <p>You may manage or revoke that permission through the relevant browser or device settings.</p>

        <p>If you do not grant camera permission, camera-dependent gameplay features may be unavailable.</p>

        <h3>4.3 Remote Phone Camera</h3>

        <p>Remote Phone Camera is available to both Free and Premium users.</p>

        <p>Under the current implementation, the remote device transmits numerical ball-tracking coordinates, such as X and Y positions, to support gameplay.</p>

        <p>It does not transmit raw camera video to Hockey Beats servers as part of this functionality.</p>

        <p>A session identifier may be stored locally to establish or maintain the connection.</p>

        <h3>4.4 Privacy considerations</h3>

        <p>Although raw camera frames are not uploaded, the use of camera permissions and tracking functionality may still involve technical information processed by your browser, device, or associated infrastructure.</p>

        <p>You should use the camera in a suitable environment and respect the privacy of other people.</p>

        <h2>5. Gameplay, Scores, and Leaderboards</h2>

        <p>Hockey Beats processes gameplay information to:</p>

        <ul>
          <li>Save progress.</li>
          <li>Calculate XP, levels, and streaks.</li>
          <li>Record achievements.</li>
          <li>Store scores.</li>
          <li>Display leaderboards.</li>
          <li>Provide account-based gameplay continuity.</li>
          <li>Support available friends and social features.</li>
        </ul>

        <p>Scores may be associated with usernames and displayed to other users through leaderboard functionality.</p>

        <p>Users should avoid choosing usernames that reveal sensitive personal information.</p>

        <h2>6. Analytics and Website Visit Tracking</h2>

        <h3>6.1 Vercel Analytics</h3>

        <p>Hockey Beats uses Vercel Analytics to understand website usage and performance.</p>

        <p>The integration is intended to provide privacy-oriented, aggregated website analytics without Hockey Beats setting advertising or analytics tracking cookies through this integration.</p>

        <p>Technical data may nevertheless be processed by the analytics provider in accordance with its service configuration and applicable privacy requirements.</p>

        <h3>6.2 Internal visit tracking</h3>

        <p>Hockey Beats also operates an internal visit tracker.</p>

        <p>This system stores the visited page path, username where available, and timestamp in Supabase.</p>

        <p>Unlike aggregated analytics, these records can be associated with an identifiable account and therefore constitute personal data.</p>

        <h3>6.3 Retention</h3>

        <p><strong>Internal <code>page_views</code> records are automatically deleted after 90 days</strong> under the configured daily deletion process.</p>

        <p>Technical infrastructure logs may have different retention periods determined by their purposes and provider configurations.</p>

        <h2>7. Cookies and Browser Storage</h2>

        <p>Hockey Beats uses cookies and browser storage to support authentication-related functionality, settings, game progress, and other features.</p>

        <h3>7.1 Username cookie</h3>

        <p>Hockey Beats uses a cookie named:</p>

        <p><strong><code>hb_username</code></strong></p>

        <p>Its purpose is to retain the user&apos;s username for relevant account and interface functionality.</p>

        <p>The cookie is configured with a maximum lifetime of approximately one year.</p>

        <p>It is not used by Hockey Beats as an advertising cookie.</p>

        <h3>7.2 Local storage</h3>

        <p>The current application uses the following browser local-storage keys:</p>

        <p><strong><code>sportqo_engagement</code></strong></p>

        <p>Stores gameplay engagement information, such as XP, streaks, games played, and achievements.</p>

        <p><strong><code>sportqo_user_settings</code></strong></p>

        <p>Stores user preferences, including username, platform, and selected music service.</p>

        <p><strong><code>sportqo_music_history</code></strong></p>

        <p>Stores information about previously played music tracks.</p>

        <p><strong><code>hb_friends</code></strong></p>

        <p>Stores friends-related information.</p>

        <p><strong><code>ballTracker_calibration</code></strong></p>

        <p>Stores camera and ball-tracking calibration settings.</p>

        <p><strong><code>hb_remote_session</code></strong></p>

        <p>Stores a session identifier used for Remote Phone Camera functionality.</p>

        <h3>7.3 Essential and optional storage</h3>

        <p>Storage used to provide a service expressly requested by the user may be necessary for that service to function.</p>

        <p>Where non-essential cookies or similar technologies require consent under applicable law, we will obtain that consent before using them.</p>

        <p>Hockey Beats does not currently use its own advertising or behavioral advertising cookies under the confirmed implementation.</p>

        <p>Third-party services may use their own storage mechanisms when you interact with them.</p>

        <h3>7.4 Managing storage</h3>

        <p>Users can manage or delete cookies and local-storage data through their browser settings.</p>

        <p>Removing certain stored information may reset preferences, affect locally saved progress, or require users to sign in or configure features again.</p>

        <h2>8. Supabase Database and Authentication</h2>

        <p>Hockey Beats uses Supabase for database and authentication functionality.</p>

        <p>The confirmed database configuration uses EU-hosted infrastructure.</p>

        <p>The principal application tables include:</p>

        <h3>8.1 <code>user_data</code></h3>

        <p>May contain:</p>

        <ul>
          <li>Username.</li>
          <li>XP.</li>
          <li>Streak.</li>
          <li>Level.</li>
          <li>Friends.</li>
          <li>Music history.</li>
          <li>Avatar or mascot identifier.</li>
          <li>Profile color.</li>
        </ul>

        <h3>8.2 <code>scores</code></h3>

        <p>May contain:</p>

        <ul>
          <li>Username.</li>
          <li>Score.</li>
          <li>Difficulty.</li>
          <li>Song name.</li>
        </ul>

        <h3>8.3 <code>page_views</code></h3>

        <p>Contains:</p>

        <ul>
          <li>Page path.</li>
          <li>Username, where available.</li>
          <li>Timestamp.</li>
        </ul>

        <h3>8.4 <code>beat_maps</code></h3>

        <p>Contains game-related music metadata, such as:</p>

        <ul>
          <li>Track name.</li>
          <li>BPM.</li>
          <li>Beat information.</li>
        </ul>

        <p>Beat-map information is not inherently personal data, although associated account or usage information may be personal data depending on the context.</p>

        <h3>8.5 Supabase Auth</h3>

        <p>Authentication may involve:</p>

        <ul>
          <li>Email addresses.</li>
          <li>Password hashes.</li>
          <li>Provider-specific authentication identifiers.</li>
          <li>OAuth-related authentication information.</li>
          <li>Security and session information.</li>
        </ul>

        <p>Supabase processes relevant data according to its role, contractual arrangements, and applicable data protection requirements.</p>

        <h2>9. Purposes and Legal Bases of Processing</h2>

        <p>We process personal data only where an appropriate legal basis applies.</p>

        <h3>9.1 Performance of a contract — Article 6(1)(b) GDPR</h3>

        <p>Where necessary to provide the Service requested by a user, we process information for:</p>

        <ul>
          <li>Account creation and authentication.</li>
          <li>Email verification.</li>
          <li>Gameplay progression.</li>
          <li>Scores and achievements.</li>
          <li>Account-based settings.</li>
          <li>Provision of Free and Premium features.</li>
          <li>Management of subscriptions when implemented.</li>
        </ul>

        <h3>9.2 Legitimate interests — Article 6(1)(f) GDPR</h3>

        <p>Where our interests are not overridden by users&apos; rights and freedoms, we may process information for:</p>

        <ul>
          <li>Maintaining Service security.</li>
          <li>Detecting fraud and misuse.</li>
          <li>Troubleshooting technical issues.</li>
          <li>Improving the Service.</li>
          <li>Internal usage analysis and visit tracking.</li>
          <li>Protecting accounts and preventing unauthorized activity.</li>
        </ul>

        <p>Where children are involved, their interests and rights receive particular consideration.</p>

        <p>Users have the right to object to processing based on legitimate interests in accordance with applicable law.</p>

        <h3>9.3 Consent — Article 6(1)(a) GDPR</h3>

        <p>Where consent is the appropriate legal basis, we may rely on it for optional processing activities.</p>

        <p>Consent must be freely given, specific, informed, and unambiguous.</p>

        <p>Users may withdraw consent at any time, without affecting the lawfulness of processing performed before withdrawal.</p>

        <p>Where parental consent is required for a child, we must take reasonable steps to obtain and verify it in accordance with applicable law.</p>

        <p>Browser camera permission is a technical device permission and does not, by itself, replace any GDPR consent that may be legally required.</p>

        <h3>9.4 Legal obligations — Article 6(1)(c) GDPR</h3>

        <p>We may process information where necessary to comply with applicable legal obligations, including accounting, tax, consumer protection, and lawful regulatory requirements.</p>

        <h2>10. Children and Parental Consent</h2>

        <p>Hockey Beats is intended for users aged <strong>13 and older</strong>.</p>

        <p>Children under 13 must not create an account or use the Service.</p>

        <p>Users aged 13 to 15 must have permission from a parent or legal guardian to use Hockey Beats.</p>

        <p>In Slovakia, Article 8 GDPR consent for information society services may be given independently from age 16.</p>

        <p>Where we rely on consent for processing subject to Article 8 GDPR, the necessary parental authorization must be obtained for younger users through an appropriate verification process.</p>

        <p>A child selecting a checkbox stating that parental permission has been obtained does not, by itself, establish verified parental consent.</p>

        <p>Different rules may apply in other jurisdictions.</p>

        <p>We aim to minimize personal data processing involving minors and to provide information in language that is understandable to younger users.</p>

        <p>Parents or guardians may contact <strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong> regarding a child&apos;s account or personal data.</p>

        <p>If we learn that personal data has been processed without a required legal basis or authorization, we will take appropriate steps under applicable law.</p>

        <h2>11. Third-Party Music Services</h2>

        <h3>11.1 Apple Music</h3>

        <p>Hockey Beats supports optional Apple Music integration through MusicKit.</p>

        <p>When a user connects Apple Music, relevant authorization and playback-related information may be processed to provide the requested integration.</p>

        <p>Apple independently processes information under its applicable privacy policies and terms.</p>

        <h3>11.2 Spotify</h3>

        <p>Hockey Beats contains technical support for Spotify connectivity, but public use within the game remains subject to Spotify&apos;s applicable requirements and any necessary permissions.</p>

        <p>Spotify integration will be made available only where legally and contractually permitted.</p>

        <p>Where implemented, relevant authentication and music-related information may be processed to support the connection.</p>

        <h3>11.3 Disconnecting music services</h3>

        <p>Users can disconnect supported music services through Settings.</p>

        <p>Under the current implementation, disconnecting a music service clears the associated music history stored by Hockey Beats.</p>

        <p>Disconnecting a service does not necessarily delete information independently retained by the external music provider.</p>

        <p>Users may need to manage third-party authorizations separately through the relevant provider&apos;s account settings.</p>

        <h2>12. Data Sharing and Service Providers</h2>

        <p>We may disclose personal data to service providers where reasonably necessary to operate Hockey Beats and where an appropriate legal basis exists.</p>

        <p>Relevant providers include:</p>

        <p><strong>Vercel:</strong> Website hosting, infrastructure, and analytics.</p>

        <p><strong>Supabase:</strong> Database hosting, authentication, and related backend services.</p>

        <p><strong>Google:</strong> Optional Google account authentication.</p>

        <p><strong>Apple:</strong> Optional Apple account authentication and Apple Music integration.</p>

        <p><strong>Spotify:</strong> Optional music connectivity if and when lawfully available.</p>

        <p><strong>Payment providers:</strong> Payment processing when paid checkout functionality is introduced.</p>

        <p>Service providers may act as processors or independent controllers depending on the specific processing activity.</p>

        <p>Where required, we use appropriate contractual and organizational safeguards.</p>

        <p>We do not sell users&apos; personal data to advertisers.</p>

        <p>We may disclose information where required by applicable law, a valid legal request, or to protect legal rights, subject to applicable safeguards.</p>

        <h2>13. International Data Transfers</h2>

        <p>Hockey Beats uses EU-hosted Supabase database infrastructure under the confirmed configuration.</p>

        <p>However, some providers, support operations, authentication services, or other technical processing may involve access to or transfers of personal data outside the European Economic Area.</p>

        <p>Where GDPR transfer restrictions apply, we will use an appropriate legal transfer mechanism, such as:</p>

        <ul>
          <li>An applicable European Commission adequacy decision.</li>
          <li>Standard Contractual Clauses, where appropriate.</li>
          <li>Other safeguards or derogations permitted by law.</li>
        </ul>

        <p>Additional safeguards will be applied where required.</p>

        <p>Users may contact <strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong> for information about relevant transfer safeguards.</p>

        <h2>14. Data Retention</h2>

        <p>We retain personal data only for as long as necessary for the purposes for which it was collected, subject to applicable legal obligations.</p>

        <h3>14.1 Account and profile data</h3>

        <p>Account-related and profile information is generally retained while the account remains active and until it is deleted, unless a different lawful retention period applies.</p>

        <h3>14.2 Scores and achievements</h3>

        <p>Scores, XP, streaks, levels, and achievements are retained while the relevant account exists, subject to account deletion and any lawful retention requirements.</p>

        <h3>14.3 Internal page views</h3>

        <p>Records in the <code>page_views</code> table are automatically deleted after <strong>90 days</strong> through the configured daily deletion process.</p>

        <h3>14.4 Local browser storage</h3>

        <p>Local-storage information remains on the user&apos;s device until removed by the application, cleared by the user or browser, or otherwise affected by the relevant browser&apos;s storage behavior.</p>

        <p>The <code>hb_username</code> cookie has a configured maximum lifetime of approximately one year.</p>

        <h3>14.5 Camera frames</h3>

        <p>Raw camera frames are processed locally and discarded in real time.</p>

        <p>Hockey Beats does not retain raw camera photographs or videos as part of its ball-tracking functionality.</p>

        <h3>14.6 Support requests</h3>

        <p>Support correspondence is retained for as long as reasonably necessary to resolve the request, maintain appropriate records, and comply with applicable obligations.</p>

        <h3>14.7 Authentication records and technical logs</h3>

        <p>Authentication records, technical logs, and backups may be subject to separate retention schedules determined by operational needs, provider configurations, security requirements, and applicable law.</p>

        <p>Such records will not be retained indefinitely without an appropriate justification.</p>

        <h3>14.8 Legal retention</h3>

        <p>Where personal data must be retained to satisfy a legal obligation or establish, exercise, or defend legal claims, relevant information may be retained for the legally justified period.</p>

        <h2>15. Account Deletion</h2>

        <p>Users can initiate account deletion through:</p>

        <p><strong>Settings → Delete my account and all data</strong></p>

        <p>The process includes a double-confirmation step.</p>

        <p>The current account deletion endpoint is:</p>

        <p><strong><code>DELETE /api/account</code></strong></p>

        <p>Under the confirmed implementation, the deletion process removes associated records from:</p>

        <ul>
          <li><code>user_data</code></li>
          <li><code>scores</code></li>
          <li><code>page_views</code></li>
        </ul>

        <p>Deletion of authentication records, other linked records, provider-held information, and backup copies must be handled according to their actual technical configuration and applicable law.</p>

        <p>Some information may need to be retained temporarily or for a legally required period.</p>

        <p>Where immediate deletion is not technically possible, we will apply appropriate restrictions and deletion schedules consistent with applicable law.</p>

        <p>Users may also request deletion by contacting:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>We will assess and respond to requests in accordance with applicable data protection law.</p>

        <h2>16. Your GDPR Rights</h2>

        <p>Where GDPR applies, you may have the following rights:</p>

        <h3>16.1 Right of access</h3>

        <p>You may request confirmation of whether we process your personal data and obtain access to relevant information.</p>

        <h3>16.2 Right to rectification</h3>

        <p>You may request correction of inaccurate personal data and completion of incomplete information.</p>

        <h3>16.3 Right to erasure</h3>

        <p>You may request deletion of your personal data where the conditions established by applicable law are satisfied.</p>

        <h3>16.4 Right to restriction</h3>

        <p>You may request restriction of processing in circumstances provided by law.</p>

        <h3>16.5 Right to data portability</h3>

        <p>Where applicable, you may request personal data in a structured, commonly used, machine-readable format and have it transmitted to another controller where technically feasible.</p>

        <h3>16.6 Right to object</h3>

        <p>You may object to processing based on legitimate interests, including profiling based on that legal basis, in accordance with applicable law.</p>

        <h3>16.7 Right to withdraw consent</h3>

        <p>Where processing is based on consent, you may withdraw that consent at any time.</p>

        <p>Withdrawal does not affect the lawfulness of earlier processing.</p>

        <h3>16.8 Automated decisions</h3>

        <p>You have rights concerning certain decisions based solely on automated processing, including profiling, where Article 22 GDPR applies.</p>

        <h3>16.9 Right to complain</h3>

        <p>You may lodge a complaint with a competent data protection supervisory authority.</p>

        <p>In Slovakia, the competent supervisory authority is:</p>

        <p><strong>Úrad na ochranu osobných údajov Slovenskej republiky</strong><br />
        (Personal Data Protection Office of the Slovak Republic)</p>

        <p>You may also contact the competent supervisory authority in another EU Member State where applicable.</p>

        <h3>16.10 Exercising your rights</h3>

        <p>To exercise your rights, contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>We may request information reasonably necessary to verify your identity before fulfilling a request.</p>

        <p>We will respond within the deadlines required by applicable law, generally within one month under the GDPR, subject to permitted extensions.</p>

        <h2>17. Data Security</h2>

        <p>We use technical and organizational measures intended to protect personal data against unauthorized access, accidental loss, alteration, disclosure, or destruction.</p>

        <p>These may include:</p>

        <ul>
          <li>Authentication controls.</li>
          <li>Restricted access to relevant systems.</li>
          <li>Security features provided by hosting and database providers.</li>
          <li>Password hashing through the authentication infrastructure.</li>
          <li>Encrypted communications where applicable.</li>
          <li>Account deletion functionality.</li>
          <li>Data retention and deletion procedures.</li>
        </ul>

        <p>No online service can guarantee absolute security.</p>

        <p>We review and adapt safeguards as appropriate to the risks associated with the processing.</p>

        <p>Where a personal data breach triggers legal notification obligations, we will comply with the applicable requirements.</p>

        <h2>18. Automated Gameplay Processing</h2>

        <p>Hockey Beats uses automated technical processes to:</p>

        <ul>
          <li>Detect ball position.</li>
          <li>Calculate gameplay outcomes.</li>
          <li>Determine scores.</li>
          <li>Update achievements and progression.</li>
          <li>Apply gameplay access limits.</li>
        </ul>

        <p>These processes are intended to provide interactive game functionality.</p>

        <p>Under the current design, they do not ordinarily produce legal effects or similarly significant effects on users within the meaning of Article 22 GDPR.</p>

        <p>If future functionality introduces automated decision-making subject to additional legal requirements, we will provide the necessary information and safeguards.</p>

        <h2>19. Changes to This Privacy Policy</h2>

        <p>We may update this Privacy Policy to reflect changes in:</p>

        <ul>
          <li>The Service.</li>
          <li>Technology and infrastructure.</li>
          <li>Data processing activities.</li>
          <li>Third-party integrations.</li>
          <li>Legal requirements.</li>
          <li>Security and privacy practices.</li>
        </ul>

        <p>The updated version and effective date will be published on our website.</p>

        <p>Where a change requires additional notice or consent under applicable law, we will provide it before the relevant processing begins.</p>

        <h2>20. Contact</h2>

        <p>For questions about this Privacy Policy, personal data, account deletion, parental requests, or your data protection rights, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Privacy Policy — Version 1.1</strong></p>
      </main>
    </div>
  );
}
