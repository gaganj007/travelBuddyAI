chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "run_prompt") {
    (async () => {
      try {
        const { available } = await ai.languageModel.capabilities();
        if (available !== "no") {
          const session = await ai.languageModel.create();
          const result = await session.prompt("Write a two sentence poem");
          console.log(result);
          sendResponse(result);
        } else {
          sendResponse("AI model is not available.");
        }
      } catch (error) {
        sendResponse(`Error: ${error.message}`);
      }
    })();

    return true; // Keep the message channel open for asynchronous response
  }
});
