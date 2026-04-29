import { Link } from "react-router-dom";
import {
    LuCalendarDays,
    LuCheckCheck,
    LuChevronRight,
    LuClipboardList,
    LuClock3,
    LuFolderKanban,
    LuSparkles,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";

const featureCards = [
    {
        title: "Plan smarter with Calendar",
        description: "Block your study sessions visually and keep deadlines in view.",
        icon: LuCalendarDays,
    },
    {
        title: "Organize tasks with Kanban",
        description: "Move cards across stages and keep progress crystal clear.",
        icon: LuFolderKanban,
    },
    {
        title: "Track consistency",
        description: "History, streaks, and insights help you build momentum every day.",
        icon: LuClipboardList,
    },
];

const testimonials = [
    {
        quote: "I finally stopped juggling 4 apps. Calendar + Kanban in one place is perfect.",
        name: "Ari, Engineering Student",
    },
    {
        quote: "Pomodoro and session history made my revision routine much more consistent.",
        name: "Maya, Medical Student",
    },
    {
        quote: "The UI is clean and fast, so I actually enjoy planning before studying.",
        name: "Ken, CS Undergraduate",
    },
];

const faqs = [
    {
        question: "Is Study Tracker free to use?",
        answer: "Yes. You can start using core planning and tracking features right away.",
    },
    {
        question: "Can I use it for any subject?",
        answer: "Absolutely. Create your own subjects, plans, and workflows for any course.",
    },
    {
        question: "Does it work on tablet and desktop?",
        answer: "Yes. The app is responsive and optimized for mobile, tablet, and desktop screens.",
    },
];

export default function Index() {
    return (
        <div className="vibe-page-bg min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                        <span className="vibe-brand-dot inline-block h-2.5 w-2.5 rounded-full" />
                        Pebble Study Tracker
                    </Link>

                    <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                        <a href="#features" className="hover:text-foreground">Features</a>
                        <a href="#workflow" className="hover:text-foreground">How it works</a>
                        <a href="#faq" className="hover:text-foreground">FAQ</a>
                    </nav>

                    <Link to="/study-tracker">
                        <Button className="h-9 rounded-full px-4 text-sm">Open App</Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
                <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="space-y-5">
                        <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground dark:border-white/10">
                            <LuSparkles className="h-3.5 w-3.5" />
                            One workspace for focused students
                        </p>
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            Plan better. Study deeper. Finish with confidence.
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Combine Calendar planning, Kanban task flow, Pomodoro focus, and study history
                            in one clean app designed for real student workflows.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link to="/study-tracker">
                                <Button className="h-11 rounded-full px-6 text-sm font-semibold">
                                    Start Study Tracking
                                    <LuChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button variant="outline" className="h-11 rounded-full px-6 text-sm">View Features</Button>
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><LuCheckCheck className="h-3.5 w-3.5" /> Calendar + Kanban</span>
                            <span className="inline-flex items-center gap-1"><LuCheckCheck className="h-3.5 w-3.5" /> Pomodoro timer</span>
                            <span className="inline-flex items-center gap-1"><LuCheckCheck className="h-3.5 w-3.5" /> Session history</span>
                        </div>
                    </div>

                    <div className="vibe-card rounded-[1.75rem] bg-card/85 p-5 sm:p-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Today at a glance</p>

                        <div className="space-y-3">
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-3 dark:border-white/10">
                                <p className="text-sm font-semibold text-foreground">Calculus Revision</p>
                                <p className="mt-1 text-xs text-muted-foreground">7:00 PM – 8:00 PM</p>
                            </div>
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-3 dark:border-white/10">
                                <p className="text-sm font-semibold text-foreground">Chemistry Flashcards</p>
                                <p className="mt-1 text-xs text-muted-foreground">45 min Pomodoro planned</p>
                            </div>
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-3 dark:border-white/10">
                                <p className="text-sm font-semibold text-foreground">Daily focus progress</p>
                                <div className="mt-2 h-2 rounded-full bg-muted">
                                    <div className="h-2 w-[68%] rounded-full bg-primary" />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">68% of today’s goal completed</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="pt-16">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Everything you need in one place</h2>
                        <p className="mt-1 text-sm text-muted-foreground">No more fragmented tools. Your full study system, unified.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {featureCards.map(({ title, description, icon: Icon }) => (
                            <article key={title} className="vibe-card rounded-[1.25rem] bg-card p-5">
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="workflow" className="pt-16">
                    <div className="vibe-card rounded-[1.5rem] bg-card p-5 sm:p-6">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">How it works</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-4 dark:border-white/10">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Step 1</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Plan your week</p>
                                <p className="mt-1 text-sm text-muted-foreground">Set study blocks in Calendar and organize tasks in Kanban lists.</p>
                            </div>
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-4 dark:border-white/10">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Step 2</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Focus in sessions</p>
                                <p className="mt-1 text-sm text-muted-foreground">Use Pomodoro and session timer to stay deep in focused study windows.</p>
                            </div>
                            <div className="rounded-xl border border-black/8 bg-muted/20 p-4 dark:border-white/10">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Step 3</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">Review and improve</p>
                                <p className="mt-1 text-sm text-muted-foreground">Track progress in history and adjust your schedule based on what worked.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pt-16">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Students love the simplicity</h2>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {testimonials.map((item) => (
                            <blockquote key={item.name} className="vibe-card rounded-[1.25rem] bg-card p-5">
                                <p className="text-sm text-foreground/90">“{item.quote}”</p>
                                <footer className="mt-3 text-xs font-medium text-muted-foreground">— {item.name}</footer>
                            </blockquote>
                        ))}
                    </div>
                </section>

                <section id="faq" className="pt-16">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">FAQ</h2>
                    <div className="mt-5 space-y-3">
                        {faqs.map((item) => (
                            <article key={item.question} className="vibe-card rounded-[1.1rem] bg-card p-4">
                                <h3 className="text-sm font-semibold text-foreground">{item.question}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="pt-16">
                    <div className="vibe-card rounded-[1.75rem] bg-card p-6 text-center sm:p-8">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            <LuClock3 className="h-3.5 w-3.5" />
                            Ready to focus?
                        </p>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Build a study routine you can actually keep.
                        </h2>
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Start with your first plan in under a minute and keep everything organized from one dashboard.
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-3">
                            <Link to="/study-tracker">
                                <Button className="h-11 rounded-full px-6 text-sm font-semibold">Start Now</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-black/5 py-5 text-center text-xs text-muted-foreground dark:border-white/10">
                <p>© {new Date().getFullYear()} Pebble Study Tracker — Built for focused learners.</p>
            </footer>
        </div>
    );
}

