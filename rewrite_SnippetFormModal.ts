import fs from 'fs'
const file = fs.readFileSync('components/SnippetFormModal.tsx', 'utf8')
const newFile = file
  .replace("code:        initialData?.code        ?? '',\n    notes:       initialData?.notes       ?? '',\n  })", "notes:       initialData?.notes       ?? '',\n  })\n\n  const [tabs, setTabs] = useState<{name: string, language: string, code: string}[]>(\n    initialData?.tabs?.length\n      ? initialData.tabs\n      : [{ name: 'main', language: initialData?.language ?? 'typescript', code: initialData?.code ?? '' }]\n  )\n  const [activeTab, setActiveTab] = useState(0);")
  .replace("const hasCode = form.code.trim().length > 0", "const hasCode = tabs[activeTab].code.trim().length > 0")
  .replace("const ctx = `Language: ${form.language}\\n\\nCode:\\n${form.code}`", "const ctx = `Language: ${tabs[activeTab].language}\\n\\nCode:\\n${tabs[activeTab].code}`")
  .replace("${form.code}", "${tabs[activeTab].code}")
  .replace("${form.code}", "${tabs[activeTab].code}")
  .replace("${form.code}", "${tabs[activeTab].code}")
  .replace("language:    form.language,", "language:    tabs[0].language as Language,")
  .replace("code:        form.code,", "code:        tabs[0].code,\n      tabs:        tabs,")
  .replace("language:    initialData?.language    ?? 'typescript',\n", "")
  
fs.writeFileSync('components/SnippetFormModal.tsx', newFile)
