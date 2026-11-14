import './AnimatedPenguin.css'

type AnimatedPenguinProps = {
  size?: number
  running?: boolean
  boosted?: boolean
  variant?: number
}

/** A decorative, eight-frame pixel penguin for the race track. */
export default function AnimatedPenguin({
  size = 64,
  running = false,
  boosted = false,
  variant = 0,
}: AnimatedPenguinProps) {
  const accessory = ((Math.trunc(variant) % 4) + 4) % 4
  return (
    <span
      aria-hidden="true"
      className={`animated-penguin${running ? ' animated-penguin--running' : ''}${boosted ? ' animated-penguin--boosted' : ''} animated-penguin--variant-${accessory}`}
      style={{ width: size, height: size }}
    >
      <span className="animated-penguin__sprite" />
      {accessory !== 0 && <span className="animated-penguin__accessory" />}
    </span>
  )
}
