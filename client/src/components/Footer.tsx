export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DevPulse. All rights reserved.</p>
        <p className="mt-1">
          A blog platform for Programming, Tech &amp; AI content.
        </p>
      </div>
    </footer>
  );
}
