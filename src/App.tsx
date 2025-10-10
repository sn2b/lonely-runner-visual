import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, Plus, Minus, Sparkle, Shuffle } from '@phosphor-icons/react'

interface Runner {
  id: number
  speed: number
  angle: number
  color: string
  isLonely: boolean
  lonelyStartTime: number | null
  totalLonelyTime: number
  currentLonelyDuration: number
}

const COLORS = [
  'oklch(0.6 0.15 0)',    // Red
  'oklch(0.6 0.15 120)',  // Green  
  'oklch(0.6 0.15 240)',  // Blue
  'oklch(0.6 0.15 60)',   // Yellow
  'oklch(0.6 0.15 300)',  // Magenta
  'oklch(0.6 0.15 180)',  // Cyan
  'oklch(0.4 0.1 30)',    // Brown
  'oklch(0.5 0.1 270)',   // Purple
]

// Known mathematical configurations for the Lonely Runner Conjecture
const PRESET_CONFIGURATIONS = {
  'simple-2': {
    name: 'Simple Case (n=2)',
    description: 'Basic case with 2 runners - proven',
    runners: 2,
    speeds: [1.0, 2.0],
    note: 'Two runners will always be lonely when they are diametrically opposite.'
  },
  'classic-3': {
    name: 'Classic Triangle (n=3)',
    description: 'Three runners with harmonic speeds - proven',
    runners: 3,
    speeds: [1.0, 2.0, 3.0],
    note: 'Each runner becomes lonely when at least 1/3 of track away from others.'
  },
  'fibonacci-4': {
    name: 'Fibonacci Series (n=4)',
    description: 'Four runners using Fibonacci ratios - proven',
    runners: 4,
    speeds: [1.0, 1.6, 2.6, 4.2],
    note: 'Speeds based on Fibonacci sequence create interesting patterns.'
  },
  'prime-5': {
    name: 'Prime Numbers (n=5)',
    description: 'Five runners with prime number speeds - proven',
    runners: 5,
    speeds: [1.0, 2.0, 3.0, 5.0, 7.0],
    note: 'Using prime numbers as speed ratios demonstrates the conjecture.'
  },
  'harmonic-6': {
    name: 'Harmonic Series (n=6)',
    description: 'Six runners in harmonic progression - proven',
    runners: 6,
    speeds: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5],
    note: 'Evenly spaced speeds in arithmetic progression.'
  },
  'edge-case-7': {
    name: 'Edge Case (n=7)',
    description: 'Seven runners - largest proven case',
    runners: 7,
    speeds: [1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4],
    note: 'This is the largest case that has been mathematically proven.'
  },
  'conjecture-8': {
    name: 'Open Question (n=8)',
    description: 'Eight runners - unproven territory',
    runners: 8,
    speeds: [1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1],
    note: 'Beyond n=7, the conjecture remains unproven but likely true.'
  }
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [runnerCount, setRunnerCount] = useKV('runner-count', 3)
  const [runners, setRunners] = useKV('runners', [] as Runner[])
  const [lonelinessThreshold, setLonelinessThreshold] = useState(1/3)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [animationSpeed, setAnimationSpeed] = useKV('animation-speed', 1.0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Initialize runners when count changes
  useEffect(() => {
    const newRunners: Runner[] = []
    for (let i = 0; i < runnerCount; i++) {
      const existingRunner = runners[i]
      newRunners.push({
        id: i,
        speed: existingRunner?.speed || (i + 1) * 0.5,
        angle: existingRunner?.angle || (i * (360 / runnerCount)),
        color: COLORS[i % COLORS.length],
        isLonely: false,
        lonelyStartTime: null,
        totalLonelyTime: existingRunner?.totalLonelyTime || 0,
        currentLonelyDuration: 0
      })
    }
    setRunners(newRunners)
    // For n=2, use a much smaller threshold (1%) to make the conjecture observable
    // For all other n, use the theoretical 1/n threshold
    if (runnerCount === 2) {
      setLonelinessThreshold(0.01) // 1% for n=2
    } else {
      setLonelinessThreshold(1 / runnerCount) // Theoretical threshold for n>2
    }
  }, [runnerCount])

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime
      }
      
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      setRunners(currentRunners => {
        const updatedRunners = currentRunners.map(runner => ({
          ...runner,
          angle: (runner.angle + runner.speed * deltaTime * 60 * animationSpeed) % 360
        }))

        // Calculate loneliness for each runner
        return updatedRunners.map(runner => {
          let minDistance = Infinity
          
          updatedRunners.forEach(otherRunner => {
            if (otherRunner.id !== runner.id) {
              const angleDiff = Math.abs(runner.angle - otherRunner.angle)
              const distance = Math.min(angleDiff, 360 - angleDiff) / 360
              minDistance = Math.min(minDistance, distance)
            }
          })

          const isCurrentlyLonely = minDistance >= lonelinessThreshold
          const now = currentTime / 1000 // Convert to seconds
          
          let newLonelyStartTime = runner.lonelyStartTime
          let newTotalLonelyTime = runner.totalLonelyTime
          let newCurrentLonelyDuration = runner.currentLonelyDuration

          if (isCurrentlyLonely && !runner.isLonely) {
            // Just became lonely
            newLonelyStartTime = now
            newCurrentLonelyDuration = 0
          } else if (!isCurrentlyLonely && runner.isLonely) {
            // Just stopped being lonely
            if (runner.lonelyStartTime !== null) {
              const duration = now - runner.lonelyStartTime
              newTotalLonelyTime += duration
            }
            newLonelyStartTime = null
            newCurrentLonelyDuration = 0
          } else if (isCurrentlyLonely && runner.lonelyStartTime !== null) {
            // Still lonely, update current duration
            newCurrentLonelyDuration = now - runner.lonelyStartTime
          }

          return {
            ...runner,
            isLonely: isCurrentlyLonely,
            lonelyStartTime: newLonelyStartTime,
            totalLonelyTime: newTotalLonelyTime,
            currentLonelyDuration: newCurrentLonelyDuration
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      lastTimeRef.current = 0
    }
  }, [isPlaying, lonelinessThreshold, animationSpeed])

  const updateRunnerSpeed = (runnerId: number, speed: number) => {
    setRunners(currentRunners => 
      currentRunners.map(runner => 
        runner.id === runnerId ? { ...runner, speed } : runner
      )
    )
    clearPreset() // Clear preset when manually adjusting speeds
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const adjustRunnerCount = (delta: number) => {
    const newCount = Math.max(2, Math.min(8, runnerCount + delta))
    setRunnerCount(newCount)
    clearPreset() // Clear preset when manually adjusting
  }

  const resetPositions = () => {
    setRunners(currentRunners => 
      currentRunners.map((runner, index) => ({
        ...runner,
        angle: index * (360 / runnerCount),
        isLonely: false,
        lonelyStartTime: null,
        totalLonelyTime: 0,
        currentLonelyDuration: 0
      }))
    )
  }

  const loadPreset = (presetKey: string) => {
    const preset = PRESET_CONFIGURATIONS[presetKey as keyof typeof PRESET_CONFIGURATIONS]
    if (!preset) return

    setSelectedPreset(presetKey)
    setRunnerCount(preset.runners)
    
    // The runners will be recreated by the useEffect when runnerCount changes
    // But we need to set the speeds after that happens
    setTimeout(() => {
      setRunners(currentRunners => 
        currentRunners.map((runner, index) => ({
          ...runner,
          speed: preset.speeds[index] || 1.0,
          angle: index * (360 / preset.runners),
          isLonely: false,
          lonelyStartTime: null,
          totalLonelyTime: 0,
          currentLonelyDuration: 0
        }))
      )
    }, 100)
  }

  const clearPreset = () => {
    setSelectedPreset(null)
  }

  const randomizeSpeeds = () => {
    setRunners(currentRunners => 
      currentRunners.map(runner => ({
        ...runner,
        speed: Math.random() * 20 - 10, // Random speed between -10 and 10
        totalLonelyTime: 0,
        currentLonelyDuration: 0,
        isLonely: false,
        lonelyStartTime: null
      }))
    )
    clearPreset() // Clear preset when randomizing
  }

  const formatTime = (seconds: number) => {
    return seconds.toFixed(1) + 's'
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="text-center space-y-2 px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">Lonely Runner Conjecture</h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl mx-auto">
            Visualizing the mathematical conjecture that runners on a circular track will eventually become "lonely"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-lg">Track Visualization</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPositions}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={randomizeSpeeds}
                    className="flex items-center gap-2"
                  >
                    <Shuffle size={16} />
                    <span className="hidden sm:inline">Random</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-center w-full aspect-square max-w-[500px] mx-auto">
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full"
                >
                  <circle
                    cx="200"
                    cy="200"
                    r="150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border"
                  />
                  
                  <circle
                    cx="200"
                    cy="200"
                    r="3"
                    fill="currentColor"
                    className="text-muted-foreground"
                  />

                  {runners.map((runner) => {
                    const radian = (runner.angle * Math.PI) / 180
                    const x = 200 + 150 * Math.cos(radian - Math.PI/2)
                    const y = 200 + 150 * Math.sin(radian - Math.PI/2)
                    
                    return (
                      <g key={runner.id}>
                        {runner.isLonely && (
                          <circle
                            cx={x}
                            cy={y}
                            r="12"
                            fill="none"
                            stroke="oklch(0.7 0.15 45)"
                            strokeWidth="3"
                            className="animate-pulse"
                          />
                        )}
                        
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill={runner.isLonely ? 'oklch(0.7 0.15 45)' : runner.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                        
                        {runner.speed < 0 && (
                          <path
                            d={`M ${x-3} ${y-1} L ${x+1} ${y-1} L ${x-1} ${y-3} M ${x+1} ${y-1} L ${x-1} ${y+1}`}
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                        )}
                        
                        <text
                          x={x}
                          y={runner.speed < 0 ? y + 3 : y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-semibold fill-white"
                        >
                          {runner.id + 1}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              
              <div className="mt-4 space-y-2 px-2">
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Threshold:</span>
                  <Badge variant="outline">{(lonelinessThreshold * 100).toFixed(1)}%</Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground text-center max-w-2xl mx-auto">
                  A runner is "lonely" when their closest neighbor is at least {(lonelinessThreshold * 100).toFixed(1)}% of the track away.
                  {runnerCount === 2 
                    ? " (Adjusted to 1% for n=2)" 
                    : ` (Threshold: 1/n = ${(100/runnerCount).toFixed(1)}%)`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Currently lonely:</span>
                  <Badge variant="secondary">
                    {runners.filter(r => r.isLonely).length} / {runners.length}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Individual Times:</span>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {runners.map((runner) => {
                      const totalTime = runner.totalLonelyTime + (runner.isLonely ? runner.currentLonelyDuration : 0)
                      return (
                        <div key={runner.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: runner.color }}
                            />
                            <span className="truncate">Runner {runner.id + 1}</span>
                          </div>
                          <span className="font-mono flex-shrink-0 ml-2">{formatTime(totalTime)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total collective:</span>
                  <span className="font-mono text-sm">
                    {formatTime(runners.reduce((sum, r) => 
                      sum + r.totalLonelyTime + (r.isLonely ? r.currentLonelyDuration : 0), 0
                    ))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkle size={16} className="text-accent" />
                    Presets
                  </label>
                  <Select value={selectedPreset || ""} onValueChange={loadPreset}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose configuration..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRESET_CONFIGURATIONS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{config.name}</span>
                            <span className="text-xs text-muted-foreground">{config.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedPreset && (
                    <div className="bg-muted/30 p-2.5 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground truncate">
                          {PRESET_CONFIGURATIONS[selectedPreset as keyof typeof PRESET_CONFIGURATIONS].name}
                        </span>
                        <Button variant="ghost" size="sm" onClick={clearPreset} className="h-6 px-2 text-xs flex-shrink-0">
                          Clear
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {PRESET_CONFIGURATIONS[selectedPreset as keyof typeof PRESET_CONFIGURATIONS].note}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Runners</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRunnerCount(-1)}
                      disabled={runnerCount <= 2}
                    >
                      <Minus size={14} />
                    </Button>
                    <Badge variant="secondary" className="min-w-[2.5rem] justify-center">
                      {runnerCount}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRunnerCount(1)}
                      disabled={runnerCount >= 8}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Animation Speed</label>
                    <Badge variant="outline" className="text-xs">
                      {animationSpeed === 0 ? 'Paused' : `${animationSpeed.toFixed(1)}x`}
                    </Badge>
                  </div>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={([value]) => setAnimationSpeed(value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="hidden lg:block">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sparkle size={16} className="text-accent" />
                  Presets
                </label>
                <Select value={selectedPreset || ""} onValueChange={loadPreset}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose configuration..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESET_CONFIGURATIONS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{config.name}</span>
                          <span className="text-xs text-muted-foreground">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedPreset && (
                  <div className="bg-muted/30 p-2.5 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground truncate">
                        {PRESET_CONFIGURATIONS[selectedPreset as keyof typeof PRESET_CONFIGURATIONS].name}
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearPreset} className="h-6 px-2 text-xs flex-shrink-0">
                        Clear
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {PRESET_CONFIGURATIONS[selectedPreset as keyof typeof PRESET_CONFIGURATIONS].note}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Runners</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustRunnerCount(-1)}
                    disabled={runnerCount <= 2}
                  >
                    <Minus size={14} />
                  </Button>
                  <Badge variant="secondary" className="min-w-[2.5rem] justify-center">
                    {runnerCount}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustRunnerCount(1)}
                    disabled={runnerCount >= 8}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Animation Speed</label>
                  <Badge variant="outline" className="text-xs">
                    {animationSpeed === 0 ? 'Paused' : `${animationSpeed.toFixed(1)}x`}
                  </Badge>
                </div>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={([value]) => setAnimationSpeed(value)}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Runner Speeds</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={randomizeSpeeds}
                  className="flex items-center gap-1 h-7 px-2 text-xs"
                >
                  <Shuffle size={12} />
                  Randomize
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {runners.map((runner) => (
                  <div key={runner.id} className="space-y-2 p-3 rounded-lg border border-border/50 bg-card/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: runner.color }}
                        />
                        <span className="text-sm font-medium truncate">Runner {runner.id + 1}</span>
                        {runner.isLonely && (
                          <Badge variant="default" className="bg-accent text-accent-foreground text-xs flex-shrink-0">
                            LONELY
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {runner.speed >= 0 ? '+' : ''}{runner.speed.toFixed(1)}
                      </Badge>
                    </div>
                    <Slider
                      value={[runner.speed]}
                      onValueChange={([value]) => updateRunnerSpeed(runner.id, value)}
                      min={-10}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-mono">
                          {runner.isLonely ? formatTime(runner.currentLonelyDuration) : '0.0s'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-mono">
                          {formatTime(runner.totalLonelyTime + (runner.isLonely ? runner.currentLonelyDuration : 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">About the Lonely Runner Conjecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Lonely Runner Conjecture states that if n runners start at the same point on a circular track and run at different constant speeds, 
                then each runner will eventually be "lonely" - meaning at some point, their closest neighbor will be at least 1/n of the track away.
                For n=2, we use a 1% threshold instead of the theoretical 50% to make loneliness actually observable.
              </p>
              <p>
                This conjecture has been proven for n ≤ 7 runners, but remains open for larger values. 
                The visualization above lets you experiment with different configurations to observe this fascinating mathematical phenomenon.
              </p>
              
              <div className="bg-muted/50 p-3 md:p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
                  <Sparkle size={16} className="text-accent" />
                  Mathematical Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex-shrink-0">n = 2, 3:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">Proven</Badge>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex-shrink-0">n = 4, 5:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">Proven</Badge>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex-shrink-0">n = 6, 7:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">Proven</Badge>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex-shrink-0">n ≥ 8:</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0">Open</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App