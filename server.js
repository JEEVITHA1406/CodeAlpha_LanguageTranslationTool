
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/translate", async (req, res) => {
  try {
    const { text, source, target } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please enter text." });
    }

    if (!source || source === "auto") {
      return res.status(400).json({
        error: "Please select the source language."
      });
    }

    if (!target) {
      return res.status(400).json({
        error: "Please select the target language."
      });
    }

    if (source === target) {
      return res.status(400).json({
        error: "Select two different languages."
      });
    }

    if (Buffer.byteLength(text, "utf8") > 500) {
      return res.status(400).json({
        error: "Text is too long. Please enter up to 500 bytes."
      });
    }

    const params = new URLSearchParams({
      q: text,
      langpair: `${source}|${target}`
    });

    const response = await fetch(
      `https://api.mymemory.translated.net/get?${params}`
    );

    const data = await response.json();

    if (!response.ok || data.responseStatus !== 200) {
      throw new Error(
        data.responseDetails || "Translation failed."
      );
    }

    res.json({
      translatedText: data.responseData.translatedText
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Unable to translate."
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Translation Tool running at http://localhost:${PORT}`);
});
