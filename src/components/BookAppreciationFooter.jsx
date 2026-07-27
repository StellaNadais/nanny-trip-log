/**
 * A compact note for the nanny that can travel with the next care request.
 */
export default function BookAppreciationFooter({ value, onChange }) {
  return (
    <section className="book-appreciation-footer" aria-label="Appreciation note">
      <label className="book-appreciation-footer__field">
        <span className="book-appreciation-footer__label">Leave a note to nanny</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Leave a note for your nanny…"
          rows={1}
          maxLength={600}
          autoComplete="off"
        />
      </label>
    </section>
  )
}
