export function parseCsvRows(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]
    if (quoted) {
      if (char === "\"" && next === "\"") {
        field += "\""
        i += 1
      } else if (char === "\"") {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === "\"") {
      quoted = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char !== "\r") {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export function rowObject(headers: string[], row: string[]) {
  const result: Record<string, string> = {}
  headers.forEach((header, index) => {
    result[header.trim()] = (row[index] ?? "").trim()
  })
  return result
}
