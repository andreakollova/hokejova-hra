import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-6 sm:px-10 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/images/hb-logo-hero-dark.png" alt="Hockey Beats" width={160} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 sm:px-10 py-12 prose prose-gray prose-sm max-w-none">
        <h1>HOCKEY BEATS</h1>
        <h1>Terms of Service</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.1<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction and Service Provider</h2>

        <p>Welcome to Hockey Beats, an interactive hockey training and entertainment platform combining physical hockey skills, camera-based ball tracking, games, challenges, and optional music playback.</p>

        <p>Hockey Beats (&quot;Hockey Beats&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is operated by:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number (IČO):</strong> 53874871<br />
        <strong>Tax Identification Number (DIČ):</strong> 2121518399<br />
        <strong>VAT Identification Number:</strong> SK2121518399<br />
        <strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <p>These Terms of Service (&quot;Terms&quot;) govern access to and use of the Hockey Beats website, games, accounts, training activities, camera-based functionality, music integrations, free services, paid subscriptions, promotional offers, and related services (collectively, the &quot;Service&quot;).</p>

        <p>By creating an account or using the Service, you agree to comply with these Terms.</p>

        <p>Nothing in these Terms excludes, restricts, or overrides mandatory consumer rights, data protection rights, or other protections that cannot lawfully be waived.</p>

        <h2>2. Description of the Service</h2>

        <p>Hockey Beats is a browser-based platform designed to make hockey training engaging through interactive games and challenges.</p>

        <p>Depending on availability, the Service may include:</p>

        <ul>
          <li>Hockey skill games and training challenges.</li>
          <li>Camera-based ball tracking.</li>
          <li>Remote Phone Camera functionality.</li>
          <li>User accounts and customizable profiles.</li>
          <li>Experience points (XP), levels, streaks, and achievements.</li>
          <li>Scores and leaderboards.</li>
          <li>Friends and social features.</li>
          <li>Optional third-party music integrations.</li>
          <li>Free and Premium access.</li>
          <li>Promotional access, club discounts, and group licenses.</li>
        </ul>

        <p>Hockey Beats is intended for recreational, educational, and training purposes. It does not replace professional coaching, medical advice, or appropriate adult supervision.</p>

        <p>We may improve, update, or expand the Service over time, subject to our contractual obligations and applicable law.</p>

        <h2>3. Eligibility and Age Requirements</h2>

        <h3>3.1 Minimum age</h3>

        <p>Hockey Beats is intended for users aged <strong>13 years and older</strong>.</p>

        <p>Users under 13 are not permitted to create an account or use the Service.</p>

        <h3>3.2 Users aged 13–15</h3>

        <p>Users aged 13 to 15 must have permission from a parent or legal guardian to use Hockey Beats.</p>

        <p>Where applicable data protection law requires parental consent for particular processing activities, that consent must be obtained through an appropriate process before those activities take place.</p>

        <p>Under Slovak law, the age at which a child may independently consent to processing based on Article 8 of the GDPR in connection with information society services is 16.</p>

        <p>A checkbox selected solely by a child does not automatically constitute verified parental consent.</p>

        <h3>3.3 Users aged 16–17</h3>

        <p>Users aged 16 or 17 may use the Service subject to applicable law. Parental or guardian authorization may still be required for purchases or other legally significant transactions.</p>

        <h3>3.4 Parental supervision</h3>

        <p>Parents and legal guardians are encouraged to supervise younger players, review these Terms and the Privacy Policy, and ensure that the playing environment is safe.</p>

        <p>Third-party services may impose additional age requirements.</p>

        <h2>4. Registration, Authentication, and Account Security</h2>

        <h3>4.1 Registration methods</h3>

        <p>Hockey Beats supports:</p>

        <ul>
          <li>Email address and password.</li>
          <li>Sign in with Google.</li>
          <li>Sign in with Apple.</li>
        </ul>

        <p>Authentication is supported by Supabase Auth.</p>

        <h3>4.2 Email verification</h3>

        <p>Users registering with an email address and password must verify their email address by clicking the verification link sent to that address before their first successful sign-in.</p>

        <h3>4.3 Google and Apple sign-in</h3>

        <p>Users who authenticate through Google or Apple authorize the relevant provider to share the information necessary to establish or authenticate their Hockey Beats account, subject to the provider&apos;s settings and policies.</p>

        <p>Apple may provide a private relay email address.</p>

        <h3>4.4 Account responsibilities</h3>

        <p>Users must provide accurate information, protect their credentials, and refrain from sharing access with unauthorized persons.</p>

        <p>Users must not impersonate others, create fraudulent accounts, or attempt unauthorized access.</p>

        <p>Suspected unauthorized account activity should be reported to <a href="mailto:studio@drixton.com">studio@drixton.com</a>.</p>

        <p>We may apply proportionate security measures to protect accounts and the Service.</p>

        <h2>5. Free Plan</h2>

        <p>Hockey Beats offers a permanent Free plan with no subscription fee.</p>

        <p>Free users can access:</p>

        <ul>
          <li>The core Hockey Beats Slalom game without a Premium time limit.</li>
          <li>A one-time, 10-minute complimentary allowance for each Premium game.</li>
          <li>Camera-based ball tracking.</li>
          <li>Remote Phone Camera.</li>
          <li>Supported music integrations, subject to third-party requirements.</li>
          <li>XP, levels, streaks, and achievements.</li>
          <li>Leaderboards and available social features.</li>
        </ul>

        <p>The Free plan does not automatically become a paid subscription.</p>

        <h2>6. Ten-Minute Access to Premium Games</h2>

        <p>Each registered Free user receives <strong>10 minutes of complimentary access to each Premium game, once per account per game</strong>.</p>

        <p>The allowance:</p>

        <ul>
          <li>Applies separately to each eligible Premium game.</li>
          <li>Is cumulative across sessions.</li>
          <li>Does not reset daily.</li>
          <li>Does not reset when a game is restarted.</li>
          <li>Does not reset when switching devices.</li>
          <li>Is not replenished by signing in again.</li>
        </ul>

        <p>After the allowance for a particular game has been exhausted, continued access requires an active Premium entitlement or another valid access right.</p>

        <p>We may take reasonable measures to prevent fraudulent circumvention of these limits.</p>

        <h2>7. Premium Plans and Pricing</h2>

        <p>When paid subscriptions are available, Hockey Beats offers:</p>

        <p><strong>Premium Monthly:</strong> €8.45 per month, including applicable VAT.</p>

        <p><strong>Premium Yearly:</strong> €79.99 per year, including applicable VAT.</p>

        <p>The annual plan is equivalent to approximately €6.67 per month when averaged over 12 months.</p>

        <p>Premium provides access to all current and newly released Premium games during the applicable entitlement period, without the Free plan&apos;s 10-minute gameplay restrictions.</p>

        <p>Premium may also include additional features expressly identified as Premium in the relevant offer.</p>

        <p><strong>Remote Phone Camera is available to both Free and Premium users at no additional charge.</strong></p>

        <p>Premium does not include Apple Music, Spotify Premium, or other third-party subscriptions.</p>

        <p>All charges, taxes, billing periods, and material subscription conditions will be disclosed before purchase.</p>

        <h2>8. Seven-Day Premium Free Trial</h2>

        <h3>8.1 Trial availability</h3>

        <p>Hockey Beats offers an introductory <strong>seven-day Premium free trial</strong> when an eligible user activates a Monthly or Yearly Premium subscription through the applicable subscription checkout.</p>

        <p>The trial provides access to Premium games and features during the trial period.</p>

        <p>Eligibility for an introductory trial may be limited to users who have not previously received the same introductory offer. Any additional material eligibility conditions will be disclosed before activation.</p>

        <h3>8.2 Payment authorization</h3>

        <p>To activate the trial, the user selects either the Monthly or Yearly plan and provides a valid payment method.</p>

        <p>Before confirming the subscription, the checkout will clearly disclose:</p>

        <ul>
          <li>The seven-day free-trial period.</li>
          <li>The selected plan.</li>
          <li>The amount payable after the trial.</li>
          <li>The date of the first scheduled payment.</li>
          <li>The recurring billing interval.</li>
          <li>The automatic renewal arrangement.</li>
          <li>How to cancel before being charged.</li>
        </ul>

        <p>The user must expressly authorize the subscription and its recurring payment terms.</p>

        <h3>8.3 Automatic conversion</h3>

        <p>Unless canceled before the trial ends, the trial automatically converts into the selected paid subscription.</p>

        <p>The first scheduled charge will be:</p>

        <ul>
          <li><strong>€8.45</strong>, including applicable VAT, for Premium Monthly; or</li>
          <li><strong>€79.99</strong>, including applicable VAT, for Premium Yearly.</li>
        </ul>

        <p>Subsequent charges follow the selected billing cycle until cancellation.</p>

        <h3>8.4 Cancellation during the trial</h3>

        <p>Users may cancel their subscription at any time before the trial ends.</p>

        <p>If cancellation is completed before the first scheduled charge, no subscription payment will be collected for that trial.</p>

        <p>Cancellation stops the automatic conversion to a paid subscription.</p>

        <h3>8.5 Relationship to the Free plan</h3>

        <p>The seven-day Premium free trial is separate from the permanent Free plan and the one-time, 10-minute allowance available for each Premium game.</p>

        <p>Using the permanent Free plan does not itself activate a paid subscription or a trial with automatic billing.</p>

        <h3>8.6 Legal rights</h3>

        <p>Any statutory withdrawal rights or other mandatory consumer protections apply independently of the promotional trial conditions.</p>

        <h2>9. Subscription Renewal and Cancellation</h2>

        <h3>9.1 Automatic renewal</h3>

        <p>After the trial converts to a paid subscription, Monthly and Yearly subscriptions renew automatically unless canceled before the next renewal.</p>

        <h3>9.2 Cancellation</h3>

        <p>Users may cancel an active subscription through the available account or billing management process.</p>

        <p>Cancellation prevents future renewals.</p>

        <p>Unless a refund, statutory remedy, or different arrangement applies, Premium access continues until the end of the already-paid billing period.</p>

        <p>After the paid entitlement ends, the account returns to the Free plan.</p>

        <h3>9.3 Billing transparency</h3>

        <p>Before purchase, users will receive clear information about the subscription&apos;s recurring nature, total price, billing frequency, and cancellation conditions.</p>

        <p>Where legally required, the payment confirmation control will expressly indicate that placing the order creates a payment obligation.</p>

        <h2>10. Subscription Price Changes</h2>

        <p>Hockey Beats may change subscription prices from time to time.</p>

        <p><strong>An existing subscription price is not guaranteed for life.</strong></p>

        <p>However, a price change affecting an existing subscription will be handled in accordance with the applicable contract and mandatory consumer law.</p>

        <h3>10.1 Advance notice</h3>

        <p>We will provide at least <strong>30 days&apos; advance notice by email</strong> of a proposed increase affecting an existing subscription.</p>

        <p>The notice will explain the proposed new price, its intended effective date, and the user&apos;s available options.</p>

        <h3>10.2 Effective date</h3>

        <p>A price increase will not apply retroactively to a billing period already paid for.</p>

        <p>Where lawfully implemented, the new price will apply no earlier than the relevant renewal date following the required notice period.</p>

        <h3>10.3 Consent and cancellation</h3>

        <p>Where applicable law requires the user&apos;s express agreement to a price increase, we will obtain that agreement before charging the new amount.</p>

        <p>A user&apos;s silence will not be treated as express consent where express consent is legally required.</p>

        <p>Users may cancel their subscription before the proposed change takes effect.</p>

        <p>If a user does not accept a proposed change, the existing arrangement will be handled in accordance with applicable law and the relevant contractual rights. We will not unilaterally impose a higher charge without a valid legal basis.</p>

        <h3>10.4 Lifetime Pass</h3>

        <p>Changes to Monthly or Yearly subscription prices do not alter a valid Lifetime Pass entitlement.</p>

        <h2>11. Promotional Codes</h2>

        <p>Hockey Beats may issue promotional codes for complimentary or discounted access.</p>

        <h3>11.1 One-month complimentary Premium</h3>

        <p>An eligible code may provide one month of Premium access without charge.</p>

        <h3>11.2 Three-month complimentary Premium</h3>

        <p>An eligible code may provide three months of Premium access without charge.</p>

        <h3>11.3 No automatic paid conversion</h3>

        <p>Complimentary one-month and three-month promotional access <strong>does not automatically convert into a paid subscription</strong>.</p>

        <p>After the complimentary period expires, the account returns to the Free plan unless the user has separately and expressly purchased a paid subscription.</p>

        <p>Redeeming a complimentary access code does not authorize future charges.</p>

        <h3>11.4 Conditions</h3>

        <p>Promotional codes may be subject to disclosed eligibility requirements, expiration dates, redemption limits, and other material conditions.</p>

        <p>Fraudulent or invalid codes may be rejected, subject to applicable law.</p>

        <h2>12. Lifetime Pass</h2>

        <p>Hockey Beats may offer a Lifetime Pass as a promotional or purchased entitlement.</p>

        <p>A valid Lifetime Pass provides access to:</p>

        <ul>
          <li>All current Premium games.</li>
          <li>Future Premium games made available as part of Hockey Beats.</li>
          <li>Current Premium features.</li>
          <li>Future Premium features made available as part of Hockey Beats.</li>
        </ul>

        <p>The entitlement lasts for the <strong>operational lifetime of the Hockey Beats Service</strong>, not the lifetime of the individual user.</p>

        <p>A Lifetime Pass does not guarantee that the Service will operate indefinitely.</p>

        <p>If the Service is materially modified, discontinued, or becomes unavailable, Lifetime Pass holders retain any contractual and statutory rights or remedies applicable to their entitlement.</p>

        <p>Unless expressly stated otherwise, the Lifetime Pass does not include external music subscriptions, third-party purchases, or separately operated products.</p>

        <p>Any price, transferability restrictions, or material conditions will be disclosed before purchase or redemption.</p>

        <h2>13. Club Discounts and Group Licenses</h2>

        <p>Hockey Beats may provide special offers for sports clubs, teams, schools, and other organizations.</p>

        <h3>13.1 Individual club discounts</h3>

        <p>Eligible club members may receive discount codes for individual Premium subscriptions.</p>

        <p>The discount amount, duration, renewal price, and eligibility conditions will be disclosed before purchase.</p>

        <h3>13.2 Bulk licenses</h3>

        <p>Clubs and organizations may purchase multiple Premium entitlements under a group arrangement.</p>

        <p>The relevant offer or agreement will specify the number of licenses, price, duration, assignment rules, renewal conditions, and applicable discounts.</p>

        <p>A club&apos;s purchase of group licenses does not automatically authorize unrestricted access to members&apos; personal account data.</p>

        <p>Mandatory consumer rights remain unaffected where applicable.</p>

        <h2>14. Refunds and Statutory Consumer Rights</h2>

        <h3>14.1 Voluntary seven-day refund guarantee</h3>

        <p>Hockey Beats offers a voluntary <strong>seven-day full-refund guarantee</strong> for an eligible initial paid Premium subscription purchase.</p>

        <p>The guarantee begins on the date the first subscription payment is successfully collected, not on the date the free trial begins.</p>

        <p>Users may request a refund by contacting <a href="mailto:studio@drixton.com">studio@drixton.com</a> or through an available billing support process.</p>

        <p>This guarantee is separate from the seven-day Premium free trial.</p>

        <h3>14.2 After the guarantee period</h3>

        <p>After the voluntary guarantee period expires, refunds remain available wherever required by applicable law or expressly provided under another applicable offer.</p>

        <h3>14.3 Statutory rights</h3>

        <p>Nothing in these Terms limits statutory withdrawal rights, rights relating to non-conforming digital content or services, or other mandatory consumer remedies.</p>

        <p>The availability of a statutory withdrawal right depends on the applicable legal requirements, including the type of service, the start of performance, and any legally valid consent or acknowledgment.</p>

        <p>Acceptance of these Terms alone does not constitute a waiver of statutory withdrawal rights.</p>

        <p>Where separate consent, an express request for immediate performance, or a specific acknowledgment is legally required, it must be obtained through the appropriate process.</p>

        <p>Further details are provided in the Subscription, Cancellation &amp; Refund Policy.</p>

        <h2>15. Payment Processing</h2>

        <p>Paid subscriptions may be processed through an external payment provider, including Stripe when implemented.</p>

        <p>The applicable payment provider, accepted payment methods, and relevant terms will be identified during checkout.</p>

        <p>Hockey Beats will not charge a user without the authorization required by applicable law.</p>

        <p>Users are responsible for keeping their payment information current and must not use payment methods without authorization.</p>

        <p>Any payment failures, retries, suspension of paid access, or other billing consequences will be handled in accordance with the disclosed subscription terms and applicable law.</p>

        <h2>16. Camera-Based Tracking</h2>

        <p>Hockey Beats uses camera-based tracking to support interactive gameplay.</p>

        <p>Under the current implementation, camera frames are processed locally in the user&apos;s browser.</p>

        <p>Raw camera images and video are not uploaded to or stored on Hockey Beats servers as part of this functionality.</p>

        <p>Individual frames are processed in real time and discarded.</p>

        <p>Camera access requires permission through the user&apos;s browser or device.</p>

        <p>If permission is denied or the camera is unavailable, camera-dependent features may not work.</p>

        <h2>17. Remote Phone Camera</h2>

        <p>Remote Phone Camera is available to <strong>both Free and Premium users without an additional subscription charge</strong>.</p>

        <p>When this functionality is used, the remote device transmits numerical tracking coordinates, such as X and Y positions, rather than a raw camera video stream to Hockey Beats servers.</p>

        <p>A session identifier may be used to establish and maintain the connection.</p>

        <p>Users must use this feature responsibly and respect the privacy of other individuals.</p>

        <p>Additional technical and data protection information is provided in the Privacy Policy.</p>

        <h2>18. Music Integrations</h2>

        <h3>18.1 Apple Music</h3>

        <p>Hockey Beats supports Apple Music integration through MusicKit.</p>

        <p>Users must maintain any Apple account, subscription, authorization, and compatible device required by Apple.</p>

        <p>Apple Music remains subject to Apple&apos;s own terms and policies.</p>

        <h3>18.2 Spotify</h3>

        <p>Spotify integration may be made publicly available only where permitted under Spotify&apos;s applicable developer policies, licensing arrangements, and any required approvals.</p>

        <p>Technical integration does not itself establish permission to use Spotify within an interactive game.</p>

        <p>We do not guarantee public Spotify functionality until the relevant requirements have been satisfied.</p>

        <h3>18.3 Music subscription costs</h3>

        <p>Hockey Beats does not provide or pay for third-party music subscriptions.</p>

        <p>Premium access does not include Apple Music or Spotify Premium.</p>

        <h3>18.4 Gameplay timing</h3>

        <p>Users select gameplay BPM manually.</p>

        <p>Under the current design, Hockey Beats does not analyze music audio to generate gameplay timing or automatically synchronize gameplay events to detected song beats.</p>

        <p>This does not remove applicable third-party music licensing obligations.</p>

        <h3>18.5 Availability</h3>

        <p>Music features may vary by region, subscription status, provider requirements, device compatibility, and licensing restrictions.</p>

        <p>Integrations may be restricted where necessary for legal or contractual compliance, subject to applicable consumer rights.</p>

        <h2>19. Scores, Leaderboards, and Social Features</h2>

        <p>Hockey Beats may store and display usernames, scores, achievements, levels, and other gameplay information in leaderboards and social features.</p>

        <p>Users must not:</p>

        <ul>
          <li>Manipulate scores or rankings.</li>
          <li>Use bots or unauthorized automation to obtain unfair advantages.</li>
          <li>Exploit technical vulnerabilities.</li>
          <li>Harass, threaten, or impersonate other users.</li>
          <li>Publish unlawful, abusive, or discriminatory content.</li>
          <li>Disclose another person&apos;s private information without authorization.</li>
        </ul>

        <p>We may take proportionate measures to protect fair gameplay and other users, including removing manipulated scores or restricting accounts.</p>

        <p>Where legally required, users will receive appropriate information about moderation decisions and available remedies.</p>

        <h2>20. Physical Safety and Responsible Gameplay</h2>

        <p>Hockey Beats involves physical movement and may require hockey sticks, balls, phones, cameras, and other equipment.</p>

        <p>Users should:</p>

        <ul>
          <li>Play in a suitable, sufficiently spacious environment.</li>
          <li>Remove obstacles, fragile objects, and trip hazards.</li>
          <li>Keep other people and animals away from the active playing area.</li>
          <li>Secure phones, cameras, and other devices.</li>
          <li>Use appropriate equipment and footwear.</li>
          <li>Avoid excessive exertion and unsafe movements.</li>
          <li>Stop immediately if they experience pain, dizziness, or discomfort.</li>
          <li>Ensure appropriate adult supervision for younger players.</li>
        </ul>

        <p>Users should assess their physical ability and circumstances before participating.</p>

        <p>Hockey Beats is not a medical service and does not provide diagnosis, treatment, or individualized medical advice.</p>

        <p>Nothing in these Terms excludes liability for injury or other harm where exclusion is prohibited by law.</p>

        <h2>21. Intellectual Property</h2>

        <p>The Hockey Beats name, original game design, software, branding, interface, graphics, and other protected materials belong to DRIXTON s. r. o. or their respective licensors.</p>

        <p>Users receive a limited, personal, non-exclusive, non-transferable permission to use the Service for its intended purposes, subject to these Terms.</p>

        <p>Except where permitted by applicable law or express authorization, users must not:</p>

        <ul>
          <li>Copy or redistribute protected elements of the Service.</li>
          <li>Resell or sublicense access.</li>
          <li>Remove ownership notices.</li>
          <li>Use Hockey Beats trademarks without authorization.</li>
          <li>Reverse-engineer protected software in violation of applicable law.</li>
          <li>Misrepresent an affiliation with Hockey Beats.</li>
        </ul>

        <p>Third-party intellectual property remains the property of its respective owners.</p>

        <p>Mandatory statutory exceptions and user rights remain unaffected.</p>

        <h2>22. Acceptable Use</h2>

        <p>Users must not use the Service for unlawful, fraudulent, abusive, or unauthorized purposes.</p>

        <p>Prohibited activities include:</p>

        <ul>
          <li>Unauthorized access to accounts or systems.</li>
          <li>Circumvention of subscription or gameplay restrictions.</li>
          <li>Fraudulent promotional-code use.</li>
          <li>Distribution of malware.</li>
          <li>Interference with Service availability.</li>
          <li>Unauthorized commercial resale.</li>
          <li>Infringement of intellectual property or privacy rights.</li>
          <li>Harassment or harmful conduct toward other users.</li>
        </ul>

        <p>We may investigate credible reports of misuse and take reasonable, proportionate protective measures.</p>

        <h2>23. Account Suspension and Termination</h2>

        <p>We may restrict or suspend access where reasonably necessary to address serious violations, fraud, security threats, legal obligations, or substantial risks to the Service or other users.</p>

        <p>Where appropriate, we will provide notice and an opportunity to resolve the issue.</p>

        <p>Users may stop using Hockey Beats at any time.</p>

        <p>Suspension or termination does not remove statutory consumer rights or remedies for failures for which we are legally responsible.</p>

        <h2>24. Account Deletion and Personal Data</h2>

        <p>Users may initiate account deletion through:</p>

        <p><strong>Settings → Delete my account and all data</strong></p>

        <p>The process includes a double-confirmation step.</p>

        <p>Under the current implementation, account deletion removes associated records from the <code>user_data</code>, <code>scores</code>, and <code>page_views</code> tables.</p>

        <p>Authentication records, backups, third-party records, and legally required retention must also be handled in accordance with applicable law and the Privacy Policy.</p>

        <p>Users may contact <a href="mailto:studio@drixton.com">studio@drixton.com</a> regarding deletion or other privacy requests.</p>

        <p>Users can disconnect supported music services through Settings. Under the current implementation, disconnecting a music service removes stored music history.</p>

        <p>Account deletion does not necessarily cancel a separately managed payment agreement unless the applicable billing process expressly provides for cancellation. Users will be informed of the necessary steps.</p>

        <h2>25. Privacy and Data Protection</h2>

        <p>Hockey Beats processes personal data in accordance with applicable data protection law, including the GDPR where applicable.</p>

        <p>Our Privacy Policy describes:</p>

        <ul>
          <li>Account and authentication data.</li>
          <li>Gameplay and profile information.</li>
          <li>Camera tracking.</li>
          <li>Remote Phone Camera data.</li>
          <li>Cookies and local storage.</li>
          <li>Analytics and visit tracking.</li>
          <li>Data retention.</li>
          <li>Account deletion.</li>
          <li>Data sharing with service providers.</li>
          <li>User rights and privacy contacts.</li>
        </ul>

        <p>The Privacy Policy is available at:</p>

        <p><strong><a href="https://hockeybeats.app/privacy">https://hockeybeats.app/privacy</a></strong></p>

        <p>Acceptance of these Terms does not replace any separate consent required by applicable law.</p>

        <h2>26. Updates, Modifications, and Service Availability</h2>

        <p>We may provide technical updates, security improvements, bug fixes, and new features.</p>

        <p>We may modify the Service where justified by legitimate reasons, including security, technical compatibility, legal compliance, or product improvement.</p>

        <p>Changes affecting paid digital services will be handled in accordance with applicable law, including any required advance notice, consent, termination rights, or remedies.</p>

        <p>We will provide updates necessary to maintain conformity for the period required by applicable law.</p>

        <p>Temporary interruptions may occur due to maintenance, technical incidents, or circumstances beyond our reasonable control.</p>

        <p>This provision does not exclude responsibility for failures for which we are legally liable.</p>

        <h2>27. Third-Party Services</h2>

        <p>Hockey Beats uses or may integrate with third-party services, including:</p>

        <ul>
          <li>Vercel for hosting and related infrastructure.</li>
          <li>Supabase for database and authentication.</li>
          <li>Google for optional authentication.</li>
          <li>Apple for optional authentication and Apple Music.</li>
          <li>Spotify, if and when its integration is permitted for public use.</li>
          <li>Payment processors, including Stripe when implemented.</li>
        </ul>

        <p>Third-party services may have separate terms and privacy policies.</p>

        <p>Our involvement of third-party providers does not exclude responsibility imposed on us by applicable law.</p>

        <h2>28. Liability</h2>

        <p>Hockey Beats is provided with reasonable care and skill and in accordance with applicable contractual and statutory obligations.</p>

        <p>To the extent permitted by law, we are not responsible for losses caused solely by unlawful user conduct, misuse of equipment, or circumstances for which we are not legally responsible.</p>

        <p>Nothing in these Terms excludes or limits liability for:</p>

        <ul>
          <li>Death or personal injury where limitation is prohibited.</li>
          <li>Fraud or intentional misconduct.</li>
          <li>Mandatory consumer protection obligations.</li>
          <li>Statutory digital content and digital service remedies.</li>
          <li>Any other liability that cannot lawfully be excluded.</li>
        </ul>

        <p>Any permitted limitation will be interpreted consistently with applicable mandatory law.</p>

        <h2>29. Complaints and Dispute Resolution</h2>

        <p>For support, complaints, or contractual questions, contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Please provide sufficient information to help us investigate and respond.</p>

        <p>We will handle complaints fairly and within applicable legal deadlines.</p>

        <p>Consumers may have access to statutory alternative dispute resolution mechanisms, consumer protection authorities, and competent courts.</p>

        <p>In Slovakia, information about alternative dispute resolution is available through the Slovak Trade Inspection and other authorized entities, as applicable.</p>

        <p>EU consumers may also seek assistance from the European Consumer Centres Network.</p>

        <p>Nothing in these Terms prevents a consumer from exercising legally available dispute resolution rights.</p>

        <h2>30. Governing Law and Jurisdiction</h2>

        <p>These Terms are governed by the laws of the Slovak Republic, subject to mandatory consumer protection and conflict-of-law rules.</p>

        <p>If a consumer is habitually resident in another country, this choice of law does not deprive that consumer of mandatory protections applicable under relevant law.</p>

        <p>Disputes are subject to applicable jurisdiction rules, including mandatory consumer jurisdiction provisions.</p>

        <p>Nothing in these Terms requires a consumer to bring proceedings exclusively before a Slovak court where applicable law provides otherwise.</p>

        <h2>31. Changes to These Terms</h2>

        <p>We may update these Terms to reflect changes in the Service, legal requirements, security practices, or business operations.</p>

        <p>The current version and effective date will be published on our website.</p>

        <p>Where a change materially affects existing contractual rights or obligations, we will provide the notice, consent mechanism, or termination rights required by applicable law.</p>

        <p>Changes will not retroactively remove accrued rights or mandatory statutory remedies.</p>

        <p>Continued use will not be treated as valid consent where express agreement is legally required.</p>

        <h2>32. Severability</h2>

        <p>If any provision of these Terms is found invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.</p>

        <p>No invalid provision will be interpreted or replaced in a manner that deprives consumers of mandatory legal protections.</p>

        <h2>33. Contact</h2>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company ID:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399<br />
        <strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Terms of Service — Version 1.1</strong></p>
      </main>
    </div>
  );
}
