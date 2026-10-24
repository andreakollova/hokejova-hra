import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Promotional Codes, Gift Access & Lifetime Pass Terms',
};

export default function PromotionalTermsPage() {
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
        <h1>Promotional Codes, Gift Access &amp; Lifetime Pass Terms</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.0<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>
        <p>These Promotional Codes, Gift Access &amp; Lifetime Pass Terms (&quot;Promotional Terms&quot;) govern special access offers provided by Hockey Beats, including promotional codes, complimentary Premium access, gift access, and Lifetime Pass entitlements.</p>
        <p>Hockey Beats is an interactive hockey training and entertainment platform combining physical hockey skills, rhythm-based gameplay, camera-based ball tracking, and digital player progression.</p>
        <p>From time to time, Hockey Beats may offer special access arrangements to individual users, promotional partners, clubs, or other eligible recipients.</p>
        <p>These Promotional Terms supplement our Terms of Service, Subscription, Cancellation &amp; Refund Policy, Privacy Policy, and other applicable policies.</p>
        <p>Where specific offer conditions differ from these Promotional Terms, the clearly disclosed offer-specific conditions apply to the extent permitted by law.</p>

        <h2>2. Service Provider</h2>
        <p>Hockey Beats is operated by:</p>
        <p><strong>DRIXTON s. r. o.</strong><br />Mudrochova 7480/15<br />831 06 Bratislava – Rača<br />Slovak Republic</p>
        <p><strong>Company Registration Number (IČO):</strong> 53874871<br /><strong>Tax Identification Number (DIČ):</strong> 2121518399<br /><strong>VAT Identification Number:</strong> SK2121518399</p>
        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br /><strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>3. Types of Promotional Access</h2>
        <p>Hockey Beats may provide the following types of access:</p>
        <ul>
          <li>Complimentary one-month Premium codes.</li>
          <li>Complimentary three-month Premium codes.</li>
          <li>Gifted Premium access for a specified period.</li>
          <li>Special promotional access for selected users or partners.</li>
          <li>Lifetime Pass entitlements.</li>
          <li>Other expressly identified promotional offers.</li>
        </ul>
        <p>Each offer may have its own eligibility criteria, activation deadline, access period, and limitations.</p>
        <p>Not every offer will be available at all times.</p>

        <h2>4. Complimentary One-Month Premium Codes</h2>
        <p>A complimentary one-month Premium code grants an eligible user access to Premium functionality for the stated one-month period.</p>
        <p>Unless the specific offer expressly provides otherwise, the access period begins when the code is successfully redeemed.</p>
        <p>The code does not require the user to purchase an individual Premium subscription.</p>
        <p>No recurring payment obligation is created merely by redeeming the code.</p>
        <p>When the complimentary access period ends, the account returns to the Free Plan unless the user separately purchases Premium.</p>

        <h2>5. Complimentary Three-Month Premium Codes</h2>
        <p>A complimentary three-month Premium code grants an eligible user access to Premium functionality for the stated three-month period.</p>
        <p>Unless the offer states otherwise, the access period begins when the code is successfully redeemed.</p>
        <p>The user is not required to authorize a recurring payment to receive the complimentary access.</p>
        <p>When the three-month period ends, Premium access expires automatically.</p>
        <p>The user may continue using the Free Plan without being charged.</p>

        <h2>6. No Automatic Conversion to Paid Premium</h2>
        <p><strong>Complimentary promotional access does not automatically convert into a paid subscription.</strong></p>
        <p>Redeeming a free promotional code does not authorize Hockey Beats to charge the user after the promotional period.</p>
        <p>A paid subscription may begin only if the user separately selects a paid plan and completes the required checkout and payment authorization process.</p>
        <p>Any applicable price, billing frequency, trial terms, and automatic renewal conditions must be disclosed before the user agrees to the paid subscription.</p>
        <p>This rule also applies where a complimentary code is provided by a club, partner, or promotional campaign, unless the offer is expressly structured as a separate paid subscription with the user&apos;s valid authorization.</p>

        <h2>7. Promotional Codes and Activation</h2>
        <p>To redeem a promotional code, a user may be required to:</p>
        <ol>
          <li>Create a Hockey Beats account or sign in.</li>
          <li>Complete required email verification.</li>
          <li>Meet applicable age and eligibility requirements.</li>
          <li>Enter the promotional code in the designated activation interface.</li>
          <li>Complete the redemption process.</li>
        </ol>
        <p>A promotional code becomes effective only after successful validation and activation.</p>
        <p>A code may be rejected if it is invalid, expired, already redeemed, restricted to another user, or otherwise ineligible.</p>

        <h2>8. Code Validity and Expiration</h2>
        <p>Promotional codes may have a redemption deadline.</p>
        <p>The redemption deadline is separate from the duration of Premium access granted after activation.</p>
        <p>For example, a one-month code may need to be redeemed before a specified date but may grant one month of access starting from the successful redemption date.</p>
        <p>Any redemption deadline and access duration will be disclosed in the relevant offer.</p>
        <p>An expired code does not create an entitlement to Premium access unless required by applicable law or expressly agreed by Hockey Beats.</p>

        <h2>9. Single-Use Codes</h2>
        <p>Unless expressly stated otherwise, promotional codes are intended for one-time redemption.</p>
        <p>Once successfully redeemed, a code becomes associated with the relevant user account and cannot be redeemed by another account.</p>
        <p>Users must not:</p>
        <ul>
          <li>Guess or generate unauthorized codes.</li>
          <li>Circumvent code validation.</li>
          <li>Use scripts to redeem codes fraudulently.</li>
          <li>Sell codes distributed as non-transferable complimentary offers.</li>
          <li>Use multiple accounts to evade expressly disclosed eligibility restrictions.</li>
        </ul>
        <p>Hockey Beats may invalidate fraudulently obtained or unlawfully used codes, subject to applicable law.</p>

        <h2>10. Eligibility and Offer Restrictions</h2>
        <p>Promotional offers may be limited by:</p>
        <ul>
          <li>Redemption date.</li>
          <li>Number of available codes.</li>
          <li>Eligible accounts.</li>
          <li>Participating organizations.</li>
          <li>Geographic availability where legally justified.</li>
          <li>Other clearly disclosed conditions.</li>
        </ul>
        <p>Material eligibility restrictions must be communicated before redemption.</p>
        <p>Hockey Beats will not apply undisclosed restrictions retroactively in a manner that violates applicable contractual or consumer rights.</p>

        <h2>11. Multiple Promotional Codes</h2>
        <p>Users may receive more than one promotional code.</p>
        <p>Unless expressly stated otherwise, promotional access periods do not automatically stack.</p>
        <p>Where an account already has an active Premium entitlement, the redemption interface should disclose whether a new code:</p>
        <ul>
          <li>Extends the existing access period.</li>
          <li>Begins after the existing entitlement ends.</li>
          <li>Cannot be redeemed until the current entitlement expires.</li>
          <li>Is subject to another clearly stated rule.</li>
        </ul>
        <p>Hockey Beats will not silently shorten an existing paid entitlement when a promotional code is redeemed.</p>

        <h2>12. Promotional Access and Existing Paid Subscriptions</h2>
        <p>A user who already has an active paid Premium subscription may receive a promotional code.</p>
        <p>The treatment of that code depends on the applicable offer conditions.</p>
        <p>A complimentary code does not automatically cancel, pause, or refund an existing paid subscription.</p>
        <p>Before applying a code in a way that affects an existing subscription, Hockey Beats should clearly explain the consequences.</p>
        <p>Users who wish to stop an existing paid subscription must follow the applicable cancellation process.</p>
        <p>Mandatory consumer rights remain unaffected.</p>

        <h2>13. Gifted Premium Access</h2>
        <p>Hockey Beats may allow Premium access to be provided as a gift.</p>
        <p>Gift access may be delivered through an activation code or another supported method.</p>
        <p>The gift offer must identify:</p>
        <ul>
          <li>The included access period or entitlement.</li>
          <li>Any redemption deadline.</li>
          <li>Eligibility requirements.</li>
          <li>Whether the gift is transferable.</li>
          <li>Any applicable payment and refund conditions.</li>
        </ul>
        <p>The recipient is not required to enter payment details solely to redeem a fully prepaid gift entitlement.</p>
        <p>Gift access does not automatically renew as a paid subscription for the recipient.</p>

        <h2>14. Gift Purchases and Refunds</h2>
        <p>Where gift access is sold to a purchaser, the purchase is subject to the applicable checkout terms and mandatory consumer rights.</p>
        <p>Any statutory withdrawal rights, exceptions, and remedies for defective digital services will be determined under applicable law.</p>
        <p>The fact that a gift code has been issued or redeemed does not, by itself, eliminate mandatory statutory rights.</p>
        <p>Any refund arrangement must take account of whether the entitlement has been activated and the applicable legal requirements.</p>

        <h2>15. Lifetime Pass</h2>
        <p>Hockey Beats may offer a Lifetime Pass granting access to the Premium games and features covered by the offer.</p>
        <p>Unless the offer expressly states otherwise, a Lifetime Pass provides access for the <strong>operational lifetime of the Hockey Beats Service</strong>, not for the biological lifetime of the purchaser.</p>
        <p>The operational lifetime means the period during which Hockey Beats continues to operate and provide the relevant Premium Service.</p>
        <p>A Lifetime Pass does not guarantee that Hockey Beats will operate indefinitely.</p>

        <h2>16. Scope of Lifetime Pass Access</h2>
        <p>Unless the offer expressly limits its scope, a Lifetime Pass includes:</p>
        <ul>
          <li>Premium games available at the time of purchase or activation.</li>
          <li>Future games introduced as part of the standard Hockey Beats Premium offering.</li>
          <li>Premium gameplay functionality included in the standard Premium tier.</li>
        </ul>
        <p>A Lifetime Pass does not automatically include:</p>
        <ul>
          <li>Separate subscriptions to Apple Music, Spotify, or other third-party services.</li>
          <li>Physical products or equipment.</li>
          <li>Separately licensed third-party content.</li>
          <li>Distinct products or services that are not part of the standard Hockey Beats Premium offering.</li>
        </ul>
        <p>Any material exclusions must be clearly disclosed before purchase.</p>
        <p>Hockey Beats may not use newly introduced labels or artificial product divisions to circumvent the Premium access rights expressly promised in a Lifetime Pass.</p>

        <h2>17. Lifetime Pass Activation</h2>
        <p>A Lifetime Pass may be activated through a supported purchase process, redemption code, or another expressly authorized method.</p>
        <p>Once activated, the entitlement is associated with the relevant Hockey Beats account.</p>
        <p>A Lifetime Pass does not require monthly or yearly renewal payments for the included Premium access.</p>
        <p>Where the Lifetime Pass is purchased, its price and applicable terms must be clearly disclosed before payment.</p>

        <h2>18. Lifetime Pass and Service Changes</h2>
        <p>Hockey Beats may develop, modify, replace, or discontinue individual features over time.</p>
        <p>A Lifetime Pass does not guarantee that every game, integration, or technical feature will remain unchanged.</p>
        <p>However, changes must respect the contractual scope of the purchased entitlement and applicable law.</p>
        <p>If material changes substantially reduce the promised value of a Lifetime Pass, users may have contractual or statutory remedies.</p>
        <p>Nothing in these Promotional Terms permits Hockey Beats to avoid mandatory remedies for non-conforming digital services.</p>

        <h2>19. Lifetime Pass and Service Closure</h2>
        <p>If Hockey Beats permanently ceases operating, access under a Lifetime Pass may end when the relevant Service is discontinued.</p>
        <p>This possibility does not automatically exclude the purchaser&apos;s legal rights.</p>
        <p>Any applicable refund, price reduction, termination, or other remedy will be determined by the contractual circumstances and mandatory law.</p>
        <p>The term &quot;Lifetime Pass&quot; must not be interpreted as an unconditional guarantee of perpetual service availability.</p>

        <h2>20. Lifetime Pass Transfers</h2>
        <p>Unless expressly stated otherwise in the offer, a Lifetime Pass is personal to the account on which it is activated.</p>
        <p>It may not be resold, sublicensed, or transferred to another user without authorization.</p>
        <p>Hockey Beats may consider exceptional transfer requests, such as account-access problems, subject to security, fraud prevention, and applicable law.</p>
        <p>Any statutory rights that cannot lawfully be restricted remain unaffected.</p>

        <h2>21. Promotional Access and Club Premium</h2>
        <p>Complimentary promotional codes are separate from Club Premium licenses unless expressly identified as part of a Club Premium offer.</p>
        <p>A club-funded license is generally dependent on the organization&apos;s active subscription and applicable license assignment.</p>
        <p>A complimentary one-month or three-month code expires according to its own stated access period.</p>
        <p>Redeeming a promotional code does not automatically create club membership or add the recipient to a club&apos;s Friends group.</p>
        <p>Club activation codes are governed by the Club &amp; Organization Licensing Terms.</p>

        <h2>22. Player Accounts and Progression</h2>
        <p>Players using promotional access or a Lifetime Pass maintain individual Hockey Beats accounts.</p>
        <p>Their accounts may contain:</p>
        <ul><li>XP.</li><li>Levels.</li><li>Scores.</li><li>Achievements.</li><li>Streaks.</li><li>Friends.</li><li>Game settings.</li><li>Other supported progression information.</li></ul>
        <p>When temporary promotional access expires, the account may return to the Free Plan.</p>
        <p>Legitimate progression is not automatically erased merely because a promotional Premium entitlement ends.</p>
        <p>Account deletion and personal data processing are governed by the Privacy Policy and applicable law.</p>

        <h2>23. Age Requirements</h2>
        <p>Hockey Beats is intended for users aged 13 and older.</p>
        <p>Users under 13 must not create accounts or use the Service.</p>
        <p>Users aged 13–15 require parental or guardian permission and any additional legally required authorization.</p>
        <p>Where a promotional entitlement is free, redeeming it does not create a recurring payment obligation.</p>
        <p>Where a Lifetime Pass or gift entitlement is purchased, applicable rules on minors&apos; contractual capacity and payment authorization must be respected.</p>

        <h2>24. Fair Use and Fraud Prevention</h2>
        <p>Hockey Beats may take proportionate measures against fraudulent promotional activity.</p>
        <p>Examples include:</p>
        <ul><li>Unauthorized code generation.</li><li>Automated redemption attacks.</li><li>Code theft.</li><li>Misrepresentation of eligibility.</li><li>Circumvention of expressly disclosed redemption limits.</li><li>Unauthorized commercial resale of complimentary codes.</li></ul>
        <p>Hockey Beats may suspend or invalidate affected entitlements where legally justified.</p>
        <p>Legitimate users must not lose paid rights arbitrarily because of an unrelated security incident.</p>

        <h2>25. Technical Availability</h2>
        <p>Promotional and Lifetime Pass access depends on the continued availability of the relevant Service.</p>
        <p>Temporary interruptions may occur due to maintenance, technical failures, or third-party dependencies.</p>
        <p>Hockey Beats will address service failures in accordance with the applicable agreement and mandatory law.</p>
        <p>A complimentary entitlement does not necessarily provide the same contractual remedies as a purchased entitlement, but applicable legal protections remain unaffected.</p>

        <h2>26. Pricing and Taxes</h2>
        <p>Complimentary promotional codes are provided without a subscription charge to the recipient.</p>
        <p>Gift access and Lifetime Pass purchases, where offered for sale, will have their prices disclosed before checkout.</p>
        <p>Applicable taxes will be handled according to relevant law.</p>
        <p>No Lifetime Pass price is established by these Promotional Terms alone.</p>

        <h2>27. Refunds and Consumer Rights</h2>
        <p>Paid gift access and Lifetime Pass purchases may be subject to statutory withdrawal rights, conformity requirements, and other consumer protections.</p>
        <p>The voluntary seven-day Premium refund guarantee for eligible initial paid recurring subscriptions does not automatically apply to Lifetime Pass or gift purchases unless expressly stated in the offer.</p>
        <p>Mandatory statutory rights remain unaffected.</p>
        <p>Users may contact <a href="mailto:studio@drixton.com">studio@drixton.com</a> to request information about applicable refunds or remedies.</p>

        <h2>28. Changes to Promotional Offers</h2>
        <p>Hockey Beats may introduce, modify, or discontinue promotional offers for future users.</p>
        <p>An offer may be withdrawn before a valid entitlement is acquired, subject to applicable law and any binding commitments already made.</p>
        <p>Hockey Beats will not arbitrarily revoke validly acquired paid entitlements.</p>
        <p>Changes to existing entitlements must respect applicable contractual and statutory requirements.</p>

        <h2>29. Changes to These Promotional Terms</h2>
        <p>We may update these Promotional Terms to reflect:</p>
        <ul><li>New promotional offers.</li><li>Changes to activation processes.</li><li>New gift access functionality.</li><li>Changes to Lifetime Pass offerings.</li><li>Technical or legal developments.</li></ul>
        <p>The latest version and effective date will be published on our website.</p>
        <p>Changes will not retroactively remove mandatory rights.</p>

        <h2>30. Governing Law</h2>
        <p>These Promotional Terms are governed by the laws of the Slovak Republic, subject to applicable mandatory consumer protection rules and conflict-of-law principles.</p>
        <p>Nothing in these Promotional Terms deprives consumers of mandatory protections available under the law of their country of habitual residence where applicable.</p>

        <h2>31. Contact Information</h2>
        <p>For promotional codes, gift access, Lifetime Pass inquiries, activation issues, or related complaints, contact:</p>
        <p><strong>DRIXTON s. r. o.</strong><br />Mudrochova 7480/15<br />831 06 Bratislava – Rača<br />Slovak Republic</p>
        <p><strong>Company Registration Number:</strong> 53874871<br /><strong>VAT ID:</strong> SK2121518399</p>
        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br /><strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>
        <hr />
        <p><strong>End of Promotional Codes, Gift Access &amp; Lifetime Pass Terms — Version 1.0</strong></p>
      </main>
    </div>
  );
}
