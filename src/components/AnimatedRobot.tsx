import { useEffect, useRef } from "react"
import "./AnimatedRobot.css"

interface AnimatedRobotProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AnimatedRobot({ className = "", size = "lg" }: AnimatedRobotProps) {
  const robotRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: "w-20 h-28",
    md: "w-32 h-44",
    lg: "w-40 h-56",
  }

  const handleRobotClick = () => {
    if (!robotRef.current) return

    const robot = robotRef.current
    const mainEye = robot.querySelector(".main-eye") as HTMLElement
    const indicators = robot.querySelectorAll(".indicator") as NodeListOf<HTMLElement>
    const antennas = robot.querySelectorAll(".antenna") as NodeListOf<HTMLElement>

    // Main eye reaction - intense glow
    if (mainEye) {
      mainEye.style.boxShadow = "0 0 40px rgba(255, 46, 99, 1), inset 0 2px 10px rgba(0,0,0,0.8)"
      mainEye.style.transform = "translateX(-50%) scale(1.1)"
      setTimeout(() => {
        mainEye.style.boxShadow = "0 0 20px rgba(255, 46, 99, 0.3), inset 0 2px 10px rgba(0,0,0,0.8)"
        mainEye.style.transform = "translateX(-50%) scale(1)"
      }, 400)
    }

    // All indicators flash simultaneously
    indicators.forEach((indicator) => {
      indicator.style.background = "#ffffff"
      indicator.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)"
      setTimeout(() => {
        indicator.style.background = "#FF2E63"
        indicator.style.boxShadow = "none"
      }, 200)
    })

    // Antennas vibrate
    antennas.forEach((antenna, index) => {
      const isLeft = index === 0
      antenna.style.transform = `rotate(${isLeft ? -20 : 20}deg)`
      setTimeout(() => {
        antenna.style.transform = `rotate(${isLeft ? -12 : 12}deg)`
      }, 200)
    })

    // Robot enhanced bounce
    robot.style.transform = "translateY(-20px) rotate(2deg) scale(1.05)"
    setTimeout(() => {
      robot.style.transform = "translateY(0) rotate(0deg) scale(1)"
    }, 300)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return

      const robotBody = robotRef.current.querySelector(".robot-body") as HTMLElement
      const mainEye = robotRef.current.querySelector(".main-eye") as HTMLElement

      if (!robotBody || !mainEye) return

      const bodyRect = robotBody.getBoundingClientRect()
      const centerX = bodyRect.left + bodyRect.width / 2
      const centerY = bodyRect.top + bodyRect.height / 2

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const distance = Math.min(3, Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)) / 100)

      const moveX = Math.cos(angle) * distance
      const moveY = Math.sin(angle) * distance

      mainEye.style.transform = `translateX(-50%) translate(${moveX}px, ${moveY}px)`
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <div ref={robotRef} className="robot" onClick={handleRobotClick}>
        {/* Main egg-shaped body */}
        <div className="robot-body">
          <div className="orange-stripe"></div>
          <div className="texture-overlay"></div>

          {/* Antennas */}
          <div className="antenna left"></div>
          <div className="antenna right"></div>

          {/* Main eye/camera */}
          <div className="main-eye"></div>

          {/* Side sensors */}
          <div className="side-sensor left"></div>
          <div className="side-sensor right"></div>

          {/* Indicator lights */}
          <div className="indicator top"></div>
          <div className="indicator bottom-left"></div>
          <div className="indicator bottom-right"></div>
        </div>

        {/* Mechanical arms */}
        <div className="arm left">
          <div className="arm-segment">
            <div className="arm-joint"></div>
          </div>
          <div className="hand"></div>
        </div>
        <div className="arm right">
          <div className="arm-segment">
            <div className="arm-joint"></div>
          </div>
          <div className="hand"></div>
        </div>

        {/* Body base */}
        <div className="body-base"></div>
      </div>
    </div>
  )
}
