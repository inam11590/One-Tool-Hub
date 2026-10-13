# OneToolHub — Image Processing Architecture

**Document Version**: 1.0.0  
**Phase**: Step 22 — Professional Image & Design Tools Expansion  
**Author**: Principal Software Architect & Browser Image Processing Specialist  
**Status**: APPROVED & IMPLEMENTED  

---

## 1. Architectural Philosophy: 100% In-Browser Execution

OneToolHub guarantees that user files, artwork, personal photographs, and company branding assets are **never uploaded to any external server or cloud backend**.

All graphic transformations, conversions, cropping, encoding, and color quantization occur exclusively inside the client's web browser using standard Web APIs:
- **HTML5 Canvas 2D Rendering Context** (`HTMLCanvasElement`, `CanvasRenderingContext2D`)
- **Web FileReader API** (`FileReader.readAsDataURL`, `readAsArrayBuffer`)
- **Native Browser Image Decoders** (`new Image()`, `createObjectURL`)
- **Typed Arrays** (`Uint8Array`, `Uint8ClampedArray`, `ImageData`)

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
|                                                                                 |
|  [ User File Drop ]                                                             |
|          |                                                                      |
|          v                                                                      |
|  [ Magic Byte Validator ]                                                       |
|    (FF D8 FF / 89 50 4E 47 / 52 49 46 46)                                       |
|          |                                                                      |
|          +--------------------+---------------------+--------------------+       |
|          |                    |                     |                    |       |
|          v                    v                     v                    v       |
|  +---------------+    +---------------+     +---------------+    +---------------+
|  | Format        |    | Image         |     | Image to      |    | Color Palette |
|  | Converter     |    | Cropper       |     | Base64        |    | Extractor     |
|  +---------------+    +---------------+     +---------------+    +---------------+
|  | HTML5 Canvas  |    | Sub-rectangle |     | FileReader    |    | 5-Bit Binning |
|  | Alpha Flatten |    | Boundary Clip |     | RFC 2397      |    | Euclidean Dist|
|  | Quality Scale |    | Canvas Redraw |     | Overhead Calc |    | Alpha Filter  |
|  +---------------+    +---------------+     +---------------+    +---------------+
|          |                    |                     |                    |       |
|          +--------------------+---------------------+--------------------+       |
|                                       |                                         |
|                                       v                                         |
|                           [ In-Memory Blob / Data URL ]                         |
|                                       |                                         |
|                                       v                                         |
|                           [ Instant Local Download ]                            |
|                     (Zero Network Transmission Guaranteed)                      |
+---------------------------------------------------------------------------------+
```

---

## 2. Tool-Specific Technical Architectures

### 2.1 Image Format Converter (`/tools/image-format-converter`)

- **File**: `frontend/src/lib/tools/image-format-converter.ts`
- **Component**: `frontend/src/components/tools/ImageFormatConverterTool.tsx`
- **Supported Input Formats**: JPEG, PNG, WebP (up to 25 MB / 40 Megapixels).
- **Supported Output Formats**: `image/jpeg`, `image/png`, `image/webp`.

#### Key Technical Considerations
1. **Transparency Preservation vs. Flattening**:
   - Converting PNG/WebP with transparent alpha channels to JPEG (which lacks an alpha channel) natively causes browsers to render transparent areas as black pixels (`#000000`).
   - Our engine provides an explicit transparency flattener:
     ```typescript
     if (targetMimeType === "image/jpeg") {
       ctx.fillStyle = backgroundColor || "#ffffff";
       ctx.fillRect(0, 0, width, height);
     }
     ctx.drawImage(img, 0, 0, width, height);
     ```
2. **Quality Clamping**:
   - Quality parameter is clamped between `0.01` and `1.0` (mapped from 1% to 100% on the UI slider).
   - PNG is strictly lossless; quality settings are ignored by the browser canvas for PNG exports.
3. **Safe Downscaling & Dimension Preservation**:
   - Preserves 100% of native pixel dimensions (`naturalWidth` × `naturalHeight`) without blur or unwanted resampling.
4. **Byte Reduction Analytics**:
   - Calculates exact size delta and percentage reduction:
     $$\Delta\% = \frac{\text{originalBytes} - \text{outputBytes}}{\text{originalBytes}} \times 100$$

---

### 2.2 Image Cropper (`/tools/image-cropper`)

- **File**: `frontend/src/lib/tools/image-cropper.ts`
- **Component**: `frontend/src/components/tools/ImageCropperTool.tsx`
- **Aspect Ratio Presets**:
  - `freeform`: Arbitrary box resizing within image boundaries.
  - `1:1`: Square (Avatars, Instagram post).
  - `16:9`: Widescreen (YouTube video thumbnail, desktop banner).
  - `9:16`: Vertical (Instagram Story, TikTok, YouTube Shorts).
  - `4:3`: Classic photography / tablet layout.

#### Crop Rectangle Mathematics
- **Boundary Clamping**:
  The crop rectangle $[x, y, w, h]$ is strictly validated against natural image dimensions $[W, H]$:
  $$\begin{cases}
  0 \le x < W \\
  0 \le y < H \\
  1 \le w \le W - x \\
  1 \le h \le H - y
  \end{cases}$$
- **Default Centered Box Calculation**:
  When an aspect ratio preset $R = \frac{w}{h}$ is selected, the initial crop box is centered:
  $$\text{If } \frac{W}{H} > R \implies h_{\text{crop}} = H \times 0.9, \quad w_{\text{crop}} = h_{\text{crop}} \times R$$
  $$\text{If } \frac{W}{H} \le R \implies w_{\text{crop}} = W \times 0.9, \quad h_{\text{crop}} = \frac{w_{\text{crop}}}{R}$$
  $$\text{Origin: } x = \frac{W - w_{\text{crop}}}{2}, \quad y = \frac{H - h_{\text{crop}}}{2}$$
- **Canvas Sub-Rectangle Rendering**:
  ```typescript
  ctx.drawImage(
    img,
    cropRect.x, cropRect.y, cropRect.width, cropRect.height, // Source rectangle
    0, 0, cropRect.width, cropRect.height                   // Destination canvas
  );
  ```

---

### 2.3 Image to Base64 Converter (`/tools/image-to-base64`)

- **File**: `frontend/src/lib/tools/image-to-base64.ts`
- **Component**: `frontend/src/components/tools/ImageToBase64Tool.tsx`
- **Output Standards**: RFC 2397 Data URL (`data:[<mediatype>][;base64],<data>`) and raw Base64 string.

#### Encoding & Byte Overhead Analytics
1. **Mathematical Overhead**:
   Every 3 bytes of binary data (24 bits) are encoded into 4 printable ASCII characters (32 bits):
   $$\text{Overhead Ratio} = \frac{4}{3} \approx 1.3333 \ (+33.33\%)$$
   With MIME prefix and padding (`=`), the analytical formula implemented is:
   $$\text{Base64 String Length} = 4 \times \left\lceil \frac{N}{3} \right\rceil$$
   $$\text{Overhead \%} = \frac{\text{DataURL Length} - N}{N} \times 100$$
2. **Crash Prevention for Large Strings**:
   Copying multi-megabyte strings to the system clipboard can freeze the main UI thread. The tool provides a **"Save as .txt"** download stream that constructs a UTF-8 Blob and triggers a local file download, preventing clipboard buffer overflows.

---

### 2.4 Image Color Palette Extractor (`/tools/image-color-palette`)

- **File**: `frontend/src/lib/tools/image-color-palette.ts`
- **Component**: `frontend/src/components/tools/ImageColorPaletteTool.tsx`
- **Palette Sizes**: 4, 6, 8, 10, or 12 swatches.

#### Color Quantization & Clustering Pipeline
To process large images (up to 40 MP) in sub-100ms without Web Workers or external dependencies:

```
[ Raw Image ] 
     |
     v
[ Downsample to 200x200 Canvas ] (Max 40,000 pixels)
     |
     v
[ Alpha Filter ] (Skip pixels with alpha < 128)
     |
     v
[ 5-Bit RGB Binning ] (Reduce 256^3 colors to 32^3 = 32,768 bins)
  bin_r = r >> 3,  bin_g = g >> 3,  bin_b = b >> 3
     |
     v
[ Frequency Sorting ] (Descending order of pixel counts)
     |
     v
[ Euclidean Distance Deduplication ] (Threshold d >= 38)
  d = sqrt((r1 - r2)^2 + (g1 - g2)^2 + (b1 - b2)^2)
     |
     v
[ Top K Swatches + Visual Percentage Share ]
     |
     v
[ Export to CSS Variables / JSON / Plain Text ]
```

1. **Downsampling Stage**: Downsamples image to a thumbnail canvas ($200 \times 200$ px), drastically reducing memory and CPU cycles while preserving dominant color distributions.
2. **Alpha Filtering**: Pixels with transparency $\alpha < 128$ are omitted, preventing transparent PNG canvas margins from skewing the dominant palette.
3. **5-Bit Color Binning**: Quantizes each channel by shifting bits (`r >> 3`), aggregating color frequency counts in a linear `Map`.
4. **Euclidean Color Distance**: Evaluates distance between candidate bins:
   $$D(C_1, C_2) = \sqrt{(R_1 - R_2)^2 + (G_1 - G_2)^2 + (B_1 - B_2)^2}$$
   Bins with $D < 38$ are clustered into their dominant ancestor to avoid repetitive, near-identical color swatches.
5. **Perceived Contrast Ratio**: Calculates luminance $L = 0.2126R + 0.7152G + 0.0722B$ to dynamically choose black or white text on swatch preview cards for maximum readability.

---

## 3. Memory & Resource Management Protocol

Browser Canvas instances and Object URLs can leak memory if not actively cleaned:
1. **`URL.revokeObjectURL` Lifecycle**:
   All components maintain a `urlsRef` pointer and invoke `URL.revokeObjectURL` whenever:
   - A new image is uploaded.
   - The user clicks the "Reset" / "New Image" button.
   - The component unmounts via `useEffect` cleanup hook.
2. **Canvas Garbage Collection**:
   Canvas elements created programmatically in memory (`document.createElement("canvas")`) are dereferenced immediately after extracting data URLs or pixel arrays, allowing the V8 garbage collector to reclaim backing store buffers.
3. **Safe Maximum Dimension Limits**:
   Images exceeding 40 Megapixels or 25 MB are rejected with a clear user advisory (`FILE_TOO_LARGE` or `DIMENSIONS_EXCEEDED`) before being allocated in memory, preventing tab crashes on mobile devices.
