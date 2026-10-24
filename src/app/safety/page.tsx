import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Safety & Physical Activity Guidelines',
};

export default function SafetyPage() {
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
        <h1>Safety &amp; Physical Activity Guidelines</h1>

        <p><strong>Effective Date:</strong> 24 October 2026<br />
        <strong>Version:</strong> 1.0<br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <h2>1. Introduction</h2>

        <p>Hockey Beats is an interactive hockey training and entertainment platform that combines real-world movement, hockey skills, rhythm-based gameplay, and camera-based ball tracking.</p>

        <p>Unlike traditional video games, Hockey Beats may require players to move physically and use sports equipment, including a hockey stick and ball.</p>

        <p>Your safety and the safety of people around you should always come first.</p>

        <p>These Safety &amp; Physical Activity Guidelines (&quot;Guidelines&quot;) explain how to prepare a suitable playing environment, use equipment responsibly, manage physical activity, and reduce foreseeable risks associated with playing Hockey Beats.</p>

        <p>These Guidelines apply to all Hockey Beats users, including Free players, Premium subscribers, and users participating through clubs or organized training activities.</p>

        <p>They supplement our Terms of Service and other applicable policies.</p>

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

        <h2>3. Physical Activity Warning</h2>

        <p>Hockey Beats involves physical activity.</p>

        <p>Depending on the game and difficulty level, gameplay may involve:</p>

        <ul>
          <li>Hockey stick handling.</li>
          <li>Ball control.</li>
          <li>Repeated arm and wrist movements.</li>
          <li>Bending and reaching.</li>
          <li>Changes in body position.</li>
          <li>Coordination and reaction exercises.</li>
          <li>Repetitive physical movements.</li>
          <li>Activities requiring balance and concentration.</li>
        </ul>

        <p>Physical activity carries inherent risks, including muscle strain, falls, collisions, and accidental contact with equipment.</p>

        <p>Players should select activities appropriate to their age, experience, physical condition, and surroundings.</p>

        <p>Do not attempt movements that exceed your abilities or that cannot be performed safely in your environment.</p>

        <h2>4. Prepare a Safe Playing Area</h2>

        <p>Before starting a game, make sure you have enough space to move and handle your hockey stick safely.</p>

        <p>Choose a flat, stable, non-slippery surface.</p>

        <p>Remove or secure:</p>

        <ul>
          <li>Fragile objects.</li>
          <li>Furniture within stick-swinging distance.</li>
          <li>Electrical cables.</li>
          <li>Loose rugs.</li>
          <li>Sharp objects.</li>
          <li>Obstacles.</li>
          <li>Unsecured equipment.</li>
          <li>Other items that could cause injury or damage.</li>
        </ul>

        <p>Ensure there is sufficient clearance around the player, including overhead and behind the body.</p>

        <p>Do not play near windows, glass doors, televisions, mirrors, or other breakable surfaces.</p>

        <p>Do not play in areas where people or animals may unexpectedly enter the active playing space.</p>

        <p>If you cannot create a safe playing environment, do not begin gameplay.</p>

        <h2>5. Hockey Stick Safety</h2>

        <p>Use a hockey stick suitable for your age, height, ability, and the intended activity.</p>

        <p>Before playing:</p>

        <ul>
          <li>Check the stick for visible damage.</li>
          <li>Make sure the grip is secure.</li>
          <li>Confirm that there is enough room to move it.</li>
          <li>Keep the stick away from other people and animals.</li>
          <li>Avoid uncontrolled or unnecessarily forceful movements.</li>
        </ul>

        <p>Do not swing the stick toward people, pets, screens, cameras, or fragile objects.</p>

        <p>Avoid raising the stick dangerously, particularly in confined indoor spaces.</p>

        <p>Hockey Beats is designed to support controlled skill development, not reckless or forceful stick movements.</p>

        <h2>6. Hockey Ball Safety</h2>

        <p>Use a ball appropriate for the game, playing surface, and available space.</p>

        <p>A standard field hockey ball can be hard and may cause injury or property damage, particularly indoors.</p>

        <p>For indoor or home use, a suitable softer training ball may reduce certain risks, provided it is compatible with the game&apos;s tracking functionality.</p>

        <p>Players should:</p>

        <ul>
          <li>Check the ball for damage.</li>
          <li>Avoid striking the ball toward people or animals.</li>
          <li>Keep the ball away from breakable objects.</li>
          <li>Use controlled movements.</li>
          <li>Stop if the ball repeatedly leaves the safe playing area.</li>
        </ul>

        <p>Never prioritize achieving a higher score over safe ball control.</p>

        <h2>7. Footwear and Playing Surface</h2>

        <p>Wear suitable footwear that provides appropriate grip and support for the playing surface.</p>

        <p>Avoid playing on wet, slippery, uneven, or unstable surfaces.</p>

        <p>Do not play in socks on a slippery floor.</p>

        <p>Keep the playing surface clear of objects that could cause slipping or tripping.</p>

        <p>If the surface becomes unsafe during gameplay, stop immediately.</p>

        <h2>8. Camera Placement</h2>

        <p>Hockey Beats uses camera-based ball tracking to support gameplay.</p>

        <p>Camera positioning should allow the game to detect the ball while keeping the playing area safe.</p>

        <p>When using a webcam, laptop camera, or another compatible camera:</p>

        <ul>
          <li>Position the device on a stable surface.</li>
          <li>Keep it outside the active stick and ball movement area.</li>
          <li>Secure cables.</li>
          <li>Avoid placing the device where it could fall.</li>
          <li>Ensure the camera does not obstruct movement.</li>
          <li>Avoid unstable stands or improvised supports.</li>
        </ul>

        <p>Do not position a laptop, phone, or camera directly in the expected path of the ball.</p>

        <p>Camera accuracy should never take priority over physical safety.</p>

        <h2>9. Remote Phone Camera Safety</h2>

        <p>Hockey Beats offers Remote Phone Camera functionality, allowing a compatible smartphone to support ball tracking.</p>

        <p>The feature is available to Free and Premium users.</p>

        <p>When using a phone:</p>

        <ul>
          <li>Place it on a stable and secure surface.</li>
          <li>Use a suitable stand or holder where necessary.</li>
          <li>Keep it outside the playing area.</li>
          <li>Protect it from accidental contact with the stick or ball.</li>
          <li>Ensure charging cables do not create a tripping hazard.</li>
          <li>Avoid handling the phone while actively moving with the hockey stick.</li>
        </ul>

        <p>Stop gameplay before adjusting the phone or camera position.</p>

        <p>Do not hold the phone in your hand while attempting to perform stick-handling movements.</p>

        <h2>10. Warm-Up and Physical Preparation</h2>

        <p>Before playing, consider a short warm-up appropriate to the intensity of the activity.</p>

        <p>This may include:</p>

        <ul>
          <li>Gentle walking or movement.</li>
          <li>Controlled shoulder and arm movements.</li>
          <li>Wrist mobility.</li>
          <li>Light lower-body movements.</li>
          <li>Easy stick-handling exercises.</li>
        </ul>

        <p>Begin at a comfortable pace.</p>

        <p>Increase intensity gradually rather than immediately attempting difficult or fast movements.</p>

        <p>Warm-up activities may help prepare the body for exercise but do not eliminate the risk of injury.</p>

        <h2>11. Fatigue, Pain, and Physical Limits</h2>

        <p>Listen to your body during gameplay.</p>

        <p>Stop playing if you experience:</p>

        <ul>
          <li>Pain.</li>
          <li>Dizziness.</li>
          <li>Unusual shortness of breath.</li>
          <li>Chest discomfort.</li>
          <li>Loss of balance.</li>
          <li>Significant fatigue.</li>
          <li>Numbness.</li>
          <li>Sudden weakness.</li>
          <li>Any other concerning symptoms.</li>
        </ul>

        <p>If you experience severe symptoms, including chest pain, fainting, or serious breathing difficulty, stop immediately and seek urgent medical assistance.</p>

        <p>Do not continue playing through pain to maintain a streak, complete a challenge, or improve a leaderboard position.</p>

        <p>Players should take regular breaks and stay appropriately hydrated.</p>

        <h2>12. Existing Injuries and Medical Conditions</h2>

        <p>If you have an injury, medical condition, or physical limitation that may affect safe participation, consider seeking advice from a qualified healthcare professional before using physically demanding features.</p>

        <p>Hockey Beats does not assess individual medical fitness.</p>

        <p>The Service does not provide medical diagnosis, treatment, rehabilitation prescriptions, or individualized medical clearance.</p>

        <p>Gameplay recommendations and difficulty settings should not be interpreted as medical advice.</p>

        <h2>13. Children and Teenagers</h2>

        <p>Hockey Beats is intended for players aged 13 and older.</p>

        <p>Users under 13 must not create accounts or use the Service.</p>

        <p>Users aged 13–15 require parental or guardian permission, together with any additional authorization required by applicable law.</p>

        <p>Parents and guardians should assess whether a playing environment, equipment, and selected activities are suitable for the child.</p>

        <p>Appropriate adult supervision is recommended, particularly when a younger player is:</p>

        <ul>
          <li>Setting up equipment.</li>
          <li>Using a hockey stick indoors.</li>
          <li>Positioning cameras or phones.</li>
          <li>Trying unfamiliar movements.</li>
          <li>Playing in a shared space.</li>
        </ul>

        <p>Children should be encouraged to prioritize technique, safety, and enjoyment over scores or rankings.</p>

        <h2>14. Clubs, Coaches, and Organized Activities</h2>

        <p>Hockey Beats may be used by hockey clubs, coaches, training groups, and other organizations.</p>

        <p>When used in an organized setting, the responsible adult or organization should:</p>

        <ul>
          <li>Assess the suitability of the training space.</li>
          <li>Select appropriate equipment.</li>
          <li>Establish clear safety rules.</li>
          <li>Maintain appropriate supervision.</li>
          <li>Consider players&apos; age and experience.</li>
          <li>Ensure suitable spacing between participants.</li>
          <li>Follow applicable safeguarding and sports safety requirements.</li>
          <li>Stop activities when unsafe conditions arise.</li>
        </ul>

        <p>Hockey Beats does not replace the professional judgment or responsibilities of coaches, instructors, or organizations.</p>

        <p>Organizations remain responsible for meeting their applicable legal and safeguarding obligations.</p>

        <h2>15. Screen Awareness and Distractions</h2>

        <p>Hockey Beats may display targets, scores, rhythm cues, or other visual elements on a screen.</p>

        <p>Players should not focus on the screen in a way that causes them to lose awareness of their surroundings.</p>

        <p>Keep the screen at a suitable distance and position.</p>

        <p>Avoid rapid or uncontrolled movements while looking away from the ball or playing area.</p>

        <p>Pause gameplay when you need to adjust equipment or check your surroundings.</p>

        <h2>16. Music and Hearing Safety</h2>

        <p>Hockey Beats may integrate with supported music services.</p>

        <p>When playing with music:</p>

        <ul>
          <li>Keep the volume at a reasonable level.</li>
          <li>Avoid excessively loud headphones.</li>
          <li>Remain aware of people and hazards nearby.</li>
          <li>Do not allow music to distract from safe movement.</li>
          <li>Take listening breaks when appropriate.</li>
        </ul>

        <p>Players should avoid using noise-isolating headphones in environments where hearing surrounding activity is important for safety.</p>

        <p>Music integrations are subject to the terms and availability of the relevant providers.</p>

        <h2>17. Difficulty Levels and Competitive Pressure</h2>

        <p>Hockey Beats may include difficulty levels, challenges, XP, achievements, and leaderboards.</p>

        <p>These features are intended to motivate practice and improvement.</p>

        <p>They should never encourage unsafe behavior.</p>

        <p>Players should:</p>

        <ul>
          <li>Select a suitable difficulty.</li>
          <li>Progress gradually.</li>
          <li>Take breaks.</li>
          <li>Stop when fatigued.</li>
          <li>Avoid movements beyond their current abilities.</li>
        </ul>

        <p>A higher score is not worth risking an injury.</p>

        <h2>18. Equipment and Property Damage</h2>

        <p>Physical gameplay may result in accidental contact with furniture, electronic devices, walls, flooring, or other property.</p>

        <p>Players should take reasonable precautions to protect their surroundings.</p>

        <p>Hockey Beats does not supply or physically inspect the equipment used by players unless expressly stated otherwise.</p>

        <p>Users should follow equipment manufacturers&apos; safety instructions.</p>

        <p>Any allocation of responsibility for property damage or injury remains subject to applicable law.</p>

        <p>Nothing in these Guidelines excludes or restricts liability that cannot lawfully be excluded or restricted.</p>

        <h2>19. Camera Privacy</h2>

        <p>Under the current Hockey Beats implementation, camera frames used for ball tracking are processed locally in the user&apos;s browser.</p>

        <p>Raw camera video is not uploaded to or stored by Hockey Beats servers as part of the tracking process.</p>

        <p>Remote Phone Camera transmits numerical tracking coordinates rather than raw video to Hockey Beats servers.</p>

        <p>Users control camera permissions through their browser or device settings.</p>

        <p>Additional information is available in our Privacy Policy.</p>

        <h2>20. Technical Limitations</h2>

        <p>Camera tracking may be affected by:</p>

        <ul>
          <li>Lighting conditions.</li>
          <li>Camera quality.</li>
          <li>Ball color.</li>
          <li>Background contrast.</li>
          <li>Device performance.</li>
          <li>Camera positioning.</li>
          <li>Network connectivity for remote functionality.</li>
          <li>Other environmental or technical factors.</li>
        </ul>

        <p>Tracking errors may occur.</p>

        <p>Do not make sudden or unsafe movements to compensate for inaccurate detection.</p>

        <p>If tracking becomes unreliable, pause gameplay and adjust the setup safely.</p>

        <h2>21. Emergencies</h2>

        <p>If an injury or emergency occurs:</p>

        <ol>
          <li>Stop gameplay immediately.</li>
          <li>Move away from any immediate hazard, if safe to do so.</li>
          <li>Seek appropriate assistance.</li>
          <li>Contact local emergency services when necessary.</li>
        </ol>

        <p>In Slovakia and elsewhere in the European Union, <strong>112</strong> is the general emergency number.</p>

        <p>Do not rely on Hockey Beats to detect emergencies or contact emergency services.</p>

        <h2>22. No Medical or Professional Training Guarantee</h2>

        <p>Hockey Beats is designed as a training and entertainment aid.</p>

        <p>It does not guarantee:</p>

        <ul>
          <li>Improvement in sporting performance.</li>
          <li>Prevention of injuries.</li>
          <li>Achievement of a particular fitness level.</li>
          <li>Selection for a team or competition.</li>
          <li>Suitability for a particular medical condition.</li>
          <li>Replacement of professional sports coaching.</li>
        </ul>

        <p>Individual results depend on many factors, including practice, technique, physical condition, and training environment.</p>

        <h2>23. Limitation of Liability</h2>

        <p>Users should follow these Guidelines and exercise reasonable care when participating in physical gameplay.</p>

        <p>To the extent permitted by applicable law, Hockey Beats is not responsible for harm caused solely by unsafe environments, unsuitable equipment, unauthorized modifications, or conduct outside its reasonable control.</p>

        <p>However, nothing in these Guidelines excludes, restricts, or limits liability for personal injury, negligence, defective digital services, or other matters where such exclusion or restriction is prohibited by applicable law.</p>

        <p>Mandatory consumer rights remain unaffected.</p>

        <h2>24. Changes to These Guidelines</h2>

        <p>We may update these Guidelines to reflect:</p>

        <ul>
          <li>New gameplay features.</li>
          <li>Additional supported equipment.</li>
          <li>Changes to camera functionality.</li>
          <li>Updated safety recommendations.</li>
          <li>Legal or regulatory requirements.</li>
          <li>Improvements to the Service.</li>
        </ul>

        <p>The updated version and effective date will be published on our website.</p>

        <h2>25. Contact Information</h2>

        <p>For questions about safe gameplay or these Guidelines, contact:</p>

        <p><strong>DRIXTON s. r. o.</strong><br />
        Mudrochova 7480/15<br />
        831 06 Bratislava – Rača<br />
        Slovak Republic</p>

        <p><strong>Company Registration Number:</strong> 53874871<br />
        <strong>VAT ID:</strong> SK2121518399</p>

        <p><strong>Email:</strong> <a href="mailto:studio@drixton.com">studio@drixton.com</a><br />
        <strong>Website:</strong> <a href="https://hockeybeats.app">https://hockeybeats.app</a></p>

        <hr />

        <p><strong>End of Safety &amp; Physical Activity Guidelines — Version 1.0</strong></p>
      </main>
    </div>
  );
}
