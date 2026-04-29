import { useEffect, useState } from "react";
import { ListTable } from "./components/ListTable";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { EmptyState } from "@/components/custom/EmptyState";
import { LuHistory, LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input";

const headers = [
    { title: "Subject", textAlign: "start" as const },
    { title: "Topic", textAlign: "start" as const },
    { title: "Time", textAlign: "start" as const },
    { title: "Duration (Minutes)", textAlign: "start" as const },
    { title: "Date", textAlign: "start" as const },
    { title: "Notes", textAlign: "start" as const },
    { title: "Actions", textAlign: "center" as const },
];

export default function History() {
    const { sessions, load } = useHistoryStore();
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, [load]);

    const filteredSessions = sessions.filter(
        (s) =>
            s.subject.toLowerCase().includes(search.toLowerCase()) ||
            s.topic.toLowerCase().includes(search.toLowerCase()) ||
            (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AppLayout>
            <div className="mx-auto w-full max-w-5xl space-y-4 pb-4">
                {sessions.length === 0 ? (
                    <EmptyState 
                        icon={LuHistory} 
                        title="No study history yet" 
                        description="When you complete a study session, it will show up here." 
                    />
                ) : (
                    <div className="vibe-card rounded-[2rem] bg-card p-4 sm:p-6 overflow-hidden flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3">
                            <div className="relative w-full sm:w-72 md:w-80">
                                <LuSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search subject, topic or notes..."
                                    className="h-10 w-full rounded-full border-none bg-muted/50 pl-10 text-sm font-medium shadow-inner focus-visible:ring-1"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {filteredSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-[1.5rem] border border-black/5 dark:border-white/5">
                                No results found for "{search}"
                            </div>
                        ) : (
                            <ListTable headers={headers} data={filteredSessions} />
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}