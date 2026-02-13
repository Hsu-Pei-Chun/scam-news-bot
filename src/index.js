import "dotenv/config";
import { messagingApi } from "@line/bot-sdk";

// Configuration
const config = {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    searchQuery: "詐騙 新聞",
    maxResults: 1,
    videoDuration: "short",
  },
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    groupIds:
      process.env.LINE_GROUP_IDS?.split(",").map((id) => id.trim()) || [],
  },
};

/**
 * Search for the latest scam news video on YouTube
 * @returns {Promise<{title: string, url: string} | null>}
 */
async function searchLatestScamVideo() {
  const { apiKey, searchQuery, maxResults, videoDuration } = config.youtube;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not set");
  }

  const searchParams = new URLSearchParams({
    part: "snippet",
    q: searchQuery,
    type: "video",
    order: "date",
    maxResults: maxResults.toString(),
    regionCode: "TW",
    relevanceLanguage: "zh-TW",
    videoDuration,
    key: apiKey,
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${searchParams}`;

  console.log(`Searching YouTube for: "${searchQuery}"`);

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.log("No videos found");
    return null;
  }

  const video = data.items[0];
  const videoId = video.id.videoId;
  const title = video.snippet.title;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log(`Found video: ${title}`);
  console.log(`URL: ${videoUrl}`);

  return {
    title,
    url: videoUrl,
  };
}

/**
 * Send a message to all LINE groups using Push Message API
 * @param {string} message - The message to send
 */
async function pushToLineGroups(message) {
  const { channelAccessToken, groupIds } = config.line;

  if (!channelAccessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }

  if (!groupIds || groupIds.length === 0) {
    throw new Error("LINE_GROUP_IDS is not set");
  }

  const client = new messagingApi.MessagingApiClient({
    channelAccessToken,
  });

  for (const groupId of groupIds) {
    console.log(`Pushing message to LINE group: ${groupId}`);

    await client.pushMessage({
      to: groupId,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    });

    console.log(`Message sent to ${groupId} successfully!`);
  }
}

/**
 * Format the video information into a message
 * @param {{title: string, url: string}} video
 * @returns {string}
 */
function formatMessage(video) {
  return `📢 今日詐騙新聞

${video.title}

🔗 ${video.url}`;
}

/**
 * Main function
 */
async function main() {
  console.log("=== Scam News Bot Started ===");
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    // Search for latest scam video
    const video = await searchLatestScamVideo();

    if (!video) {
      console.log("No video found, skipping push message");
      return;
    }

    // Format and send message
    const message = formatMessage(video);
    await pushToLineGroups(message);

    console.log("=== Bot execution completed successfully ===");
  } catch (error) {
    console.error("=== Bot execution failed ===");
    console.error("Error:", error.message);

    if (error.stack) {
      console.error("Stack:", error.stack);
    }

    process.exit(1);
  }
}

// Run the bot
main();
