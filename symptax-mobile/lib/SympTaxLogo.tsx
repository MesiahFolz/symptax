import React from "react";
import Svg, { Polygon, Rect, Polyline, Text, TSpan, Line, Defs, Mask } from "react-native-svg";

interface LogoProps {
  width?: number;
  height?: number;
}

export default function SympTaxLogo({ width = 280, height = 140 }: LogoProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 680 340">
      {/* Hexagon shadow */}
      <Polygon
        points="120,275 48,233 48,147 120,105 192,147 192,233"
        transform="translate(4,6)"
        fill="rgb(15, 118, 110)"
        opacity={0.18}
      />
      {/* Hexagon main */}
      <Polygon
        points="120,275 48,233 48,147 120,105 192,147 192,233"
        fill="rgb(13, 148, 136)"
      />
      {/* Hexagon inner ring */}
      <Polygon
        points="120,263 58,229 58,161 120,117 182,161 182,229"
        fill="rgb(15, 118, 110)"
        stroke="rgb(15, 118, 110)"
        strokeWidth={1}
      />
      {/* Medical cross - vertical */}
      <Rect x={106} y={152} width={28} height={86} rx={5} fill="white" />
      {/* Medical cross - horizontal */}
      <Rect x={85} y={173} width={70} height={28} rx={5} fill="white" />
      {/* Pulse line */}
      <Polyline
        points="48,190 75,190 88,165 100,215 112,178 125,178 136,190 192,190"
        fill="none"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brand name */}
      <Text
        x={218}
        y={218}
        fill="rgb(45, 212, 191)"
        fontSize={52}
        fontWeight="500"
      >
        {"Symp"}
        <TSpan fill="rgb(56, 189, 248)">Tax</TSpan>
      </Text>
      {/* Tagline */}
      <Text x={220} y={252} fill="rgb(148, 163, 184)" fontSize={15}>
        SMART HEALTH CONSULTATIONS
      </Text>
    </Svg>
  );
}
