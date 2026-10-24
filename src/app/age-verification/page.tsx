import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Age Verification, Parental Consent & Premium Checkout',
};

export default function AgeVerificationPage() {
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
        <h1>Age Verification, Parental Consent &amp; Premium Checkout</h1>
        <h2>UX Copy &amp; Implementation Specification</h2>

        <p><strong>Version:</strong> 1.0<br />
        <strong>Date:</strong> 24 October 2026<br />
        <strong>Platform:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a><br />
        <strong>Operator:</strong> DRIXTON s. r. o.</p>

        <hr />

        <h2>1. Purpose</h2>

        <p>This document defines the registration, parental authorization, subscription checkout, and cancellation experience for Hockey Beats.</p>

        <p>The objectives are to:</p>

        <ul>
          <li>Protect children and teenagers using Hockey Beats.</li>
          <li>Prevent registration by users under 13.</li>
          <li>Obtain appropriate parental authorization for users aged 13–15.</li>
          <li>Distinguish parental permission from GDPR consent.</li>
          <li>Prevent unauthorized purchases and recurring payments.</li>
          <li>Clearly communicate the seven-day Premium free trial.</li>
          <li>Make subscription cancellation straightforward.</li>
          <li>Preserve applicable consumer and data protection rights.</li>
        </ul>

        <p>The user experience should remain simple, accessible, and understandable to younger players.</p>

        <p>Age-related safeguards must be enforced by the backend, not only by interface text.</p>

        <hr />

        <h1>PART A — ACCOUNT REGISTRATION</h1>

        <h2>2. Registration Screen</h2>

        <p><strong>Heading</strong></p>
        <p>Create your Hockey Beats account</p>

        <p><strong>Description</strong></p>
        <p>Join Hockey Beats, improve your hockey skills, earn XP, unlock achievements, and play interactive hockey games.</p>

        <p><strong>Registration options</strong></p>
        <ul>
          <li>Continue with Google</li>
          <li>Continue with Apple</li>
          <li>Continue with Email</li>
        </ul>

        <p><strong>Age information</strong></p>
        <p>Hockey Beats is available to players aged 13 and older. Players aged 13–15 need permission from a parent or legal guardian.</p>

        <p><strong>Legal notice</strong></p>
        <p>By creating an account, you agree to our Terms of Service and acknowledge our Privacy Policy.</p>

        <p><strong>Links</strong></p>
        <ul>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
          <li>Children&apos;s Privacy Notice</li>
        </ul>

        <p><strong>Primary button</strong></p>
        <p>Continue</p>

        <h3>Implementation requirements</h3>

        <ul>
          <li>Do not preselect optional marketing or privacy consent.</li>
          <li>Do not use a general Terms checkbox as a substitute for legally required GDPR consent.</li>
          <li>Apply the same age restrictions to email, Google, and Apple registration.</li>
          <li>Do not grant unrestricted account access before required age and authorization checks are complete.</li>
        </ul>

        <hr />

        <h2>3. Age Confirmation</h2>

        <p><strong>Heading</strong></p>
        <p>How old are you?</p>

        <p><strong>Description</strong></p>
        <p>We ask your age to help keep Hockey Beats safe and provide the right experience for every player.</p>

        <p><strong>Input</strong></p>
        <p>Date of birth</p>

        <p><strong>Primary button</strong></p>
        <p>Continue</p>

        <p><strong>Privacy explanation</strong></p>
        <p>We use your age information to check eligibility and apply age-appropriate protections. Learn more in our Privacy Policy.</p>

        <h3>Age-based behavior</h3>

        <table>
          <thead><tr><th>Age</th><th>Registration outcome</th></tr></thead>
          <tbody>
            <tr><td>Under 13</td><td>Registration blocked</td></tr>
            <tr><td>13–15</td><td>Parent or guardian authorization flow</td></tr>
            <tr><td>16–17</td><td>Registration allowed, with applicable minor safeguards</td></tr>
            <tr><td>18+</td><td>Standard registration</td></tr>
          </tbody>
        </table>

        <h3>Technical requirements</h3>

        <p>The server must calculate age from the supplied date of birth.</p>

        <p>The application should collect and retain only the age-related information necessary for eligibility, legal compliance, and protection against circumvention.</p>

        <p>Access to date-of-birth information must be restricted.</p>

        <p>Age information must not appear on public profiles or leaderboards.</p>

        <p>Where legally necessary, the applicable age threshold must be determined by the user&apos;s jurisdiction rather than assuming Slovak rules apply everywhere.</p>

        <hr />

        <h2>4. Under-13 Screen</h2>

        <p><strong>Heading</strong></p>
        <p>Hockey Beats is for players aged 13 and older</p>

        <p><strong>Description</strong></p>
        <p>Sorry, you need to be at least 13 years old to create a Hockey Beats account.</p>
        <p>You can come back when you&apos;re old enough to join.</p>

        <p><strong>Button</strong></p>
        <p>Back to Homepage</p>

        <h3>Implementation requirements</h3>

        <ul>
          <li>Do not create an active player account.</li>
          <li>Do not offer a checkbox to bypass the restriction.</li>
          <li>Do not invite the child to enter a parent&apos;s email to bypass the minimum age.</li>
          <li>Minimize any information retained from the unsuccessful registration attempt.</li>
        </ul>

        <hr />

        <h1>PART B — PARENTAL AUTHORIZATION</h1>

        <h2>5. Registration for Players Aged 13–15</h2>

        <p><strong>Heading</strong></p>
        <p>Let&apos;s get your parent or guardian involved</p>

        <p><strong>Description</strong></p>
        <p>You&apos;re almost ready to join Hockey Beats!</p>
        <p>Because you&apos;re under 16, we need permission from your parent or legal guardian before you can start playing.</p>

        <p><strong>Input</strong></p>
        <p>Parent or guardian&apos;s email address</p>

        <p><strong>Primary button</strong></p>
        <p>Send Permission Request</p>

        <p><strong>Secondary button</strong></p>
        <p>Back</p>

        <p><strong>Additional information</strong></p>
        <p>We&apos;ll send your parent or guardian an email explaining Hockey Beats and how to review your request.</p>

        <h3>Implementation requirements</h3>

        <ul>
          <li>Create a pending registration request, not an unrestricted active account.</li>
          <li>Use the parent&apos;s email only for the authorization process and related necessary communications.</li>
          <li>Apply reasonable rate limits to prevent email abuse.</li>
          <li>Do not use the parent&apos;s email for marketing without a separate lawful basis.</li>
          <li>Do not expose a child&apos;s personal information unnecessarily in the email.</li>
          <li>Record the status and outcome of the authorization request.</li>
        </ul>

        <hr />

        <h2>6. Child&apos;s Pending Approval Screen</h2>

        <p><strong>Heading</strong></p>
        <p>Permission request sent!</p>

        <p><strong>Description</strong></p>
        <p>We&apos;ve sent an email to your parent or guardian.</p>
        <p>Once they&apos;ve reviewed and approved your request, we&apos;ll let you know when your Hockey Beats account is ready.</p>

        <p><strong>Status</strong></p>
        <p>Waiting for parent or guardian approval</p>

        <p><strong>Actions</strong></p>
        <ul>
          <li>Resend Email</li>
          <li>Change Parent&apos;s Email</li>
          <li>Back to Homepage</li>
        </ul>

        <p><strong>Additional information</strong></p>
        <p>Ask your parent or guardian to check their inbox and spam folder.</p>

        <h3>Implementation requirements</h3>

        <p>The resend action must be rate-limited.</p>

        <p>The authorization link must be unique, time-limited, and resistant to guessing or reuse.</p>

        <p>Pending accounts must not have unrestricted access to account-based features.</p>

        <p>Expired or rejected requests must be handled according to a documented deletion schedule.</p>

        <hr />

        <h2>7. Parental Authorization Email</h2>

        <p><strong>Subject:</strong> Your permission is requested for Hockey Beats</p>

        <p>Hello,</p>

        <p>A young player has requested permission to create a Hockey Beats account using your email address as their parent or legal guardian contact.</p>

        <p>Hockey Beats is an interactive hockey training platform that combines physical skills, camera-based gameplay, achievements, and optional music integrations.</p>

        <p>Hockey Beats is available to players aged 13 and older. Players aged 13–15 require parental or guardian permission.</p>

        <p>Before making a decision, please review:</p>

        <ul>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
          <li>Parental Consent &amp; Children&apos;s Privacy Notice</li>
        </ul>

        <p><strong>Review Permission Request</strong></p>

        <p>If you did not expect this email or do not recognize the request, you can ignore it or contact studio@drixton.com.</p>

        <p>Receiving this email does not create a paid subscription or authorize any payment.</p>

        <p>Thank you,<br />
        <strong>The Hockey Beats Team</strong><br />
        studio@drixton.com</p>

        <hr />

        <h2>8. Parent Review Screen</h2>

        <p><strong>Heading</strong></p>
        <p>Review your child&apos;s Hockey Beats request</p>

        <p><strong>Description</strong></p>
        <p>A young player has asked for your permission to join Hockey Beats.</p>
        <p>Before approving, please review how the platform works and how your child&apos;s information will be used.</p>

        <h3>What your child can do</h3>

        <ul>
          <li>Play interactive hockey training games.</li>
          <li>Use camera-based ball tracking.</li>
          <li>Earn XP and achievements.</li>
          <li>Appear on leaderboards under a username.</li>
          <li>Use supported music integrations.</li>
          <li>Access Free games and eligible Premium game previews.</li>
        </ul>

        <h3>How camera tracking works</h3>

        <p>Hockey Beats processes camera frames locally in the browser for ball tracking. Raw camera video is not uploaded to Hockey Beats servers as part of this functionality.</p>

        <h3>What information may be stored</h3>

        <p>Account information, username, gameplay progress, scores, achievements, preferences, and limited website usage information.</p>

        <h3>What you are authorizing</h3>

        <p><strong>Permission to use Hockey Beats</strong></p>
        <p>I confirm that I am the child&apos;s parent or legal guardian and authorize the child to use Hockey Beats under the applicable Terms of Service.</p>

        <p><strong>Data processing consent, where legally required</strong></p>
        <p>I have reviewed the Children&apos;s Privacy Notice and authorize the specifically described consent-based processing activities identified in this authorization process.</p>

        <p>This second choice must only be presented where consent is the applicable legal basis. Any separate optional processing requiring consent must be described and controlled independently.</p>

        <p><strong>Primary button</strong></p>
        <p>Approve Request</p>

        <p><strong>Secondary button</strong></p>
        <p>Decline Request</p>

        <p><strong>Privacy note</strong></p>
        <p>Approving account access does not authorize Premium purchases, recurring payments, or use of your payment method.</p>

        <h3>Verification requirements</h3>

        <p>The approval link alone must not automatically be treated as sufficient proof of parental responsibility in every situation.</p>

        <p>The implementation must use a risk-appropriate process to take reasonable steps to verify parental authorization, taking into account available technology and applicable law.</p>

        <p>The selected method must be assessed before launch. Possible approaches may include verified parent accounts and additional confirmation steps where necessary.</p>

        <p>Avoid collecting identity documents unless genuinely necessary and supported by an appropriate legal basis and safeguards.</p>

        <hr />

        <h2>9. Parent Approval Confirmation</h2>

        <p><strong>Heading</strong></p>
        <p>Permission approved</p>

        <p><strong>Description</strong></p>
        <p>Thank you for reviewing the request.</p>
        <p>The player&apos;s Hockey Beats account can now be activated, subject to completion of the required verification steps.</p>
        <p>You can contact us at any time with questions about your child&apos;s account or personal information.</p>

        <p><strong>Button</strong></p>
        <p>Done</p>

        <p><strong>Additional notice</strong></p>
        <p>This approval does not authorize paid subscriptions or recurring charges.</p>

        <hr />

        <h2>10. Parent Declines Request</h2>

        <p><strong>Heading</strong></p>
        <p>Request declined</p>

        <p><strong>Description</strong></p>
        <p>You&apos;ve declined this Hockey Beats registration request.</p>
        <p>The player will not receive access through this request.</p>
        <p>If you have questions or would like to discuss your child&apos;s information, contact studio@drixton.com.</p>

        <p><strong>Button</strong></p>
        <p>Done</p>

        <hr />

        <h2>11. Child Receives Approval</h2>

        <p><strong>Email subject:</strong> You&apos;re ready to join Hockey Beats!</p>

        <p><strong>Email body</strong></p>

        <p>Good news!</p>

        <p>Your parent or guardian has approved your Hockey Beats account request.</p>

        <p>You can now complete your registration and start playing.</p>

        <p><strong>Complete Registration</strong></p>

        <p>See you on the field!<br />
        <strong>The Hockey Beats Team</strong></p>

        <h3>Technical requirements</h3>

        <p>Before activation, the system must confirm that the relevant authorization is valid, current, and associated with the correct pending registration.</p>

        <p>An approval should not be reusable to activate unrelated accounts.</p>

        <hr />

        <h1>PART C — PREMIUM SUBSCRIPTIONS</h1>

        <h2>12. Premium Plan Selection</h2>

        <p><strong>Heading</strong></p>
        <p>Unlock Hockey Beats Premium</p>

        <p><strong>Description</strong></p>
        <p>Play every Premium game, improve your skills, and enjoy unlimited Premium gameplay.</p>

        <p><strong>Premium Monthly</strong></p>
        <p>€8.45/month</p>

        <p><strong>Premium Yearly</strong></p>
        <p>€79.99/year</p>
        <p>Save approximately 21% compared with monthly billing.</p>

        <p><strong>Included</strong></p>
        <ul>
          <li>All current Premium games.</li>
          <li>New Premium games as they become available.</li>
          <li>Unlimited Premium gameplay.</li>
          <li>Full Premium access during your subscription.</li>
        </ul>

        <p><strong>Trial message</strong></p>
        <p>Start with 7 days free.</p>

        <p><strong>Primary button</strong></p>
        <p>Start 7-Day Free Trial</p>

        <p><strong>Additional note</strong></p>
        <p>Your selected plan starts automatically after the trial unless you cancel before it ends.</p>

        <h3>Important</h3>

        <p>The checkout must not suggest that features already available in the Free Plan require Premium.</p>

        <p>Remote Phone Camera, XP, achievements, leaderboards, and supported music integrations remain available to eligible Free users.</p>

        <hr />

        <h2>13. Premium Checkout — Adult Purchaser</h2>

        <p><strong>Heading</strong></p>
        <p>Start your 7-day Premium free trial</p>

        <p><strong>Selected plan</strong></p>
        <p>Premium Monthly — €8.45/month</p>
        <p><em>or</em></p>
        <p>Premium Yearly — €79.99/year</p>

        <p><strong>Today</strong></p>
        <p>€0.00</p>

        <p><strong>Free trial</strong></p>
        <p>7 days</p>

        <p><strong>First payment</strong></p>
        <p>[Exact date] — [Exact amount]</p>

        <p><strong>Renewal</strong></p>
        <p>Your subscription will automatically renew every month or year, depending on your selected plan, until canceled.</p>

        <p><strong>Cancellation</strong></p>
        <p>Cancel anytime before your free trial ends to avoid the first charge.</p>

        <p><strong>Refund information</strong></p>
        <p>Your eligible first paid Premium subscription purchase is covered by our voluntary 7-day full-refund guarantee, in addition to applicable statutory rights.</p>

        <p><strong>Payment method</strong></p>
        <p>[Secure payment form]</p>

        <p><strong>Required acknowledgment</strong></p>
        <p>I understand that my selected subscription will automatically become paid after the 7-day free trial unless I cancel before the trial ends. I authorize the recurring payments shown above.</p>

        <p><strong>Primary button</strong></p>
        <p>Start Free Trial — Pay After 7 Days</p>

        <p><strong>Links</strong></p>
        <ul>
          <li>Subscription, Cancellation &amp; Refund Policy</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>

        <h3>Technical requirements</h3>

        <ul>
          <li>Show the actual calendar date of the first charge.</li>
          <li>Show the exact amount and billing frequency.</li>
          <li>Do not preselect optional marketing consent.</li>
          <li>Use an explicit payment-obligation confirmation where legally required.</li>
          <li>Do not hide renewal information in linked policies.</li>
          <li>Save a record of the applicable offer, terms version, and subscription authorization.</li>
          <li>Ensure the trial is created only after the required checkout authorization is completed.</li>
        </ul>

        <hr />

        <h2>14. Premium Checkout for a Minor</h2>

        <p>Where the purchaser is not legally capable of independently entering the proposed paid subscription, the purchase must be completed or validly authorized by a legally capable person.</p>

        <p><strong>Heading</strong></p>
        <p>Ask a parent or guardian to complete your purchase</p>

        <p><strong>Description</strong></p>
        <p>Premium is a paid subscription that automatically renews after the free trial.</p>
        <p>A parent or legal guardian may need to review and authorize the purchase before you can activate it.</p>

        <p><strong>Primary button</strong></p>
        <p>Ask Parent or Guardian</p>

        <p><strong>Secondary button</strong></p>
        <p>Continue with Free</p>

        <h3>Parent purchase screen</h3>

        <p><strong>Heading</strong></p>
        <p>Review this Premium subscription</p>

        <p><strong>Description</strong></p>
        <p>You are reviewing a paid Hockey Beats subscription for a younger player.</p>

        <p><strong>Selected plan</strong></p>
        <p>[Premium Monthly / Premium Yearly]</p>

        <p><strong>Free trial</strong></p>
        <p>7 days</p>

        <p><strong>First payment</strong></p>
        <p>[Exact date and amount]</p>

        <p><strong>Recurring payments</strong></p>
        <p>[Monthly / Yearly]</p>

        <p><strong>Required acknowledgment</strong></p>
        <p>I confirm that I am legally authorized to make this purchase and authorize the recurring payments described above.</p>

        <p><strong>Primary button</strong></p>
        <p>Authorize Subscription — Pay After 7 Days</p>

        <h3>Implementation requirements</h3>

        <p>Parental permission to use the Service must not be reused as payment authorization.</p>

        <p>The payment authorization must relate to the specific subscription, amount, billing cycle, and renewal terms.</p>

        <p>The purchaser must be able to review the purchase and receive the legally required confirmation.</p>

        <p>The system must not allow a child to bypass required purchase authorization merely by selecting a checkbox.</p>

        <hr />

        <h1>PART D — SUBSCRIPTION MANAGEMENT</h1>

        <h2>15. Trial Activated</h2>

        <p><strong>Heading</strong></p>
        <p>Your Premium trial is active!</p>

        <p><strong>Description</strong></p>
        <p>Enjoy seven days of full Premium access.</p>

        <p><strong>Trial ends</strong></p>
        <p>[Exact date]</p>

        <p><strong>First scheduled payment</strong></p>
        <p>[Exact date and amount]</p>

        <p><strong>Selected plan</strong></p>
        <p>[Monthly / Yearly]</p>

        <p><strong>Primary button</strong></p>
        <p>Start Playing</p>

        <p><strong>Secondary button</strong></p>
        <p>Manage Subscription</p>

        <p><strong>Important note</strong></p>
        <p>Cancel before your trial ends to avoid being charged.</p>

        <hr />

        <h2>16. Subscription Settings</h2>

        <p><strong>Heading</strong></p>
        <p>Manage Subscription</p>

        <p><strong>Current plan</strong></p>
        <p>Premium Monthly / Premium Yearly</p>

        <p><strong>Status</strong></p>
        <p>Free Trial / Active / Canceled / Expired</p>

        <p><strong>Next payment</strong></p>
        <p>[Exact date and amount, if applicable]</p>

        <p><strong>Billing frequency</strong></p>
        <p>Monthly / Yearly</p>

        <p><strong>Actions</strong></p>
        <ul>
          <li>Manage Payment Method</li>
          <li>View Billing History</li>
          <li>Cancel Subscription</li>
        </ul>

        <p><strong>Support</strong></p>
        <p>Need help? Contact studio@drixton.com.</p>

        <h3>Technical requirements</h3>

        <p>Subscription status must come from verified backend billing records.</p>

        <p>Do not rely solely on frontend state or a successful checkout redirect.</p>

        <p>A canceled subscription must not be displayed as active with future renewal enabled.</p>

        <p>Users must be able to identify whether a future payment is scheduled.</p>

        <hr />

        <h2>17. Cancel During Free Trial</h2>

        <p><strong>Heading</strong></p>
        <p>Cancel your Premium free trial?</p>

        <p><strong>Description</strong></p>
        <p>If you cancel now, your subscription will not become paid when the trial ends.</p>
        <p>You won&apos;t be charged for this trial.</p>

        <p><strong>Primary button</strong></p>
        <p>Confirm Cancellation</p>

        <p><strong>Secondary button</strong></p>
        <p>Keep My Trial</p>

        <p>Do not use confusing button labels or unnecessary cancellation obstacles.</p>

        <h3>Confirmation screen</h3>

        <p><strong>Heading</strong></p>
        <p>Your trial has been canceled</p>

        <p><strong>Description</strong></p>
        <p>Your Premium subscription will not automatically convert into a paid plan.</p>
        <p>No subscription charge will be collected for this trial.</p>
        <p>Your Free Hockey Beats account remains available.</p>

        <p><strong>Button</strong></p>
        <p>Back to Hockey Beats</p>

        <hr />

        <h2>18. Cancel Paid Subscription</h2>

        <p><strong>Heading</strong></p>
        <p>Cancel your Premium subscription?</p>

        <p><strong>Description</strong></p>
        <p>You can cancel your subscription at any time.</p>
        <p>Cancellation stops future automatic renewals.</p>
        <p>Unless a refund or statutory remedy applies, you&apos;ll keep Premium access until the end of your current paid period.</p>

        <p><strong>Premium access until</strong></p>
        <p>[Exact date]</p>

        <p><strong>Primary button</strong></p>
        <p>Confirm Cancellation</p>

        <p><strong>Secondary button</strong></p>
        <p>Keep Premium</p>

        <h3>Confirmation screen</h3>

        <p><strong>Heading</strong></p>
        <p>Your subscription has been canceled</p>

        <p><strong>Description</strong></p>
        <p>Your subscription will not renew.</p>
        <p>You can continue using Premium until [exact date], after which your account will return to Free.</p>

        <p><strong>Button</strong></p>
        <p>Done</p>

        <hr />

        <h1>PART E — REFUNDS AND WITHDRAWAL</h1>

        <h2>19. Voluntary Refund Request</h2>

        <p><strong>Heading</strong></p>
        <p>Request a Refund</p>

        <p><strong>Description</strong></p>
        <p>Eligible first paid Premium subscription purchases are covered by our voluntary seven-day full-refund guarantee.</p>
        <p>The guarantee begins when your first subscription payment is successfully collected, not when your free trial starts.</p>

        <p><strong>Displayed information</strong></p>
        <ul>
          <li>Purchase date.</li>
          <li>Amount paid.</li>
          <li>Eligibility status.</li>
          <li>Applicable guarantee deadline.</li>
        </ul>

        <p><strong>Primary button</strong></p>
        <p>Request Refund</p>

        <p><strong>Alternative</strong></p>
        <p>Contact studio@drixton.com.</p>

        <p><strong>Additional note</strong></p>
        <p>Your statutory consumer rights remain available independently of this guarantee.</p>

        <h3>Technical requirements</h3>

        <p>A refund request must not be rejected merely because the voluntary guarantee has expired if the user may still have a statutory withdrawal right or another legal remedy.</p>

        <p>The interface should distinguish voluntary refund requests from statutory withdrawal or non-conformity claims.</p>

        <hr />

        <h2>20. Statutory Withdrawal</h2>

        <p><strong>Heading</strong></p>
        <p>Exercise Your Right of Withdrawal</p>

        <p><strong>Description</strong></p>
        <p>Depending on the applicable law and the type of digital service purchased, you may have a statutory right to withdraw from your contract.</p>
        <p>You may submit an unequivocal withdrawal request through the available process or contact studio@drixton.com.</p>

        <p><strong>Primary button</strong></p>
        <p>Submit Withdrawal Request</p>

        <p><strong>Additional information</strong></p>
        <p>Any legal consequences of starting digital performance during the withdrawal period must be explained separately where required by law.</p>

        <h3>Implementation requirements</h3>

        <p>Before launching paid checkout, implement the legally required pre-contractual withdrawal information, any prescribed model form, and any necessary separate consent or acknowledgment.</p>

        <p>Do not use a blanket checkbox claiming that all statutory withdrawal rights are waived.</p>

        <hr />

        <h1>PART F — BACKEND AND SECURITY REQUIREMENTS</h1>

        <h2>21. Suggested Registration States</h2>

        <p>The backend should distinguish at least:</p>

        <table>
          <thead><tr><th>State</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td><code>pending_email_verification</code></td><td>Email registration awaits verification</td></tr>
            <tr><td><code>pending_parent_approval</code></td><td>Minor awaits required parental authorization</td></tr>
            <tr><td><code>parent_approval_rejected</code></td><td>Authorization declined</td></tr>
            <tr><td><code>active_free</code></td><td>Account eligible for Free access</td></tr>
            <tr><td><code>restricted</code></td><td>Account access restricted for a valid reason</td></tr>
            <tr><td><code>deletion_pending</code></td><td>Valid deletion request is being processed</td></tr>
          </tbody>
        </table>

        <p>The exact state model may differ, but users must not bypass required checks through OAuth, API requests, direct URLs, or client-side manipulation.</p>

        <h2>22. Suggested Subscription States</h2>

        <table>
          <thead><tr><th>State</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td><code>trialing</code></td><td>Seven-day Premium trial active</td></tr>
            <tr><td><code>active</code></td><td>Paid Premium subscription active</td></tr>
            <tr><td><code>cancel_at_period_end</code></td><td>Renewal disabled; current entitlement remains</td></tr>
            <tr><td><code>canceled</code></td><td>Subscription terminated</td></tr>
            <tr><td><code>past_due</code></td><td>Payment issue requiring appropriate handling</td></tr>
            <tr><td><code>expired</code></td><td>No active Premium entitlement</td></tr>
          </tbody>
        </table>

        <p>These are suggested application states, not necessarily the exact event or status names used by the payment processor.</p>

        <p>The backend must determine access using validated subscription and entitlement records.</p>

        <h2>23. Authorization Records</h2>

        <p>Where parental authorization is required, retain an appropriately protected record of:</p>

        <ul>
          <li>The account or pending registration concerned.</li>
          <li>The type and scope of authorization.</li>
          <li>The parent or guardian verification outcome.</li>
          <li>The relevant notice or policy version.</li>
          <li>The time of authorization.</li>
          <li>Any subsequent withdrawal or revocation.</li>
        </ul>

        <p>Where a payment is authorized, retain the relevant evidence of the subscription offer and payment authorization through the appropriate billing system.</p>

        <p>Do not store unnecessary identity information or full payment card numbers.</p>

        <p>Retention periods must be documented and justified.</p>

        <h2>24. Security Controls</h2>

        <p>The implementation should include:</p>

        <ul>
          <li>Secure, expiring authorization links.</li>
          <li>Rate limiting.</li>
          <li>Server-side eligibility checks.</li>
          <li>Appropriate access controls.</li>
          <li>Protection against account enumeration.</li>
          <li>Auditability of relevant authorization events.</li>
          <li>Verified payment webhooks.</li>
          <li>Idempotent billing event processing.</li>
          <li>Protection against duplicate subscription creation.</li>
          <li>Secure handling of canceled and expired entitlements.</li>
          <li>Appropriate data deletion and retention processes.</li>
        </ul>

        <h2>25. Parent and Child Privacy Requests</h2>

        <p>Parents and guardians should be able to contact:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>For:</p>

        <ul>
          <li>Questions about a child&apos;s account.</li>
          <li>Requests to review relevant information.</li>
          <li>Correction requests.</li>
          <li>Erasure requests.</li>
          <li>Withdrawal of consent where applicable.</li>
          <li>Reports of unauthorized registration or purchases.</li>
        </ul>

        <p>Requests must be handled with appropriate verification of identity and legal authority.</p>

        <p>A person claiming to be a parent must not automatically receive access to a child&apos;s personal data without verification.</p>

        <p>The child&apos;s rights and interests must also be considered.</p>

        <hr />

        <h1>PART G — IMPLEMENTATION ACCEPTANCE CHECKLIST</h1>

        <p>Before public launch, confirm:</p>

        <ul>
          <li>Users under 13 cannot register.</li>
          <li>Age checks apply to all registration methods.</li>
          <li>Users aged 13–15 enter a genuine authorization workflow.</li>
          <li>Required parental consent is verified appropriately.</li>
          <li>Unapproved minor accounts cannot bypass restrictions.</li>
          <li>Premium purchases by minors follow applicable legal-capacity rules.</li>
          <li>The seven-day trial is shown clearly before checkout.</li>
          <li>The first payment date and amount are displayed.</li>
          <li>Automatic renewal is expressly disclosed and authorized.</li>
          <li>Canceling before the trial ends prevents the first charge.</li>
          <li>Monthly and Yearly cancellation works.</li>
          <li>The seven-day voluntary refund guarantee is implemented.</li>
          <li>Statutory withdrawal rights are handled separately.</li>
          <li>Price increases are notified and authorized as legally required.</li>
          <li>Complimentary one-month and three-month codes do not autocharge.</li>
          <li>Remote Phone Camera remains available on the Free Plan.</li>
          <li>Account deletion and billing cancellation are coordinated.</li>
          <li>Required records are retained securely and only as long as justified.</li>
          <li>The deployed flows match the published legal policies.</li>
        </ul>

        <hr />

        <h2>26. Contact</h2>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of UX Copy &amp; Implementation Specification — Version 1.0</strong></p>
      </main>
    </div>
  );
}
