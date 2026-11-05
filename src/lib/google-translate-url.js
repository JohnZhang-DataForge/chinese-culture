export const GOOGLE_TRANSLATE_LANGUAGES = Object.freeze([
  { code: "ar", label: "Arabic" },
  { code: "bn", label: "Bengali" },
  { code: "bg", label: "Bulgarian" },
  { code: "ca", label: "Catalan" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "zh-TW", label: "Chinese (Traditional)" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "gu", label: "Gujarati" },
  { code: "he", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hu", label: "Hungarian" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "kn", label: "Kannada" },
  { code: "ko", label: "Korean" },
  { code: "ms", label: "Malay" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "ne", label: "Nepali" },
  { code: "no", label: "Norwegian" },
  { code: "fa", label: "Persian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sr", label: "Serbian" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "es", label: "Spanish" },
  { code: "sv", label: "Swedish" },
  { code: "sw", label: "Swahili" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "vi", label: "Vietnamese" }
]);

const supportedLanguageCodes = new Set(
  GOOGLE_TRANSLATE_LANGUAGES.map(({ code }) => code)
);

function decodeGoogleTranslateHostname(hostname) {
  const proxySuffix = ".translate.goog";
  let decodedHostname = hostname.toLowerCase();
  let decodedLayers = 0;

  // A previous version could create a proxy-of-a-proxy URL. Decode each
  // translate.goog layer until the original public hostname is recovered.
  while (decodedHostname.endsWith(proxySuffix)) {
    const encodedHostname = decodedHostname.slice(0, -proxySuffix.length);
    let sourceHostname = "";

    for (let index = 0; index < encodedHostname.length; index += 1) {
      const character = encodedHostname[index];

      if (character !== "-") {
        sourceHostname += character;
        continue;
      }

      if (encodedHostname[index + 1] === "-") {
        sourceHostname += "-";
        index += 1;
      } else {
        sourceHostname += ".";
      }
    }

    if (!sourceHostname || sourceHostname === encodedHostname) {
      throw new TypeError("Unable to decode the Google Translate hostname.");
    }

    decodedHostname = sourceHostname;
    decodedLayers += 1;

    if (decodedLayers > 5) {
      throw new TypeError("Google Translate hostname contains too many nested proxy layers.");
    }
  }

  return decodedHostname;
}

export function buildGoogleTranslateUrl(currentPageUrl, targetLanguage) {
  if (!supportedLanguageCodes.has(targetLanguage)) {
    throw new RangeError("Unsupported Google Translate target language: " + targetLanguage);
  }

  const pageUrl = new URL(currentPageUrl);
  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    throw new TypeError("Google Translate requires an HTTP or HTTPS page URL.");
  }

  const sourceHostname = decodeGoogleTranslateHostname(pageUrl.hostname);

  if (
    pageUrl.port ||
    !sourceHostname.includes(".") ||
    !/^[a-z0-9.-]+$/i.test(sourceHostname)
  ) {
    throw new TypeError("Google Translate requires a public DNS hostname without a port.");
  }

  const encodedHostname = sourceHostname
    .toLowerCase()
    .replace(/-/g, "--")
    .replace(/\./g, "-");

  const translatedUrl = new URL(pageUrl.href);
  translatedUrl.protocol = "https:";
  translatedUrl.hostname = encodedHostname + ".translate.goog";
  translatedUrl.port = "";

  // Remove routing parameters from an existing translated page before
  // applying the newly selected target language.
  for (const key of [...translatedUrl.searchParams.keys()]) {
    if (key.startsWith("_x_tr_")) translatedUrl.searchParams.delete(key);
  }

  translatedUrl.searchParams.set("_x_tr_sl", "auto");
  translatedUrl.searchParams.set("_x_tr_tl", targetLanguage);
  translatedUrl.searchParams.set("_x_tr_hl", "en");
  translatedUrl.searchParams.set("_x_tr_pto", "wapp");

  return translatedUrl.toString();
}
