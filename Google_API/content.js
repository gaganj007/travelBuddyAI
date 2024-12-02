function extractVisibleText() {
  const isVisible = (element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  };

  let text = "";
  document.querySelectorAll("body *").forEach((element) => {
    if (isVisible(element) && element.textContent.trim() !== "") {
      text += element.textContent.trim() + " ";
    }
  });

  return text.trim();
}

// Extract text and send it to the background script
chrome.runtime.sendMessage({ action: "extractedText", text: extractVisibleText() });
