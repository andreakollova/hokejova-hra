import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Fair Play & Leaderboard Rules',
};

export default function FairPlayPage() {
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
        <h1>Fair Play &amp; Leaderboard Rules</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.1<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>Hockey Beats is an interactive hockey training platform that combines real-world hockey skills with rhythm-based gameplay, challenges, and player progression.</p>

        <p>Our goal is to make hockey training enjoyable, motivating, and fair for all players.</p>

        <p>These Fair Play &amp; Leaderboard Rules (&quot;Rules&quot;) explain how players are expected to participate in Hockey Beats, how scores and achievements are managed, and what happens when gameplay results are manipulated.</p>

        <p>These Rules apply to all Hockey Beats users, including Free users, Premium subscribers, promotional users, and players accessing the Service through participating clubs.</p>

        <p>These Rules supplement our Terms of Service.</p>

        <h2>2. Service Operator</h2>

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

        <h2>3. Fair Play Principles</h2>

        <p>Hockey Beats is designed to reward genuine hockey skills, coordination, practice, and improvement.</p>

        <p>Players are expected to:</p>

        <ul>
          <li>Participate in gameplay using the intended game mechanics.</li>
          <li>Earn scores and achievements through legitimate gameplay.</li>
          <li>Use camera tracking and other supported input methods as intended.</li>
          <li>Respect the integrity of leaderboards and challenges.</li>
          <li>Avoid exploiting technical errors or vulnerabilities.</li>
          <li>Use their own accounts and respect other players&apos; results.</li>
        </ul>

        <p>Fair play helps ensure that rankings remain meaningful and that every player has a reasonable opportunity to improve.</p>

        <h2>4. Gameplay and Score Calculation</h2>

        <p>Hockey Beats uses game-specific mechanics to calculate player performance.</p>

        <p>Depending on the game, scores may reflect factors such as:</p>

        <ul>
          <li>Successful ball movements.</li>
          <li>Accuracy.</li>
          <li>Timing.</li>
          <li>Completed challenges.</li>
          <li>Difficulty settings.</li>
          <li>Other gameplay-specific performance measures.</li>
        </ul>

        <p>Different games or difficulty levels may use different scoring methods.</p>

        <p>Scores are calculated through the relevant gameplay systems and may be stored in association with a player&apos;s account.</p>

        <p>We may improve scoring algorithms and game mechanics as Hockey Beats develops.</p>

        <p>Where changes materially affect existing rankings or gameplay progression, we will seek to communicate them appropriately.</p>

        <h2>5. Camera-Based Ball Tracking</h2>

        <p>Hockey Beats uses camera-based tracking to detect hockey ball movement.</p>

        <p>Under the current implementation, camera frames are processed locally in the browser.</p>

        <p>Raw camera video is not uploaded to or stored by Hockey Beats servers as part of ball tracking.</p>

        <p>Players are expected to use camera tracking honestly and as intended.</p>

        <p>The following activities are prohibited:</p>

        <ul>
          <li>Deliberately submitting fabricated tracking data.</li>
          <li>Using unauthorized scripts to simulate successful gameplay.</li>
          <li>Injecting false ball-position coordinates.</li>
          <li>Manipulating tracking systems to obtain unfair scores.</li>
          <li>Circumventing game mechanics through unauthorized technical methods.</li>
        </ul>

        <p>Normal camera calibration, device adjustments, and legitimate accessibility needs are not considered cheating merely because they affect how a player interacts with the game.</p>

        <h2>6. Remote Phone Camera</h2>

        <p>Remote Phone Camera allows a compatible phone to support gameplay by transmitting ball-tracking coordinates.</p>

        <p>The feature is available to both Free and Premium users.</p>

        <p>Players must not intentionally manipulate the transmitted coordinates or session information to generate false gameplay results.</p>

        <p>Technical limitations, connectivity problems, or ordinary tracking errors do not automatically constitute cheating.</p>

        <h2>7. Leaderboards</h2>

        <p>Hockey Beats may display player scores and usernames through leaderboards.</p>

        <p>Leaderboards are intended to:</p>

        <ul>
          <li>Encourage improvement.</li>
          <li>Recognize gameplay performance.</li>
          <li>Motivate regular training.</li>
          <li>Support friendly competition.</li>
          <li>Allow players to compare their progress.</li>
        </ul>

        <p>Leaderboard placement depends on the applicable scoring rules and recorded results.</p>

        <p>Hockey Beats does not guarantee that rankings will remain unchanged indefinitely.</p>

        <p>Rankings may change as other players achieve new scores or as technical issues are corrected.</p>

        <h2>8. Invalid Scores and Technical Errors</h2>

        <p>Occasionally, technical issues may affect score calculation or recording.</p>

        <p>Examples include:</p>

        <ul>
          <li>Camera-tracking errors.</li>
          <li>Interrupted gameplay sessions.</li>
          <li>Network connectivity problems.</li>
          <li>Duplicate score submissions.</li>
          <li>Software bugs.</li>
          <li>Incorrect difficulty classification.</li>
          <li>Data synchronization errors.</li>
        </ul>

        <p>Where a result is demonstrably invalid, Hockey Beats may correct or remove it.</p>

        <p>A technical error does not automatically mean that a player has intentionally violated these Rules.</p>

        <p>We will distinguish, where reasonably possible, between accidental errors and deliberate manipulation.</p>

        <h2>9. Prohibited Competitive Manipulation</h2>

        <p>Players must not:</p>

        <ul>
          <li>Use bots to generate artificial scores.</li>
          <li>Modify game requests to submit false results.</li>
          <li>Exploit vulnerabilities to obtain unauthorized XP or achievements.</li>
          <li>Manipulate leaderboard entries.</li>
          <li>Interfere with another player&apos;s account or results.</li>
          <li>Circumvent gameplay time limits through unauthorized methods.</li>
          <li>Create fraudulent accounts for the purpose of manipulating rankings or rewards.</li>
          <li>Misrepresent simulated or automated gameplay as genuine physical performance.</li>
        </ul>

        <p>We may investigate credible indications of manipulation and take proportionate corrective action.</p>

        <h2>10. XP, Levels, Streaks, and Achievements</h2>

        <p>Hockey Beats may reward players with:</p>

        <ul>
          <li>Experience points (XP).</li>
          <li>Player levels.</li>
          <li>Gameplay streaks.</li>
          <li>Achievements.</li>
          <li>Other in-game progression indicators.</li>
        </ul>

        <p>These features are intended to reflect participation, progress, and gameplay accomplishments.</p>

        <p>Unless expressly stated otherwise, they have no monetary value and cannot be exchanged for cash.</p>

        <p>We may correct progression data affected by bugs, duplicate submissions, fraud, or unauthorized manipulation.</p>

        <p>We will not arbitrarily remove legitimate paid entitlements or override applicable consumer rights.</p>

        <h2>11. Usernames and Player Identity</h2>

        <p>Player usernames may be visible through leaderboards and other account-based gameplay features.</p>

        <p>Players must not use usernames that:</p>

        <ul>
          <li>Impersonate another person or organization.</li>
          <li>Falsely claim to represent Hockey Beats.</li>
          <li>Contain unlawful threats or abusive expressions.</li>
          <li>Reveal another person&apos;s private information without authorization.</li>
          <li>Violate applicable intellectual property rights.</li>
        </ul>

        <p>Players, especially minors, should avoid including full names, addresses, school information, telephone numbers, or other sensitive personal details in usernames.</p>

        <p>Where reasonably necessary, Hockey Beats may require a username change.</p>

        <h2>12. Free and Premium Players</h2>

        <p>Hockey Beats offers both Free and Premium access.</p>

        <p>The Free Plan includes unlimited access to Hockey Beats Slalom and a one-time cumulative ten-minute preview for each Premium game.</p>

        <p>Premium subscribers receive access to the Premium games and features included in their subscription.</p>

        <p>The same principles of fair play apply to all players, regardless of subscription type.</p>

        <p>A Premium subscription does not guarantee higher scores, improved leaderboard positions, or preferential treatment in competitive rankings.</p>

        <h2>13. Account Integrity</h2>

        <p>Players should use their own accounts and protect their sign-in credentials.</p>

        <p>The following are prohibited:</p>

        <ul>
          <li>Accessing another player&apos;s account without authorization.</li>
          <li>Submitting results under another person&apos;s identity without permission.</li>
          <li>Using compromised credentials.</li>
          <li>Attempting to bypass account security.</li>
          <li>Interfering with the operation of Hockey Beats.</li>
        </ul>

        <p>Players who suspect unauthorized access should contact <a href="mailto:studio@drixton.com">studio@drixton.com</a>.</p>

        <h2>14. Review and Correction of Results</h2>

        <p>Hockey Beats may review gameplay results when there is a reasonable indication of technical error, fraud, or manipulation.</p>

        <p>Depending on the circumstances, we may:</p>

        <ul>
          <li>Correct an invalid score.</li>
          <li>Remove a duplicate result.</li>
          <li>Recalculate affected progression.</li>
          <li>Remove a manipulated leaderboard entry.</li>
          <li>Restrict competitive functionality.</li>
          <li>Suspend or terminate access in cases of serious or repeated misconduct.</li>
        </ul>

        <p>Actions will be proportionate and consistent with applicable law and our Terms of Service.</p>

        <p>We will consider the available evidence and distinguish accidental technical issues from intentional misconduct where reasonably possible.</p>

        <h2>15. Reporting Score Problems</h2>

        <p>Players may report suspected scoring errors or unfair gameplay manipulation by contacting:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Please include, where available:</p>

        <ul>
          <li>Your Hockey Beats username.</li>
          <li>The relevant game.</li>
          <li>The approximate date and time.</li>
          <li>A description of the issue.</li>
          <li>Supporting information, if available.</li>
        </ul>

        <p>Do not include passwords or unnecessary sensitive personal information.</p>

        <p>Reports will be assessed according to the information available and the nature of the issue.</p>

        <h2>16. Requests for Review</h2>

        <p>If a player believes a score correction, leaderboard removal, or account restriction was applied incorrectly, they may request a review.</p>

        <p>Requests should be sent to:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Please provide the relevant username and an explanation of the concern.</p>

        <p>We will assess review requests fairly and comply with any applicable legal requirements.</p>

        <h2>17. Changes to Games and Rankings</h2>

        <p>Hockey Beats may introduce:</p>

        <ul>
          <li>New games.</li>
          <li>New difficulty levels.</li>
          <li>Updated scoring systems.</li>
          <li>Additional achievements.</li>
          <li>New leaderboard formats.</li>
          <li>Improvements to ball tracking.</li>
          <li>Changes to gameplay balancing.</li>
        </ul>

        <p>Such changes may affect future scores or the comparability of historical results.</p>

        <p>Where appropriate, Hockey Beats may introduce new ranking periods or separate leaderboard categories.</p>

        <p>Any changes affecting paid services remain subject to applicable contractual and consumer protection requirements.</p>

        <h2>18. Privacy and Player Data</h2>

        <p>Gameplay information, including usernames, scores, achievements, and progression data, may constitute personal data.</p>

        <p>Hockey Beats processes this information in accordance with its Privacy Policy.</p>

        <p>Players may exercise applicable data protection rights by contacting:</p>

        <p><strong><a href="mailto:studio@drixton.com">studio@drixton.com</a></strong></p>

        <p>Account deletion may result in the removal of associated scores and progression information, subject to the actual deletion process and applicable legal obligations.</p>

        <h2>19. Changes to These Rules</h2>

        <p>We may update these Rules to reflect new gameplay mechanics, technical improvements, competitive features, or legal requirements.</p>

        <p>The latest version and effective date will be published on our website.</p>

        <p>Where changes materially affect users&apos; contractual rights, applicable notice and consent requirements will be respected.</p>

        <h2>20. Contact Information</h2>

        <p>For questions about fair play, leaderboards, score corrections, or these Rules, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Fair Play &amp; Leaderboard Rules — Version 1.1</strong></p>
      </main>
    </div>
  );
}
