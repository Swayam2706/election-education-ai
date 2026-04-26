// Inline script to force dark theme and prevent flash
export function ThemeScript() {
  const script = `
    (function() {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
