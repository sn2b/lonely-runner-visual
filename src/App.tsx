import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Pause, Plus, Minus } from '@phosphor-icons/react'

interface Runner {
  id: number
  speed: number
  angle: number
  color: string
  isLonely: boolean
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

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [runnerCount, setRunnerCount] = useKV('runner-count', 3)
  const [runners, setRunners] = useKV('runners', [] as Runner[])
  const [lonelinessThreshold, setLonelinessThreshold] = useState(1/3)
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
        isLonely: false
      })
    }
    setRunners(newRunners)
    setLonelinessThreshold(1 / runnerCount)
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
          angle: (runner.angle + runner.speed * deltaTime * 60) % 360
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

          return {
            ...runner,
            isLonely: minDistance >= lonelinessThreshold
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
  }, [isPlaying, lonelinessThreshold])

  const updateRunnerSpeed = (runnerId: number, speed: number) => {
    setRunners(currentRunners => 
      currentRunners.map(runner => 
        runner.id === runnerId ? { ...runner, speed } : runner
      )
    )
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const adjustRunnerCount = (delta: number) => {
    const newCount = Math.max(2, Math.min(8, runnerCount + delta))
    setRunnerCount(newCount)
  }

  const resetPositions = () => {
    setRunners(currentRunners => 
      currentRunners.map((runner, index) => ({
        ...runner,
        angle: index * (360 / runnerCount),
        isLonely: false
      }))
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Lonely Runner Conjecture</h1>
          <p className="text-muted-foreground text-lg">
            Visualizing the mathematical conjecture that runners on a circular track will eventually become "lonely"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Track Visualization</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPositions}
                  >
                    Reset
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center" style={{ aspectRatio: '1' }}>
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full max-w-[400px] max-h-[400px]"
                >
                  {/* Track circle */}
                  <circle
                    cx="200"
                    cy="200"
                    r="150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-border"
                  />
                  
                  {/* Center dot */}
                  <circle
                    cx="200"
                    cy="200"
                    r="3"
                    fill="currentColor"
                    className="text-muted-foreground"
                  />

                  {/* Runners */}
                  {runners.map((runner) => {
                    const radian = (runner.angle * Math.PI) / 180
                    const x = 200 + 150 * Math.cos(radian - Math.PI/2)
                    const y = 200 + 150 * Math.sin(radian - Math.PI/2)
                    
                    return (
                      <g key={runner.id}>
                        {/* Lonely indicator ring */}
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
                        
                        {/* Runner dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill={runner.isLonely ? 'oklch(0.7 0.15 45)' : runner.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                        
                        {/* Runner ID */}
                        <text
                          x={x}
                          y={y + 1}
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
              
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Loneliness threshold: <Badge variant="outline">{(lonelinessThreshold * 100).toFixed(1)}%</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  A runner is "lonely" when their closest neighbor is at least {(lonelinessThreshold * 100).toFixed(1)}% of the track away
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Runner Count */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Number of Runners</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustRunnerCount(-1)}
                    disabled={runnerCount <= 2}
                  >
                    <Minus size={14} />
                  </Button>
                  <Badge variant="secondary" className="min-w-[2rem] justify-center">
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

              {/* Speed Controls */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Runner Speeds</label>
                {runners.map((runner) => (
                  <div key={runner.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: runner.color }}
                        />
                        Runner {runner.id + 1}
                        {runner.isLonely && (
                          <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
                            LONELY
                          </Badge>
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {runner.speed.toFixed(1)}
                      </Badge>
                    </div>
                    <Slider
                      value={[runner.speed]}
                      onValueChange={([value]) => updateRunnerSpeed(runner.id, value)}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <Card>
          <CardHeader>
            <CardTitle>About the Lonely Runner Conjecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Lonely Runner Conjecture states that if n runners start at the same point on a circular track and run at different constant speeds, 
                then each runner will eventually be "lonely" - meaning at some point, their closest neighbor will be at least 1/n of the track away.
              </p>
              <p>
                This conjecture has been proven for n ≤ 7 runners, but remains open for larger values. 
                The visualization above lets you experiment with different configurations to observe this fascinating mathematical phenomenon.
              </p>
              <p>
                Try adjusting the speeds and number of runners to see how different configurations affect when runners become lonely!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App