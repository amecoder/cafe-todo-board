// Reads the to-do tables in the meeting notes and renders the board.
// No DOM access here, so check.mjs can run the same code in Node.

export const NOTES = ['notes/2026-10-27-weekly.md', 'notes/2026-10-29-extra.md']
export const ROLES = ['메뉴·글 담당', '재료·사진 담당']

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

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

export function renderBoard(todos) {
  const cards = todos.map(
    (t) => `<li class="todo">
  <p class="task">${escapeHtml(t.task)}</p>
  <dl>
    <dt>담당</dt><dd>${escapeHtml(t.owner)}</dd>
    <dt>기한</dt><dd>${escapeHtml(t.due)}</dd>
    <dt>상태</dt><dd>${escapeHtml(t.status)}</dd>
    <dt>회의</dt><dd>${escapeHtml(t.meeting)}</dd>
  </dl>
</li>`,
  )
  return `<p class="count">할 일 ${todos.length}개</p>\n<ul class="board">\n${cards.join('\n')}\n</ul>`
}
