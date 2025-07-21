# Lonely Runner Conjecture Visualization

An interactive tool that visualizes the famous Lonely Runner Conjecture through animated runners moving on a circular track at different speeds.

**Experience Qualities**:
1. **Educational** - Makes complex mathematical concepts accessible through visual demonstration
2. **Interactive** - Users can experiment with different configurations to explore the conjecture
3. **Mesmerizing** - Smooth animations create an engaging, almost hypnotic viewing experience

**Complexity Level**: Light Application (multiple features with basic state)
- Real-time animation system with multiple configurable parameters and mathematical calculations for loneliness detection

## Essential Features

**Runner Animation System**
- Functionality: Animated dots moving around a circle at configurable speeds
- Purpose: Visual representation of the mathematical problem
- Trigger: Automatic on load, with play/pause controls
- Progression: Load → Display circle → Animate runners → Calculate loneliness → Highlight lonely states
- Success criteria: Smooth 60fps animation with accurate speed differentials

**Speed Configuration**
- Functionality: Adjustable speed sliders for each runner
- Purpose: Allows exploration of different speed combinations
- Trigger: User interaction with speed controls
- Progression: Adjust slider → Update runner speed → Recalculate loneliness in real-time
- Success criteria: Immediate response to speed changes with smooth transitions

**Runner Count Control**
- Functionality: Add/remove runners (2-8 runners supported)
- Purpose: Test conjecture with different numbers of runners
- Trigger: Plus/minus buttons or dropdown selection
- Progression: Change count → Add/remove runners → Reset speeds → Resume animation
- Success criteria: Seamless addition/removal without breaking animation

**Loneliness Detection**
- Functionality: Real-time calculation of minimum distance between any runner and all others
- Purpose: Core mathematical validation of the conjecture
- Trigger: Continuous during animation
- Progression: Calculate positions → Find minimum distances → Determine if threshold met → Highlight lonely runner
- Success criteria: Accurate detection with visual feedback when loneliness threshold (1/n) is reached

**Visual Feedback System**
- Functionality: Color changes, highlights, and indicators for lonely states
- Purpose: Clear communication of when conjecture conditions are met
- Trigger: When loneliness threshold is reached
- Progression: Detect loneliness → Change runner color → Show distance indicator → Log event
- Success criteria: Immediately visible when any runner becomes "lonely"

## Edge Case Handling
- **Identical Speeds**: Prevent runners from having exactly the same speed to avoid mathematical edge cases
- **Performance**: Graceful degradation if frame rate drops below acceptable levels
- **Mobile Touch**: Ensure sliders work properly on touch devices
- **Window Resize**: Maintain proper circle scaling and runner positions
- **Animation Pause**: Preserve exact positions when pausing and resuming

## Design Direction
The design should feel like a sophisticated mathematical instrument - clean, precise, and scientific yet approachable. Think of it as a digital version of a physics demonstration tool you'd find in a university classroom.

## Color Selection
Triadic color scheme to distinguish different runners while maintaining visual harmony and ensuring the lonely state stands out dramatically.

- **Primary Color**: Deep Navy Blue (oklch(0.25 0.1 240)) - Professional, mathematical feel for the interface
- **Secondary Colors**: Slate Gray (oklch(0.4 0.02 240)) for controls and Warm White (oklch(0.97 0.01 60)) for backgrounds
- **Accent Color**: Bright Orange (oklch(0.7 0.15 45)) - High-contrast highlight for lonely runner detection
- **Foreground/Background Pairings**: 
  - Background (Warm White): Navy text - Ratio 8.2:1 ✓
  - Primary (Navy): White text - Ratio 8.2:1 ✓
  - Accent (Orange): Navy text - Ratio 4.6:1 ✓
  - Secondary (Slate): White text - Ratio 4.8:1 ✓

## Font Selection
Clean, technical typography that conveys precision and clarity - Inter for its excellent readability and mathematical character support.

**Typographic Hierarchy**:
- H1 (App Title): Inter Bold/32px/tight letter spacing
- H2 (Section Headers): Inter SemiBold/20px/normal spacing  
- Body (Controls): Inter Regular/16px/relaxed line height
- Small (Speed Values): Inter Medium/14px/tabular numbers

## Animations
Smooth, physics-based motion that feels natural and precise, with subtle UI animations that don't distract from the mathematical demonstration.

**Purposeful Meaning**: Motion communicates the mathematical relationships and draws attention to significant events (loneliness detection)
**Hierarchy of Movement**: Primary focus on runner animation, secondary on UI state changes, minimal on control interactions

## Component Selection

**Components**: 
- Card for main visualization area and control panels
- Slider for speed controls with custom styling
- Button for play/pause and runner count controls
- Badge for displaying current speed values and loneliness indicators
- Separator for organizing control sections

**Customizations**: 
- Custom circular track component with SVG
- Custom runner components with position calculation
- Custom loneliness detection visualization overlay

**States**:
- Buttons: Distinct play/pause states with icon transitions
- Sliders: Smooth handle movement with value preview
- Runners: Normal, highlighted (lonely), and dimmed states

**Icon Selection**: 
- Play/Pause from Phosphor for animation controls
- Plus/Minus for runner count adjustment  
- Settings gear for advanced options

**Spacing**: Consistent 4/6/8/12px spacing using Tailwind scale for tight mathematical precision

**Mobile**: 
- Responsive circle sizing that maintains aspect ratio
- Touch-friendly slider controls with increased hit areas
- Stacked layout for controls on smaller screens
- Simplified UI with essential controls prioritized