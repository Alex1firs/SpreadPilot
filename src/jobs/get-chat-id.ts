import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not defined in .env.local');
    return;
  }

  console.log('⏳ Looking for messages sent to your bot...');
  console.log('👉 Please make sure you have clicked START on your bot (SpreadPilot_Alert_Bot).');

  const url = `https://api.telegram.org/bot${token}/getUpdates`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      const lastMessage = data.result[data.result.length - 1];
      const chatID = lastMessage.message.chat.id;
      const firstName = lastMessage.message.chat.first_name;
      
      console.log('\n✅ FOUND IT!');
      console.log(`User: ${firstName}`);
      console.log(`Your Telegram Chat ID: ${chatID}`);
      console.log('\nNow copy that ID and paste it into your SpreadPilot dashboard!');
    } else {
      console.log('\n❌ No messages found yet.');
      console.log('Please send a message like "Hello" to your bot and then run this script again.');
    }
  } catch (err) {
    console.error('❌ Error fetching updates:', err);
  }
}

main();
