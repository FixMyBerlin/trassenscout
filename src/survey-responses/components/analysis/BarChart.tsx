import {
  Bar,
  BarChart as RechartBarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ImplicitLabelType } from "recharts/types/component/Label"

type Props = {
  data: {
    name: string
    value: number
  }[]
}

const CustomizedLabel: ImplicitLabelType = (props) => {
  const x = props.x ?? 0
  const y = props.y ?? 0
  return (
    <svg xmlns="http://www.w3.org/2000/svg">
      <switch>
        <foreignObject x={x + 4} y={y - 96} width="70vw" height="150">
          <div className="flex flex-col justify-end h-24 leading-tight">
            <p className="text-sm"> {props.name}</p>
          </div>
        </foreignObject>
      </switch>
    </svg>
  )
}

export const BarChart: React.FC<Props> = ({ data }) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <RechartBarChart
          data={data}
          margin={{ top: 15, right: 40, left: 10, bottom: 5 }}
          layout="vertical"
        >
          <YAxis
            tickLine={false}
            tick={false}
            // mirror={true}
            dataKey="name"
            width={0} // when tick = true, 130 is ok
            type="category"
            stroke={"0"}
          />
          <XAxis type="number" stroke={"0"} />
          <CartesianGrid stroke="#ccc" strokeWidth={0.5} horizontal={false} />
          <Bar
            barSize={32}
            background={false}
            fill="#EAB308"
            dataKey="value"
            label={<CustomizedLabel />}
            // disabling the animation: quick fix for labels/labellist that sometimes are not shown
            isAnimationActive={false}
          >
            {/* <LabelList dataKey="key" position="top" /> */}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </RechartBarChart>
      </ResponsiveContainer>
    </>
  )
}
