const DIFY_API_KEY = '*****'; 
const LINE_ACCESS_TOKEN = '*****';

function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    const replyToken = event.replyToken;
    if (!event.message || event.message.type !== 'text') return;

    const userText = event.message.text;

    const type = event.source.type; // 「user」か「group」か「room」が入ります

    // グループまたは複数人トークの場合のみ、合言葉をチェックする
    if ((type === 'group' || type === 'room') && userText.indexOf("ボットくん") === -1) {
      return; 
    }
    
    const payload = {
      "inputs": {},
      "query": userText,
      "response_mode": "blocking",
      "user": "ikeyama-user"
    };

    const options = {
      "method": "post",
      "headers": {
        "Authorization": "Bearer " + DIFY_API_KEY,
        "Content-Type": "application/json"
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const url = "https://api.dify.ai/v1/chat-messages"; 
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    const aiText = result.answer || "エラー内容：" + JSON.stringify(result);
    
    replyMessage(replyToken, aiText);

  } catch (err) {
    const eventTemp = JSON.parse(e.postData.contents).events[0];
    replyMessage(eventTemp.replyToken, "GASエラー：" + err.message);
  }
}

function replyMessage(token, text) {
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + LINE_ACCESS_TOKEN
    },
    "payload": JSON.stringify({
      "replyToken": token,
      "messages": [{ "type": "text", "text": text }]
    })
  });
}
