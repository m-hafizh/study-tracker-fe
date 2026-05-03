// docs: 
// 1. https://plugins.slyweb.ch/clock-timepicker/#examples
// 2. https://github.com/loebi-ch/clock-timepicker

import 'clock-timepicker';
import './Timepicker.css'
import { createElement } from 'react';


interface TimePickerProps {
    name?: string;
    value: string;
    onValueChange: (value: string) => void;
}

export default function TimePicker({ name, value, onValueChange }: TimePickerProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onChange = useCallback((e: Event | null) => {
        // event.target is an EventTarget, cast to HTMLInputElement to access `.value`
        const val = (e?.target as HTMLInputElement | null)?.value ?? null;
        // console.log('onChange value', val, 'event', e);
        if (val !== null) onValueChange(val);
    }, [onValueChange]);

    useEffect(() => {
        const el = inputRef.current as HTMLInputElement | null;
        if (!el) return;

        // ensure the component has the initial value (some web components expose a .value property)
    try { el.value = value; } catch { /* ignore web component assignment edge cases */ }

        const handle = (ev: Event) => {
            // console.log('time: ',(ev.target as HTMLInputElement | null)?.value)
            onChange(ev);
        };

        // listen to the custom event dispatched by the web component
        el.addEventListener('change', handle);

        return () => {
            // cleanup the event listener
            el.removeEventListener('change', handle);
        };
    }, [value, onChange]);

    return (
        createElement('clock-timepicker', {
            ref: inputRef,
            value,
            name,
            autosize: true,
            separator: ':',
            format: 'HH:mm:ss',
            vibrate: 'true',
        })
    );
}