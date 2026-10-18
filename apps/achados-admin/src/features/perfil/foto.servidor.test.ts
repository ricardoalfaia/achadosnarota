import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

import { FOTO, FOTO_INVALIDA } from "./domain/foto";
import { prepararFoto } from "./foto.servidor";

vi.mock("server-only", () => ({}));

async function jpegComGps(largura: number, altura: number): Promise<Blob> {
  const bytes = await sharp({
    create: {
      width: largura,
      height: altura,
      channels: 3,
      background: "#f15a24",
    },
  })
    .jpeg()
    .withExif({
      IFD0: { Make: "Câmera de teste" },
      IFD3: { GPSLatitudeRef: "S", GPSLatitude: "22/1 54/1 0/1" },
    })
    .toBuffer();
  return new Blob([new Uint8Array(bytes)], { type: "image/jpeg" });
}

describe("prepararFoto", () => {
  it("regrava como WebP quadrado do lado do avatar, sem metadados", async () => {
    const preparada = await prepararFoto(await jpegComGps(900, 600));
    expect(preparada.ok).toBe(true);
    if (!preparada.ok) return;
    const lida = await sharp(preparada.value).metadata();
    expect(lida.format).toBe("webp");
    expect([lida.width, lida.height]).toEqual([FOTO.lado, FOTO.lado]);
    expect(lida.exif).toBeUndefined();
  });

  it("recusa o que não é imagem, mesmo declarado como JPEG", async () => {
    const falsa = new Blob(["<script>alert(1)</script>"], {
      type: "image/jpeg",
    });
    const preparada = await prepararFoto(falsa);
    expect(preparada.ok).toBe(false);
    if (!preparada.ok) expect(preparada.error.code).toBe(FOTO_INVALIDA);
  });

  it("recusa um GIF declarado como PNG", async () => {
    const gif = await sharp({
      create: { width: 4, height: 4, channels: 3, background: "#000" },
    })
      .gif()
      .toBuffer();
    const preparada = await prepararFoto(
      new Blob([new Uint8Array(gif)], { type: "image/png" })
    );
    expect(preparada.ok).toBe(false);
  });
});
