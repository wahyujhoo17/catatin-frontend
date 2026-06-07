const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/layout/BottomNav.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove states: cameraPermission, stream, isFlashing, videoRef
content = content.replace(/  const \[isFlashing, setIsFlashing\] = useState\(false\);\n/, '');
content = content.replace(/  const \[stream, setStream\] = useState<MediaStream \| null>\(null\);\n/, '');
content = content.replace(/  const videoRef = useRef<HTMLVideoElement>\(null\);\n/, '');
content = content.replace(/  const \[cameraPermission, setCameraPermission\] =[\s\S]*?const permissionChecked = useRef\(false\);\n/g, '');

// 2. Remove startCamera & stopCamera
content = content.replace(/  const startCamera = async \(\) => {[\s\S]*?};\n\n  const stopCamera = \(\) => {[\s\S]*?};\n\n/g, '');

// 3. Update handleOpenScan
content = content.replace(
/  const handleOpenScan = \(e: React\.MouseEvent\) => {[\s\S]*?};\n/,
`  const handleOpenScan = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };\n`
);

// 4. Update handleCloseScan
content = content.replace(
/  const handleCloseScan = \(\) => {[\s\S]*?};\n/,
`  const handleCloseScan = () => {
    setIsCameraOpen(false);
    setScanPhase("camera");
    setCapturedImage(null);
    setScanResult(null);
    setScanError(null);
    setSelectedAccount(null);
    setIsSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };\n`
);

// 5. Update handleFileUpload
content = content.replace(
/  const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {[\s\S]*?  };\n/g,
`  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        setIsCameraOpen(true);
        setScanPhase("processing");
        fetchAccounts();
        processReceipt(base64);
      };
      reader.readAsDataURL(file);
    }
  };\n`
);

// 6. Update handleRetake
content = content.replace(
/  const handleRetake = \(\) => {[\s\S]*?};\n/g,
`  const handleRetake = () => {
    handleCloseScan();
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 100);
  };\n`
);

// 7. Remove handleConfirmCapture and stream useEffect
content = content.replace(/  const handleConfirmCapture = \(\) => {[\s\S]*?};\n\n  useEffect\(\(\) => {[\s\S]*?}, \[stream\]\);\n/g, '');
content = content.replace(/  const handleConfirmCapture = \(\) => {[\s\S]*?};\n/g, '');

// 8. Simplify the Camera Viewfinder JSX
// We replace the entire `<div className="camera-viewfinder"> ... </div>` section
content = content.replace(
/          \{\/\* ─── PHASE: Camera \/ Preview \/ Processing ─── \*\/\}[\s\S]*?          \{\/\* ─── PHASE: Result & Success ─── \*\/\}/,
`          {/* ─── PHASE: Preview / Processing ─── */}
          {(scanPhase === "preview" || scanPhase === "processing") && (
            <div className="camera-viewfinder">
              {/* Frozen Captured Image */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured receipt"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Processing overlay on frozen image */}
              {scanPhase === "processing" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    zIndex: 30,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: "4px solid rgba(207,188,255,0.3)",
                      borderTopColor: "var(--primary-fixed-dim)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p
                    className="text-body-md"
                    style={{ color: "white", fontWeight: 600 }}
                  >
                    AI sedang membaca struk...
                  </p>
                  <p
                    className="text-body-sm"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    Harap tunggu beberapa detik
                  </p>
                </div>
              )}

              {/* Scanning laser line during processing */}
              {scanPhase === "processing" && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: 4,
                    background:
                      "linear-gradient(90deg, transparent, rgba(207, 188, 255, 0.9), transparent)",
                    boxShadow:
                      "0 0 15px rgba(207, 188, 255, 0.9), 0 0 30px var(--primary)",
                    zIndex: 31,
                    animation: "laser-scan 1.5s ease-in-out infinite",
                  }}
                />
              )}
            </div>
          )}

          {/* ─── PHASE: Result & Success ─── */}`
);

// 9. Remove <div className="camera-controls">
content = content.replace(/          \{\/\* ─── Camera Controls ─── \*\/\}[\s\S]*?            <\/div>\n          \)}/g, '');

// Finally, make sure the input file has capture="environment" (optional but good for mobile)
content = content.replace(
  /<input\s+type="file"\s+accept="image\/\*"\s+ref=\{fileInputRef\}/,
  '<input type="file" accept="image/*" ref={fileInputRef}'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully updated BottomNav.tsx");
