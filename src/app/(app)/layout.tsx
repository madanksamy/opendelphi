import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { EditModeProvider } from "@/components/cms/EditModeProvider";
import { EditToolbar } from "@/components/cms/EditToolbar";
import { UserProvider } from "@/components/providers/UserProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <EditModeProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
        <EditToolbar />
      </EditModeProvider>
    </UserProvider>
  );
}
