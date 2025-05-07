
import React from "react";

export const RelationshipMarkers: React.FC = () => {
  return (
    <defs>
      {/* Arrow marker */}
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
      
      {/* Triangle marker (empty) */}
      <marker
        id="triangle"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="currentColor" strokeWidth="1" />
      </marker>
      
      {/* Diamond marker */}
      <marker
        id="diamond"
        viewBox="0 0 12 12"
        refX="6"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="white" stroke="currentColor" strokeWidth="1" />
      </marker>
      
      {/* Satisfy marker */}
      <marker
        id="satisfy"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 6 L 10 6 M 5 2 L 10 6 L 5 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      
      {/* Verify marker */}
      <marker
        id="verify"
        viewBox="0 0 12 12"
        refX="10"
        refY="6"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 1 1 L 6 11 L 11 1" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
      
      {/* Allocate marker */}
      <marker
        id="allocate"
        viewBox="0 0 14 14"
        refX="11"
        refY="7"
        markerWidth="9"
        markerHeight="9"
        orient="auto-start-reverse"
      >
        <circle cx="7" cy="7" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 4 7 L 10 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </marker>
    </defs>
  );
};
