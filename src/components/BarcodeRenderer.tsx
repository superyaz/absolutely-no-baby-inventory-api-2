import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  format?: 'CODE128' | 'EAN13';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  lineColor?: string;
  background?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.6,
  height = 48,
  displayValue = true,
  fontSize = 12,
  className = '',
  lineColor = '#000000',
  background = '#ffffff'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue,
        fontSize,
        font: 'JetBrains Mono',
        textMargin: 3,
        lineColor,
        background,
        margin: 4
      });
    } catch {
      // Fallback to CODE128 if format failed
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          font: 'JetBrains Mono',
          lineColor,
          background,
          margin: 4
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, lineColor, background]);

  return (
    <div className={`inline-flex flex-col items-center bg-white rounded p-1 ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};
