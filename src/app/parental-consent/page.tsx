import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Parental Consent & Children\'s Privacy Notice',
};

export default function ParentalConsentPage() {
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
        <h1>Parental Consent &amp; Children&apos;s Privacy Notice</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.0<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>Hockey Beats is an interactive hockey training and entertainment platform designed to make physical activity, hockey skills, and learning more engaging through games.</p>

        <p>We recognize that some Hockey Beats users are children and teenagers. Protecting their privacy, safety, and personal information is an important responsibility.</p>

        <p>This Parental Consent &amp; Children&apos;s Privacy Notice (&quot;Notice&quot;) explains:</p>

        <ul>
          <li>Who may use Hockey Beats.</li>
          <li>When parental permission or authorization is required.</li>
          <li>What personal data may be processed.</li>
          <li>How camera-based features work.</li>
          <li>How gameplay and social features operate.</li>
          <li>How Premium subscriptions and payments are handled.</li>
          <li>How parents and legal guardians can exercise their rights.</li>
          <li>How we protect younger users.</li>
        </ul>

        <p>This Notice supplements our Terms of Service, Privacy Policy, Cookie &amp; Local Storage Policy, and Subscription, Cancellation &amp; Refund Policy.</p>

        <p>Where mandatory law provides additional protection to children or consumers, that law prevails.</p>

        <h2>2. Service Provider and Data Controller</h2>

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

        <p>DRIXTON s. r. o. is the controller of personal data processed for the purposes described in this Notice, unless otherwise stated.</p>

        <h2>3. Minimum Age Requirements</h2>

        <h3>3.1 Children under 13</h3>

        <p>Hockey Beats is not intended for children under the age of 13.</p>

        <p>Children under 13 must not register for an account or use the Service.</p>

        <p>If we become aware that a child under 13 has registered or that we are processing their personal data without an appropriate legal basis, we will take the steps required by applicable law.</p>

        <h3>3.2 Users aged 13 to 15</h3>

        <p>Users aged 13 to 15 may use Hockey Beats only with permission from a parent or legal guardian.</p>

        <p>Where processing relies on consent and applicable law requires authorization from a holder of parental responsibility, the required authorization must be obtained before that processing begins.</p>

        <p>Under Slovak law, a child may independently consent to processing covered by Article 8 GDPR in connection with information society services from the age of 16.</p>

        <p>Where the child is younger than the applicable digital-consent age, consent-based processing must be authorized by the holder of parental responsibility in accordance with applicable law.</p>

        <h3>3.3 Users aged 16 to 17</h3>

        <p>Users aged 16 or 17 may use Hockey Beats subject to applicable law.</p>

        <p>They may generally provide their own consent for processing covered by Article 8 GDPR under Slovak law.</p>

        <p>However, this does not automatically establish legal capacity to enter every type of contract or authorize every payment.</p>

        <p>Parental or guardian involvement may still be necessary for paid transactions or other legally significant activities.</p>

        <h3>3.4 Users aged 18 and over</h3>

        <p>Adult users may create accounts and purchase subscriptions in accordance with the applicable Terms of Service and payment conditions.</p>

        <h2>4. Parental Permission and GDPR Consent</h2>

        <p>Parental permission to use Hockey Beats and consent to personal data processing are not always the same legal requirement.</p>

        <h3>4.1 Permission to use the Service</h3>

        <p>For users aged 13 to 15, Hockey Beats requires permission from a parent or legal guardian.</p>

        <p>Parents should review the Service, understand its features, and assess whether it is appropriate for their child.</p>

        <h3>4.2 Consent-based personal data processing</h3>

        <p>Where Hockey Beats relies on consent as the legal basis for a processing activity and Article 8 GDPR applies, the required parental authorization must be obtained for children below the applicable age threshold.</p>

        <p>Other processing activities may rely on different lawful bases, such as performance of a contract or legitimate interests, where those bases are appropriate under applicable law.</p>

        <p>We do not treat parental consent as a universal legal basis for every processing activity.</p>

        <h3>4.3 Verification</h3>

        <p>Where verified parental authorization is legally required, Hockey Beats must take reasonable steps to verify that consent was given or authorized by a holder of parental responsibility, taking into account available technology and the nature of the processing.</p>

        <p>A statement or checkbox selected solely by a child does not automatically establish verified parental consent.</p>

        <h3>4.4 Withdrawal</h3>

        <p>Where processing relies on consent, the person entitled to withdraw that consent may do so in accordance with applicable law.</p>

        <p>Withdrawal does not affect the lawfulness of processing carried out before withdrawal.</p>

        <p>If withdrawal means a feature can no longer lawfully operate, access to that feature may be restricted.</p>

        <h2>5. Account Registration</h2>

        <p>Hockey Beats supports:</p>

        <ul>
          <li>Email address and password.</li>
          <li>Sign in with Google.</li>
          <li>Sign in with Apple.</li>
        </ul>

        <p>Authentication is provided through Supabase Auth.</p>

        <p>Users registering with an email address and password must verify their email address before their first successful sign-in.</p>

        <p>Google and Apple may process account-related information according to their own terms and privacy policies.</p>

        <p>Parents should be aware that external authentication providers may impose additional minimum age requirements or parental supervision rules.</p>

        <p>Children must not use false ages or another person&apos;s identity to bypass eligibility restrictions.</p>

        <h2>6. Personal Data Processed</h2>

        <p>Depending on the features used, Hockey Beats may process:</p>

        <p><strong>Account information</strong></p>

        <ul>
          <li>Email address.</li>
          <li>Username.</li>
          <li>Authentication identifiers.</li>
          <li>Account security information.</li>
        </ul>

        <p><strong>Profile information</strong></p>

        <ul>
          <li>Avatar or mascot.</li>
          <li>Profile color.</li>
          <li>Preferences.</li>
          <li>Friends-related information.</li>
        </ul>

        <p><strong>Gameplay information</strong></p>

        <ul>
          <li>Scores.</li>
          <li>XP and levels.</li>
          <li>Achievements.</li>
          <li>Streaks.</li>
          <li>Difficulty settings.</li>
          <li>Games played.</li>
        </ul>

        <p><strong>Music-related information</strong></p>

        <ul>
          <li>Selected music service.</li>
          <li>Track names.</li>
          <li>Music history stored by Hockey Beats.</li>
          <li>Relevant connection information.</li>
        </ul>

        <p><strong>Website activity</strong></p>

        <ul>
          <li>Visited page paths.</li>
          <li>Username, where available.</li>
          <li>Timestamps.</li>
        </ul>

        <p><strong>Technical information</strong></p>

        <ul>
          <li>Information necessary for authentication, security, hosting, and technical operation.</li>
        </ul>

        <p>We aim to limit personal data collection to information appropriate for the Service and its purposes.</p>

        <h2>7. Camera-Based Gameplay</h2>

        <p>Hockey Beats uses camera-based ball tracking.</p>

        <p>Under the current implementation:</p>

        <ul>
          <li>Camera images are processed locally in the browser.</li>
          <li>Raw camera video is not uploaded to Hockey Beats servers as part of ball tracking.</li>
          <li>Raw camera frames are not stored by Hockey Beats.</li>
          <li>Frames are processed in real time and discarded.</li>
          <li>Camera permission must be granted through the browser or device.</li>
        </ul>

        <p>Parents should help younger players position the camera appropriately and ensure that the surrounding environment is suitable.</p>

        <p>The browser&apos;s camera permission is separate from any GDPR consent that may be legally required.</p>

        <h2>8. Remote Phone Camera</h2>

        <p>Remote Phone Camera allows a compatible phone to support gameplay.</p>

        <p>This feature is available to <strong>both Free and Premium users without an additional subscription charge</strong>.</p>

        <p>Under the current implementation, Remote Phone Camera sends numerical tracking coordinates, such as X and Y positions, rather than raw camera video to Hockey Beats servers.</p>

        <p>A session identifier may be used to establish or maintain the connection.</p>

        <p>Parents should supervise device setup where appropriate and ensure that the phone is placed securely.</p>

        <h2>9. Leaderboards, Usernames, and Social Features</h2>

        <p>Hockey Beats may display usernames, scores, achievements, and other gameplay information through leaderboards and social features.</p>

        <p>Parents and younger players should avoid using usernames that reveal:</p>

        <ul>
          <li>Full legal names.</li>
          <li>Home addresses.</li>
          <li>School details.</li>
          <li>Telephone numbers.</li>
          <li>Personal contact information.</li>
          <li>Other information that could unnecessarily identify or locate a child.</li>
        </ul>

        <p>Hockey Beats may provide friends and social features.</p>

        <p>Users must not harass others, impersonate other players, or disclose another person&apos;s private information without authorization.</p>

        <p>We may take proportionate steps to address abuse, fraud, or harmful conduct.</p>

        <p>Where appropriate, privacy-protective defaults and additional safeguards should be applied to younger users.</p>

        <h2>10. Music Integrations</h2>

        <p>Hockey Beats supports or may support optional integrations with external music services.</p>

        <h3>10.1 Apple Music</h3>

        <p>Apple Music integration may require an Apple account, compatible device, and an eligible Apple Music subscription.</p>

        <p>Apple&apos;s own terms, age restrictions, and privacy policies apply.</p>

        <h3>10.2 Spotify</h3>

        <p>Spotify integration may be made publicly available only where permitted under Spotify&apos;s developer policies, licensing conditions, and any required approvals.</p>

        <p>Technical availability does not itself establish authorization for public gameplay use.</p>

        <p>Spotify&apos;s own account and age requirements apply.</p>

        <h3>10.3 Parental responsibility</h3>

        <p>Parents should review the conditions of external music services before allowing children to connect them.</p>

        <p>Hockey Beats Premium does not include a subscription to Apple Music, Spotify Premium, or another third-party music service.</p>

        <h2>11. Free Plan and Premium Game Previews</h2>

        <p>Hockey Beats offers a permanent Free Plan.</p>

        <p>The Free Plan includes:</p>

        <ul>
          <li>Unlimited access to Hockey Beats Slalom.</li>
          <li>A one-time, 10-minute allowance for each Premium game.</li>
          <li>Camera-based ball tracking.</li>
          <li>Remote Phone Camera.</li>
          <li>XP, achievements, and leaderboards.</li>
          <li>Available social features.</li>
          <li>Supported music integrations, subject to third-party conditions.</li>
        </ul>

        <p>The ten-minute allowance for each Premium game is cumulative and does not reset daily or when changing devices.</p>

        <p>Using the Free Plan does not automatically create a paid subscription.</p>

        <h2>12. Premium Subscriptions and Minors</h2>

        <p>Hockey Beats offers:</p>

        <p><strong>Premium Monthly:</strong> €8.45 per month, including applicable VAT.</p>

        <p><strong>Premium Yearly:</strong> €79.99 per year, including applicable VAT.</p>

        <p>Paid subscriptions provide access to Premium games and features during the subscription period.</p>

        <h3>12.1 Authorization for purchases</h3>

        <p>A minor&apos;s ability to enter into a paid subscription agreement depends on applicable law and the nature of the transaction.</p>

        <p>Where parental or legal guardian authorization is required, the purchase must be authorized by the appropriate adult.</p>

        <p>A child stating that a parent has agreed does not automatically establish legally valid authorization for a recurring payment.</p>

        <h3>12.2 Payment method</h3>

        <p>A minor must not use a parent&apos;s or another person&apos;s payment method without authorization.</p>

        <p>Payment details must be provided by a person legally authorized to use the payment method and enter the relevant transaction.</p>

        <h3>12.3 Seven-day Premium trial</h3>

        <p>Eligible users may be offered a seven-day Premium free trial when activating a Monthly or Yearly subscription.</p>

        <p>The user selects a plan before the trial begins.</p>

        <p>Unless the subscription is canceled before the trial ends, the selected paid subscription starts automatically and the payment method is charged.</p>

        <p>The applicable amount and first scheduled billing date must be clearly displayed before the trial is confirmed.</p>

        <h3>12.4 Cancellation during the trial</h3>

        <p>If the trial is canceled before the first scheduled charge, no subscription payment is collected for that trial.</p>

        <h3>12.5 Automatic renewal</h3>

        <p>Paid Monthly and Yearly subscriptions renew automatically until canceled.</p>

        <p>Any required authorization, payment disclosure, and consumer protection safeguards apply.</p>

        <h3>12.6 Refund rights</h3>

        <p>Eligible initial paid Premium purchases may qualify for Hockey Beats&apos; voluntary seven-day refund guarantee.</p>

        <p>Statutory consumer rights, including applicable withdrawal and digital service remedies, remain unaffected.</p>

        <p>Further information is available in the Subscription, Cancellation &amp; Refund Policy.</p>

        <h2>13. Promotional Premium Access</h2>

        <p>Hockey Beats may offer complimentary Premium access through promotional codes.</p>

        <p>Such offers may include:</p>

        <ul>
          <li>One month of complimentary Premium.</li>
          <li>Three months of complimentary Premium.</li>
        </ul>

        <p>These complimentary codes do <strong>not</strong> automatically convert into paid subscriptions.</p>

        <p>No recurring payment authorization arises solely from redeeming a complimentary promotional code.</p>

        <p>At the end of the complimentary period, the account returns to the Free Plan unless a separate paid subscription has been expressly purchased.</p>

        <h2>14. Physical Safety and Parental Supervision</h2>

        <p>Hockey Beats involves physical movement and may involve hockey sticks, balls, cameras, and other equipment.</p>

        <p>Parents and guardians should help younger players:</p>

        <ul>
          <li>Choose a safe and sufficiently spacious playing area.</li>
          <li>Remove obstacles and fragile objects.</li>
          <li>Keep other people and animals away from the active playing area.</li>
          <li>Position cameras and phones securely.</li>
          <li>Use suitable equipment and footwear.</li>
          <li>Take breaks when needed.</li>
          <li>Stop playing if pain, dizziness, or discomfort occurs.</li>
          <li>Follow appropriate coaching and safety instructions.</li>
        </ul>

        <p>Hockey Beats is not a substitute for qualified coaching, medical advice, or appropriate adult supervision.</p>

        <p>Nothing in this Notice limits liability where exclusion is prohibited by law.</p>

        <h2>15. Cookies and Local Storage</h2>

        <p>Hockey Beats uses browser storage for account functionality, preferences, gameplay information, camera calibration, and Remote Phone Camera sessions.</p>

        <p>Examples include:</p>

        <ul>
          <li><code>hb_username</code></li>
          <li><code>sportqo_engagement</code></li>
          <li><code>sportqo_user_settings</code></li>
          <li><code>sportqo_music_history</code></li>
          <li><code>hb_friends</code></li>
          <li><code>ballTracker_calibration</code></li>
          <li><code>hb_remote_session</code></li>
        </ul>

        <p>Where optional storage requires consent, we will obtain the necessary consent before using it.</p>

        <p>Where the user is a child and parental authorization is legally required, the relevant requirements apply.</p>

        <p>More information is provided in our Cookie &amp; Local Storage Policy.</p>

        <h2>16. Analytics and Retention</h2>

        <p>Hockey Beats uses Vercel Analytics and an internal visit-tracking system.</p>

        <p>The internal system records page paths, usernames where available, and timestamps.</p>

        <p>These records are personal data where they can be linked to an identifiable user.</p>

        <p>Internal <code>page_views</code> records are automatically deleted after <strong>90 days</strong>.</p>

        <p>Scores, achievements, and account progression are generally retained while the account exists, subject to deletion requests and lawful retention requirements.</p>

        <p>Raw camera frames are not retained by Hockey Beats as part of the current ball-tracking functionality.</p>

        <p>Other authentication records, security logs, and backups may follow separate lawful retention schedules.</p>

        <h2>17. Data Sharing</h2>

        <p>Hockey Beats may use service providers such as:</p>

        <ul>
          <li>Supabase for authentication and database functionality.</li>
          <li>Vercel for hosting and analytics.</li>
          <li>Google for optional authentication.</li>
          <li>Apple for optional authentication and music integration.</li>
          <li>Spotify where its integration is legally permitted.</li>
          <li>Payment processors when paid checkout is implemented.</li>
        </ul>

        <p>Personal data may be shared with these providers where necessary and lawful.</p>

        <p>Third-party services may act as processors or independent controllers depending on the circumstances.</p>

        <p>We do not sell children&apos;s personal data to advertisers.</p>

        <h2>18. Account Deletion and Parental Requests</h2>

        <p>Users can initiate account deletion through:</p>

        <p><strong>Settings → Delete my account and all data</strong></p>

        <p>The current deletion process removes associated records from the <code>user_data</code>, <code>scores</code>, and <code>page_views</code> tables.</p>

        <p>Authentication records, backups, other linked information, and legally required retention must be handled according to the applicable technical configuration and law.</p>

        <p>Parents and legal guardians may contact us regarding a child&apos;s account or personal data.</p>

        <p>We may request reasonable information to verify identity, parental responsibility, and authority to make a request.</p>

        <p>We will not disclose a child&apos;s account information to an unverified person merely because they claim to be the child&apos;s parent or guardian.</p>

        <p>Requests can be sent to:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <h2>19. Children&apos;s Data Protection Rights</h2>

        <p>Children have data protection rights under applicable law.</p>

        <p>Depending on the circumstances, these may include:</p>

        <ul>
          <li>Access to personal data.</li>
          <li>Correction of inaccurate information.</li>
          <li>Erasure.</li>
          <li>Restriction of processing.</li>
          <li>Data portability.</li>
          <li>Objection to certain processing.</li>
          <li>Withdrawal of consent.</li>
          <li>Protection against certain solely automated decisions.</li>
        </ul>

        <p>A parent or legal guardian may be able to exercise rights on behalf of a child where permitted by applicable law.</p>

        <p>The child&apos;s own rights, maturity, interests, and applicable legal requirements must also be respected.</p>

        <p>We may require appropriate verification before fulfilling a request.</p>

        <h2>20. International Users</h2>

        <p>Hockey Beats is operated from Slovakia and may be accessible in other countries.</p>

        <p>Different jurisdictions may establish different rules concerning:</p>

        <ul>
          <li>The age at which a child can consent to data processing.</li>
          <li>Parental authorization.</li>
          <li>Children&apos;s online privacy.</li>
          <li>Consumer contracts.</li>
          <li>Subscription purchases.</li>
          <li>Payment authorization.</li>
        </ul>

        <p>We will apply relevant mandatory requirements where they govern our activities.</p>

        <p>Access to Hockey Beats does not guarantee that every feature is available or legally suitable for every age group in every jurisdiction.</p>

        <p>Where a particular market requires additional safeguards, age restrictions, or parental authorization procedures, those requirements must be addressed before offering the relevant functionality there.</p>

        <h2>21. Complaints and Data Protection Authority</h2>

        <p>Parents, guardians, and users may contact us with privacy concerns at:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Where GDPR applies, individuals may also lodge a complaint with a competent supervisory authority.</p>

        <p>In Slovakia, the relevant authority is:</p>

        <p><strong>Úrad na ochranu osobných údajov Slovenskej republiky</strong><br />
        (Personal Data Protection Office of the Slovak Republic)</p>

        <p>The right to complain to another competent EU supervisory authority remains unaffected.</p>

        <h2>22. Changes to This Notice</h2>

        <p>We may update this Notice to reflect changes in:</p>

        <ul>
          <li>Hockey Beats functionality.</li>
          <li>Age-related safeguards.</li>
          <li>Account registration.</li>
          <li>Parental authorization procedures.</li>
          <li>Payment functionality.</li>
          <li>Data processing practices.</li>
          <li>Applicable law.</li>
        </ul>

        <p>The updated version and effective date will be published on our website.</p>

        <p>Where applicable law requires additional notice or consent, we will provide it before the relevant processing begins.</p>

        <h2>23. Contact Information</h2>

        <p>For questions about children&apos;s privacy, parental authorization, account deletion, purchases by minors, or this Notice, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT Identification Number:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Parental Consent &amp; Children&apos;s Privacy Notice — Version 1.0</strong></p>
      </main>
    </div>
  );
}
