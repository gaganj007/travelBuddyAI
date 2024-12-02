chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "run_prompt") {
    (async () => {
      try {
        const { available } = await ai.languageModel.capabilities();
        if (available !== "no") {
          const session = await ai.languageModel.create();
          const result = await session.prompt("Write a 2 sentence poem");
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

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "summarizer") {
    port.onMessage.addListener(async (message) => {
      if (message.action === "summarize") {
        try {
          const canSummarize = await ai.summarizer.capabilities();
          let summarizer;

          if (canSummarize && canSummarize.available !== "no") {
            summarizer = await ai.summarizer.create();

            const result = await summarizer.summarizeStreaming(message.text);
            let previousLength = 0;

            for await (const segment of result) {
              const newContent = segment.slice(previousLength);
              previousLength = segment.length;

              // Send each chunk back to the popup
              port.postMessage({ chunk: newContent });
            }

            // Indicate that summarization is complete
            port.postMessage({ complete: true });
          } else {
            port.postMessage({ error: "Summarizer is not available." });
          }
        } catch (error) {
          port.postMessage({ error: `Error: ${error.message}` });
        }
      }
    });
  }
});



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.action === "detect_language") {
    (async () => {
      try {
        const canDetect = await ai.languageDetector.capabilities();
        let detector;
      

        if (canDetect && canDetect.available !== "no") {
          if (canDetect.available === "readily") {
            detector = await ai.languageDetector.create();
            console.log("ready")
          } else {
            console.log('no')
            detector = await ai.languageDetector.create();
            detector.addEventListener("downloadprogress", (e) => {
              console.log(`Downloading: ${e.loaded}/${e.total}`);
            });
            await detector.ready;
          }
          
          const detectionResults = await detector.detect(message.text);
          console.log("HERE")
          sendResponse({ results: detectionResults[0].detectedLanguage });
        } else {
          sendResponse({ error: "Language detection is not available." });
        }
      } catch (error) {
        console.log("YP")
        sendResponse({ error: `Error: ${error.message}` });
      }
    })();

    return true; // Keep the channel open for async response
  }
});



