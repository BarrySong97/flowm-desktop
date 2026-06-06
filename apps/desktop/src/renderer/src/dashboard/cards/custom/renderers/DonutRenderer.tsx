import type { FlowQueryResult } from "@flowm/api"
import { PieRenderer } from "./PieRenderer"

interface Props {
  result: FlowQueryResult
  labelColumn?: string
  valueColumn?: string
}

export function DonutRenderer(props: Props) {
  return <PieRenderer {...props} donut />
}
