// Checks SPEC.md line by line. Run: node check.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { NOTES, escapeHtml, parseTodos, renderBoard } from './board.js'

const EXPECTED_TODOS = 6
// kept here, not in board.js, so changing the code under test cannot widen the rule
const ROLES = ['메뉴·글 담당', '재료·사진 담당']
const results = []
const check = (name, ok) => results.push({ name, ok })

const notes = NOTES.map((path) => readFileSync(path, 'utf8'))
const todos = notes.flatMap(parseTodos)
const html = renderBoard(todos)
// counted straight from the files, so a bug in parseTodos cannot hide a missing row
const cards = html.split('<li class="todo">').slice(1)
const rows = notes.flatMap((n) => n.split('\n').filter((l) => /^\| .* \|$/.test(l) && !l.startsWith('| 할 일 |')))

const noteFiles = readdirSync('notes').map((f) => `notes/${f}`).sort()
check('1. notes 폴더의 회의록을 모두 읽는다', JSON.stringify(noteFiles) === JSON.stringify([...NOTES].sort()))
check(`1. 회의록의 할 일 ${EXPECTED_TODOS}개가 모두 보인다`, rows.length === EXPECTED_TODOS && cards.length === EXPECTED_TODOS)
check('2. 카드마다 내용·담당·기한·상태·회의 날짜가 보인다', todos.every((t, i) => [t.task, t.owner, t.due, t.status, t.meeting].every((v) => v && cards[i].includes(escapeHtml(v)))))
check('3. 담당 칸에는 역할만 있다', todos.every((t) => ROLES.includes(t.owner)))
check('5. 연습용 안내가 있다', readFileSync('index.html', 'utf8').includes('연습용으로 만든 페이지'))

for (const { name, ok } of results) console.log(`${ok ? '통과' : '실패'}  ${name}`)
const failed = results.filter((r) => !r.ok).length
console.log(`통과 ${results.length - failed}개, 실패 ${failed}개 (4번 휴대폰 폭은 브라우저에서 확인)`)
process.exit(failed ? 1 : 0)
