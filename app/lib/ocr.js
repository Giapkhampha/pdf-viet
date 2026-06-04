/**
 * OCR ảnh sang text bằng tesseract.js, ngôn ngữ vie+eng.
 * Lần đầu sẽ tải ~10MB language data — sau đó được cache bởi browser.
 */
export async function ocrImage(file, onProgress) {
  const { createWorker } = await import("tesseract.js");

  onProgress?.("Đang tải engine OCR (lần đầu ~20s)...");
  const worker = await createWorker("vie+eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.(`Nhận dạng: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  const url = URL.createObjectURL(file);
  try {
    const { data: { text } } = await worker.recognize(url);
    return text;
  } finally {
    await worker.terminate();
    URL.revokeObjectURL(url);
  }
}
