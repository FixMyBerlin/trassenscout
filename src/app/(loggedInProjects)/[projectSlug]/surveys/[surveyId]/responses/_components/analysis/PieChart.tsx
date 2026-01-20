import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type Props = {
  data: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export const PieChart: React.FC<Props> = ({ data }) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <RechartPieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            fill="#8884d8"
            dataKey="value"
            label
            style={{ fontFamily: "Red Hat Text" }}
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
            wrapperStyle={{ fontFamily: "Red Hat Text" }}
          />
          <Legend
            layout="vertical"
            iconType="circle"
            wrapperStyle={{
              margin: "0px",
              color: "black",
            }}
          />
        </RechartPieChart>
      </ResponsiveContainer>
    </>
  )
}
