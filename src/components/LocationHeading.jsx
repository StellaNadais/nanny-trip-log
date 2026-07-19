/** Pin icon + “Locations” label for outings / place nicknames. */
export default function LocationHeading({ id, as: Tag = 'h3', className = '' }) {
  return (
    <Tag id={id} className={`location-heading ${className}`.trim()}>
      <svg
        className="location-heading__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      <span className="location-heading__text">Locations</span>
    </Tag>
  )
}
