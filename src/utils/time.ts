import moment from "moment";


export function diffTime(startTime?: string, endTime?: string): { value: number; unit: "seconds" | "minutes" | "hours" } | 0 {
    if (!startTime || !endTime) return 0;
    const format = "h:mm:ss A";

    const start = moment(startTime, format);
    const end = moment(endTime, format);

    // ⏰ Crosses midnight
    if (end.isBefore(start)) {
        end.add(1, "day");
    }

    const diffSeconds = end.diff(start, "seconds");
    const duration = moment.duration(diffSeconds, "seconds");

    if (duration.asSeconds() < 60) {
        return {
            value: duration.seconds(),
            unit: "seconds",
        };
    }

    if (duration.asMinutes() < 60) {
        return {
            value: Math.floor(duration.asMinutes()),
            unit: "minutes",
        };
    }

    return {
        value: Math.floor(duration.asHours()),
        unit: "hours",
    };
}

export function durationFormat(time: string): { value: number; unit: "seconds" | "minutes" | "hours" } {
    const duration = moment.duration(time, "seconds");

    if (duration.asSeconds() < 60) {
        return {
            value: duration.seconds(),
            unit: "seconds",
        };
    }

    if (duration.asMinutes() < 60) {
        return {
            value: Math.floor(duration.asMinutes()),
            unit: "minutes",
        };
    }

    return {
        value: Math.floor(duration.asHours()),
        unit: "hours",
    };
}

export function convertTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num: number) => String(num).padStart(2, "0");

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}


export function timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time
        .split(":")
        .map(Number);

    return hours * 3600 + minutes * 60 + seconds;
}

export function timeToMinutes(time?: string): number {
    if (!time) return 0;
    const duration = moment.duration(time);
    return duration.hours() * 60 + duration.minutes();
}