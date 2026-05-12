export function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function groupBy(array, keyGetter) {
  const map = new Map()
  for (const item of array) {
    const key = keyGetter(item)
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }
  return map
}

export function selectBalancedQuestions(pool, count) {
  const uniqueById = new Map()
  for (const q of pool) uniqueById.set(q.id, q)
  const uniquePool = [...uniqueById.values()]

  if (uniquePool.length < count) {
    throw new Error(
      `Not enough questions in pool: need ${count}, got ${uniquePool.length}`,
    )
  }

  const byKey = groupBy(uniquePool, (q) => q.key)
  const keys = shuffleArray([...byKey.keys()])
  const keyBuckets = new Map()
  for (const k of keys) keyBuckets.set(k, shuffleArray(byKey.get(k)))

  const picked = []
  const pickedIds = new Set()
  const pickedIntents = new Map() // intent -> count

  const intentCount = (intent) => pickedIntents.get(intent) ?? 0
  const pickOneFromKey = (k, allowIntentRepeat) => {
    const bucket = keyBuckets.get(k) ?? []
    while (bucket.length > 0) {
      const q = bucket.shift()
      if (pickedIds.has(q.id)) continue
      if (!allowIntentRepeat && intentCount(q.intent) > 0) continue
      picked.push(q)
      pickedIds.add(q.id)
      pickedIntents.set(q.intent, intentCount(q.intent) + 1)
      return true
    }
    return false
  }

  // Pass 1: round-robin keys, prefer intent-unique
  while (picked.length < count) {
    let progressed = false
    for (const k of keys) {
      if (picked.length >= count) break
      progressed = pickOneFromKey(k, false) || progressed
    }
    if (!progressed) break
  }

  // Pass 2: fill remaining allowing intent repeats, still key-balanced
  while (picked.length < count) {
    let progressed = false
    for (const k of keys) {
      if (picked.length >= count) break
      progressed = pickOneFromKey(k, true) || progressed
    }
    if (!progressed) break
  }

  // Pass 3: last resort from remaining pool (no duplicate id)
  if (picked.length < count) {
    const remaining = shuffleArray(uniquePool).filter((q) => !pickedIds.has(q.id))
    for (const q of remaining) {
      if (picked.length >= count) break
      picked.push(q)
      pickedIds.add(q.id)
    }
  }

  if (picked.length !== count) {
    throw new Error(
      `Failed to select ${count} questions; selected ${picked.length}`,
    )
  }

  return picked
}

export function generateExamQuestions(questionBank, quota) {
  const types = Object.keys(quota)
  const results = []
  const usedIds = new Set()

  for (const type of types) {
    const need = quota[type]
    const pool = questionBank.filter((q) => q.type === type)
    const chosen = selectBalancedQuestions(pool, need)
    for (const q of chosen) {
      if (usedIds.has(q.id)) {
        throw new Error(`Duplicate id selected across types: ${q.id}`)
      }
      usedIds.add(q.id)
      results.push(q)
    }
  }

  const total = results.length
  const expected = types.reduce((sum, t) => sum + quota[t], 0)
  if (total !== expected) {
    throw new Error(`Expected ${expected} questions, got ${total}`)
  }

  // ensure unique ids
  if (usedIds.size !== results.length) {
    throw new Error('Duplicate ids found in generated exam questions')
  }

  return shuffleArray(results)
}

export function buildDiagnosisPages(sessionQuestions) {
  const byType = groupBy(sessionQuestions, (q) => q.type)

  const pages = []
  for (const [type, qs] of byType.entries()) {
    const ordered = [...qs]
    for (let i = 0; i < ordered.length; i += 5) {
      const chunk = ordered.slice(i, i + 5)
      const first = chunk[0]
      pages.push({
        type,
        section: first.section,
        displaySection: first.displaySection,
        questions: chunk,
      })
    }
  }

  // Keep section order stable by displaySection (matches DIAGNOSIS_SECTIONS usage)
  return pages.sort((a, b) =>
    `${a.type}`.localeCompare(`${b.type}`, 'ko-KR'),
  )
}

export function runQuestionSelectorTests({ questionBank, quota }) {
  const ids = questionBank.map((q) => q.id)
  const uniqueIds = new Set(ids)
  console.assert(
    uniqueIds.size === ids.length,
    `questionBank id must be unique: ${ids.length - uniqueIds.size} duplicates`,
  )

  const texts = questionBank.map((q) => q.text)
  const uniqueTexts = new Set(texts)
  console.assert(
    uniqueTexts.size === texts.length,
    `questionBank text must be unique: ${texts.length - uniqueTexts.size} duplicates`,
  )

  const session = generateExamQuestions(questionBank, quota)
  console.assert(session.length === 50, 'generateExamQuestions should return 50')
  console.assert(
    new Set(session.map((q) => q.id)).size === session.length,
    'generated questions should not contain duplicate ids',
  )

  for (const [type, count] of Object.entries(quota)) {
    const actual = session.filter((q) => q.type === type).length
    console.assert(
      actual === count,
      `quota mismatch for ${type}: expected ${count}, got ${actual}`,
    )
  }

  const pages = buildDiagnosisPages(session)
  console.assert(pages.length > 0, 'buildDiagnosisPages should return pages')
  for (const page of pages) {
    console.assert(
      page.questions.length <= 5,
      'each page should have max 5 questions',
    )
    const types = new Set(page.questions.map((q) => q.type))
    console.assert(types.size === 1, 'a page must not mix different types')
  }
}


