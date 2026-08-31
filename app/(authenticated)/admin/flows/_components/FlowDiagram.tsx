import { Fragment } from 'react'
import { FlowStep } from './FlowStep'
import { FlowArrow } from './FlowArrow'
import { ICON_MAP, IconKey } from './iconMap'

export type FlowStepData = {
  icon: IconKey
  title: string
  caption: string
  adminNote?: string
}

export function FlowDiagram({ steps }: { steps: FlowStepData[] }) {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-0 w-full">
      {steps.map((step, i) => (
        <Fragment key={i}>
          <FlowStep {...step} icon={ICON_MAP[step.icon]} isLast={i === steps.length - 1} />
          {i < steps.length - 1 && <FlowArrow />}
        </Fragment>
      ))}
    </div>
  )
}
