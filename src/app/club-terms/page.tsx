import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Club & Organization Licensing Terms',
};

export default function ClubTermsPage() {
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
        <h1>Club &amp; Organization Licensing Terms</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.1<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>These Club &amp; Organization Licensing Terms (&quot;Club Terms&quot;) govern the purchase, activation, management, renewal, and use of Hockey Beats Club Premium subscriptions.</p>

        <p>Hockey Beats is an interactive hockey training and entertainment platform combining real-world hockey skills, rhythm-based gameplay, camera-based ball tracking, and player progression.</p>

        <p>The Club Premium program is designed to allow hockey clubs, sports academies, schools, and other eligible organizations to purchase Premium access for multiple players under a single organizational subscription.</p>

        <p>Each participating player maintains an individual Hockey Beats account and activates their Premium access using a unique club activation code.</p>

        <p>These Club Terms apply to Club Premium subscriptions once the relevant purchasing and activation functionality is made available.</p>

        <p>They supplement our Terms of Service, Privacy Policy, Subscription, Cancellation &amp; Refund Policy, Fair Play &amp; Leaderboard Rules, and Safety &amp; Physical Activity Guidelines.</p>

        <p>Where an individually negotiated written agreement expressly differs from these Club Terms, the individual agreement takes precedence to the extent permitted by applicable law.</p>

        <h2>2. Service Provider</h2>

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

        <h2>3. Eligibility</h2>

        <p>Club Premium subscriptions may be purchased by eligible organizations, including:</p>

        <ul>
          <li>Field hockey clubs.</li>
          <li>Ice hockey clubs.</li>
          <li>Sports academies.</li>
          <li>Schools and educational institutions.</li>
          <li>Training centers.</li>
          <li>Sports associations.</li>
          <li>Other approved organizations.</li>
        </ul>

        <p>The person purchasing a Club Premium subscription on behalf of an organization must have the authority to enter into the agreement and authorize the relevant payments.</p>

        <p>Hockey Beats may request reasonable information to verify organizational eligibility or prevent misuse.</p>

        <h2>4. Club Premium Subscription Model</h2>

        <p>Club Premium is a recurring monthly subscription purchased and paid for by an organization.</p>

        <p>Each subscription includes a defined number of Premium player licenses.</p>

        <p>For example, a Club 20 subscription includes 20 player licenses.</p>

        <p>The organization receives access to the corresponding number of unique activation codes.</p>

        <p>Each code may be redeemed by one eligible Hockey Beats account.</p>

        <p>Once successfully redeemed, the account receives Premium access for as long as the corresponding club license remains active.</p>

        <p>Players using club-funded licenses do not need to purchase a separate individual Premium subscription to access the included Premium games.</p>

        <p>A Club Premium license does not provide a separate subscription to any third-party music service.</p>

        <h2>5. Club Premium Packages and Pricing</h2>

        <p>The following standard monthly packages are offered under the Club Premium pricing model.</p>

        <p>Prices are stated in euros and include applicable VAT at the rate reflected in the published price.</p>

        <table>
          <thead><tr><th>Package</th><th>Player Licenses</th><th>Discount</th><th>Monthly Price</th></tr></thead>
          <tbody>
            <tr><td>Club 5</td><td>5</td><td>10%</td><td>€38.03</td></tr>
            <tr><td>Club 10</td><td>10</td><td>15%</td><td>€71.83</td></tr>
            <tr><td>Club 15</td><td>15</td><td>20%</td><td>€101.40</td></tr>
            <tr><td>Club 20</td><td>20</td><td>25%</td><td>€126.75</td></tr>
            <tr><td>Club 25</td><td>25</td><td>30%</td><td>€147.88</td></tr>
            <tr><td>Club 30</td><td>30</td><td>35%</td><td>€164.78</td></tr>
            <tr><td>Club 35</td><td>35</td><td>40%</td><td>€177.45</td></tr>
            <tr><td>Club 40</td><td>40</td><td>45%</td><td>€185.90</td></tr>
            <tr><td>Club 45</td><td>45</td><td>48%</td><td>€197.73</td></tr>
            <tr><td>Club 50</td><td>50</td><td>55%</td><td>€190.13</td></tr>
            <tr><td>Club 50+</td><td>More than 50</td><td>Custom</td><td>Individual quotation</td></tr>
          </tbody>
        </table>

        <p>Discounts are calculated against the standard individual Premium Monthly reference price of €8.45 per player per month.</p>

        <p>Displayed package prices are rounded to two decimal places.</p>

        <p>The applicable package price, taxes, billing frequency, and renewal conditions will be confirmed before the organization authorizes payment.</p>

        <p>For Club 50+, pricing, license quantity, and other commercial conditions will be specified in an individual quotation or written agreement.</p>

        <p>Hockey Beats may introduce new packages or promotional offers. Any changes affecting an existing subscription remain subject to the applicable contractual and legal requirements.</p>

        <h2>6. Monthly Billing Through Stripe</h2>

        <p>Club Premium subscriptions are intended to be billed monthly through Stripe once Stripe Checkout is enabled for the Service.</p>

        <p>By completing checkout, the authorized organizational purchaser agrees to the disclosed recurring payment terms.</p>

        <p>The organization authorizes payment of the applicable subscription fee for each billing period until the subscription is canceled or otherwise terminated.</p>

        <p>Stripe may process payment information in accordance with its own terms and privacy documentation.</p>

        <p>Hockey Beats does not require individual players to enter payment card information when redeeming an active club-funded license.</p>

        <p>Payment processing is subject to the availability of the relevant checkout functionality.</p>

        <h2>7. Initial Subscription Activation</h2>

        <p>After the organization successfully completes its first subscription payment, Hockey Beats will activate the purchased number of player licenses.</p>

        <p>The activation process is intended to:</p>

        <ol>
          <li>Confirm the successful payment.</li>
          <li>Create or activate the organization&apos;s Club Premium subscription.</li>
          <li>Allocate the purchased number of license slots.</li>
          <li>Generate unique activation codes for available slots.</li>
          <li>Make the codes available to the authorized organizational purchaser through the supported delivery method.</li>
        </ol>

        <p>Activation codes will not be treated as active solely because a checkout page was opened or a payment was attempted.</p>

        <p>Access is subject to successful payment confirmation and completion of the relevant activation process.</p>

        <h2>8. Club Activation Codes</h2>

        <p>Each Club Premium activation code is unique and intended for one player account.</p>

        <p>An activation code:</p>

        <ul>
          <li>May be redeemed once.</li>
          <li>Activates one available club-funded Premium license.</li>
          <li>Is associated with the relevant organization.</li>
          <li>Does not require a separate individual subscription payment.</li>
          <li>Must not be sold or distributed outside the authorized organization.</li>
          <li>Remains subject to the active status of the underlying club subscription.</li>
        </ul>

        <p>The organization is responsible for distributing codes only to eligible participants.</p>

        <p>Hockey Beats may invalidate unused codes where reasonably necessary to address fraud, security risks, or unauthorized distribution.</p>

        <p>A code that has already been redeemed cannot be reused to activate a second account.</p>

        <h2>9. Player Registration and Code Redemption</h2>

        <p>To activate a Club Premium license, a player must:</p>

        <ol>
          <li>Create an individual Hockey Beats account or sign in to an existing account.</li>
          <li>Complete any required email verification.</li>
          <li>Meet the applicable age and parental authorization requirements.</li>
          <li>Enter the club activation code in the designated account interface.</li>
          <li>Complete the activation process.</li>
        </ol>

        <p>After successful redemption, the player&apos;s account becomes associated with the relevant club license.</p>

        <p>The player&apos;s individual account remains separate from the organization&apos;s billing account.</p>

        <p>Redeeming a club code does not create an individual recurring payment obligation for the player.</p>

        <h2>10. Premium Access</h2>

        <p>An active Club Premium license grants access to the Premium games and functionality included in the relevant Club Premium offering.</p>

        <p>Premium access remains available while:</p>

        <ul>
          <li>The organization&apos;s subscription is active.</li>
          <li>The corresponding license slot remains assigned.</li>
          <li>The player&apos;s account remains eligible.</li>
          <li>No valid suspension or termination restriction applies.</li>
        </ul>

        <p>Club Premium does not guarantee a particular score, level, achievement, or sporting result.</p>

        <h2>11. Club Membership and Friends</h2>

        <p>Players who redeem activation codes belonging to the same organization may be associated with a shared Hockey Beats club group.</p>

        <p>Where the club membership functionality is enabled, participating players may be shown in the Friends area as club teammates.</p>

        <p>The purpose of this feature is to help players identify teammates, compare supported gameplay progress, and participate in a shared club experience.</p>

        <p>Club membership does not automatically grant other players access to private account information.</p>

        <p>Information visible to teammates will be limited to the information made available through the relevant feature and described in the Privacy Policy.</p>

        <p>Appropriate privacy protections must be applied for younger users.</p>

        <p>Hockey Beats may provide controls or restrictions for club visibility where necessary to protect users and comply with applicable law.</p>

        <h2>12. Individual Player Progression</h2>

        <p>Club Premium players retain their individual gameplay profiles.</p>

        <p>Their accounts may include:</p>

        <ul>
          <li>XP.</li>
          <li>Levels.</li>
          <li>Scores.</li>
          <li>Achievements.</li>
          <li>Streaks.</li>
          <li>Game settings.</li>
          <li>Supported Friends information.</li>
          <li>Other available progression features.</li>
        </ul>

        <p>A club license grants access to Premium functionality but does not transfer ownership of the player&apos;s personal account to the organization.</p>

        <p>A player&apos;s legitimate progression is not automatically deleted when their club-funded Premium entitlement expires.</p>

        <h2>13. Monthly Subscription Renewal</h2>

        <p>Club Premium subscriptions renew monthly unless canceled or otherwise terminated.</p>

        <p>Following successful payment of the next billing period, the organization&apos;s active license entitlements are extended for the new period.</p>

        <p><strong>Existing players do not need to enter new activation codes every month.</strong></p>

        <p>Previously redeemed codes remain associated with the respective player accounts while the underlying licenses remain active.</p>

        <p>Hockey Beats may generate additional codes when an organization purchases additional license slots or when an authorized reassignment creates an available slot.</p>

        <h2>14. Failed Payments</h2>

        <p>If a recurring payment fails, Hockey Beats may notify the organization and allow it to update its payment method or resolve the issue.</p>

        <p>The Service may apply a disclosed payment recovery or grace period.</p>

        <p>If payment is not successfully completed within the applicable period, the corresponding Club Premium entitlements may be suspended or expire.</p>

        <p>Players will not automatically be charged individually to replace an unpaid organizational subscription.</p>

        <p>Any suspension or termination will be handled consistently with applicable law and the agreed subscription conditions.</p>

        <h2>15. Subscription Cancellation</h2>

        <p>The authorized organizational purchaser may cancel the Club Premium subscription through the available subscription management process or by contacting Hockey Beats.</p>

        <p>Cancellation stops future automatic renewals.</p>

        <p>Unless otherwise stated in the applicable agreement or required by law, Premium access remains available until the end of the current paid billing period.</p>

        <p>Cancellation does not automatically result in an immediate refund of an already commenced billing period.</p>

        <p>The organization&apos;s cancellation rights and any applicable refund entitlements remain subject to the agreement and mandatory law.</p>

        <h2>16. Expiration of Club Premium Access</h2>

        <p>When a Club Premium subscription expires or is terminated, the associated Premium entitlements will end in accordance with the applicable contractual conditions.</p>

        <p>Affected players may continue using Hockey Beats through the Free Plan, subject to the Terms of Service.</p>

        <p>Their accounts may retain eligible scores, XP, achievements, and other progression data.</p>

        <p>Premium games and features will no longer be available through the expired club license.</p>

        <p>Players may choose to purchase an individual Premium subscription separately, subject to the applicable subscription conditions.</p>

        <h2>17. Increasing the Number of Licenses</h2>

        <p>An organization may request an upgrade to a larger Club Premium package.</p>

        <p>For example, a club using Club 15 may request Club 20.</p>

        <p>The upgraded package provides the additional license capacity once the change is confirmed and any required payment is successfully processed.</p>

        <p>The applicable checkout or amendment process must disclose:</p>

        <ul>
          <li>The new monthly price.</li>
          <li>The additional license quantity.</li>
          <li>The effective date.</li>
          <li>Any prorated charge.</li>
          <li>The next renewal amount.</li>
        </ul>

        <p>Additional codes may then be generated for the newly available license slots.</p>

        <h2>18. Decreasing the Number of Licenses</h2>

        <p>An organization may request a reduction to a smaller package.</p>

        <p>A reduction may require the organization to identify which license assignments will end.</p>

        <p>Unless otherwise agreed, a reduction will normally take effect at the next billing period rather than retroactively reducing an already paid period.</p>

        <p>The organization must be informed of the effective date and resulting subscription price.</p>

        <p>A reduction must not grant the organization unauthorized access to player account data.</p>

        <h2>19. Reassigning Licenses</h2>

        <p>Organizations may need to replace players who leave the club or no longer require access.</p>

        <p>Hockey Beats may support controlled license reassignment.</p>

        <p>Where reassignment is permitted:</p>

        <ul>
          <li>The existing player&apos;s club-funded Premium entitlement may be removed.</li>
          <li>The original player&apos;s individual account and personal progression remain separate.</li>
          <li>The released license slot may be assigned to another eligible player.</li>
          <li>A new unique activation code may be generated.</li>
          <li>The previously redeemed code remains invalid for further redemption.</li>
        </ul>

        <p>Hockey Beats may impose reasonable reassignment limits to prevent abuse or unauthorized resale.</p>

        <p>Any such limits must be disclosed before they materially affect a purchased package.</p>

        <h2>20. Club Administration</h2>

        <p>Hockey Beats may provide tools to help authorized club representatives manage their subscriptions.</p>

        <p>These may include:</p>

        <ul>
          <li>Viewing purchased license capacity.</li>
          <li>Checking the number of allocated and available licenses.</li>
          <li>Accessing unused activation codes.</li>
          <li>Managing authorized reassignments.</li>
          <li>Viewing subscription and billing information.</li>
          <li>Requesting changes to the package.</li>
        </ul>

        <p>The availability of any specific administration tool depends on the functionality actually released.</p>

        <p>These Club Terms do not guarantee a dedicated club dashboard unless expressly included in the purchased offering.</p>

        <h2>21. Age Requirements and Parental Authorization</h2>

        <p>Hockey Beats is intended for players aged 13 and older.</p>

        <p>Players under 13 must not create accounts or use the Service.</p>

        <p>Players aged 13–15 require parental or guardian permission and any additional legally required authorization.</p>

        <p>A club&apos;s purchase of Premium licenses does not automatically replace the legally required authorization of a parent or guardian.</p>

        <p>Where applicable, parental authorization must be obtained and verified through an appropriate process.</p>

        <p>Players under 18 must also comply with any applicable rules relating to contractual capacity and paid purchases.</p>

        <p>Redeeming a prepaid club activation code does not itself create a recurring payment obligation for the player.</p>

        <h2>22. Player Privacy and Data Protection</h2>

        <p>Hockey Beats processes personal data in accordance with its Privacy Policy and applicable data protection law.</p>

        <p>A club may receive information necessary to administer its purchased licenses, subject to appropriate access controls and lawful processing.</p>

        <p>Purchasing licenses does not automatically entitle a club to access:</p>

        <ul>
          <li>Players&apos; passwords.</li>
          <li>Private authentication information.</li>
          <li>Unrelated personal account data.</li>
          <li>Private gameplay information not included in an authorized club feature.</li>
          <li>Personal information beyond what is necessary for the agreed purpose.</li>
        </ul>

        <p>Any processing arrangement between Hockey Beats and an organization will be assessed according to the parties&apos; actual roles under GDPR.</p>

        <p>Where required, the parties will establish an appropriate data processing or joint-controller arrangement.</p>

        <h2>23. Fair Play</h2>

        <p>All Club Premium players must follow the Hockey Beats Fair Play &amp; Leaderboard Rules.</p>

        <p>Clubs must not encourage or facilitate:</p>

        <ul>
          <li>Artificial score generation.</li>
          <li>Manipulation of ball-tracking data.</li>
          <li>Unauthorized account sharing.</li>
          <li>Fraudulent achievement generation.</li>
          <li>Leaderboard manipulation.</li>
          <li>Circumvention of license restrictions.</li>
        </ul>

        <p>Hockey Beats may take proportionate action against misuse, subject to applicable contractual and legal requirements.</p>

        <h2>24. Training and Physical Safety</h2>

        <p>Organizations using Hockey Beats for organized training must provide appropriate supervision and safe playing conditions.</p>

        <p>They should ensure that:</p>

        <ul>
          <li>The playing area is suitable.</li>
          <li>Players have appropriate equipment.</li>
          <li>Hockey sticks and balls are used safely.</li>
          <li>Cameras and electronic devices are positioned securely.</li>
          <li>Players are not encouraged to perform unsafe movements.</li>
          <li>Appropriate safeguarding measures are followed.</li>
        </ul>

        <p>The Safety &amp; Physical Activity Guidelines provide further information.</p>

        <p>Hockey Beats is a supplementary training and entertainment platform and does not replace qualified coaching or professional medical advice.</p>

        <h2>25. Intellectual Property and Permitted Use</h2>

        <p>Hockey Beats software, design, branding, and protected content remain the property of DRIXTON s. r. o. or the relevant rights holders.</p>

        <p>A Club Premium subscription grants a limited, non-exclusive, non-transferable right to access the purchased functionality during the applicable subscription period.</p>

        <p>Organizations must not reproduce, resell, sublicense, or distribute Hockey Beats software or access rights outside the authorized licensing arrangement.</p>

        <p>Any use of Hockey Beats branding for promotional purposes must comply with applicable intellectual property rules and any required authorization.</p>

        <h2>26. Organizational Branding</h2>

        <p>Purchasing Club Premium does not automatically establish an official sponsorship or partnership relationship.</p>

        <p>Neither party may use the other&apos;s name, logo, or trademarks in promotional materials in a manner suggesting endorsement without appropriate authorization.</p>

        <p>Ordinary factual identification of the service purchased or provided is permitted where legally appropriate.</p>

        <h2>27. Technical Availability</h2>

        <p>Hockey Beats aims to provide reliable access but cannot guarantee uninterrupted operation.</p>

        <p>Service interruptions may occur due to maintenance, technical issues, network problems, or third-party service dependencies.</p>

        <p>Any specific service-level commitments must be expressly agreed in writing.</p>

        <p>Material service failures and related remedies remain subject to applicable contractual and legal requirements.</p>

        <h2>28. Suspension and Termination for Misuse</h2>

        <p>Hockey Beats may suspend or terminate organizational access where reasonably justified by serious or repeated violations, including:</p>

        <ul>
          <li>Fraudulent payments.</li>
          <li>Unauthorized resale of activation codes.</li>
          <li>Systematic license abuse.</li>
          <li>Security attacks.</li>
          <li>Deliberate circumvention of subscription restrictions.</li>
        </ul>

        <p>Where appropriate, the organization will be informed of the issue and provided an opportunity to resolve it.</p>

        <p>Immediate protective action may be taken where reasonably necessary to address serious security or legal risks.</p>

        <p>Mandatory rights remain unaffected.</p>

        <h2>29. Refunds</h2>

        <p>Refunds for Club Premium subscriptions are governed by the applicable agreement and mandatory law.</p>

        <p>The voluntary seven-day refund guarantee for eligible individual Premium subscriptions does not automatically apply to organizational bulk subscriptions.</p>

        <p>Any special organizational refund arrangement must be expressly stated in the relevant offer or agreement.</p>

        <p>Where a purchaser qualifies as a consumer under applicable law, mandatory consumer protections remain unaffected.</p>

        <h2>30. Price Changes</h2>

        <p>Hockey Beats may revise Club Premium prices for future purchases.</p>

        <p>Changes to an existing recurring subscription will be communicated in advance, with at least 30 days&apos; notice where applicable under the Service&apos;s pricing policy.</p>

        <p>Any new price will apply only in accordance with the existing agreement and applicable law.</p>

        <p>Where express acceptance is legally required, the new price will not take effect without that acceptance.</p>

        <h2>31. Changes to These Club Terms</h2>

        <p>Hockey Beats may update these Club Terms to reflect new features, pricing structures, technical processes, or legal requirements.</p>

        <p>The current version and effective date will be published on the website.</p>

        <p>Material changes affecting existing subscriptions will be handled according to the applicable contractual amendment process and mandatory law.</p>

        <h2>32. Governing Law</h2>

        <p>These Club Terms are governed by the laws of the Slovak Republic, subject to applicable mandatory rules and conflict-of-law principles.</p>

        <p>The parties should first attempt to resolve disputes through good-faith communication.</p>

        <p>Nothing in these Club Terms excludes mandatory rights or legal remedies available under applicable law.</p>

        <h2>33. Contact Information</h2>

        <p>For questions about Club Premium subscriptions, activation codes, billing, licensing, or organizational access, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Club &amp; Organization Licensing Terms — Version 1.1</strong></p>
      </main>
    </div>
  );
}
