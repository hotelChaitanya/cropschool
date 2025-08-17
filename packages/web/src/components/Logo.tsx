import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({
  width = 40,
  height = 40,
  className = '',
  showText = true,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* CropSchool Logo */}
      <div className="relative" style={{ width, height }}>
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="CropSchool Logo"
            width={width}
            height={height}
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Fallback when logo image is not available */
          <div
            className="flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600"
            style={{ width, height }}
          >
            <span className="text-white font-bold text-xl">🌱</span>
          </div>
        )}
      </div>

      {showText && (
        <span className="text-xl font-bold text-gray-900">CropSchool</span>
      )}
    </div>
  );
}

export function LogoIcon({
  width = 32,
  height = 32,
  className = '',
}: Omit<LogoProps, 'showText'>) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!imageError ? (
        <Image
          src="/logo.png"
          alt="CropSchool"
          width={width}
          height={height}
          className="object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Fallback when logo image is not available */
        <div
          className="flex items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600"
          style={{ width, height }}
        >
          <span className="text-white font-bold">🌱</span>
        </div>
      )}
    </div>
  );
}
