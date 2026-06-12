"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { asset } from '../../lib/asset';

const CANVAS_SIZE = 1080;

// Utility to crop image and apply template
async function generateFinalImage(imageSrc, pixelCrop, templateId, logoImg) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  // 1. Draw the cropped user image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    CANVAS_SIZE,
    CANVAS_SIZE
  );

  // 2. Draw the selected template over the image
  drawTemplate(ctx, templateId, logoImg);

  return canvas.toDataURL('image/png');
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

function drawCurvedText(ctx, text, cx, cy, radius, startAngle, textInside) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(startAngle); // Angle for the CENTER of the text (0 = perfectly vertical)
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add some slight letter spacing by artificially inflating char width
  const letterSpacing = 2;
  
  let totalAngle = 0;
  let charAngles = [];
  for (let i = 0; i < text.length; i++) {
    let charWidth = ctx.measureText(text[i]).width + letterSpacing;
    let angle = charWidth / radius;
    charAngles.push(angle);
    totalAngle += angle;
  }
  
  if (textInside) {
    // Bottom text (facing inward, readable from bottom)
    ctx.rotate(totalAngle / 2);
    for (let i = 0; i < text.length; i++) {
      ctx.rotate(-charAngles[i] / 2);
      ctx.save();
      ctx.translate(0, radius);
      ctx.rotate(Math.PI); // Flip 180 degrees so it's readable right-side up
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
      ctx.rotate(-charAngles[i] / 2);
    }
  } else {
    // Top text (facing outward, readable from top)
    ctx.rotate(-totalAngle / 2);
    for (let i = 0; i < text.length; i++) {
      ctx.rotate(charAngles[i] / 2);
      ctx.save();
      ctx.translate(0, -radius);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
      ctx.rotate(charAngles[i] / 2);
    }
  }
  
  ctx.restore();
}

function drawTemplate(ctx, templateId) {
  const W = CANVAS_SIZE;
  const cx = W / 2;
  const cy = W / 2;
  const cr = W / 2; // Outer boundary

  ctx.save();

  // Draw subtle circular mask boundary just in case (optional, helps visual framing)
  ctx.beginPath();
  ctx.arc(cx, cy, cr - 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 4;
  ctx.stroke();

  switch (templateId) {
    case 1: // Classic Green Ribbon
      // Thick green bottom arc spanning ~120 degrees
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 40, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = '#7A9D34';
      ctx.lineWidth = 80;
      ctx.stroke();
      
      // Thin white accent arc above the green ribbon
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 84, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Curved Text on bottom arc
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'I PLEDGE FOR A BETTER EARTH', cx, cy, cr - 40, 0, true);
      break;

    case 2: // Top & Bottom Banners
      // Top white arc
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 36, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 72;
      ctx.stroke();

      // Bottom dark arc
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 36, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 72;
      ctx.stroke();

      // Top text
      ctx.fillStyle = '#7A9D34';
      ctx.font = '900 32px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'CLIMATE CHAMPION', cx, cy, cr - 36, 0, false);

      // Bottom text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'NEPAL CARBON FOOTPRINT 2026', cx, cy, cr - 36, 0, true);
      break;

    case 3: // Full Ring with Badge
      // Solid green ring all around
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#7A9D34';
      ctx.lineWidth = 48;
      ctx.stroke();

      // Inner white line
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 50, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Curved text at bottom
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 38px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'ACT TODAY • SAVE TOMORROW', cx, cy, cr - 24, 0, true);

      // Climate badge bottom right
      const bx = cx + (cr - 60) * Math.cos(Math.PI / 4);
      const by = cy + (cr - 60) * Math.sin(Math.PI / 4);
      
      ctx.beginPath(); ctx.arc(bx, by, 70, 0, Math.PI*2);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.beginPath(); ctx.arc(bx, by, 60, 0, Math.PI*2);
      ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 3; ctx.stroke();
      
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#7A9D34';
      ctx.font = '900 16px "Helvetica Neue", sans-serif';
      ctx.fillText('CARBON', bx, by - 12);
      ctx.fillText('NEUTRAL', bx, by + 12);
      break;

    case 4: // Transparent Glass Ribbon
      // A thick frosted glass arc at the bottom
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 45, Math.PI * 0.1, Math.PI * 0.9);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)'; // dark translucent
      ctx.lineWidth = 90;
      ctx.stroke();

      // Bright lime green curved text
      ctx.fillStyle = '#A3E635';
      ctx.font = 'bold 44px Georgia, serif';
      drawCurvedText(ctx, 'MY CLIMATE PLEDGE', cx, cy, cr - 45, 0, true);
      break;

    case 5: // The Bright Defender
      // Lime green thick arc
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 45, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = '#A3E635';
      ctx.lineWidth = 90;
      ctx.stroke();
      
      // Thin dark border
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 90, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 42px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'EARTH DEFENDER', cx, cy, cr - 45, 0, true);
      break;

    case 6: // Minimal Dark Ring
      // Thin black ring
      ctx.beginPath();
      ctx.arc(cx, cy, cr - 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 40;
      ctx.stroke();

      // Lime green text on black
      ctx.fillStyle = '#A3E635';
      ctx.font = 'bold 24px "Helvetica Neue", sans-serif';
      drawCurvedText(ctx, 'PROTECTING NEPAL', cx, cy, cr - 20, 0, false);

      ctx.fillStyle = '#FFFFFF';
      drawCurvedText(ctx, 'ONE STEP AT A TIME', cx, cy, cr - 20, 0, true);
      break;
  }

  ctx.restore();
}

export default function PledgeFramePage() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [logoImg, setLogoImg] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [finalImage, setFinalImage] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLogoImg(img);
    img.src = asset('/atl-logo.png');
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generatePreview = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const finalBase64 = await generateFinalImage(imageSrc, croppedAreaPixels, selectedTemplate, logoImg);
      setFinalImage(finalBase64);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Live update final image when template changes (if already cropped)
    if (imageSrc && croppedAreaPixels) {
      generatePreview();
    }
  }, [selectedTemplate, imageSrc, croppedAreaPixels]);

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.download = `my-climate-pledge.png`;
    link.href = finalImage;
    link.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f0a',
      color: 'white',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '700', marginBottom: '12px' }}>
          Create Your <span style={{ color: '#7A9D34' }}>Profile Frame</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          Upload your photo, position it, and select a template. 
          The final image is perfectly sized (1080x1080) and social-media ready!
        </p>
      </div>

      {!imageSrc ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', maxWidth: '400px', aspectRatio: '1',
            border: '2px dashed rgba(255,255,255,0.2)',
            borderRadius: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#7A9D34'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7A9D34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <h3 style={{ marginTop: '20px', fontSize: '18px', fontWeight: '600' }}>Select a Photo</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '8px' }}>JPG or PNG</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1000px', gap: '40px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
            {/* Cropper Section */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                position: 'relative', 
                width: '100%', 
                aspectRatio: '1', 
                borderRadius: '24px', 
                overflow: 'hidden',
                backgroundColor: '#000',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Zoom</span>
                <input 
                  type="range" 
                  min={1} max={3} step={0.1} 
                  value={zoom} 
                  onChange={(e) => setZoom(Number(e.target.value))} 
                  style={{ flex: 1, accentColor: '#7A9D34' }}
                />
              </div>

              <button 
                onClick={() => setImageSrc(null)}
                style={{ padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >
                Choose Different Photo
              </button>
            </div>

            {/* Template Selection & Preview */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)' }}>Select Template</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[1, 2, 3, 4, 5, 6].map(id => (
                    <button
                      key={id}
                      onClick={() => setSelectedTemplate(id)}
                      style={{
                        padding: '16px 8px',
                        background: selectedTemplate === id ? 'rgba(122,157,52,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${selectedTemplate === id ? '#7A9D34' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '12px',
                        color: selectedTemplate === id ? '#A3E635' : 'white',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Style {id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Preview (what you get when you download) */}
              {finalImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Final Preview (1080x1080)</span>
                  </div>
                  <img 
                    src={finalImage} 
                    alt="Final Pledge Frame" 
                    style={{ 
                      width: '100%', 
                      borderRadius: '50%', // Show it as a circle in preview since it's a PFP!
                      border: '4px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }} 
                  />
                  <button
                    onClick={handleDownload}
                    style={{
                      padding: '18px',
                      background: 'linear-gradient(135deg, #7A9D34, #5a7a22)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(122,157,52,0.3)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Profile Picture
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <a href={asset('/')} style={{ marginTop: '60px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>
        ← BACK TO CALCULATOR
      </a>
    </div>
  );
}
