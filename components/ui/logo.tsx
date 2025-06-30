"use client"

import React from 'react'

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 150, height = 45, className = "" }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 60" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
    >
      {/* Icono de micrófono ultra minimalista */}
      <circle cx="35" cy="25" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
      <line x1="35" y1="29" x2="35" y2="35" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
      <line x1="31" y1="38" x2="39" y2="38" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
      
      {/* Texto FAKTO */}
      <text 
        x="70" 
        y="40" 
        fontFamily="Inter, sans-serif" 
        fontSize="24" 
        fontWeight="200" 
        fill="currentColor" 
        letterSpacing="4px"
        className="text-foreground dark:text-foreground"
      >
        FAKTO
      </text>
    </svg>
  )
}
