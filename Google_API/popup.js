document.getElementById("yes-btn").addEventListener("click", async () => {
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

// Handle the "Nah, I got it!" button click
document.getElementById("no-btn").addEventListener("click", () => {
  document.getElementById("result").textContent = "Alright, let me know if you change your mind!";
});
