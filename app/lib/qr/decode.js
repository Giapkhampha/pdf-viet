/**
 * Decode mã QR từ ảnh — dùng `jsqr` (~30KB).
 *
 * @param {File} file - ảnh JPG/PNG chứa QR
 * @returns {Promise<{ data: string, location?: object }>} text decode được
 */
export async function decodeQrFromImage(file) {
  const jsQR = (await import("jsqr")).default;

  // Load ảnh vào canvas để lấy ImageData
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (!result) {
      throw new Error(
        "Không tìm thấy mã QR trong ảnh. Thử ảnh rõ hơn hoặc cắt sát mã QR."
      );
    }
    return { data: result.data, location: result.location };
  } finally {
    URL.revokeObjectURL(url);
  }
}
