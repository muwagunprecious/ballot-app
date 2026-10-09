import React from 'react';

interface LandmarkSvgProps {
  type?: 'lekki_bridge' | 'zuma_rock' | 'olumo_rock' | 'aso_rock' | 'cocoa_house' | 'national_theatre' | 'confluence' | 'generic_monument';
  className?: string;
  opacity?: number;
  color?: string;
}

export const LandmarkSvg: React.FC<LandmarkSvgProps> = ({
  type = 'lekki_bridge',
  className = 'w-full h-full',
  opacity = 0.08,
  color = '#087443',
}) => {
  switch (type) {
    case 'lekki_bridge':
      // Lekki-Ikoyi Link Bridge stylized cable-stayed pylon illustration
      return (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ opacity }}
        >
          {/* Water waves */}
          <path
            d="M0 450 C200 440, 300 460, 500 445 C700 430, 750 455, 800 450"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          <path
            d="M0 470 C150 465, 350 480, 550 465 C700 455, 780 475, 800 470"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Road Deck */}
          <line x1="0" y1="360" x2="800" y2="360" stroke={color} strokeWidth="8" />
          <line x1="0" y1="375" x2="800" y2="375" stroke={color} strokeWidth="2" />
          {/* Deck Railings & Lights */}
          {Array.from({ length: 17 }).map((_, i) => (
            <line
              key={`post-${i}`}
              x1={50 * i}
              y1="345"
              x2={50 * i}
              y2="360"
              stroke={color}
              strokeWidth="2"
            />
          ))}

          {/* Central Pylon (Tower) */}
          <polygon
            points="380,360 395,80 405,80 420,360 410,360 400,100 390,360"
            fill={color}
            fillOpacity="0.3"
            stroke={color}
            strokeWidth="3"
          />
          {/* Cross Struts */}
          <line x1="388" y1="200" x2="412" y2="200" stroke={color} strokeWidth="4" />
          <line x1="384" y1="280" x2="416" y2="280" stroke={color} strokeWidth="4" />
          
          {/* Cable stays Left */}
          <line x1="400" y1="110" x2="100" y2="360" stroke={color} strokeWidth="2.5" />
          <line x1="400" y1="140" x2="160" y2="360" stroke={color} strokeWidth="2" />
          <line x1="400" y1="170" x2="220" y2="360" stroke={color} strokeWidth="2" />
          <line x1="400" y1="200" x2="280" y2="360" stroke={color} strokeWidth="1.5" />
          <line x1="400" y1="230" x2="330" y2="360" stroke={color} strokeWidth="1.5" />

          {/* Cable stays Right */}
          <line x1="400" y1="110" x2="700" y2="360" stroke={color} strokeWidth="2.5" />
          <line x1="400" y1="140" x2="640" y2="360" stroke={color} strokeWidth="2" />
          <line x1="400" y1="170" x2="580" y2="360" stroke={color} strokeWidth="2" />
          <line x1="400" y1="200" x2="520" y2="360" stroke={color} strokeWidth="1.5" />
          <line x1="400" y1="230" x2="470" y2="360" stroke={color} strokeWidth="1.5" />

          {/* Pier Foundations */}
          <rect x="370" y="360" width="60" height="90" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="3" />
        </svg>
      );

    case 'zuma_rock':
    case 'aso_rock':
      // Zuma & Aso Rock Monolith illustration
      return (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ opacity }}
        >
          {/* Groundline */}
          <path d="M0 430 L800 430" stroke={color} strokeWidth="4" />
          
          {/* Mountain Profile */}
          <path
            d="M 120 430 Q 160 300 240 180 Q 320 80 400 70 Q 480 80 560 180 Q 640 300 680 430 Z"
            fill={color}
            fillOpacity="0.1"
            stroke={color}
            strokeWidth="3.5"
          />

          {/* Rock Contour Lines & Natural Striations */}
          <path d="M 330 90 Q 360 220 350 430" stroke={color} strokeWidth="2" strokeDasharray="5 5" />
          <path d="M 400 75 Q 405 200 400 430" stroke={color} strokeWidth="2.5" />
          <path d="M 470 90 Q 440 220 450 430" stroke={color} strokeWidth="2" strokeDasharray="5 5" />
          <path d="M 270 150 Q 290 270 260 430" stroke={color} strokeWidth="1.5" />
          <path d="M 530 150 Q 510 270 540 430" stroke={color} strokeWidth="1.5" />

          {/* Characteristic Natural Face Contours (Zuma Rock) */}
          <ellipse cx="370" cy="220" rx="15" ry="25" stroke={color} strokeWidth="2" />
          <ellipse cx="430" cy="220" rx="15" ry="25" stroke={color} strokeWidth="2" />
          <path d="M 385 270 Q 400 290 415 270" stroke={color} strokeWidth="2.5" />
          <path d="M 360 330 Q 400 350 440 330" stroke={color} strokeWidth="3" />

          {/* Foreground savannah shrubs */}
          <path d="M 80 430 Q 100 390 120 430 M 140 430 Q 160 400 180 430 M 620 430 Q 650 380 680 430 M 710 430 Q 730 405 750 430" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'olumo_rock':
      // Olumo Rock granite outcrop
      return (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ opacity }}
        >
          <path d="M 0 440 L 800 440" stroke={color} strokeWidth="3" />
          {/* Terraced Rock Formations */}
          <path
            d="M 100 440 L 150 320 L 260 270 L 320 160 L 480 140 L 580 230 L 660 310 L 720 440 Z"
            fill={color}
            fillOpacity="0.1"
            stroke={color}
            strokeWidth="3.5"
          />
          {/* Caves and stairs */}
          <path d="M 320 160 L 360 440 M 480 140 L 510 440 M 260 270 L 290 440 M 580 230 L 600 440" stroke={color} strokeWidth="2" strokeDasharray="6 4" />
          <rect x="370" y="240" width="70" height="40" rx="6" stroke={color} strokeWidth="2" />
        </svg>
      );

    case 'cocoa_house':
      // Cocoa House Ibadan (First skyscraper in Tropical Africa)
      return (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ opacity }}
        >
          <line x1="0" y1="450" x2="800" y2="450" stroke={color} strokeWidth="4" />
          {/* Main Tower */}
          <rect x="330" y="60" width="140" height="390" stroke={color} strokeWidth="3.5" fill={color} fillOpacity="0.08" />
          {/* Roof Spire and Crown */}
          <polygon points="320,60 400,20 480,60" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.2" />
          <line x1="400" y1="20" x2="400" y2="0" stroke={color} strokeWidth="3" />

          {/* Window Grid */}
          {Array.from({ length: 12 }).map((_, row) => (
            <React.Fragment key={`row-${row}`}>
              <line x1="340" y1={90 + row * 28} x2="460" y2={90 + row * 28} stroke={color} strokeWidth="1.5" />
              {Array.from({ length: 5 }).map((_, col) => (
                <line
                  key={`win-${row}-${col}`}
                  x1={345 + col * 23}
                  y1={75 + row * 28}
                  x2={345 + col * 23}
                  y2={90 + row * 28}
                  stroke={color}
                  strokeWidth="1.5"
                />
              ))}
            </React.Fragment>
          ))}
          {/* Podium base */}
          <rect x="270" y="380" width="260" height="70" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.1" />
        </svg>
      );

    case 'confluence':
    case 'generic_monument':
    default:
      // Niger-Benue River Confluence & Unity Monument
      return (
        <svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={{ opacity }}
        >
          {/* River River Fork */}
          <path
            d="M 50 80 Q 250 200 400 280 Q 550 360 750 480"
            stroke={color}
            strokeWidth="6"
            strokeDasharray="10 5"
          />
          <path
            d="M 750 80 Q 550 200 400 280 Q 400 400 400 500"
            stroke={color}
            strokeWidth="6"
          />
          {/* Decorative Nigerian Coat of Arms Eagle & Shield Geometry */}
          <circle cx="400" cy="200" r="100" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="400,120 480,240 320,240" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.08" />
          <polygon points="400,280 480,160 320,160" stroke={color} strokeWidth="3" fill={color} fillOpacity="0.08" />
          <circle cx="400" cy="200" r="30" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.2" />
        </svg>
      );
  }
};
