async function getDoc(url) {
  const resp = await fetch(url)
  const decoder = new TextDecoder('Windows-1251')
  const text = decoder.decode(await resp.arrayBuffer())
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  return doc
}

async function getRegionWithChildren({ href, name }) {
  const doc = await getDoc(href)
  const options = [...doc.body.querySelectorAll('option')].map(o => ({ href: o.value, name: o.innerText }))
  return { href, name, children: options }
}

async function getAllRegionsWithChildren(res1) {
  const res = []
  for (const obj of res1) {
    res.push(await getRegionWithChildren(obj))
  }
  return res
}

async function getUikData(res2) {
  const doc = await getDoc(res2.href)
  const link = [...doc.body.querySelectorAll('a')].find(a => a.innerText.includes('Сводная таблица'))
  const doc2 = await getDoc(link.href)
  const table = [...doc2.querySelectorAll('table')].slice(-1)[0]
  const tbody = table.firstElementChild
  const rows = [
    'УИК',
    'Число участников голосования, включенных в список участников голосования на момент окончания голосования',
    'Число бюллетеней, выданных участникам голосования',
    'Число бюллетеней, содержащихся в ящиках для голосования',
    'Число недействительных бюллетеней',
    '---',
    'ДА',
    'НЕТ'
  ]
  const children = [];
  ([...tbody.children]).forEach((row, i) => {
    ([...row.children]).forEach((col, j) => {
      if (!children[j]) children[j] = {}
      children[j][rows[i]] = col.innerText
    })
  })

  return { ...res2, tableHref: link.href, children }
}

async function populateRegions(regions) {
  for (const region of regions) {
    for (const uik of region.children) {
      if (uik.children) continue;
      const res = await getUikData(uik);
      uik.children = res.children;
      uik.tableHref = res.tableHref;
    }
  }
}

function getUikDataInline() {
  const doc2 = document
  const table = [...doc2.querySelectorAll('table')].slice(-1)[0]
  const tbody = table.firstElementChild
  const rows = [
    'УИК',
    'Число участников голосования, включенных в список участников голосования на момент окончания голосования',
    'Число бюллетеней, выданных участникам голосования',
    'Число бюллетеней, содержащихся в ящиках для голосования',
    'Число недействительных бюллетеней',
    '---',
    'ДА',
    'НЕТ'
  ]
  const children = [];
  ([...tbody.children]).forEach((row, i) => {
    ([...row.children]).forEach((col, j) => {
      if (!children[j]) children[j] = {}
      children[j][rows[i]] = col.innerText
    })
  })

  return children
}