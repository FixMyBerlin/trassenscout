import { useState } from "react"
import { NumberFormatBase } from "react-number-format"

const removeFormatting = (s) => {
  if (s === "") return ""

  const parts = s.split(",")
  if (parts.length > 1) {
    s = [parts[0], parts.slice(1).join("")].join(",")
  }
  s = s
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
  return s
}

const format = (numStr) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(numStr)
}

const Demo = () => {
  const [value, setValue] = useState(0)
  const handleSubmit = (e) => e.preventDefault()

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <NumberFormatBase value={value} removeFormatting={removeFormatting} format={format} />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

const NumberPage = () => <Demo />

export default NumberPage
