'use client'

import { setHideConfetti } from 'lib/store/slices/uiSlice'
import { store, useUiSelector } from 'lib/store/store'
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface Confetti3DProps {
  burstTrigger?: number
}

interface ConfettiUserData {
  velocity: { x: number; y: number; z: number }
  rotationSpeed: { x: number; y: number; z: number }
  gravity: number
  life: number
  fadeSpeed: number
}

const COLORS: number[] = [
  0x0891b2, 0xa78bfa, 0xf472b6, 0x0e7490, 0x38bdf8, 0xc084fc, 0xfb7185, 0x34d399, 0x22d3ee,
  0xe879f9, 0x818cf8, 0xf9a8d4
]

export const Confetti3D: React.FC<Confetti3DProps> = ({ burstTrigger = 0 }) => {
  const { confetti: trigger } = useUiSelector()
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const confettiPiecesRef = useRef<THREE.Mesh[]>([])
  const isActiveRef = useRef(false)
  const prevBurstTrigger = useRef(burstTrigger)
  const duration = 3000

  const createConfetti = (count: number = 100): THREE.Mesh[] => {
    if (!sceneRef.current) return []
    const scene = sceneRef.current
    const pieces: THREE.Mesh[] = []

    for (let i = 0; i < count; i++) {
      const geometry = new THREE.PlaneGeometry(0.15, 0.08)
      const material = new THREE.MeshBasicMaterial({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      })

      const confetti = new THREE.Mesh(geometry, material)
      confetti.position.x = (Math.random() - 0.5) * 12
      confetti.position.y = 6 + Math.random() * 3
      confetti.position.z = (Math.random() - 0.5) * 4
      confetti.rotation.x = Math.random() * Math.PI * 2
      confetti.rotation.y = Math.random() * Math.PI * 2
      confetti.rotation.z = Math.random() * Math.PI * 2

      confetti.userData = {
        velocity: {
          x: (Math.random() - 0.5) * 0.04,
          y: -0.03 - Math.random() * 0.02,
          z: (Math.random() - 0.5) * 0.03
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
          z: (Math.random() - 0.5) * 0.2
        },
        gravity: -0.0012,
        life: 1.0,
        fadeSpeed: 0.005
      } as ConfettiUserData

      scene.add(confetti)
      pieces.push(confetti)
    }

    return pieces
  }

  const createBurst = (count: number = 120, origin = { x: 0, y: 0, z: 0 }): THREE.Mesh[] => {
    if (!sceneRef.current) return []
    const scene = sceneRef.current
    const pieces: THREE.Mesh[] = []

    for (let i = 0; i < count; i++) {
      const geometry = new THREE.PlaneGeometry(0.15, 0.08)
      const material = new THREE.MeshBasicMaterial({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
      })

      const confetti = new THREE.Mesh(geometry, material)

      // Start at origin with small random offset
      confetti.position.x = origin.x + (Math.random() - 0.5) * 0.5
      confetti.position.y = origin.y + (Math.random() - 0.5) * 0.5
      confetti.position.z = origin.z + (Math.random() - 0.5) * 0.5

      confetti.rotation.x = Math.random() * Math.PI * 2
      confetti.rotation.y = Math.random() * Math.PI * 2
      confetti.rotation.z = Math.random() * Math.PI * 2

      // Radial explosion velocity
      const angle = Math.random() * Math.PI * 2
      const speed = 0.08 + Math.random() * 0.12
      const upwardBias = 0.04 + Math.random() * 0.08

      confetti.userData = {
        velocity: {
          x: Math.cos(angle) * speed,
          y: upwardBias + Math.abs(Math.sin(angle)) * speed * 0.5,
          z: Math.sin(angle) * speed * 0.5
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.4,
          y: (Math.random() - 0.5) * 0.4,
          z: (Math.random() - 0.5) * 0.4
        },
        gravity: -0.004,
        life: 1.0,
        fadeSpeed: 0.008
      } as ConfettiUserData

      scene.add(confetti)
      pieces.push(confetti)
    }

    return pieces
  }

  const createBurstText = (origin = { x: 0, y: 0, z: 0 }): THREE.Mesh[] => {
    if (!sceneRef.current) return []
    const scene = sceneRef.current
    const pieces: THREE.Mesh[] = []

    const words = ['SQYSH', 'SQYSH', 'SQYSH', 'SQYSH', 'SQYSH', 'SQYSH', 'SQYSH', 'SQYSH']

    words.forEach((word, wi) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 256, 64)
      ctx.font = 'bold 36px monospace'
      ctx.fillStyle = `hsl(${Math.random() * 360}, 90%, 65%)`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, 128, 32)

      const texture = new THREE.CanvasTexture(canvas)
      const geometry = new THREE.PlaneGeometry(1.2, 0.3)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = origin.x + (Math.random() - 0.5) * 0.3
      mesh.position.y = origin.y + (Math.random() - 0.5) * 0.3
      mesh.position.z = origin.z

      const angle = (wi / words.length) * Math.PI * 2
      const speed = 0.06 + Math.random() * 0.06

      mesh.userData = {
        velocity: {
          x: Math.cos(angle) * speed,
          y: 0.06 + Math.random() * 0.08,
          z: (Math.random() - 0.5) * 0.02
        },
        rotationSpeed: {
          x: 0,
          y: 0,
          z: (Math.random() - 0.5) * 0.05
        },
        gravity: -0.002,
        life: 1.0,
        fadeSpeed: 0.006
      } as ConfettiUserData

      scene.add(mesh)
      pieces.push(mesh)
    })

    return pieces
  }

  useEffect(() => {
    const mountElement = mountRef.current
    if (!mountElement) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountElement.appendChild(renderer.domElement)

    sceneRef.current = scene
    rendererRef.current = renderer
    camera.position.set(0, 0, 5)

    const animate = (): void => {
      animationIdRef.current = requestAnimationFrame(animate)

      confettiPiecesRef.current.forEach((piece, index) => {
        const userData = piece.userData as ConfettiUserData
        if (!userData) return

        userData.velocity.y += userData.gravity
        piece.position.x += userData.velocity.x
        piece.position.y += userData.velocity.y
        piece.position.z += userData.velocity.z
        piece.rotation.x += userData.rotationSpeed.x
        piece.rotation.y += userData.rotationSpeed.y
        piece.rotation.z += userData.rotationSpeed.z

        userData.velocity.x *= 0.98
        userData.velocity.z *= 0.98
        piece.position.x += Math.sin(Date.now() * 0.001 + index) * 0.002

        userData.life -= userData.fadeSpeed
        const material = piece.material as THREE.MeshBasicMaterial
        material.opacity = Math.max(0, userData.life)

        if (piece.position.y < -8 || userData.life <= 0) {
          scene.remove(piece)
          confettiPiecesRef.current.splice(index, 1)
        }
      })

      renderer.render(scene, camera)
    }

    const handleResize = (): void => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      confettiPiecesRef.current.forEach((piece) => {
        scene.remove(piece)
        piece.geometry.dispose()
        ;(piece.material as THREE.Material).dispose()
      })
      confettiPiecesRef.current = []
      if (mountElement?.contains(renderer.domElement)) {
        mountElement.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Original falling confetti — auction ended
  useEffect(() => {
    if (trigger && !isActiveRef.current && sceneRef.current) {
      isActiveRef.current = true

      confettiPiecesRef.current.push(...createConfetti(150))

      const t1 = setTimeout(() => confettiPiecesRef.current.push(...createConfetti(100)), 200)
      const t2 = setTimeout(() => confettiPiecesRef.current.push(...createConfetti(80)), 400)
      const reset = setTimeout(() => {
        isActiveRef.current = false
        store.dispatch(setHideConfetti())
      }, duration)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(reset)
      }
    }
  }, [trigger])

  // Burst — quick bid success
  useEffect(() => {
    if (burstTrigger === prevBurstTrigger.current) return
    prevBurstTrigger.current = burstTrigger
    if (!sceneRef.current) return

    confettiPiecesRef.current.push(...createBurst(120, { x: 0, y: -1, z: 0 }))
    confettiPiecesRef.current.push(...createBurstText({ x: 0, y: -1, z: 0 }))

    const t1 = setTimeout(() => {
      confettiPiecesRef.current.push(...createBurst(60, { x: -2, y: -1.5, z: 0 }))
      confettiPiecesRef.current.push(...createBurst(60, { x: 2, y: -1.5, z: 0 }))
    }, 120)

    return () => clearTimeout(t1)
  }, [burstTrigger])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  )
}
