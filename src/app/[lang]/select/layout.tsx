interface LayoutProps {
  children: React.ReactNode;
}

export default function SelectLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
