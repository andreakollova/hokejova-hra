const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#hockey-beats';

export async function sendSlackMessage(text: string, blocks?: unknown[]) {
  if (!SLACK_BOT_TOKEN) return;

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL,
        text,
        ...(blocks ? { blocks } : {}),
      }),
    });
  } catch {}
}

export function loginMessage(username: string) {
  return sendSlackMessage(
    `🟢 *${username}* just logged in to Hockey Beats`,
    [{
      type: 'section',
      text: { type: 'mrkdwn', text: `🟢 *${username}* just logged in to Hockey Beats` },
    }]
  );
}

export function logoutMessage(username: string) {
  return sendSlackMessage(
    `🔴 *${username}* logged out`,
    [{
      type: 'section',
      text: { type: 'mrkdwn', text: `🔴 *${username}* logged out` },
    }]
  );
}

export function achievementMessage(username: string, achievementName: string, achievementIcon: string, xp: number) {
  return sendSlackMessage(
    `🏆 ${username} unlocked "${achievementName}" (+${xp} XP)`,
    [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${achievementIcon} *${username}* unlocked achievement\n*${achievementName}* — +${xp} XP`,
      },
    }]
  );
}

export function gameFinishedMessage(username: string, gameName: string, score: number) {
  return sendSlackMessage(
    `🎮 ${username} finished ${gameName} with score ${score}`,
    [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎮 *${username}* finished *${gameName}* with score *${score}*`,
      },
    }]
  );
}
