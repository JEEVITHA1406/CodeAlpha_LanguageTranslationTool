const $ = (id) => document.getElementById(id);
const input = $("inputText"), output = $("outputText");
const source = $("sourceLanguage"), target = $("targetLanguage");
const translateButton = $("translateButton"), statusLine = $("status");

input.addEventListener("input", () => $("charCount").textContent = `${input.value.length} / 5000`);

$("clearButton").addEventListener("click", () => {
  input.value = ""; output.textContent = "Your translated text will appear here.";
  output.classList.add("placeholder"); $("charCount").textContent = "0 / 5000";
  $("resultLanguage").textContent = "RESULT"; setStatus("Powered by Microsoft Translator");
});
$("swapButton").addEventListener("click", () => {
  if (source.value === "auto") return setStatus("Choose a source language before swapping.", true);
  const oldSource = source.value; source.value = target.value; target.value = oldSource;
  const oldInput = input.value; input.value = output.classList.contains("placeholder") ? oldInput : output.textContent;
  output.textContent = oldInput || "Your translated text will appear here.";
  output.classList.toggle("placeholder", !oldInput);
  $("charCount").textContent = `${input.value.length} / 5000`;
});
$("copyButton").addEventListener("click", async () => {
  if (output.classList.contains("placeholder")) return setStatus("There is no translation to copy.", true);
  try { await navigator.clipboard.writeText(output.textContent); setStatus("Translation copied to clipboard."); }
  catch { setStatus("Copy is unavailable in this browser. Select the text and copy it manually.", true); }
});
function speak(text, language) {
  if (!text.trim()) return setStatus("There is no text to read.", true);
  if (!("speechSynthesis" in window)) return setStatus("Text-to-speech is not supported in this browser.", true);
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "auto" ? "en" : language;
  speechSynthesis.speak(utterance);
}
$("speakInputButton").addEventListener("click", () => speak(input.value, source.value));
$("speakOutputButton").addEventListener("click", () => speak(output.classList.contains("placeholder") ? "" : output.textContent, target.value));

translateButton.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return setStatus("Please enter some text to translate.", true);
  if (source.value !== "auto" && source.value === target.value) return setStatus("Choose two different languages.", true);
  translateButton.disabled = true; $("buttonText").textContent = "Translating...";
  setStatus("Connecting to Microsoft Translator...");
  try {
    const response = await fetch("/api/translate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source: source.value, target: target.value })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Translation failed.");
    output.textContent = data.translatedText; output.classList.remove("placeholder");
    $("resultLanguage").textContent = target.options[target.selectedIndex].text.toUpperCase();
    setStatus(data.detectedLanguage ? `Translation complete · Detected source: ${data.detectedLanguage}` : "Translation complete.");
  } catch (error) { setStatus(error.message, true); }
  finally { translateButton.disabled = false; $("buttonText").textContent = "Translate text"; }
});
function setStatus(message, error = false) { statusLine.textContent = message; statusLine.classList.toggle("error", error); }
output.classList.add("placeholder");
