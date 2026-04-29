import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { ListTable } from "./components/ListTable";
import { EmptyState } from "@/components/custom/EmptyState";
import { LuBook, LuPlus, LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormModal from "./components/FormModal";

const headers = [
    { title: "Subject", textAlign: "start" as const },
    { title: "Color", textAlign: "start" as const },
    { title: "Actions", textAlign: "center" as const },
];

export default function Subject() {
    const { subjects, load } = useSubjectStore();
    const [search, setSearch] = useState("");
    const [openFormModal, setOpenFormModal] = useState<{
        type: "Add" | "Edit" | null;
        isOpen: boolean;
        item?: { id: string; subject: string; color: string } | null;
    }>({ type: "Add", isOpen: false, item: null });

    useEffect(() => { load(); }, [load]);

    const filteredSubjects = subjects.filter(
        (s) => s.subject.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="mx-auto w-full max-w-5xl space-y-4 pb-4">
                {subjects.length === 0 ? (
                    <EmptyState 
                        icon={LuBook} 
                        title="No subjects yet" 
                        description="Create a subject to start categorizing your study sessions." 
                        action={
                            <Button
                                className="rounded-full"
                                onClick={() => setOpenFormModal({ type: "Add", isOpen: true, item: null })}
                            >
                                Create subject <LuPlus className="ml-1 h-4 w-4" />
                            </Button>
                        }
                    />
                ) : (
                    <div className="vibe-card rounded-[2rem] bg-card p-4 sm:p-6 overflow-hidden flex flex-col gap-4">
                        {filteredSubjects.length === 0 ? (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="relative w-full sm:w-72 md:w-80">
                                        <LuSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search subjects..."
                                            className="h-10 w-full rounded-full border-none bg-muted/50 pl-10 text-sm font-medium shadow-inner focus-visible:ring-1"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => setOpenFormModal({ type: "Add", isOpen: true, item: null })}
                                    >
                                        Create <LuPlus className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                                    No results found for "{search}"
                                </div>
                            </>
                        ) : (
                            <ListTable 
                                headers={headers} 
                                data={filteredSubjects} 
                                searchSlot={
                                    <div className="relative w-full sm:w-72 md:w-80">
                                        <LuSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search subjects..."
                                            className="h-10 w-full rounded-full border-none bg-muted/50 pl-10 text-sm font-medium shadow-inner focus-visible:ring-1"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                }    
                            />
                        )}
                    </div>
                )}

                <FormModal open={openFormModal} setOpen={setOpenFormModal} />
            </div>
        </AppLayout>
    );
}