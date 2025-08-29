import { useState, useRef, useEffect } from 'react';
import { Gift, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CouponOffer } from '@/data/mockCoupons';
import { formatExpiryDate } from '@/data/mockCoupons';

interface ScratchCardProps {
  coupon: CouponOffer;
  onScratchComplete?: () => void;
}

export default function ScratchCard({ coupon, onScratchComplete }: ScratchCardProps) {
  const [isScratched, setIsScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw scratch surface
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch texture
    ctx.fillStyle = '#A0A0A0';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Add "SCRATCH HERE" text
    ctx.fillStyle = '#666';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '12px Arial';
    ctx.fillText('to reveal your offer!', canvas.width / 2, canvas.height / 2 + 10);
  }, []);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const progress = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    if (progress > 60 && !isScratched) {
      setIsScratched(true);
      onScratchComplete?.();
    }
  };

  const handleMouseDown = () => {
    isDrawingRef.current = true;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      scratch(e);
    }
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText(coupon.couponCode);
    toast.success('Coupon code copied!');
  };

  const revealOffer = () => {
    setIsScratched(true);
    onScratchComplete?.();
  };

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center bg-black">
      <div className="relative w-80 h-96 mx-4">
        {/* Background Card */}
        <div className={`absolute inset-0 bg-gradient-to-br ${coupon.backgroundColor} rounded-2xl shadow-2xl`}>
          {/* Revealed Content */}
          <div className={`p-6 h-full flex flex-col justify-center items-center text-center ${coupon.textColor} transition-opacity duration-500 ${isScratched ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`mb-4 ${coupon.iconColor}`}>
              <Gift className="h-12 w-12 mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{coupon.title}</h2>
            <p className="text-lg mb-4 opacity-90">{coupon.description}</p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 w-full">
              <p className="text-sm opacity-75 mb-1">Coupon Code</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg font-bold">{coupon.couponCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyCouponCode}
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm opacity-75 mb-2">
              Valid till {formatExpiryDate(coupon.expiryDate)}
            </div>
            
            <div className="flex items-center text-xs opacity-60">
              <Star className="h-3 w-3 mr-1" />
              <span>Only applicable on selected products & services</span>
            </div>
          </div>
        </div>

        {/* Scratch Layer */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full rounded-2xl cursor-pointer transition-opacity duration-500 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={(e) => {
            e.preventDefault();
            scratch(e);
          }}
        />

        {/* Skip Button */}
        {!isScratched && (
          <Button
            variant="ghost"
            size="sm"
            onClick={revealOffer}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
          >
            Skip
          </Button>
        )}

        {/* Progress Indicator */}
        {!isScratched && scratchProgress > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${scratchProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instruction Text */}
      {!isScratched && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-white/60 text-sm">
            Scratch the card above to reveal your exclusive offer!
          </p>
        </div>
      )}
    </div>
  );
}
