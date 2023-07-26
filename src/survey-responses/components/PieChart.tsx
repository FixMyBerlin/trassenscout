import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  data: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

const PieChartWithLegend: React.FC<Props> = ({ data }) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            fill="#8884d8"
            dataKey="value"
            label
            style={{ fontFamily: "Overpass" }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            labelStyle={{
              color: "#E5007D",
            }}
            itemStyle={{
              color: "#E5007D",
            }}
            separator=": "
            wrapperStyle={{ fontFamily: "Overpass" }}
          />
          <Legend
            layout="vertical"
            iconType="circle"
            wrapperStyle={{
              margin: "0px",
              color: "black",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}

export default PieChartWithLegend
