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
  const onChange = (s) => {
    if (s === formattedValue.replace(",", "")) {
      // comma was deleted
      s = formattedValue
    } else {
      setFormattedValue(s)
    }
    return removeFormatting(s)
  }

  const startValue = 0
  const [value, setValue] = useState(startValue)
  const [formattedValue, setFormattedValue] = useState(format(startValue))
  const handleSubmit = (e) => e.preventDefault()

  return (
    <div className="border border-black p-4 m-4">
      <form onSubmit={handleSubmit}>
        <NumberFormatBase value={value} removeFormatting={onChange} format={format} />
        <br />
        <button type="submit">Submit</button>
        <br />
        <span>{formattedValue}</span>
      </form>
    </div>
  )
}

const NumberPage = () => <Demo />

export default NumberPage
