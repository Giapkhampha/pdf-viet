export async function POST(request) {
  try {
    const formData = await request.formData();
    const stirlingId = formData.get("stirlingId");
    formData.delete("stirlingId");

    const res = await fetch(
      `https://stirling.tools/api/v1/convert/${stirlingId}`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const txt = await res.text();
      return new Response(txt, { status: res.status });
    }

    const blob = await res.blob();
    const contentDisposition = res.headers.get("content-disposition") || "";
    return new Response(blob, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
