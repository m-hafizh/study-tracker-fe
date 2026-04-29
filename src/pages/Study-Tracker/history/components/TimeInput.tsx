export type TimeValue = {
    hour?: number;
    minute?: number;
    period?: "am" | "pm";
};
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function TimeInput({
    value,
    onChangeHour,
    onChangeMinute,
}: {
    value?: TimeValue;
    onChangeHour?: (v: number | undefined) => void;
    onChangeMinute?: (v: number | undefined) => void;
}) {
    const [hour, setHour] = useState<number>(value?.hour ?? 10);
    const [minute, setMinute] = useState<number>(value?.minute ?? 0);

    useEffect(() => {
        if (!value) return;
        if (typeof value.hour === "number") setHour(value.hour);
        if (typeof value.minute === "number") setMinute(value.minute);
    }, [value]);

    const emitChangeHour = useCallback(() => {
        onChangeHour?.(hour);
    }, [hour, onChangeHour]);

    const emitChangeMinute = useCallback(() => {
        onChangeMinute?.(minute);
    }, [minute, onChangeMinute]);

    return (
        <div className="grid grid-cols-2 gap-2">
            <Input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value || 0))}
                onBlur={emitChangeHour}
            />
            <Input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value || 0))}
                onBlur={emitChangeMinute}
            />
        </div>
    );
}