// Handle the "Nah, I got it!" button click
document.getElementById("no-btn").addEventListener("click", () => {
  document.getElementById("result").textContent = "Alright, let me know if you change your mind!";
});

document.getElementById("itinerary-btn").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Generating itinerary...";


  try {
    // Communicate with the background service worker to get the itinerary
    const response = await chrome.runtime.sendMessage({ action: "run_prompt" });
    
    if (response) {
      // Redirect to a website with the result (example uses placeholder)
      const url = `https://travelbuddy-f5524.web.app?result=${encodeURIComponent(response)}`;
      window.open(url, "_blank");
    } else {
      resultDiv.textContent = "No itinerary generated.";
    }
  } catch (error) {
    resultDiv.textContent = "An error occurred: " + error.message;
  }
});

document.getElementById("summarize-btn").addEventListener("click", async () => {
  const summaryContainer = document.getElementById("summary-container");
  const summaryText = document.getElementById("summary-text");

  summaryText.textContent = "Extracting and summarizing text...";
  summaryContainer.style.display = "block";

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject the content script to extract visible text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // Listen for the extracted text from content.js
    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.action === "extractedText") {
        const port = chrome.runtime.connect({ name: "summarizer" });

        // Send the extracted text to the background script
        port.postMessage({
          action: "summarize",
          text: message.text,
        });

        // Listen for summary chunks and final output
        port.onMessage.addListener((msg) => {
          if (msg.chunk) {
            summaryText.textContent += msg.chunk; // Append new chunks
          } else if (msg.complete) {
            summaryText.textContent += "\n\nSummary generation complete!";
          } else if (msg.error) {
            summaryText.textContent = `Error: ${msg.error}`;
          }
        });
      }
    });
  } catch (error) {
    summaryText.textContent = `Error: ${error.message}`;
  }
});


// Handle the "Translate it!" button click
document.getElementById("translate-btn").addEventListener("click", async () => {
  const translationContainer = document.getElementById("translation-container");
  const translationText = document.getElementById("translation-text");

  const someUserText = "Hallo und herzlich willkommen im Early Preview Program!"; // Example text for translation

  translationText.textContent = "Detecting language and translating...";
  translationContainer.style.display = "block"; // Show the container

  try {
    const response = await chrome.runtime.sendMessage({
      action: "detect_language",
      text: someUserText,
    });


    if (response && response.detectedLanguage) {
      console.log(response)
      translationText.textContent = `Detected Language: ${response[0].detectedLanguage}`;
    } else {
      console.log("Fail")
      translationText.textContent = "Translation failed.";
    }
  } catch (error) {
    translationText.textContent = "An error occurred: " + error.message;
  }
});






