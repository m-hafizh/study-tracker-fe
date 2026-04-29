/// <reference types="vite/client" />

declare namespace JSX {
	interface IntrinsicElements {
		"clock-timepicker": {
			ref?: React.Ref<HTMLInputElement | null>;
			value?: string;
			name?: string;
			autosize?: boolean;
			separator?: string;
			format?: string;
			vibrate?: string | boolean;
		};
	}
}
