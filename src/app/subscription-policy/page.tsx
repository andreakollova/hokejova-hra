import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Subscription, Cancellation & Refund Policy',
};

export default function SubscriptionPolicyPage() {
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
        <h1>Subscription, Cancellation &amp; Refund Policy</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.0<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>This Subscription, Cancellation &amp; Refund Policy (&quot;Policy&quot;) explains how paid subscriptions, free trials, recurring payments, promotional access, cancellations, refunds, and other paid entitlements work on Hockey Beats.</p>

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

        <p>This Policy forms part of the contractual information applicable to Hockey Beats purchases and should be read together with our Terms of Service and Privacy Policy.</p>

        <p>Nothing in this Policy excludes, limits, or replaces statutory consumer rights, including rights relating to withdrawal from distance contracts, non-conforming digital services, refunds, or unfair contract terms.</p>

        <p>Where mandatory law provides greater protection, that law prevails.</p>

        <h2>2. Available Plans</h2>

        <p>Hockey Beats operates a freemium model with permanent Free access and optional Premium subscriptions.</p>

        <h3>2.1 Free Plan</h3>

        <p>The Free Plan costs <strong>€0</strong> and does not require a paid subscription.</p>

        <p>It includes:</p>

        <ul>
          <li>Unlimited access to the core Hockey Beats Slalom game.</li>
          <li>A one-time, 10-minute complimentary allowance for each Premium game.</li>
          <li>Camera-based ball tracking.</li>
          <li>Remote Phone Camera.</li>
          <li>Supported music integrations, subject to third-party requirements.</li>
          <li>XP, levels, streaks, and achievements.</li>
          <li>Leaderboards and available social features.</li>
        </ul>

        <p>The Free Plan does not expire and does not automatically become a paid subscription.</p>

        <h3>2.2 Premium Monthly</h3>

        <p><strong>Price: €8.45 per month, including applicable VAT.</strong></p>

        <p>Premium Monthly provides access to all available Premium games and Premium features during the subscription period.</p>

        <p>The subscription renews monthly unless canceled.</p>

        <h3>2.3 Premium Yearly</h3>

        <p><strong>Price: €79.99 per year, including applicable VAT.</strong></p>

        <p>Premium Yearly provides access to all available Premium games and Premium features during the subscription period.</p>

        <p>The subscription renews annually unless canceled.</p>

        <p>The yearly price is equivalent to approximately €6.67 per month when averaged over 12 months and represents an approximate saving of 21% compared with 12 monthly payments at the standard monthly price.</p>

        <h3>2.4 Taxes and pricing information</h3>

        <p>Displayed prices include applicable VAT.</p>

        <p>The total payable amount, billing frequency, any applicable discounts, and relevant taxes will be disclosed before a user confirms a purchase.</p>

        <p>If the tax treatment applicable to a particular customer or transaction requires a different legally compliant presentation, the final checkout information will clearly identify the total amount payable before the customer is bound.</p>

        <h2>3. Ten-Minute Access to Premium Games</h2>

        <p>Registered Free users may try each Premium game for <strong>10 minutes, once per account per game</strong>.</p>

        <p>The allowance:</p>

        <ul>
          <li>Applies individually to each eligible Premium game.</li>
          <li>Is cumulative across gameplay sessions.</li>
          <li>Does not reset daily.</li>
          <li>Does not reset when restarting a game.</li>
          <li>Does not reset when changing devices.</li>
          <li>Cannot be replenished by signing in again.</li>
        </ul>

        <p>Once the allowance for a particular Premium game is exhausted, continued access requires an active Premium entitlement or another valid access right.</p>

        <p>The ten-minute allowance is a Free Plan feature and is separate from the seven-day Premium subscription trial.</p>

        <h2>4. Seven-Day Premium Free Trial</h2>

        <h3>4.1 Trial description</h3>

        <p>Hockey Beats offers an introductory <strong>seven-day Premium free trial</strong> to eligible users activating a Premium Monthly or Premium Yearly subscription.</p>

        <p>During the trial, users receive access to Premium games and features without a subscription charge.</p>

        <p>The trial is separate from the permanent Free Plan.</p>

        <h3>4.2 Choosing a subscription</h3>

        <p>Before starting the trial, the user must select:</p>

        <ul>
          <li>Premium Monthly at €8.45 per month; or</li>
          <li>Premium Yearly at €79.99 per year.</li>
        </ul>

        <p>Both prices include applicable VAT.</p>

        <p>The selected plan determines the subscription that will begin when the trial expires unless the user cancels in time.</p>

        <h3>4.3 Payment method and authorization</h3>

        <p>Users must provide a valid payment method to activate a trial linked to an automatically renewing subscription.</p>

        <p>Before the user confirms the trial, the checkout will clearly display:</p>

        <ul>
          <li>The length of the free trial.</li>
          <li>The selected Premium plan.</li>
          <li>The amount of the first scheduled payment.</li>
          <li>The date on which the first payment is scheduled.</li>
          <li>The recurring billing interval.</li>
          <li>The automatic renewal conditions.</li>
          <li>The cancellation procedure.</li>
          <li>Any material eligibility restrictions.</li>
        </ul>

        <p>The user must expressly authorize the subscription and its recurring payment terms.</p>

        <p>No paid subscription will be created solely because a user registers for a Free account or uses a ten-minute Premium game allowance.</p>

        <h3>4.4 Automatic conversion after seven days</h3>

        <p><strong>If the user does not cancel before the trial ends, the selected Premium subscription automatically becomes paid.</strong></p>

        <p>The first scheduled payment will be:</p>

        <ul>
          <li>€8.45 for Premium Monthly; or</li>
          <li>€79.99 for Premium Yearly.</li>
        </ul>

        <p>The amount includes applicable VAT.</p>

        <p>The selected subscription will then renew automatically according to its billing cycle until canceled.</p>

        <h3>4.5 Cancellation during the trial</h3>

        <p>Users may cancel at any time before the trial ends.</p>

        <p>If cancellation is completed before the first scheduled payment, <strong>no subscription payment will be charged for that trial</strong>.</p>

        <p>Cancellation prevents the trial from automatically converting into a paid subscription.</p>

        <p>Premium trial access ends no later than the scheduled end of the trial period, unless another valid Premium entitlement applies.</p>

        <h3>4.6 Trial eligibility</h3>

        <p>The introductory trial is intended for eligible users and may be limited to one introductory trial per person or account.</p>

        <p>Any additional material eligibility restrictions will be disclosed before activation.</p>

        <p>Creating multiple accounts to fraudulently obtain repeated introductory offers is prohibited.</p>

        <h3>4.7 Statutory rights</h3>

        <p>The trial does not exclude or restrict statutory consumer rights.</p>

        <p>Where applicable law requires particular pre-contractual information, consent, acknowledgment, or withdrawal procedures, these requirements apply independently of the trial terms.</p>

        <h2>5. Automatic Subscription Renewal</h2>

        <h3>5.1 Monthly subscriptions</h3>

        <p>Premium Monthly renews automatically for successive monthly billing periods unless canceled.</p>

        <p>The applicable recurring price is charged on the scheduled renewal date.</p>

        <h3>5.2 Yearly subscriptions</h3>

        <p>Premium Yearly renews automatically for successive annual billing periods unless canceled.</p>

        <p>The applicable recurring price is charged on the scheduled renewal date.</p>

        <h3>5.3 Renewal authorization</h3>

        <p>Recurring payments will be collected only under a valid subscription authorization and in accordance with applicable payment and consumer protection requirements.</p>

        <p>The subscription&apos;s recurring nature and cancellation conditions will be clearly disclosed before purchase.</p>

        <h3>5.4 Payment failures</h3>

        <p>If a scheduled payment fails, we or the payment processor may request an updated payment method or retry payment where permitted by the payment authorization and applicable law.</p>

        <p>Premium access may be restricted or suspended if payment remains outstanding, subject to applicable consumer rights and any required notice.</p>

        <p>We will not impose undisclosed fees or penalties.</p>

        <h2>6. Subscription Cancellation</h2>

        <h3>6.1 Right to cancel</h3>

        <p>Users may cancel their Premium subscription at any time.</p>

        <p>Cancellation may be completed through the available account or billing management interface.</p>

        <p>If the self-service cancellation option is temporarily unavailable, users may contact <strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong> for assistance.</p>

        <h3>6.2 Cancellation during the free trial</h3>

        <p>If a user cancels before the seven-day trial expires, the subscription will not convert into a paid plan and no trial-related subscription charge will be collected.</p>

        <h3>6.3 Cancellation after payment</h3>

        <p>If a user cancels an active paid subscription, cancellation prevents future automatic renewals.</p>

        <p>Unless a refund, statutory remedy, or different arrangement applies, Premium access remains available until the end of the current paid billing period.</p>

        <h3>6.4 Return to Free</h3>

        <p>After Premium access expires, the account returns to the permanent Free Plan.</p>

        <p>Users retain access to Free features, subject to the Terms of Service.</p>

        <p>Previously exhausted ten-minute allowances do not reset merely because a Premium subscription expires.</p>

        <h3>6.5 Account deletion</h3>

        <p>Deleting a Hockey Beats account and canceling a subscription are distinct actions unless the implemented billing process expressly combines them.</p>

        <p>Users should cancel an active subscription through the available billing management process before deleting their account.</p>

        <p>Where applicable law or the implemented account-deletion workflow requires us to prevent further billing, we will comply with those obligations.</p>

        <p>We will not knowingly continue unauthorized recurring charges following a valid cancellation.</p>

        <h2>7. Subscription Price Changes</h2>

        <h3>7.1 Right to propose price changes</h3>

        <p>Hockey Beats may change the standard prices of Premium Monthly or Premium Yearly.</p>

        <p>A subscription&apos;s original price is not automatically guaranteed for the lifetime of the customer&apos;s account.</p>

        <p>However, changes affecting existing subscriptions must comply with the applicable contract and mandatory consumer protection law.</p>

        <h3>7.2 New customers</h3>

        <p>A new standard price may apply to new subscriptions from the date the revised price becomes effective.</p>

        <p>The price will be disclosed before purchase.</p>

        <h3>7.3 Existing subscribers</h3>

        <p>We will notify affected existing subscribers by email at least <strong>30 days before</strong> a proposed recurring price increase.</p>

        <p>The notice will identify:</p>

        <ul>
          <li>The current price.</li>
          <li>The proposed new price.</li>
          <li>The intended effective date.</li>
          <li>The relevant billing cycle.</li>
          <li>The available cancellation options.</li>
          <li>Any action required to accept the change.</li>
        </ul>

        <h3>7.4 When the new price applies</h3>

        <p>A price increase will not be applied retroactively to an already-paid billing period.</p>

        <p>Where lawfully implemented, a revised price will apply no earlier than the relevant subscription renewal date after the required notice period.</p>

        <h3>7.5 Customer consent</h3>

        <p>Where applicable law requires express agreement to a price increase, we will obtain that agreement before collecting the increased amount.</p>

        <p>Silence, inactivity, or failure to cancel will not be treated as express consent where express consent is legally required.</p>

        <p>If the customer does not agree to a proposed price change, the existing subscription will be handled in accordance with applicable law and contractual rights.</p>

        <p>We will not charge an increased amount without a valid legal basis.</p>

        <h3>7.6 Annual subscriptions</h3>

        <p>For an annual subscriber, an increased annual price will not be charged during an already-paid annual billing period.</p>

        <p>Any lawful increase will take effect no earlier than the applicable future renewal.</p>

        <h3>7.7 Lifetime Pass</h3>

        <p>Price changes to Monthly or Yearly subscriptions do not affect the entitlement granted under a valid Lifetime Pass.</p>

        <h2>8. Voluntary Seven-Day Refund Guarantee</h2>

        <h3>8.1 Overview</h3>

        <p>Hockey Beats offers a voluntary <strong>seven-day full-refund guarantee</strong> for an eligible initial paid Premium subscription purchase.</p>

        <p>This is an additional commercial benefit and does not replace statutory consumer rights.</p>

        <h3>8.2 When the guarantee starts</h3>

        <p>The seven-day guarantee begins when the <strong>first paid Premium subscription charge is successfully collected</strong>.</p>

        <p>It does not begin when the free trial is activated.</p>

        <p>For example, if a user starts a seven-day trial and is charged after the trial ends, the voluntary refund guarantee begins on the date of that first successful charge.</p>

        <h3>8.3 Eligible purchases</h3>

        <p>The guarantee applies to an eligible initial paid Premium Monthly or Premium Yearly subscription purchase.</p>

        <p>It is not automatically renewed for every subsequent recurring billing period.</p>

        <p>Any different refund terms for a special offer must be clearly disclosed before purchase and cannot remove mandatory statutory rights.</p>

        <h3>8.4 How to request a refund</h3>

        <p>To request a refund under the voluntary guarantee, contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>The request should identify the relevant account or transaction sufficiently for us to locate the payment.</p>

        <p>Users should not send full payment card details by email.</p>

        <p>A request made within the seven-day guarantee period will be assessed under this guarantee.</p>

        <h3>8.5 Refund amount</h3>

        <p>An approved request under the voluntary guarantee results in a refund of the full eligible initial subscription payment, including the VAT included in that payment.</p>

        <p>We will not deduct a discretionary cancellation fee from the guaranteed refund.</p>

        <h3>8.6 Refund processing</h3>

        <p>Refunds will be issued through the original payment method unless another method is lawfully agreed.</p>

        <p>Processing times may depend on the payment provider and financial institution.</p>

        <p>Any legally prescribed refund deadlines take precedence.</p>

        <h3>8.7 Effect on Premium access</h3>

        <p>Following a full refund under the voluntary guarantee, the related paid Premium entitlement may be terminated and the account returned to the Free Plan.</p>

        <p>This does not affect any separate valid entitlement or mandatory statutory right.</p>

        <h3>8.8 Abuse prevention</h3>

        <p>We may take proportionate measures to prevent fraudulent or repeated abuse of a promotional refund offer.</p>

        <p>Such measures will not be used to deny a valid statutory refund, withdrawal right, or other mandatory consumer remedy.</p>

        <h2>9. Statutory Withdrawal Rights</h2>

        <h3>9.1 General principle</h3>

        <p>Consumers purchasing digital content or digital services at a distance may have a statutory right to withdraw from the contract, including under applicable European Union consumer protection law.</p>

        <p>The availability, duration, starting point, and consequences of that right depend on the nature of the contract and the applicable legal requirements.</p>

        <h3>9.2 Fourteen-day withdrawal period</h3>

        <p>Where the statutory withdrawal right applies, eligible EU consumers generally have a <strong>14-day withdrawal period</strong>, subject to the rules and exceptions established by applicable law.</p>

        <p>The exact legal treatment may differ between a digital service contract and a contract for digital content not supplied on a tangible medium.</p>

        <h3>9.3 Immediate performance</h3>

        <p>If digital performance begins during the statutory withdrawal period, any effect on the withdrawal right depends on whether the conditions required by applicable law have been satisfied.</p>

        <p>Where express consent, an express request for immediate performance, an acknowledgment of the consequences, or contractual confirmation is required, the relevant steps must be completed in the legally prescribed manner.</p>

        <p>Accepting the Terms of Service or this Policy alone does not automatically waive statutory withdrawal rights.</p>

        <h3>9.4 Exercising withdrawal rights</h3>

        <p>Where a statutory withdrawal right applies, users may exercise it by sending an unequivocal withdrawal statement to:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Users may use the following wording:</p>

        <p>&quot;I hereby withdraw from my contract for Hockey Beats Premium.&quot;</p>

        <p>The request should include enough information to identify the relevant contract.</p>

        <p>Where required by law, we will provide any prescribed model withdrawal form and other withdrawal information before the user is bound by the contract.</p>

        <h3>9.5 Refunds following statutory withdrawal</h3>

        <p>Where withdrawal is valid, any refund, permitted proportional charge, timing requirement, and payment method will be determined by applicable law.</p>

        <p>The voluntary seven-day refund guarantee does not shorten a statutory withdrawal period or remove any other statutory remedy.</p>

        <h2>10. Non-Conforming or Unavailable Digital Services</h2>

        <p>Users may have statutory remedies if paid digital content or services fail to conform to the contract or applicable legal requirements.</p>

        <p>Depending on the circumstances and applicable law, remedies may include:</p>

        <ul>
          <li>Bringing the digital service into conformity.</li>
          <li>A proportionate price reduction.</li>
          <li>Contract termination.</li>
          <li>Reimbursement.</li>
          <li>Other mandatory legal remedies.</li>
        </ul>

        <p>A failure caused by Hockey Beats or a provider acting on our behalf is not automatically excluded from our responsibility.</p>

        <p>Users can report technical or contractual issues to <strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong>.</p>

        <p>We will address such reports in accordance with applicable law.</p>

        <h2>11. Promotional Codes</h2>

        <p>Hockey Beats may issue promotional codes granting complimentary Premium access.</p>

        <h3>11.1 One-month code</h3>

        <p>An eligible code may provide <strong>one month of Premium access free of charge</strong>.</p>

        <h3>11.2 Three-month code</h3>

        <p>An eligible code may provide <strong>three months of Premium access free of charge</strong>.</p>

        <h3>11.3 No automatic charges</h3>

        <p>One-month and three-month complimentary codes do <strong>not</strong> automatically convert into paid subscriptions.</p>

        <p>When complimentary access expires, the account returns to the Free Plan unless the user has separately and expressly purchased a paid subscription.</p>

        <p>Redeeming a complimentary code does not itself authorize a future charge.</p>

        <h3>11.4 Promotional restrictions</h3>

        <p>Codes may be subject to disclosed validity dates, eligibility requirements, usage limits, and other material conditions.</p>

        <p>Invalid or fraudulently obtained codes may be rejected.</p>

        <p>Promotional restrictions will not override mandatory statutory rights.</p>

        <h2>12. Lifetime Pass</h2>

        <p>Hockey Beats may issue or sell a Lifetime Pass.</p>

        <p>Unless expressly stated otherwise in the relevant offer, a valid Lifetime Pass provides access to:</p>

        <ul>
          <li>All current Premium games.</li>
          <li>Future Premium games made available as part of Hockey Beats.</li>
          <li>Current Premium features.</li>
          <li>Future Premium features made available as part of Hockey Beats.</li>
        </ul>

        <p>The Lifetime Pass remains valid for the <strong>operational lifetime of the Hockey Beats Service</strong>, not for the individual user&apos;s lifetime.</p>

        <p>The Lifetime Pass does not guarantee that the Service will operate indefinitely.</p>

        <p>It does not automatically include external music subscriptions, unrelated third-party purchases, or separately operated products.</p>

        <h3>12.1 Service changes or discontinuation</h3>

        <p>If Hockey Beats is materially modified or discontinued, Lifetime Pass holders retain any rights and remedies arising under the applicable contract and mandatory consumer law.</p>

        <h3>12.2 Refunds and withdrawal</h3>

        <p>Purchased Lifetime Passes are subject to any applicable statutory withdrawal, conformity, and refund rights.</p>

        <p>The voluntary seven-day refund guarantee for an initial paid Premium subscription does not automatically extend to a separately purchased Lifetime Pass unless the applicable offer expressly provides for it.</p>

        <p>Any material Lifetime Pass conditions must be disclosed before purchase or redemption.</p>

        <h2>13. Club Discounts and Group Licenses</h2>

        <h3>13.1 Individual club codes</h3>

        <p>Hockey Beats may provide discount codes to sports clubs and organizations for use by eligible individual members.</p>

        <p>The applicable discount, duration, eligibility conditions, and renewal price will be disclosed before purchase.</p>

        <h3>13.2 Bulk licenses</h3>

        <p>Clubs, teams, schools, and organizations may purchase multiple Premium entitlements under a group licensing arrangement.</p>

        <p>The relevant offer or separate agreement will specify:</p>

        <ul>
          <li>The number of licenses.</li>
          <li>The price and applicable discounts.</li>
          <li>The duration of access.</li>
          <li>License assignment and management.</li>
          <li>Renewal conditions.</li>
          <li>Cancellation arrangements.</li>
          <li>Any material restrictions.</li>
        </ul>

        <h3>13.3 Consumer and business purchases</h3>

        <p>The legal rights applicable to a group purchase depend on the identity and legal status of the purchaser and the circumstances of the transaction.</p>

        <p>Nothing in this Policy excludes mandatory consumer protections where they apply.</p>

        <h2>14. Third-Party Music Subscriptions</h2>

        <p>Hockey Beats Premium does not include Apple Music, Spotify Premium, or another third-party music subscription.</p>

        <p>Users are responsible for any subscription required by their chosen music provider.</p>

        <p>Music integrations may be subject to geographic, technical, contractual, and licensing restrictions.</p>

        <p>Refunds for subscriptions purchased directly from Apple, Spotify, or another external provider are governed by the applicable provider&apos;s terms and mandatory law.</p>

        <p>Hockey Beats does not promise that a third-party integration will remain available where continued operation would violate applicable law or licensing requirements.</p>

        <p>Any material effect on a purchased Hockey Beats digital service remains subject to applicable consumer rights.</p>

        <h2>15. Payment Processing and Security</h2>

        <p>When paid subscriptions become available, Hockey Beats may use a third-party payment processor, including Stripe.</p>

        <p>The payment provider will be identified during checkout.</p>

        <p>Payment processing and payment-related personal data will be handled in accordance with applicable law and the relevant Privacy Policy.</p>

        <p>Hockey Beats will not represent that a particular payment integration is operational before it has been implemented.</p>

        <p>Users should never send complete payment card details by email.</p>

        <h2>16. Billing Errors and Unauthorized Charges</h2>

        <p>If a user believes a payment was incorrect or unauthorized, they should contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>We will investigate billing concerns and provide any refund or remedy required by applicable law.</p>

        <p>Nothing in this Policy limits rights available through the user&apos;s payment service provider, card issuer, or applicable payment services legislation.</p>

        <h2>17. Account Deletion and Billing</h2>

        <p>Users may request account deletion through the available account settings.</p>

        <p>Deleting an account and canceling a subscription are distinct actions unless the implemented billing workflow expressly combines them.</p>

        <p>Before account deletion, users should cancel any active recurring subscription through the available billing management process.</p>

        <p>Where we are legally required to stop billing, terminate an associated contract, or provide another remedy following a valid request, we will comply.</p>

        <p>We will not knowingly continue charges without valid authorization.</p>

        <p>Account deletion and personal data retention are further explained in the Privacy Policy.</p>

        <h2>18. Changes to This Policy</h2>

        <p>We may update this Policy to reflect changes in pricing, billing functionality, legal requirements, or business operations.</p>

        <p>The current version and effective date will be published on our website.</p>

        <p>Where changes materially affect existing contractual rights or obligations, we will provide the notice, consent, and termination options required by applicable law.</p>

        <p>Changes will not retroactively remove accrued rights or mandatory consumer remedies.</p>

        <h2>19. Governing Law</h2>

        <p>This Policy is governed by the laws of the Slovak Republic, subject to mandatory consumer protection and conflict-of-law rules.</p>

        <p>Consumers habitually resident in another country retain any mandatory protections applicable under relevant law.</p>

        <p>Nothing in this Policy limits legally available court jurisdiction or dispute resolution rights.</p>

        <h2>20. Contact and Support</h2>

        <p>For subscription questions, cancellations, refunds, billing issues, or complaints, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Subscription, Cancellation &amp; Refund Policy — Version 1.0</strong></p>
      </main>
    </div>
  );
}
