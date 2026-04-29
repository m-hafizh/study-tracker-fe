import React, {
    ComponentPropsWithoutRef,
    ReactNode,
} from 'react';


// 1st way: Menggunakan ComponentPropsWithoutRef
interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
    children: ReactNode;
    size: 'small' | 'medium' | 'large';
    variant: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    size,
    variant,
    onClick,
    ...rest
}) => {
    const sizeClass =
        size === 'small' ? 'px-3 py-1 text-sm' :
        size === 'large' ? 'px-6 py-3 text-base' :
        'px-4 py-2 text-sm';

    const variantClass =
        variant === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground';

    return (
        <button
            onClick={onClick}
            className={`${sizeClass} ${variantClass} rounded-xl`}
            {...rest}
        >
            {children}
        </button>
    )
}