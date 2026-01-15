import React from 'react';

interface PrintContainerProps {
    children: React.ReactNode;
    width: string;      // e.g. '210mm' or '297mm'
    minHeight: string;  // e.g. '297mm' or '210mm'
    className?: string; // Additional classes for the container wrapper
    style?: React.CSSProperties;
    id?: string;
    minimal?: boolean;
    innerPadding?: string;
}

export const PrintContainer: React.FC<PrintContainerProps> = ({
    children,
    width,
    minHeight,
    className = "p-8", // Default padding
    style = {},
    id,
    minimal = false, // New prop for infinite canvas mode
    innerPadding = "p-8" // Default padding
}) => {
    const outerBaseClass = minimal
        ? "bg-transparent flex justify-center overflow-auto"
        : "bg-slate-200 rounded-xl overflow-auto flex justify-center border border-slate-300 shadow-inner";

    const innerBaseClass = minimal
        ? "bg-white transition-all duration-500 ease-in-out origin-top" // No shadow for minimal mode
        : "bg-white shadow-2xl transition-all duration-500 ease-in-out origin-top";

    return (
        <div className={`${outerBaseClass} ${className}`}>
            <div
                id={id}
                className={innerBaseClass}
                style={{
                    width: width,
                    minHeight: minHeight,
                    ...style
                }}
            >
                <div className={`${innerPadding} h-full`}>
                    {children}
                </div>
            </div>
        </div>
    );
};
