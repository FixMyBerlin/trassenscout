import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  data: any[]
}

const CustomizedLabel = (payload: any) => {
  console.log(payload)
  const x = payload.x ?? 0
  const y = payload.y ?? 0
  console.log()
  const width = 3
  return (
    <svg xmlns="http://www.w3.org/2000/svg">
      <text fontSize={14} x={x + 4} y={y - 10}>
        {payload.name}
      </text>
    </svg>
  )
}

const VerticalBartChart: React.FC<Props> = ({ data }) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          >
            {/* <LabelList dataKey="key" position="top" /> */}
            <LabelList dataKey="value" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default VerticalBartChart
