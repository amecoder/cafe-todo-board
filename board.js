// Reads the to-do tables in the meeting notes and renders the board.
// No DOM access here, so check.mjs can run the same code in Node.

export const NOTES = ['notes/2026-10-27-weekly.md', 'notes/2026-10-29-extra.md']

export const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function parseTodos(markdown) {
  const meeting = markdown.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (!meeting) throw new Error('회의록 제목에서 날짜를 찾지 못했습니다')
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .slice(2) // header row and separator row
    .map((line) => {
      const [task, owner, due, status] = line.split('|').slice(1, -1).map((cell) => cell.trim())
      return { task, owner, due, status, meeting }
    })
}

// a due cell like "10/30(금)" takes its year from the meeting date; "매주 월·수·금" has no date
export function dueDate(todo) {
  const match = todo.due.match(/(\d{1,2})\/(\d{1,2})/)
  if (!match) return null
  const [, month, day] = match
  return `${todo.meeting.slice(0, 4)}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function isOverdue(todo, today) {
  const due = dueDate(todo)
  return due !== null && due < today && !todo.status.startsWith('완료')
}

export function renderBoard(todos, today) {
  const cards = todos.map((t) => {
    const overdue = isOverdue(t, today)
    return `<li class="todo${overdue ? ' overdue' : ''}">
  ${overdue ? '<p class="late">기한 지남</p>' : ''}
  <p class="task">${escapeHtml(t.task)}</p>
  <dl>
    <dt>담당</dt><dd>${escapeHtml(t.owner)}</dd>
    <dt>기한</dt><dd>${escapeHtml(t.due)}</dd>
    <dt>상태</dt><dd>${escapeHtml(t.status)}</dd>
    <dt>회의</dt><dd>${escapeHtml(t.meeting)}</dd>
  </dl>
</li>`
  })
  return `<p class="count">할 일 ${todos.length}개</p>\n<ul class="board">\n${cards.join('\n')}\n</ul>`
}
